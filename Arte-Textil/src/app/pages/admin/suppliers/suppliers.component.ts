import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupplierModel } from '../../../shared/models/supplier.model';
import { ApiSupplierService } from '../../../services/api-supplier.service';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-suppliers',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, ReactiveFormsModule],
    providers: [FormBuilder],
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {

    suppliers: SupplierModel[] = [];
    suppliersOrigins: SupplierModel[] = [];
    supplierForm: FormGroup;

    // UI State
    showFormModal = false;
    showDeleteModal = false;
    isEditing = false;
    supplierToDelete: SupplierModel | null = null;
    searchTerm = '';

    constructor(
        private apiSupplierService: ApiSupplierService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.supplierForm = this.fb.group({
            supplierId: [0],
            name: ['', [Validators.required, Validators.minLength(3)]],
            contactPerson: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.minLength(8)]],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadSuppliers();
    }

    loadSuppliers() {

        this.sharedService.setLoading(true);

        this.apiSupplierService.getAll().subscribe({
            next: (suppliers: SupplierModel[]) => {

                this.suppliers = suppliers;
                this.suppliersOrigins = suppliers;

                this.cdr.markForCheck();
                this.sharedService.setLoading(false);
            },
            error: () => {
                this.sharedService.setLoading(false);
            }
        });
    }




    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.onFilterInfo();
    }

    onFilterInfo() {

        this.suppliers = this.suppliersOrigins;

        if (!this.searchTerm || this.searchTerm.trim() === '') return;

        const term = this.searchTerm.toLowerCase();

        this.suppliers = this.suppliers.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term) ||
            s.phone.toLowerCase().includes(term) ||
            s.contactPerson.toLowerCase().includes(term)
        );
    }

    // ACTIONS
    openCreateModal() {
        this.isEditing = false;
        this.supplierForm.reset({ supplierId: 0, isActive: true });
        this.showFormModal = true;
    }

    openEditModal(supplier: SupplierModel) {
        this.isEditing = true;
        this.supplierForm.patchValue(supplier);
        this.showFormModal = true;
    }

    saveSupplier() {

        if (this.supplierForm.invalid) {
            this.supplierForm.markAllAsTouched();
            return;
        }

        this.sharedService.setLoading(true);

        if (this.isEditing) {
            this._editSupplier(this.supplierForm.value);
        } else {
            this._createSupplier(this.supplierForm.value);
        }
    }

    // DELETE
    openDeleteModal(supplier: SupplierModel) {
        this.supplierToDelete = supplier;
        this.showDeleteModal = true;
    }

    confirmDelete() {

        if (this.supplierToDelete) {

            this._deleteSupplier(this.supplierToDelete.supplierId);
        }
    }

    private _createSupplier(supplierData: SupplierModel) {

        this.apiSupplierService.create(supplierData).subscribe({
            next: () => {

                this.showFormModal = false;
                this.loadSuppliers();

                this.sharedService.setLoading(false);
            },
            error: () => {
                this.sharedService.setLoading(false);
            }
        });
    }

    private _editSupplier(supplierData: SupplierModel) {

        this.apiSupplierService.update(supplierData).subscribe({
            next: () => {

                this.showFormModal = false;
                this.loadSuppliers();

                this.sharedService.setLoading(false);
            },
            error: () => {
                this.sharedService.setLoading(false);
            }
        });
    }

    private _deleteSupplier(supplierId: number) {

        let supplier = this.suppliersOrigins.find(s => s.supplierId === supplierId)?.isActive;
        
        this.apiSupplierService.updateStatus(supplierId, !supplier).subscribe({
            next: () => {

                this.showDeleteModal = false;
                this.supplierToDelete = null;
                this.loadSuppliers();

                this.sharedService.setLoading(false);
            },
            error: () => {
                this.sharedService.setLoading(false);
            }
        });
    }

}
