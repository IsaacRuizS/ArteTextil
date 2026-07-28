import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

import { AttendanceModel } from '../../../shared/models/attendance.model';
import { UserModel } from '../../../shared/models/user.model';

import { ApiAttendanceService } from '../../../services/api-attendance.service';
import { ApiUserService } from '../../../services/api-user.service';
import { SharedService } from '../../../services/shared.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-attendance',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
    templateUrl: './attendance.component.html',
    styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

    attendances: AttendanceModel[] = [];
    attendancesOrigin: AttendanceModel[] = [];

    searchTerm = '';
    dateFrom = '';
    dateTo = '';
    statusFilter = 'all';

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

        this.adminAttendanceForm = this.fb.group({
            userId: ['', Validators.required],
            checkIn: ['', Validators.required],
            checkOut: ['']
        });

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
                    this.attendances = data;
                    this.attendancesOrigin = data;
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
                    this.attendances = data;
                    this.attendancesOrigin = data;
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

        this.adminAttendanceForm.reset();

        this.showAdminModal = true;

        if (this.users.length === 0) {
            this.loadUsers();
        }
    }

    // CARGAR USUARIOS

    loadUsers() {

        this.apiUser.getAll()
            .then((users: UserModel[]) => {

                this.users = users;

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
            this.notificationService.warning('Complete los datos requeridos de la asistencia');
            return;
        }

        this.sharedService.setLoading(true);

        const payload = this.buildAttendancePayload();

        if (payload.checkOut && payload.checkOut < payload.checkIn) {
            this.notificationService.error('El check-out no puede ser menor que el check-in');
            this.sharedService.setLoading(false);
            return;
        }

        if (this.editingAttendanceId) {

            this.apiAttendance.updateAttendance(
                this.editingAttendanceId,
                payload
            ).subscribe({

                next: () => {

                    this.showAdminModal = false;

                    this.editingAttendanceId = null;

                    this.loadAttendances();

                    this.sharedService.setLoading(false);
                },

                error: (err) => {
                    this.notificationService.error(this.getErrorMessage(err, 'Error al actualizar la asistencia'));
                    this.sharedService.setLoading(false);
                }
            });

        } else {

            this.apiAttendance.createForUser(payload).subscribe({

                next: () => {

                    this.showAdminModal = false;

                    this.loadAttendances();

                    this.sharedService.setLoading(false);
                },

                error: (err) => {
                    this.notificationService.error(this.getErrorMessage(err, 'Error al crear la asistencia'));
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

        let data = [...this.attendancesOrigin];

        const term = this.searchTerm.toLowerCase();

        if (term.trim()) {
            data = data.filter(a =>

                (a.userName && a.userName.toLowerCase().includes(term))

                || a.userId.toString().includes(term)

                || (a.checkIn && new Date(a.checkIn).toLocaleDateString().toLowerCase().includes(term))

                || (a.checkOut && new Date(a.checkOut).toLocaleDateString().toLowerCase().includes(term))
            );
        }

        if (this.dateFrom) {
            const from = new Date(`${this.dateFrom}T00:00:00`);
            data = data.filter(a => a.checkIn && new Date(a.checkIn) >= from);
        }

        if (this.dateTo) {
            const to = new Date(`${this.dateTo}T23:59:59`);
            data = data.filter(a => a.checkIn && new Date(a.checkIn) <= to);
        }

        if (this.statusFilter === 'complete') {
            data = data.filter(a => !!a.checkOut);
        }

        if (this.statusFilter === 'pending') {
            data = data.filter(a => !a.checkOut);
        }

        this.attendances = data;
        this.page = 1;
    }

    // EDITAR ASISTENCIA ADMIN

    editAttendance(attendance: AttendanceModel) {

        this.editingAttendanceId = attendance.attendanceId;

        if (this.users.length === 0) {

            this.apiUser.getAll()
                .then((users: UserModel[]) => {

                    this.users = users;

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

    private buildAttendancePayload() {
        const value = this.adminAttendanceForm.value;

        return {
            userId: Number(value.userId),
            checkIn: value.checkIn || null,
            checkOut: value.checkOut || null
        };
    }

    private getErrorMessage(err: any, fallback: string): string {
        return err?.error?.message || err?.error?.Message || err?.message || fallback;
    }
}
