import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from '../../shared/pipes/crc-currency.pipe';
import { finalize } from 'rxjs';
import { ApiCategoryService } from '../../services/api-category.service';
import { ApiProductService } from '../../services/api-product.service';
import { ApiSupplierService } from '../../services/api-supplier.service';
import { SharedService } from '../../services/shared.service';
import { CategoryModel } from '../../shared/models/category.model';
import { ProductModel } from '../../shared/models/product.model';
import { SupplierModel } from '../../shared/models/supplier.model';
import { TruncatePipe } from "../../shared/pipes/truncate.pipe";
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';


@Component({
    selector: 'app-marketplace',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CustomCurrencyPipe,
        TruncatePipe
    ],
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent {

    products: ProductModel[] = [];
    productsOrigins: ProductModel[] = [];

    categories: CategoryModel[] = [];
    suppliers: SupplierModel[] = [];

    // Cantidad de productos listables por categoría / proveedor, para mostrarla
    // junto a cada opción y no ofrecer filtros que devuelven una grilla vacía.
    categoryCounts = new Map<number, number>();
    supplierCounts = new Map<number, number>();

    // Productos que el catálogo descarta por no tener imagen. Se informan en
    // pantalla en vez de desaparecer sin explicación.
    hiddenWithoutImage = 0;

    filters = {
        categoryId: 0,
        supplierId: 0,
        minPrice: null as number | null,
        maxPrice: null as number | null,
        isPromotion: false
    };


    constructor(
        public router: Router,
        private apiProductService: ApiProductService,
        public authService: AuthService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private apiSupplierService: ApiSupplierService,
        private apiCategoryService: ApiCategoryService,
        private notificationService: NotificationService,
    ) { }

    ngOnInit() {
        // Cargar productos
        this._loadProducts();
    }

    onClearFilters() {

        this.filters = {
            categoryId: 0,
            supplierId: 0,
            minPrice: null,
            maxPrice: null,
            isPromotion: false
        };

        this.products = [...this.productsOrigins];

        this.cdr.markForCheck();
    }

    get filterError(): string | null {

        const min = this.filters.minPrice;
        const max = this.filters.maxPrice;

        if (min != null && min < 0) return 'El precio mínimo no puede ser negativo.';
        if (max != null && max < 0) return 'El precio máximo no puede ser negativo.';

        if (min != null && max != null && min > max) {
            return 'El precio mínimo no puede ser mayor que el precio máximo.';
        }

        return null;
    }

    onFilter() {

        if (this.filterError) {
            this.notificationService.warning(this.filterError);
            return;
        }

        // Siempre partir del original
        let filtered = [...this.productsOrigins];


        // Categoría
        if (this.filters.categoryId && Number(this.filters.categoryId) > 0) {
            filtered = filtered.filter(p => p.categoryId == Number(this.filters.categoryId));
        }

        // Proveedor
        if (this.filters.supplierId && Number(this.filters.supplierId) > 0) {
            filtered = filtered.filter(p => p.supplierId === Number(this.filters.supplierId));
        }

        // Precio mínimo
        if (this.filters.minPrice != null) {
            filtered = filtered.filter(p => p.price >= this.filters.minPrice!);
        }

        // Precio máximo
        if (this.filters.maxPrice != null) {
            filtered = filtered.filter(p => p.price <= this.filters.maxPrice!);
        }

        // Solo promociones
        if (this.filters.isPromotion) {
            filtered = filtered.filter(p => p.promotions?.length);
        }

        this.products = filtered;

        this.cdr.markForCheck();
    }

    goBackToAdmin(): void {
        this.router.navigate(['/orders-management']);
    }

    getFinalPrice(p: ProductModel): number {

        const promo = p.bestPromotion;
        return promo
            ? p.price - (p.price * promo.discountPercent! / 100)
            : p.price;
    }

    onOpenProduct(p: any) {
        this.router.navigate(['/product', p.productId]);
    }

    categoryName(categoryId: number): string {
        const category = this.categories.find(c => c.categoryId === categoryId);
        return category ? category.name : '';
    }

    supplierName(supplierId: number): string {
        const supplier = this.suppliers.find(s => s.supplierId === supplierId);
        return supplier ? supplier.name : '';
    }

    // DATA LOAD
    private _loadProducts() {

        this.sharedService.setLoading(true);

        this.apiProductService.getAllForMarket()
            .pipe(finalize(() => this.sharedService.setLoading(false)))
            .subscribe({
                next: (products: ProductModel[]) => {

                    // La grilla no muestra productos sin imagen. Se excluyen aquí
                    // para que los filtros, los contadores y el mensaje de "sin
                    // resultados" hablen del mismo conjunto que se ve en pantalla.
                    const listable = products.filter(p => this._hasImage(p));

                    this.hiddenWithoutImage = products.length - listable.length;

                    this.products = [...listable];
                    this.productsOrigins = [...listable];

                    this._buildCounts();

                    this.cdr.markForCheck();

                    this._loadCategories();
                    this._loadSuppliers();
                },
                error: (err) => {
                    this.notificationService.error(err?.error?.message || 'Error al cargar los productos. Intente de nuevo.');
                }
            });
    }

    private _hasImage(product: ProductModel): boolean {
        return product.mainImageUrl !== 'assets/images/no-image.jpg';
    }

    private _buildCounts() {

        this.categoryCounts = new Map<number, number>();
        this.supplierCounts = new Map<number, number>();

        for (const product of this.productsOrigins) {

            const categoryId = Number(product.categoryId);
            const supplierId = Number(product.supplierId);

            if (categoryId) {
                this.categoryCounts.set(categoryId, (this.categoryCounts.get(categoryId) ?? 0) + 1);
            }

            if (supplierId) {
                this.supplierCounts.set(supplierId, (this.supplierCounts.get(supplierId) ?? 0) + 1);
            }
        }
    }

    categoryOptionLabel(category: CategoryModel): string {
        return `${category.name} (${this.categoryCounts.get(Number(category.categoryId)) ?? 0})`;
    }

    supplierOptionLabel(supplier: SupplierModel): string {
        return `${supplier.name} (${this.supplierCounts.get(Number(supplier.supplierId)) ?? 0})`;
    }

    private _loadCategories() {

        this.apiCategoryService.getAllActive().subscribe({
            next: (categories: CategoryModel[]) => {

                // Solo categorías con al menos un producto visible en el catálogo.
                this.categories = categories
                    .filter(c => (this.categoryCounts.get(Number(c.categoryId)) ?? 0) > 0)
                    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'es', { sensitivity: 'base' }));

                this.cdr.markForCheck();
            },
            error: (err) => {
                this.notificationService.error(err?.error?.message || 'Error al cargar las categorías.');
            }
        });
    }

    private _loadSuppliers() {

        this.apiSupplierService.getAllActive().subscribe({
            next: (suppliers: SupplierModel[]) => {

                // Solo proveedores con al menos un producto visible en el catálogo.
                this.suppliers = suppliers
                    .filter(s => (this.supplierCounts.get(Number(s.supplierId)) ?? 0) > 0)
                    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'es', { sensitivity: 'base' }));

                this.cdr.markForCheck();
            },
            error: (err) => {
                this.notificationService.error(err?.error?.message || 'Error al cargar los proveedores.');
            }
        });
    }

    get filteredProducts(): ProductModel[] {
        return this.products;
    }

}
