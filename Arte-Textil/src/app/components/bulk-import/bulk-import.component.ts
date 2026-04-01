import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiBulkImportService, BulkImportResult } from '../../services/api-bulk-import.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-bulk-import',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './bulk-import.component.html'
})
export class BulkImportComponent {
    @Input() entity!: string;
    @Output() imported = new EventEmitter<void>();

    loading = false;
    result: BulkImportResult | null = null;

    constructor(
        private bulkImportService: ApiBulkImportService,
        private notificationService: NotificationService
    ) {}

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        const file = input.files[0];
        this.loading = true;
        this.result = null;

        this.bulkImportService.import(this.entity, file).subscribe({
            next: (res) => {
                this.loading = false;
                this.result = res.data;
                if (res.data.imported > 0) {
                    this.notificationService.success(`${res.data.imported} registros importados correctamente.`);
                    this.imported.emit();
                }
                if (res.data.errors > 0) {
                    const msgs = res.data.errorMessages.slice(0, 5).join(' | ');
                    this.notificationService.warning(`${res.data.errors} filas con errores: ${msgs}`);
                }
            },
            error: () => {
                this.loading = false;
                this.notificationService.error('Error al procesar el archivo.');
            }
        });
    }
}
