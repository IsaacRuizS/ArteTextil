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
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private apiSupplierService: ApiSupplierService,
        private apiCategoryService: ApiCategoryService,
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

    onFilter() {

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

                    this.products = [...products];
                    this.productsOrigins = [...products];
                    this.cdr.markForCheck();

                    this._loadCategories();
                    this._loadSuppliers();
                },
                error: (err) => {
                    // manejar error
                }
            });
    }

    private _loadCategories() {

        this.apiCategoryService.getAllActive().subscribe({
            next: (categories: CategoryModel[]) => {

                this.categories = categories.filter(c => this.productsOrigins.some(p => p.categoryId === c.categoryId));

                this.cdr.markForCheck();
            },
            error: (err) => {
                // manejar error
            }
        });
    }

    private _loadSuppliers() {

        this.apiSupplierService.getAllActive().subscribe({
            next: (suppliers: SupplierModel[]) => {

                this.suppliers = suppliers.filter(s => this.productsOrigins.some(p => p.supplierId === s.supplierId));
                this.cdr.markForCheck();
            },
            error: (err) => {
                // manejar error
            }
        });
    }

    get filteredProducts(): ProductModel[] {
        return this.products;
    }

}
