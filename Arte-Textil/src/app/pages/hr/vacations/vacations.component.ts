import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VacationModel } from '../../../shared/models/vacation.model';
import { ApiVacationService } from '../../../services/api-vacation.service';
import { SharedService } from '../../../services/shared.service';
import { ApiUserService } from '../../../services/api-user.service';
import { NotificationService } from '../../../services/notification.service';
import { UserModel } from '../../../shared/models/user.model';

@Component({
    selector: 'app-vacations',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, ReactiveFormsModule],
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

    // cambiar manualmente para probar
    isAdmin = false;

    users: UserModel[] = [];

    constructor(
        private apiVacation: ApiVacationService,
        private apiUser: ApiUserService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.vacationForm = this.fb.group({
            userId: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            notes: ['']
        });
    }

    ngOnInit(): void {

        const token = localStorage.getItem('auth_token');

        if (token) {
            const payload: any = JSON.parse(atob(token.split('.')[1]));

            this.isAdmin = payload?.roleId === "1";
        }

        this.showFormModal = false;

        if (this.isAdmin) {
            this.loadUsers();
        }

        this.loadVacations();
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
                this.cdr.markForCheck();
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

                this.cdr.markForCheck();
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

    this.sharedService.setLoading(true);

    const payload = {
        userId: Number(this.vacationForm.get('userId')?.value),
        startDate: this.vacationForm.get('startDate')?.value,
        endDate: this.vacationForm.get('endDate')?.value,
        notes: this.vacationForm.get('notes')?.value
    };

    this.apiVacation.create(payload).subscribe({
        next: () => {
            this.vacationForm.reset();
            this.showFormModal = false;

            this.loadVacations();

            this.sharedService.setLoading(false);
        },
        error: () => {
            this.notificationService.error('Error al crear la solicitud de vacaciones');
            this.sharedService.setLoading(false);
        }
    });
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