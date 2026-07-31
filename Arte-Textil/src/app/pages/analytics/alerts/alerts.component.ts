import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiAlertService } from '../../../services/api-alert.service';
import { AlertModel, AlertType } from '../../../shared/models/alert.model';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';
import { sortByDateDesc } from '../../../shared/utils/sort-by-date';

// Ícono, etiqueta y destino de cada tema.
const TYPE_CONFIG: Record<AlertType, { icon: string; label: string; link: string }> = {
    Stock:     { icon: 'mdi-package-variant',    label: 'Inventario',  link: '/inventory' },
    Orden:     { icon: 'mdi-truck-delivery',     label: 'Pedidos',     link: '/orders-management' },
    Promocion: { icon: 'mdi-tag-multiple',       label: 'Promociones', link: '/promotions' }
};

// Items visibles en la tarjeta antes de mandar al detalle.
const PREVIEW_ITEMS = 3;

@Component({
    selector: 'app-alerts',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './alerts.component.html',
    styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {

    alerts: AlertModel[] = [];
    selectedAlert: AlertModel | null = null;

    // null = todos
    typeFilter: AlertType | null = null;

    markingAll = false;

    readonly previewItems = PREVIEW_ITEMS;

    // Evita que un segundo clic dispare la misma llamada.
    private markingIds = new Set<number>();

    constructor(
        private api: ApiAlertService,
        private shared: SharedService,
        private notificationService: NotificationService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.load();
    }

    isMarking(alert: AlertModel): boolean {
        return this.markingIds.has(alert.alertId);
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

    // PRESENTACIÓN

    icon(alert: AlertModel): string {
        return alert.type ? TYPE_CONFIG[alert.type].icon : 'mdi-bell-outline';
    }

    typeLabel(alert: AlertModel): string {
        return alert.type ? TYPE_CONFIG[alert.type].label : 'General';
    }

    // Color del borde izquierdo.
    severityClass(alert: AlertModel): string {
        switch (alert.severity) {
            case 'Alta':  return 'alert-card--high';
            case 'Media': return 'alert-card--medium';
            default:      return 'alert-card--low';
        }
    }

    severityBadgeClass(alert: AlertModel): string {
        switch (alert.severity) {
            case 'Alta':  return 'bg-danger-subtle text-danger-emphasis';
            case 'Media': return 'bg-warning-subtle text-warning-emphasis';
            default:      return 'bg-info-subtle text-info-emphasis';
        }
    }

    // Las alertas viejas traen la frase en la primera línea con contenido.
    summary(alert: AlertModel): string {

        const lines = (alert.message ?? '').split('\n');

        return lines.find(line => line.trim().length > 0)?.trim() ?? '';
    }

    // Alerta antigua, sin la indentación del generador.
    plainText(alert: AlertModel): string {

        return (alert.message ?? '')
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .trim();
    }

    // Items que quedan fuera de la vista previa.
    remainingItems(alert: AlertModel): number {
        const total = alert.detail?.items?.length ?? 0;
        return Math.max(total - PREVIEW_ITEMS, 0);
    }

    // FILTRO

    get filteredAlerts(): AlertModel[] {

        if (!this.typeFilter) return this.alerts;

        return this.alerts.filter(a => a.type === this.typeFilter);
    }

    countByType(type: AlertType): number {
        return this.alerts.filter(a => a.type === type).length;
    }

    setFilter(type: AlertType | null) {
        this.typeFilter = type;
    }

    // ACCIONES

    openDetail(alert: AlertModel) {
        this.selectedAlert = alert;
    }

    closeDetail(event?: MouseEvent) {
        this.selectedAlert = null;
    }

    goToModule(alert: AlertModel) {

        if (!alert.type) return;

        this.selectedAlert = null;
        this.router.navigateByUrl(TYPE_CONFIG[alert.type].link);
    }

    markAsRead(alert: AlertModel) {

        if (!alert?.alertId || this.markingIds.has(alert.alertId)) return;

        this.markingIds.add(alert.alertId);

        // UI optimista: se quita ya y se restaura si el API falla.
        const previous = this.alerts;
        this.alerts = this.alerts.filter(x => x.alertId !== alert.alertId);
        this.cdr.detectChanges();

        this.api.markAsRead(alert.alertId).subscribe({
            next: () => {
                this.markingIds.delete(alert.alertId);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.markingIds.delete(alert.alertId);
                this.alerts = previous;
                this.notificationService.error(
                    err?.error?.message || err?.message || 'No se pudo marcar la alerta como leída.');
                this.cdr.detectChanges();
            }
        });
    }

    markAllAsRead() {

        if (this.markingAll || this.alerts.length === 0) return;

        this.markingAll = true;

        const previous = this.alerts;
        this.alerts = [];
        this.selectedAlert = null;
        this.cdr.detectChanges();

        this.api.markAllAsRead().subscribe({
            next: (total) => {
                this.markingAll = false;
                this.notificationService.success(`${total} alerta(s) marcadas como leídas.`);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.markingAll = false;
                this.alerts = previous;
                this.notificationService.error(
                    err?.error?.message || err?.message || 'No se pudieron marcar las alertas.');
                this.cdr.detectChanges();
            }
        });
    }
}
