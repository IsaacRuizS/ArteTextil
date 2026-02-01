import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ProductModel } from '../../../shared/models/product.model';
import { CategoryModel } from '../../../shared/models/category.model';

import { ApiProductService } from '../../../services/api-product.service';
import { ApiCategoryService } from '../../../services/api-category.service';
import { SharedService } from '../../../services/shared.service';
import { SupplierModel } from '../../../shared/models/supplier.model';
import { ApiSupplierService } from '../../../services/api-supplier.service';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    providers: [FormBuilder],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

    products: ProductModel[] = [];
    productsOrigins: ProductModel[] = [];

    categories: CategoryModel[] = [];
    suppliers: SupplierModel[] = [];


    productForm: FormGroup;

    // UI State
    showFormModal = false;
    showDeleteModal = false;
    isEditing = false;
    productToDelete: ProductModel | null = null;
    searchTerm = '';

    constructor(
        private apiProductService: ApiProductService,
        private apiCategoryService: ApiCategoryService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private apiSupplierService: ApiSupplierService,
        private fb: FormBuilder
    ) {
        this.productForm = this.fb.group({
            productId: [0],
            productCode: ['', [Validators.required, Validators.minLength(2)]],
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            price: [0, [Validators.required, Validators.min(1)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            minStock: [10, [Validators.required, Validators.min(0)]],
            categoryId: [null, [Validators.required]],
            supplierId: [null, [Validators.required]], // si lo ocupas obligatorio pon Validators.required
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadCategories();
        this.loadProducts();
        this.loadSuppliers();
    }

    // DATA LOAD
    loadProducts() {

        this.sharedService.setLoading(true);

        this.apiProductService.getAll()
            .pipe(finalize(() => this.sharedService.setLoading(false)))
            .subscribe({
                next: (products: ProductModel[]) => {

                    this.products = [...products];
                    this.productsOrigins = [...products];
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    // manejar error
                }
            });
    }

    loadCategories() {
        this.apiCategoryService.getAll().subscribe({
            next: (categories: CategoryModel[]) => {

                // opcional: solo activas
                this.categories = categories;
                // set default categoryId si está vacío
                if (!this.productForm.get('categoryId')?.value && this.categories.length > 0) {
                    const firstActive = this.categories.find(c => c.isActive) ?? this.categories[0];
                    this.productForm.patchValue({ categoryId: firstActive.categoryId });
                }
                this.cdr.markForCheck();
            },
            error: (err) => {
                // manejar error
            }
        });
    }

    loadSuppliers() {
        this.apiSupplierService.getAll().subscribe({
            next: (suppliers: SupplierModel[]) => {

                // solo activos si quieres
                this.suppliers = suppliers.filter(s => s.isActive);

                // set default supplier si está vacío
                if (!this.productForm.get('supplierId')?.value && this.suppliers.length > 0) {
                    this.productForm.patchValue({
                        supplierId: this.suppliers[0].supplierId
                    });
                }

                this.cdr.markForCheck();
            },
            error: (err) => {
                // manejar error
            }
        });
    }


    // FILTERS
    onSearch(event: any) {
        this.searchTerm = (event?.target?.value ?? '').toString();
        this.onFilterInfo();
    }

    onFilterInfo() {
        this.products = this.productsOrigins;

        if (!this.searchTerm || this.searchTerm.trim() === '') return;

        const term = this.searchTerm.toLowerCase();

        this.products = this.products.filter(p =>
            (p.name ?? '').toLowerCase().includes(term) ||
            (p.productCode ?? '').toLowerCase().includes(term)
        );
    }

    get filteredProducts(): ProductModel[] {
        if (!this.searchTerm || this.searchTerm.trim() === '') return this.products;
        const term = this.searchTerm.toLowerCase();
        return this.products.filter(p =>
            (p.name ?? '').toLowerCase().includes(term) ||
            (p.productCode ?? '').toLowerCase().includes(term)
        );
    }

    getCategoryName(categoryId: number | null | undefined): string {
        if (!categoryId) return '-';
        const cat = this.categories.find(c => c.categoryId === categoryId);
        return cat?.name ?? '-';
    }

    // MODALS
    openCreateModal() {
        this.isEditing = false;

        const defaultCategory = this.categories.find(c => c.isActive)?.categoryId
            ?? this.categories[0]?.categoryId
            ?? null;

        this.productForm.reset({
            productId: 0,
            productCode: '',
            name: '',
            description: '',
            price: 0,
            stock: 0,
            minStock: 10,
            categoryId: defaultCategory,
            supplierId: this.suppliers[0]?.supplierId ?? null,
            isActive: true
        });

        this.showFormModal = true;
    }

    openEditModal(product: ProductModel) {
        this.isEditing = true;
        // patchValue usando el modelo
        this.productForm.patchValue({
            productId: product.productId,
            productCode: product.productCode ?? '',
            name: product.name ?? '',
            description: product.description ?? '',
            price: product.price ?? 0,
            stock: product.stock ?? 0,
            minStock: product.minStock ?? 10,
            categoryId: product.categoryId ?? null,
            supplierId: product.supplierId ?? null,
            isActive: product.isActive ?? true
        });

        this.showFormModal = true;
    }

    closeFormModal() {
        this.showFormModal = false;
        this.productForm.markAsPristine();
        this.productForm.markAsUntouched();
    }

    // SAVE (CREATE / UPDATE)
    saveProduct() {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            return;
        }

        const payload = new ProductModel(this.productForm.value);

        this.sharedService.setLoading(true);

        if (this.isEditing) {
            this.apiProductService.update(payload)
                .pipe(finalize(() => this.sharedService.setLoading(false)))
                .subscribe({
                    next: () => {
                        this.showFormModal = false;
                        this.loadProducts();
                    },
                    error: (err) => {
                        // manejar error
                    }
                });
        } else {
            this.apiProductService.create(payload)
                .pipe(finalize(() => this.sharedService.setLoading(false)))
                .subscribe({
                    next: () => {
                        this.showFormModal = false;
                        this.loadProducts();
                    },
                    error: (err) => {
                        // manejar error
                    }
                });
        }
    }

    // DELETE (desactivar)
    openDeleteModal(product: ProductModel) {
        this.productToDelete = product;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (!this.productToDelete) return;

        this.sharedService.setLoading(true);

        this.apiProductService.delete(this.productToDelete.productId)
            .pipe(finalize(() => this.sharedService.setLoading(false)))
            .subscribe({
                next: () => {
                    this.showDeleteModal = false;
                    this.productToDelete = null;
                    this.loadProducts();
                },
                error: (err) => {
                    // manejar error
                }
            });
    }
}
