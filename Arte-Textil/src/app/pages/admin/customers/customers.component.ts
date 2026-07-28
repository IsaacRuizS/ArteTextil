import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BulkImportComponent } from '../../../components/bulk-import/bulk-import.component';

import { CustomerModel } from '../../../shared/models/customer.model';
import { ApiCustomerService } from '../../../services/api-customer.service';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';
import { CustomersSmartListComponent } from '../../../components/customers-smart-list/customers-smart-list.component';

@Component({
    selector: 'app-customers',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, FormsModule, CustomersSmartListComponent, BulkImportComponent],
    providers: [FormBuilder],
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

    customers: CustomerModel[] = [];
    customersOrigins: CustomerModel[] = [];

    customerForm: FormGroup;

    showFormModal = false;
    showDeleteModal = false;
    isEditing = false;

    customerToDelete: CustomerModel | null = null;

    searchTerm = '';

    statusFilter: number = 1;

    page = 1;

    constructor(
        private apiCustomerService: ApiCustomerService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {

        this.customerForm = this.fb.group({
            customerId: [0],
            fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
            phone: ['', [Validators.pattern(/^[0-9+\s-]{8,15}$/)]],
            userId: [''],
            classification: ['', [Validators.required]],
            activityScore: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            isActive: [true]
        });

    }

    ngOnInit(): void {
        this.loadCustomers();
    }

    get formErrors(): string[] {

        const errors: string[] = [];
        const controls = this.customerForm.controls;

        if (controls['fullName'].touched && controls['fullName'].errors) {
            if (controls['fullName'].errors['required']) errors.push('El nombre completo es obligatorio.');
            if (controls['fullName'].errors['minlength']) errors.push('El nombre completo debe tener al menos 3 caracteres.');
            if (controls['fullName'].errors['maxlength']) errors.push('El nombre completo no puede superar los 100 caracteres.');
        }

        if (controls['email'].touched && controls['email'].errors) {
            if (controls['email'].errors['required']) errors.push('El email es obligatorio.');
            if (controls['email'].errors['email']) errors.push('El email ingresado no es válido.');
            if (controls['email'].errors['maxlength']) errors.push('El email no puede superar los 100 caracteres.');
        }

        if (controls['phone'].touched && controls['phone'].errors) {
            if (controls['phone'].errors['pattern']) errors.push('El teléfono solo puede contener números, espacios, "+" o "-", y debe tener entre 8 y 15 caracteres.');
        }

        if (controls['classification'].touched && controls['classification'].errors) {
            if (controls['classification'].errors['required']) errors.push('Debe seleccionar una clasificación.');
        }

        if (controls['activityScore'].touched && controls['activityScore'].errors) {
            if (controls['activityScore'].errors['required']) errors.push('El activity score es obligatorio.');
            if (controls['activityScore'].errors['min']) errors.push('El activity score no puede ser menor a 0.');
            if (controls['activityScore'].errors['max']) errors.push('El activity score no puede ser mayor a 100.');
        }

        return errors;
    }

    loadCustomers() {

        this.sharedService.setLoading(true);

        this.apiCustomerService.getAll().subscribe({

            next: (customers: CustomerModel[]) => {

                this.customers = customers;
                this.customersOrigins = customers;

                this.onFilterInfo();

                this.sharedService.setLoading(false);

                this.cdr.markForCheck();
            },

            error: () => {
                this.notificationService.error('Error al cargar los clientes. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }

        });
    }

    onSearch(event: any) {

        this.searchTerm = event.target.value;

        this.onFilterInfo();
    }

    onStatusChanged() {

        this.onFilterInfo();
    }

    onFilterInfo() {

        this.customers = this.customersOrigins;

        if (this.statusFilter > 0) {

            if (this.statusFilter === 1) {
                this.customers = this.customers.filter(c => c.isActive);
            }

            if (this.statusFilter === 2) {
                this.customers = this.customers.filter(c => !c.isActive);
            }
        }

        if (this.searchTerm && this.searchTerm.trim() !== '') {

            const term = this.searchTerm.toLowerCase();

            this.customers = this.customers.filter(c =>
                c.fullName?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term) ||
                c.phone?.toLowerCase().includes(term)
            );
        }

        this.page = 1;

        this.cdr.markForCheck();
    }

    openCreateModal() {

        this.isEditing = false;

        this.customerForm.reset({
            customerId: 0,
            isActive: true
        });

        this.showFormModal = true;
    }

    openEditModal(customer: CustomerModel) {

        this.isEditing = true;

        this.customerForm.patchValue(customer);

        this.showFormModal = true;
    }

    saveCustomer() {

        if (this.customerForm.invalid) {
            this.customerForm.markAllAsTouched();
            return;
        }

        if (this.isEditing) {
            this._editCustomer(this.customerForm.value);
        } else {
            this._createCustomer(this.customerForm.value);
        }
    }

    openDeleteModal(customer: CustomerModel) {

        this.customerToDelete = customer;

        this.showDeleteModal = true;
    }

    confirmDelete() {

        if (this.customerToDelete) {

            this._deleteCustomer(this.customerToDelete.customerId!);
        }
    }

    private _createCustomer(data: CustomerModel) {

        this.sharedService.setLoading(true);

        this.apiCustomerService.create(data).subscribe({

            next: () => {

                this.showFormModal = false;

                this.loadCustomers();

                this.sharedService.setLoading(false);
            },

            error: () => {
                this.notificationService.error('Error al crear el cliente. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }

        });
    }

    private _editCustomer(data: CustomerModel) {

        this.sharedService.setLoading(true);

        this.apiCustomerService.update(data).subscribe({

            next: () => {

                this.showFormModal = false;

                this.loadCustomers();

                this.sharedService.setLoading(false);
            },

            error: () => {
                this.notificationService.error('Error al actualizar el cliente. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }

        });
    }

    private _deleteCustomer(customerId: number) {

        const customer = this.customersOrigins.find(c => c.customerId === customerId)?.isActive;

        this.apiCustomerService.updateStatus(customerId, !customer).subscribe({

            next: () => {

                this.showDeleteModal = false;

                this.customerToDelete = null;

                this.loadCustomers();

                this.sharedService.setLoading(false);
            },

            error: () => {
                this.notificationService.error('Error al cambiar el estado del cliente. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }

        });
    }

}