import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
    InventoryItemModel, 
    RegisterMovementModel, 
    StockAlertModel,
    InventoryReportModel,
    InventoryMovementModel
} from '../../../shared/models/inventory.model';
import { ApiInventoryService } from '../../../services/api-inventory.service';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-inventory',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, ReactiveFormsModule],
    providers: [FormBuilder],
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, OnDestroy {

    inventory: InventoryItemModel[] = [];
    inventoryOrigin: InventoryItemModel[] = [];
    alerts: StockAlertModel[] = [];
    movementForm: FormGroup;
    report: InventoryReportModel | null = null;
    selectedProduct: InventoryItemModel | null = null;
    productHistory: InventoryMovementModel[] = [];

    // UI State
    showMovementModal = false;
    showQuickMovementModal = false;
    showAlertsModal = false;
    showReportModal = false;
    showReportDropdown = false;
    showAvailabilityModal = false;
    showHistoryModal = false;
    searchTerm = '';
    filterLowStock = false;
    reportType: 'general' | 'category' | 'lowstock' | 'top' | 'value' = 'general';

    movementTypes = ['Entrada', 'Salida', 'Ajuste'];
    private alertsInterval: any;

    get criticalAlertsCount(): number {
        return this.alerts.filter(a => a.alertLevel === 'Crítico').length;
    }

    constructor(
        private apiInventoryService: ApiInventoryService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.movementForm = this.fb.group({
            productId: [0, Validators.required],
            type: ['Entrada', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            reason: [''],
            performedByUserId: [1] // TODO: Get from authenticated user
        });
    }

    ngOnInit(): void {
        this.loadInventory();
        this.loadAlerts();
        
        // Verificar alertas cada 30 segundos para detectar cambios automáticamente
        this.alertsInterval = setInterval(() => {
            this.loadAlerts();
        }, 30000); // 30 segundos
    }

    ngOnDestroy(): void {
        // Limpiar el intervalo cuando el componente se destruye
        if (this.alertsInterval) {
            clearInterval(this.alertsInterval);
        }
    }

    loadInventory() {
        this.sharedService.setLoading(true);

        this.apiInventoryService.getInventory().subscribe({
            next: (inventory: InventoryItemModel[]) => {
                this.inventory = inventory;
                this.inventoryOrigin = inventory;
                this.cdr.markForCheck();
                this.sharedService.setLoading(false);
            },
            error: (err) => {
                console.error('Error loading inventory:', err);
                this.sharedService.setLoading(false);
            }
        });
    }

    loadAlerts() {
        this.apiInventoryService.getStockAlerts().subscribe({
            next: (alerts: StockAlertModel[]) => {
                this.alerts = alerts;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Error loading alerts:', err);
            }
        });
    }

    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.applyFilters();
    }

    onToggleLowStockFilter() {
        this.filterLowStock = !this.filterLowStock;
        this.applyFilters();
    }

    applyFilters() {
        this.inventory = this.inventoryOrigin;

        // Filter by search term
        if (this.searchTerm && this.searchTerm.trim() !== '') {
            const term = this.searchTerm.toLowerCase();
            this.inventory = this.inventory.filter(item =>
                item.productName.toLowerCase().includes(term) ||
                (item.productCode && item.productCode.toLowerCase().includes(term)) ||
                (item.categoryName && item.categoryName.toLowerCase().includes(term))
            );
        }

        // Filter by low stock
        if (this.filterLowStock) {
            this.inventory = this.inventory.filter(item => item.isLowStock);
        }
    }

    // ACTIONS
    openMovementModal(item: InventoryItemModel) {
        this.movementForm.reset({
            productId: item.productId,
            type: 'Entrada',
            quantity: 1,
            reason: '',
            performedByUserId: 1
        });
        this.selectedProduct = item;
        this.showMovementModal = true;
    }

    openQuickMovementModal() {
        this.movementForm.reset({
            productId: 0,
            type: 'Entrada',
            quantity: 1,
            reason: '',
            performedByUserId: 1
        });
        this.selectedProduct = null;
        this.showQuickMovementModal = true;
    }

    saveMovement() {
        if (this.movementForm.invalid) {
            this.movementForm.markAllAsTouched();
            return;
        }

        this.sharedService.setLoading(true);

        const movement: RegisterMovementModel = this.movementForm.value;

        this.apiInventoryService.registerMovement(movement).subscribe({
            next: () => {
                this.sharedService.setLoading(false);
                this.showMovementModal = false;
                this.showQuickMovementModal = false;
                this.loadInventory();
                this.loadAlerts();
                alert('✅ Movimiento registrado correctamente');
            },
            error: (err) => {
                this.sharedService.setLoading(false);
                alert(err?.message || 'Error al registrar movimiento');
            }
        });
    }

    openAlertsModal() {
        this.showAlertsModal = true;
    }

    toggleReportDropdown() {
        this.showReportDropdown = !this.showReportDropdown;
    }

    generateGeneralReport() {
        this.reportType = 'general';
        this.generateReport();
    }

    generateCategoryReport() {
        this.reportType = 'category';
        this.generateReportByType();
    }

    generateLowStockReport() {
        this.reportType = 'lowstock';
        this.generateReportByType();
    }

    generateTopProductsReport() {
        this.reportType = 'top';
        this.generateReportByType();
    }

    generateValueReport() {
        this.reportType = 'value';
        this.generateReportByType();
    }

    generateReport() {
        this.sharedService.setLoading(true);

        this.apiInventoryService.generateReport().subscribe({
            next: (report: InventoryReportModel) => {
                this.report = report;
                this.showReportModal = true;
                this.sharedService.setLoading(false);
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.sharedService.setLoading(false);
                alert(err?.message || 'Error al generar reporte');
            }
        });
    }

    generateReportByType() {
        this.sharedService.setLoading(true);

        // Crear reporte personalizado según el tipo
        const report: InventoryReportModel = {
            reportDate: new Date(),
            generatedAt: new Date(),
            totalProducts: this.inventoryOrigin.length,
            lowStockProducts: this.inventoryOrigin.filter(i => i.isLowStock).length,
            outOfStockProducts: this.inventoryOrigin.filter(i => i.stock === 0).length,
            totalInventoryValue: this.inventoryOrigin.reduce((sum, i) => sum + (i.stock * i.price), 0),
            items: [...this.inventoryOrigin]
        };

        // Ordenar según el tipo de reporte
        switch (this.reportType) {
            case 'category':
                // Ordenar por categoría
                report.items = report.items.sort((a, b) => 
                    (a.categoryName || '').localeCompare(b.categoryName || '')
                );
                break;
            case 'lowstock':
                // Solo productos con stock bajo
                report.items = report.items.filter(i => i.isLowStock || i.stock === 0);
                report.totalProducts = report.items.length;
                break;
            case 'top':
                // Top productos por valor (stock * precio)
                report.items = report.items.sort((a, b) => 
                    (b.stock * b.price) - (a.stock * a.price)
                ).slice(0, 20);
                break;
            case 'value':
                // Ordenar por valor total descendente
                report.items = report.items.sort((a, b) => 
                    (b.stock * b.price) - (a.stock * a.price)
                );
                break;
        }

        this.report = report;
        this.showReportModal = true;
        this.sharedService.setLoading(false);
        this.cdr.markForCheck();
    }

    getStockClass(item: InventoryItemModel): string {
        if (item.stock === 0) return 'text-danger fw-bold';
        if (item.isLowStock) return 'text-warning fw-bold';
        return 'text-success';
    }

    getAlertClass(alert: StockAlertModel): string {
        if (alert.alertLevel === 'Crítico') return 'bg-danger-subtle text-danger';
        if (alert.alertLevel === 'Bajo') return 'bg-warning-subtle text-warning';
        return 'bg-success-subtle text-success';
    }

    // RF-03-003: Consultar disponibilidad de materiales
    checkProductAvailability(item: InventoryItemModel) {
        this.sharedService.setLoading(true);
        
        this.apiInventoryService.checkAvailability(item.productId).subscribe({
            next: (product: InventoryItemModel) => {
                this.selectedProduct = product;
                this.showAvailabilityModal = true;
                this.sharedService.setLoading(false);
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.sharedService.setLoading(false);
                alert(err?.message || 'Error al consultar disponibilidad');
            }
        });
    }

    // Ver historial de movimientos del producto
    viewProductHistory(item: InventoryItemModel) {
        this.sharedService.setLoading(true);
        this.selectedProduct = item;
        
        this.apiInventoryService.getMovementHistory(item.productId).subscribe({
            next: (history: InventoryMovementModel[]) => {
                this.productHistory = history;
                this.showHistoryModal = true;
                this.sharedService.setLoading(false);
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.sharedService.setLoading(false);
                alert(err?.message || 'Error al obtener historial');
            }
        });
    }
}
