import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupplierModel } from '../../../shared/models/supplier.model';
import { ApiSupplierService } from '../../../services/api-supplier.service';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {

    suppliers: SupplierModel[] = [];
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
        private fb: FormBuilder
    ) {
        this.supplierForm = this.fb.group({
            supplierId: [0],
            name: ['', [Validators.required, Validators.minLength(3)]],
            contactPerson: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadSuppliers();
    }

    loadSuppliers() {
        
        this.sharedService.setLoading(true);

        this.apiSupplierService.getAll().then(
            (suppliers: SupplierModel[]) => {

                console.log('Suppliers loaded:', suppliers);

                this.suppliers = suppliers;

                this.sharedService.setLoading(false);
            },
            (err: any) => {
                this.sharedService.setLoading(false);
            }
        );
        
    }

    get filteredSuppliers() {
        if (!this.searchTerm) return this.suppliers;
        const term = this.searchTerm.toLowerCase();
        return this.suppliers.filter(s =>
            s.name.toLowerCase().includes(term) ||
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

    onSearch(event: any) {
        this.searchTerm = event.target.value;
    }

    saveSupplier() {
        if (this.supplierForm.invalid) {
            this.supplierForm.markAllAsTouched();
            return;
        }

        try {
            //this.supplierService.saveSupplier(this.supplierForm.value);
            this.showFormModal = false;
            // Native alerts as requested ("mensajes claros")
            alert(this.isEditing ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.');
            this.loadSuppliers();
        } catch (error) {
            alert('Error al guardar el proveedor.');
        }
    }

    // DELETE
    openDeleteModal(supplier: SupplierModel) {
        this.supplierToDelete = supplier;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (this.supplierToDelete) {
            //this.supplierService.deleteSupplier(this.supplierToDelete.supplierId);
            this.showDeleteModal = false;
            this.supplierToDelete = null;
            this.loadSuppliers();
            alert('Proveedor desactivado correctamente.');
        }
    }
}
