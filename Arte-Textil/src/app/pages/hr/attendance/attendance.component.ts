import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

        this.sharedService.setLoading(true);

        const payload = this.adminAttendanceForm.value;

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

                error: () => {
                    this.notificationService.error('Error al actualizar la asistencia');
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
}