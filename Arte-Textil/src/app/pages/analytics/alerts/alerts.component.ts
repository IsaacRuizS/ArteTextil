import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiAlertService } from '../../../services/api-alert.service';
import { AlertModel } from '../../../shared/models/alert.model';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-alerts',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './alerts.component.html'
})
export class AlertsComponent implements OnInit {

    alerts: AlertModel[] = [];

    constructor(
        private api: ApiAlertService,
        private shared: SharedService
    ) {}

    ngOnInit(): void {
        this.load();
    }

    load() {
        this.shared.setLoading(true);

        this.api.getAll().subscribe({
            next: data => {
                this.alerts = data;
                this.shared.setLoading(false);
            },
            error: () => this.shared.setLoading(false)
        });
    }

    markAsRead(alert: AlertModel) {

        this.api.markAsRead(alert.alertId).subscribe({
            next: () => {
                this.alerts = this.alerts.filter(x => x.alertId !== alert.alertId);
            }
        });
    }
}