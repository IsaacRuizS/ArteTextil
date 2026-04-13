import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VacationModel } from '../../../shared/models/vacation.model';
import { ApiVacationService } from '../../../services/api-vacation.service';
import { SharedService } from '../../../services/shared.service';
import { ApiUserService } from '../../../services/api-user.service';
import { NotificationService } from '../../../services/notification.service';
import { UserModel } from '../../../shared/models/user.model';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
    selector: 'app-vacations',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
    providers: [FormBuilder],
    templateUrl: './vacations.component.html',
    styleUrls: ['./vacations.component.scss']
})
export class VacationsComponent implements OnInit {

    vacations: VacationModel[] = [];
    vacationsOrigin: VacationModel[] = [];
    vacationForm: FormGroup;

    showFormModal = true;
    searchTerm = '';
    page = 1;
    availableState = {
        days: 0
    };

    showError = false;
    errorMessage = '';

    // cambiar manualmente para probar
    isAdmin = false;
    userId: number = 0;

    users: UserModel[] = [];

    constructor(
        private apiVacation: ApiVacationService,
        private apiUser: ApiUserService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
    ) {
        this.vacationForm = this.fb.group({
            userId: [null],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            notes: ['']
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.loadAvailableDays());
    }

    ngOnInit(): void {

        const token = localStorage.getItem('auth_token');

        if (token) {
            const payload: any = JSON.parse(atob(token.split('.')[1]));

            this.isAdmin = payload?.roleId === "1";
            this.userId = Number(payload?.id);
        }

        this.showFormModal = false;

        // SI NO ES ADMIN → setear userId automáticamente
        if (!this.isAdmin) {
            this.vacationForm.get('userId')?.setValue(this.userId);
            this.vacationForm.get('userId')?.clearValidators();
            this.vacationForm.get('userId')?.updateValueAndValidity();
        } else {
            this.loadUsers();
        }

        this.loadVacations();

    }


    // cargar los dias disponibles
    loadAvailableDays() {
        if (!this.isAdmin) {
            this.apiVacation.getAvailableDays().subscribe({
                next: (days) => {
                    this.availableState = { days };

                    this.cdr.detectChanges();
                },
                error: (err) => console.error(err)
            });
        }
    }

    // carga segun el rol
    loadVacations() {

        this.sharedService.setLoading(true);

        const request = this.isAdmin
            ? this.apiVacation.getAll()   // Admin ve todo
            : this.apiVacation.getMine(); // Colaborador solo lo suyo

        request.subscribe({
            next: (data) => {
                this.vacations = data;
                this.vacationsOrigin = data;
                this.sharedService.setLoading(false);
            },
            error: () => {
                this.notificationService.error('Error al cargar las vacaciones');
                this.sharedService.setLoading(false);
            }
        });
    }

    loadUsers() {

        this.apiUser.getAll()
            .then((users: UserModel[]) => {

                this.users = users;

            })
            .catch(() => {
                this.notificationService.error('Error al cargar los usuarios');
            });
    }

    // Buscador
    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.onFilter();
    }

    onFilter() {

        const source = [...this.vacationsOrigin];  // copia real

        if (!this.searchTerm || this.searchTerm.trim() === '') {
            this.vacations = source;
            return;
        }

        const term = this.searchTerm.toLowerCase();

        this.vacations = source.filter(v =>
            (v.userName && v.userName.toLowerCase().includes(term))
            || v.status.toLowerCase().includes(term)
            || new Date(v.startDate).toLocaleDateString().includes(term)
            || new Date(v.endDate).toLocaleDateString().includes(term)
        );
    }

    // Formulario para colaborador
    openCreateModal() {
        this.vacationForm.reset();
        this.showFormModal = true;
    }

    saveVacation() {

        if (this.vacationForm.invalid) {
            this.vacationForm.markAllAsTouched();
            return;
        }

        setTimeout(() => {
            this.sharedService.setLoading(true);
        });

        if (this.isAdmin && !this.vacationForm.value.userId) {
            this.showErrorModal("Debe seleccionar un usuario");
            return;
        }

        const payload = {
            userId: this.isAdmin
                ? Number(this.vacationForm.value.userId)
                : this.userId,
            startDate: this.vacationForm.value.startDate,
            endDate: this.vacationForm.value.endDate,
            notes: this.vacationForm.value.notes
        };

        this.apiVacation.create(payload).subscribe({
            next: () => {

                this.vacationForm.reset();

                // volver a setear userId si es colaborador
                if (!this.isAdmin) {
                    this.vacationForm.get('userId')?.setValue(this.userId);
                }

                this.showFormModal = false;

                this.loadVacations();

                this.loadAvailableDays();

                this.sharedService.setLoading(false);
            },
            error: (err) => {

                this.showFormModal = false;

                const message =
                    err?.error?.message ||
                    err?.error?.Message ||
                    err?.message ||
                    "No tiene días disponibles";

                this.showErrorModal(message);

                this.sharedService.setLoading(false);
            }
        });
    }

    // modal de error
    showErrorModal(message: string) {
        this.errorMessage = message;
        this.showError = true;
    }

    // Admin
    approve(vacation: VacationModel) {

        this.sharedService.setLoading(true);

        this.apiVacation.approve(vacation.vacationRequestId).subscribe({
            next: () => {
                this.loadVacations();
                this.sharedService.setLoading(false);
            },
            error: () => {
                this.notificationService.error('Error al aprobar la solicitud de vacaciones');
                this.sharedService.setLoading(false);
            }
        });
    }

    reject(vacation: VacationModel) {
        this.sharedService.setLoading(true);

        this.apiVacation.reject(vacation.vacationRequestId).subscribe({
            next: () => {
                this.loadVacations();
                this.sharedService.setLoading(false);
            },
            error: () => {
                this.notificationService.error('Error al rechazar la solicitud de vacaciones');
                this.sharedService.setLoading(false);
            }
        });
    }
}