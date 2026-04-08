import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiAlertService } from '../../../services/api-alert.service';
import { AlertModel } from '../../../shared/models/alert.model';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-alerts',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './alerts.component.html',
    styles: [`
        .message-clamp {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .border-4 { border-width: 4px !important; }
    `]
})
export class AlertsComponent implements OnInit {

    alerts: AlertModel[] = [];
    selectedAlert: AlertModel | null = null;

    constructor(
        private api: ApiAlertService,
        private shared: SharedService,
        private notificationService: NotificationService
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
            error: () => {
                this.notificationService.error('No se pudieron cargar las alertas. Intente de nuevo.');
                this.shared.setLoading(false);
            }
        });
    }

    openDetail(alert: AlertModel) {
        this.selectedAlert = alert;
    }

    closeDetail(event: MouseEvent) {
        this.selectedAlert = null;
    }

    markAsRead(alert: AlertModel) {
        this.api.markAsRead(alert.alertId).subscribe({
            next: () => {
                this.alerts = this.alerts.filter(x => x.alertId !== alert.alertId);
            }
        });
    }
}