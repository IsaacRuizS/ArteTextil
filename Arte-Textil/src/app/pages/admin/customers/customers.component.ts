import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { CustomerModel } from '../../../shared/models/customer.model';
import { ApiCustomerService } from '../../../services/api-customer.service';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-customers',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, FormsModule],
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
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {

        this.customerForm = this.fb.group({
            customerId: [0],
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.email]],
            phone: [''],
            userId: [''],
            classification: [''],
            activityScore: [0],
            isActive: [true]
        });

    }

    ngOnInit(): void {
        this.loadCustomers();
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
                this.sharedService.setLoading(false);
            }

        });
    }

}