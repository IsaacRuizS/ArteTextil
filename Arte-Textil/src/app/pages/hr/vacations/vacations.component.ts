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

    showFormModal = false;
    isEditing = false;
    searchTerm = '';

    constructor(
        private apiVacation: ApiVacationService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.vacationForm = this.fb.group({
            vacationId: [0],
            userId: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadVacations();
    }

    loadVacations() {
        this.sharedService.setLoading(true);

        this.apiVacation.getPending().subscribe({
            next: (data) => {
                this.vacations = data;
                this.vacationsOrigin = data;
                this.cdr.markForCheck();
                this.sharedService.setLoading(false);
            },
            error: () => this.sharedService.setLoading(false)
        });
    }

    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.onFilter();
    }

    onFilter() {
        this.vacations = this.vacationsOrigin;

        if (!this.searchTerm || this.searchTerm.trim() === '') return;

        const term = this.searchTerm.toLowerCase();

        this.vacations = this.vacations.filter(v =>
            v.userId.toString().includes(term) ||
            v.status.toLowerCase().includes(term)
        );
    }

    approve(vacation: VacationModel) {
        const approvedByUserId = 1; // luego tomar del token
        this.sharedService.setLoading(true);

        this.apiVacation.approve(vacation.vacationId, approvedByUserId).subscribe({
            next: () => {
                this.loadVacations();
                this.sharedService.setLoading(false);
            },
            error: () => this.sharedService.setLoading(false)
        });
    }

    reject(vacation: VacationModel) {
        const approvedByUserId = 1;
        this.sharedService.setLoading(true);

        this.apiVacation.reject(vacation.vacationId, approvedByUserId).subscribe({
            next: () => {
                this.loadVacations();
                this.sharedService.setLoading(false);
            },
            error: () => this.sharedService.setLoading(false)
        });
    }
}