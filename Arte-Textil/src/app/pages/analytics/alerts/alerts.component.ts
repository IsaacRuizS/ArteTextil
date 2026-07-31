import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiAlertService } from '../../../services/api-alert.service';
import { AlertModel } from '../../../shared/models/alert.model';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';
import { sortByDateDesc } from '../../../shared/utils/sort-by-date';

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

    // Ids con una petición de "marcar como leída" en curso, para evitar
    // que un segundo clic dispare la misma llamada dos veces.
    private markingIds = new Set<number>();

    constructor(
        private api: ApiAlertService,
        private shared: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef
    ) {}

    isMarking(alert: AlertModel): boolean {
        return this.markingIds.has(alert.alertId);
    }

    ngOnInit(): void {
        this.load();
    }

    load() {
        this.shared.setLoading(true);

        this.api.getAll().subscribe({
            next: data => {
                // Más recientes primero.
                this.alerts = sortByDateDesc(data);
                this.shared.setLoading(false);
                this.cdr.detectChanges();
            },
            error: () => {
                this.notificationService.error('No se pudieron cargar las alertas. Intente de nuevo.');
                this.shared.setLoading(false);
                this.cdr.detectChanges();
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

        if (!alert?.alertId || this.markingIds.has(alert.alertId)) return;

        this.markingIds.add(alert.alertId);

        // Se quita de inmediato de la lista (UI optimista) y se restaura si el
        // API falla. Antes la tarjeta solo desaparecía cuando algo más
        // disparaba la detección de cambios, lo que obligaba a un segundo clic.
        const previous = this.alerts;
        this.alerts = this.alerts.filter(x => x.alertId !== alert.alertId);
        this.cdr.detectChanges();

        this.api.markAsRead(alert.alertId).subscribe({
            next: () => {
                this.markingIds.delete(alert.alertId);
                this.cdr.detectChanges();
            },
            error: (err) => {
                // Se revierte para que el usuario no crea que quedó marcada.
                this.markingIds.delete(alert.alertId);
                this.alerts = previous;
                this.notificationService.error(
                    err?.error?.message || err?.message || 'No se pudo marcar la alerta como leída.');
                this.cdr.detectChanges();
            }
        });
    }

}