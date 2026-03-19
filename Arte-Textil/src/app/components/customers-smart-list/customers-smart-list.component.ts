import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CustomerModel } from '../../shared/models/customer.model';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-customers-smart-list',
    templateUrl: './customers-smart-list.component.html',
    imports: [CommonModule, NgxPaginationModule],
})
export class CustomersSmartListComponent {

    @Input() customers: CustomerModel[] = [];
    @Input() page: number = 1;
    @Input() showActions: boolean = true;
    @Input() itemsPerPage: number = 50;

    @Output() pageChange = new EventEmitter<number>();
    @Output() edit = new EventEmitter<CustomerModel>();
    @Output() toggleStatus = new EventEmitter<CustomerModel>();

    constructor() { }

    getClassificationClass(classification?: string): string {

        switch (classification) {
            case 'Cliente Nuevo':
                return 'bg-primary-subtle text-primary';

            case 'Cliente Frecuente':
                return 'bg-success-subtle text-success';

            case 'Cliente Premium':
                return 'bg-warning-subtle text-warning';

            case 'Cliente Inactivo':
                return 'bg-secondary-subtle text-secondary';

            default:
                return 'bg-light text-dark';
        }
    }

}