import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VacationModel } from '../../../shared/models/vacation.model';
import { ApiVacationService } from '../../../services/api-vacation.service';
import { SharedService } from '../../../services/shared.service';

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

    constructor(
        private apiVacation: ApiVacationService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.vacationForm = this.fb.group({
            startDate: ['', Validators.required],
            endDate: ['', Validators.required]
        });
    }

  ngOnInit(): void {

    const token = localStorage.getItem('auth_token');

    if (token) {
        const payload: any = JSON.parse(atob(token.split('.')[1]));

        console.log("TOKEN PAYLOAD:", payload);

        this.isAdmin = payload?.roleId === "1";
    }

    this.showFormModal = false;
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
        error: () => this.sharedService.setLoading(false)
    });
}
    // Buscador
    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.onFilter();
    }

    onFilter() {

    const source = [...this.vacationsOrigin];  // 👈 copia real

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
        startDate: this.vacationForm.value.startDate,
        endDate: this.vacationForm.value.endDate
    };

    this.apiVacation.create(payload).subscribe({
        next: () => {

            this.vacationForm.reset();

            this.showFormModal = false;

            this.loadVacations();

            this.sharedService.setLoading(false);
        },
        error: (err) => {
            console.error("ERROR CREAR", err);
            this.sharedService.setLoading(false);
        }
    });
}

    // Admin
   approve(vacation: VacationModel) {

    console.log("APROBAR", vacation);

    this.sharedService.setLoading(true);

    this.apiVacation.approve(vacation.vacationRequestId).subscribe({
        next: () => {
            console.log("APROBADO OK");
            this.loadVacations();
            this.sharedService.setLoading(false);
        },
        error: (err) => {
            console.error("ERROR APROBAR", err);
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
            error: () => this.sharedService.setLoading(false)
        });
    }
}