import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PayrollAdjustmentModel } from '../../../shared/models/payroll-adjustment.model';
import { ApiPayrollAdjustmentService } from '../../../services/api-payroll-adjustment.service';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-payroll-adjustments',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, ReactiveFormsModule],
    providers: [FormBuilder],
    templateUrl: './payroll-adjustments.component.html',
    styleUrls: ['./payroll-adjustments.component.scss']
})
export class PayrollAdjustmentsComponent implements OnInit {

    adjustments: PayrollAdjustmentModel[] = [];
    adjustmentsOrigin: PayrollAdjustmentModel[] = [];
    adjustmentForm: FormGroup;

    showFormModal = false;
    showDeleteModal = false;
    isEditing = false;
    adjustmentToDelete: PayrollAdjustmentModel | null = null;
    searchTerm = '';

    constructor(
        private apiAdjustment: ApiPayrollAdjustmentService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.adjustmentForm = this.fb.group({
            adjustmentId: [0],
            userId: ['', Validators.required],
            amount: ['', Validators.required],
            type: ['Extra', Validators.required],
            reason: [''],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadAdjustments();
    }

    loadAdjustments() {
        const userId = 0; // luego tomar de sesión

        this.sharedService.setLoading(true);

        this.apiAdjustment.getByUser(userId).subscribe({
            next: (data) => {
                this.adjustments = data;
                this.adjustmentsOrigin = data;
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
        this.adjustments = this.adjustmentsOrigin;

        if (!this.searchTerm || this.searchTerm.trim() === '') return;

        const term = this.searchTerm.toLowerCase();

        this.adjustments = this.adjustments.filter(a =>
            a.userId.toString().includes(term) ||
            a.type.toLowerCase().includes(term)
        );
    }

    openCreateModal() {
        this.isEditing = false;
        this.adjustmentForm.reset({ adjustmentId: 0, type: 'Extra', isActive: true });
        this.showFormModal = true;
    }

    openDeleteModal(adj: PayrollAdjustmentModel) {
        this.adjustmentToDelete = adj;
        this.showDeleteModal = true;
    }

    saveAdjustment() {
        if (this.adjustmentForm.invalid) {
            this.adjustmentForm.markAllAsTouched();
            return;
        }

        this.sharedService.setLoading(true);

        this.apiAdjustment.create(this.adjustmentForm.value).subscribe({
            next: () => {
                this.showFormModal = false;
                this.loadAdjustments();
                this.sharedService.setLoading(false);
            },
            error: () => this.sharedService.setLoading(false)
        });
    }

    confirmDelete() {
        if (!this.adjustmentToDelete) return;

        this.sharedService.setLoading(true);

        this.apiAdjustment.delete(this.adjustmentToDelete.adjustmentId).subscribe({
            next: () => {
                this.showDeleteModal = false;
                this.adjustmentToDelete = null;
                this.loadAdjustments();
                this.sharedService.setLoading(false);
            },
            error: () => this.sharedService.setLoading(false)
        });
    }
}