import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ProductDetailComponent } from './components/product-detail.component';
import { ApiProductService } from '../../services/api-product.service';
import { ApiCategoryService } from '../../services/api-category.service';
import { SharedService } from '../../services/shared.service';
import { NotificationService } from '../../services/notification.service';
import { ProductModel } from '../../shared/models/product.model';
import { CategoryModel } from '../../shared/models/category.model';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [CommonModule, FormsModule, ProductDetailComponent],
    templateUrl: './inventory.html',
    styleUrls: ['./inventory.scss']
})
export class InventoryComponent implements OnInit {

    products: ProductModel[] = [];
    productsOrigins: ProductModel[] = [];
    categories: CategoryModel[] = [];

    // Filters
    searchTerm = '';
    selectedStatus = 'Todos';
    statuses = ['Todos', 'Disponible', 'Stock Bajo', 'Agotado', 'Inactivo'];

    // Alerts
    showLowStockAlert = true;

    // Detail modal
    selectedProduct: ProductModel | null = null;

    // Movement modal
    movementProduct: ProductModel | null = null;
    movementType: 'Entrada' | 'Salida' = 'Entrada';
    movementQty = 0;
    movementDescription = '';
    movementError = '';

    constructor(
        private apiProductService: ApiProductService,
        private apiCategoryService: ApiCategoryService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadProducts();
        this.loadCategories();
    }

    loadProducts() {
        this.sharedService.setLoading(true);
        this.apiProductService.getAll()
            .pipe(finalize(() => this.sharedService.setLoading(false)))
            .subscribe({
                next: (products: ProductModel[]) => {
                    this.productsOrigins = [...products];
                    this.applyFilters();
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.notificationService.error('Error al cargar los productos del inventario. Intente de nuevo.');
                }
            });
    }

    loadCategories() {
        this.apiCategoryService.getAllActive().subscribe({
            next: (cats: CategoryModel[]) => {
                this.categories = cats;
                this.cdr.markForCheck();
            },
            error: () => {
                this.notificationService.error('Error al cargar las categorías. Intente de nuevo.');
            }
        });
    }

    getCategoryName(categoryId: number | null | undefined): string {
        if (!categoryId) return '-';
        return this.categories.find(c => c.categoryId === categoryId)?.name ?? '-';
    }

    getAvailabilityStatus(p: ProductModel): string {
        if (!p.isActive) return 'Inactivo';
        if (p.stock === 0) return 'Agotado';
        if (p.stock < p.minStock) return 'Stock Bajo';
        return 'Disponible';
    }

    get lowStockProducts(): ProductModel[] {
        return this.productsOrigins.filter(p => p.isActive && p.stock < p.minStock);
    }

    get availableCount(): number {
        return this.productsOrigins.filter(p => this.getAvailabilityStatus(p) === 'Disponible').length;
    }

    get lowStockCount(): number {
        return this.lowStockProducts.length;
    }

    get stockOutCount(): number {
        return this.productsOrigins.filter(p => this.getAvailabilityStatus(p) === 'Agotado').length;
    }

    applyFilters() {
        let filtered = [...this.productsOrigins];

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.name ?? '').toLowerCase().includes(term) ||
                (p.productCode ?? '').toLowerCase().includes(term)
            );
        }

        if (this.selectedStatus !== 'Todos') {
            filtered = filtered.filter(p => this.getAvailabilityStatus(p) === this.selectedStatus);
        }

        this.products = filtered;
    }

    // Detail modal
    selectProduct(p: ProductModel) {
        this.selectedProduct = p;
    }

    // Movement modal (RF-03-002)
    openMovementModal(p: ProductModel) {
        this.movementProduct = p;
        this.movementType = 'Entrada';
        this.movementQty = 0;
        this.movementDescription = '';
        this.movementError = '';
    }

    closeMovementModal() {
        this.movementProduct = null;
    }

    get stockResultante(): number {
        if (!this.movementProduct) return 0;
        return this.movementType === 'Entrada'
            ? this.movementProduct.stock + this.movementQty
            : this.movementProduct.stock - this.movementQty;
    }

    saveMovement() {
        if (!this.movementProduct) return;
        if (this.movementQty <= 0) {
            this.movementError = 'La cantidad debe ser mayor a 0.';
            return;
        }
        if (!this.movementDescription.trim()) {
            this.movementError = 'Ingrese una descripción del movimiento.';
            return;
        }
        if (this.movementType === 'Salida' && this.stockResultante < 0) {
            this.movementError = `Stock insuficiente. Stock actual: ${this.movementProduct.stock}`;
            return;
        }

        const updated = new ProductModel({ ...this.movementProduct, stock: this.stockResultante });

        this.sharedService.setLoading(true);
        this.apiProductService.update(updated)
            .pipe(finalize(() => this.sharedService.setLoading(false)))
            .subscribe({
                next: () => {
                    this.movementProduct = null;
                    this.loadProducts();
                },
                error: () => {
                    this.notificationService.error('Error al registrar el movimiento de inventario. Intente de nuevo.');
                    this.movementError = 'Error al registrar el movimiento. Intente de nuevo.';
                }
            });
    }

    onCloseLowStockAlert() {
        this.showLowStockAlert = false;
    }

    // RF-03-005 – Generar reporte Excel (CSV compatible)
    onGenerateExcel() {
        const headers = ['Código', 'Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Precio (₡)', 'Estado', 'Disponibilidad'];
        const rows = this.products.map(p => [
            p.productCode ?? '',
            p.name ?? '',
            this.getCategoryName(p.categoryId),
            p.stock,
            p.minStock,
            p.price,
            p.isActive ? 'Activo' : 'Inactivo',
            this.getAvailabilityStatus(p)
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\r\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
}
