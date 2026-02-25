import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerSegmentModel } from '../../../shared/models/customer-segment.model';
import { ApiCustomerService } from '../../../services/api-customer.service';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-customer-segmentation',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './customer-segmentation.component.html'
})
export class CustomerSegmentationComponent implements OnInit {

    segments: CustomerSegmentModel[] = [];
    filter = '';

    constructor(
        private apiCustomer: ApiCustomerService,
        private shared: SharedService
    ) {}

    ngOnInit(): void {
        this.load();
    }

    load() {

        this.shared.setLoading(true);

        this.apiCustomer.getSegments(this.filter).subscribe({
            next: data => {
                this.segments = data;
                this.shared.setLoading(false);
            },
            error: () => this.shared.setLoading(false)
        });
    }

    changeFilter(event: any) {
        this.filter = event.target.value;
        this.load();
    }
}