import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    AbstractControl,
    ValidationErrors
} from '@angular/forms';

import { AttendanceModel } from '../../../shared/models/attendance.model';
import { UserModel } from '../../../shared/models/user.model';

import { ApiAttendanceService } from '../../../services/api-attendance.service';
import { ApiUserService } from '../../../services/api-user.service';
import { SharedService } from '../../../services/shared.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NotificationService } from '../../../services/notification.service';
import { sortUsersByName } from '../../../shared/utils/sort-users';

@Component({
    selector: 'app-attendance',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
    templateUrl: './attendance.component.html',
    styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

    attendances: AttendanceModel[] = [];
    attendancesOrigin: AttendanceModel[] = [];

    searchTerm = '';

    isAdmin = false;

    showAdminModal = false;

    users: UserModel[] = [];

    adminAttendanceForm: FormGroup;

    editingAttendanceId: number | null = null;

    page = 1;

    constructor(
        private apiAttendance: ApiAttendanceService,
        private apiUser: ApiUserService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {

        this.adminAttendanceForm = this.fb.group(
            {
                userId: ['', Validators.required],
                checkIn: ['', Validators.required],
                checkOut: ['']
            },
            { validators: [this.checkRangeValidator, this.futureCheckInValidator] }
        );

    }

    // El check-out no puede ser anterior o igual al check-in.
    private checkRangeValidator(control: AbstractControl): ValidationErrors | null {

        const checkIn = control.get('checkIn')?.value;
        const checkOut = control.get('checkOut')?.value;

        if (!checkIn || !checkOut) return null;

        return checkOut <= checkIn ? { invalidRange: true } : null;
    }

    // No se permite registrar asistencias en el futuro.
    private futureCheckInValidator(control: AbstractControl): ValidationErrors | null {

        const now = new Date();
        const checkIn = control.get('checkIn')?.value;
        const checkOut = control.get('checkOut')?.value;

        if (checkIn && new Date(checkIn) > now) return { futureCheckIn: true };
        if (checkOut && new Date(checkOut) > now) return { futureCheckOut: true };

        return null;
    }

    ngOnInit(): void {

        const token = localStorage.getItem('auth_token');

        if (token) {
            const payload: any = JSON.parse(atob(token.split('.')[1]));
            this.isAdmin = payload?.roleId == 1;
        }

        this.loadAttendances();
    }

    // CARGAR ASISTENCIAS

    loadAttendances() {

        this.sharedService.setLoading(true);

        if (this.isAdmin) {

            this.apiAttendance.getAll().subscribe({
                next: (data) => {
                    this.attendancesOrigin = this.sortByCheckInDesc(data);
                    this.onFilter();
                    this.cdr.markForCheck();
                    this.sharedService.setLoading(false);
                },
                error: () => {
                    this.notificationService.error('Error al cargar las asistencias');
                    this.sharedService.setLoading(false);
                }
            });

        } else {

            this.apiAttendance.getMine().subscribe({
                next: (data) => {
                    this.attendancesOrigin = this.sortByCheckInDesc(data);
                    this.onFilter();
                    this.cdr.markForCheck();
                    this.sharedService.setLoading(false);
                },
                error: () => {
                    this.notificationService.error('Error al cargar las asistencias');
                    this.sharedService.setLoading(false);
                }
            });

        }
    }

    // Más recientes primero: la asistencia del día queda arriba de la lista.
    private sortByCheckInDesc(data: AttendanceModel[]): AttendanceModel[] {

        return [...data].sort((a, b) => {

            const dateA = a.checkIn ? new Date(a.checkIn).getTime() : 0;
            const dateB = b.checkIn ? new Date(b.checkIn).getTime() : 0;

            return dateB - dateA;
        });
    }

    // CHECK IN

    checkIn() {

        this.sharedService.setLoading(true);

        this.apiAttendance.checkIn().subscribe({

            next: () => this.loadAttendances(),

            error: () => {
                this.notificationService.error('Error al registrar la entrada');
                this.sharedService.setLoading(false);
            }

        });
    }

    // CHECK OUT

    checkOut() {

        this.sharedService.setLoading(true);

        this.apiAttendance.checkOut().subscribe({

            next: () => this.loadAttendances(),

            error: () => {
                this.notificationService.error('Error al registrar la salida');
                this.sharedService.setLoading(false);
            }

        });
    }

    // ADMIN MODAL

    openAdminAttendance() {

        // Debe limpiarse el id de edición, de lo contrario el modal de "nueva
        // asistencia" terminaría actualizando el último registro editado.
        this.editingAttendanceId = null;

        this.adminAttendanceForm.reset({ userId: '', checkIn: '', checkOut: '' });

        this.showAdminModal = true;

        if (this.users.length === 0) {
            this.loadUsers();
        }
    }

    closeAdminModal() {
        this.showAdminModal = false;
        this.editingAttendanceId = null;
    }

    get modalTitle(): string {
        return this.editingAttendanceId ? 'Editar asistencia' : 'Registrar asistencia';
    }

    // Mensaje del error a nivel de formulario (rango / fechas futuras).
    get formLevelError(): string | null {

        const form = this.adminAttendanceForm;

        if (!form.touched && !form.dirty) return null;

        if (form.hasError('invalidRange')) {
            return 'La hora de salida debe ser posterior a la hora de entrada.';
        }

        if (form.hasError('futureCheckIn')) {
            return 'La hora de entrada no puede estar en el futuro.';
        }

        if (form.hasError('futureCheckOut')) {
            return 'La hora de salida no puede estar en el futuro.';
        }

        return null;
    }

    // CARGAR USUARIOS

    loadUsers() {

        this.apiUser.getAll()
            .then((users: UserModel[]) => {

                this.users = sortUsersByName(users.filter(u => u.isActive));

                this.cdr.markForCheck();

            })
            .catch(() => {
                this.notificationService.error('Error al cargar los usuarios');
            });
    }

    // GUARDAR ASISTENCIA ADMIN

    saveAdminAttendance() {

        if (!this.isAdmin) {
            this.adminAttendanceForm.markAllAsTouched();
            return;
        }

        if (this.adminAttendanceForm.invalid) {
            this.adminAttendanceForm.markAllAsTouched();
            this.notificationService.warning(
                this.formLevelError || 'Complete los datos requeridos de la asistencia.');
            return;
        }

        this.sharedService.setLoading(true);

        const payload = this.adminAttendanceForm.value;

        if (this.editingAttendanceId) {

            this.apiAttendance.updateAttendance(
                this.editingAttendanceId,
                payload
            ).subscribe({

                next: () => {

                    this.closeAdminModal();

                    this.loadAttendances();

                    this.notificationService.success('Asistencia actualizada correctamente.');

                    this.sharedService.setLoading(false);
                },

                error: () => {
                    this.notificationService.error('Error al actualizar la asistencia');
                    this.sharedService.setLoading(false);
                }
            });

        } else {

            this.apiAttendance.createForUser(payload).subscribe({

                next: () => {

                    this.closeAdminModal();

                    this.loadAttendances();

                    this.notificationService.success('Asistencia registrada correctamente.');

                    this.sharedService.setLoading(false);
                },

                error: () => {
                    this.notificationService.error('Error al crear la asistencia');
                    this.sharedService.setLoading(false);
                }
            });

        }
    }

    // BUSCADOR

    onSearch(event: any) {

        this.searchTerm = event.target.value;

        this.onFilter();
    }

    onFilter() {

        this.attendances = this.attendancesOrigin;

        if (!this.searchTerm || this.searchTerm.trim() === '') return;

        const term = this.searchTerm.toLowerCase();

        this.attendances = this.attendances.filter(a =>

            (a.userName && a.userName.toLowerCase().includes(term))

            || a.userId.toString().includes(term)

            || (a.checkIn && new Date(a.checkIn).toLocaleDateString().toLowerCase().includes(term))

            || (a.checkOut && new Date(a.checkOut).toLocaleDateString().toLowerCase().includes(term))
        );
    }

    // EDITAR ASISTENCIA ADMIN

    editAttendance(attendance: AttendanceModel) {

        this.editingAttendanceId = attendance.attendanceId;

        if (this.users.length === 0) {

            this.apiUser.getAll()
                .then((users: UserModel[]) => {

                    this.users = sortUsersByName(users.filter(u => u.isActive));

                    this.setFormValues(attendance);

                    this.showAdminModal = true;

                    this.cdr.detectChanges();
                });

        } else {

            this.setFormValues(attendance);

            this.showAdminModal = true;
        }
    }

    setFormValues(attendance: AttendanceModel) {

        this.adminAttendanceForm.patchValue({
            userId: attendance.userId,
            checkIn: this.formatDate(attendance.checkIn),
            checkOut: attendance.checkOut
                ? this.formatDate(attendance.checkOut)
                : null
        });
    }

    formatDate(date: any) {

        const d = new Date(date);

        const pad = (n: number) => n.toString().padStart(2, '0');

        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
}