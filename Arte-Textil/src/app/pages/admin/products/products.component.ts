import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ProductModel } from '../../../shared/models/product.model';
import { CategoryModel } from '../../../shared/models/category.model';

import { ApiProductService } from '../../../services/api-product.service';
import { ApiCategoryService } from '../../../services/api-category.service';
import { SharedService } from '../../../services/shared.service';
import { SupplierModel } from '../../../shared/models/supplier.model';
import { ApiSupplierService } from '../../../services/api-supplier.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductImageModel } from '../../../shared/models/productImage.model';
import { UploadImageService } from '../../../services/upload-image.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule, FormsModule],
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

    // Filters RF-04-006
    filterCategory: number | null = null;
    filterPriceMin: number | null = null;
    filterPriceMax: number | null = null;
    filterDateFrom: string = '';
    filterDateTo: string = '';

    statusFilter: number = 1; // 0: all, 1: active, 2: inactive

    page = 1;

    selectedFiles: File[] = [];
    uploadedImages: ProductImageModel[] = [];
    uploadingImages = false;

    constructor(
        private apiProductService: ApiProductService,
        private apiCategoryService: ApiCategoryService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private apiSupplierService: ApiSupplierService,
        private uploadImageService: UploadImageService,
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
            isActive: [true],

            productImages: [[]]
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

                    this.applyFilters();

                    this.cdr.markForCheck();
                },
                error: (err) => {
                    // manejar error
                }
            });
    }

    loadCategories() {
        this.apiCategoryService.getAllActive().subscribe({
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
        this.apiSupplierService.getAllActive().subscribe({
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
        this.applyFilters();
    }

    onStatusChanged() {

        this.applyFilters();
    }

    onFilterChange() {
        this.applyFilters();
    }

    clearFilters() {
        this.searchTerm = '';
        this.filterCategory = null;
        this.filterPriceMin = null;
        this.filterPriceMax = null;
        this.filterDateFrom = '';
        this.filterDateTo = '';
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.productsOrigins];

        // Filtro por término de búsqueda
        if (this.searchTerm && this.searchTerm.trim() !== '') {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.name ?? '').toLowerCase().includes(term) ||
                (p.productCode ?? '').toLowerCase().includes(term)
            );
        }

        if (this.statusFilter > 0) {

            if (this.statusFilter == 1) {
                filtered = filtered.filter(x => x.isActive);
            } else if (this.statusFilter == 2) {
                filtered = filtered.filter(x => !x.isActive);
            }
        }

        // Filtro por categoría (RF-04-006)
        if (this.filterCategory) {
            filtered = filtered.filter(p => p.categoryId === this.filterCategory);
        }

        // Filtro por precio (RF-04-006)
        if (this.filterPriceMin !== null && this.filterPriceMin > 0) {
            filtered = filtered.filter(p => (p.price ?? 0) >= this.filterPriceMin!);
        }
        if (this.filterPriceMax !== null && this.filterPriceMax > 0) {
            filtered = filtered.filter(p => (p.price ?? 0) <= this.filterPriceMax!);
        }

        // Filtro por fecha de creación (RF-04-006)
        if (this.filterDateFrom) {
            const dateFrom = new Date(this.filterDateFrom);
            filtered = filtered.filter(p => {
                if (!p.createdAt) return true;
                const created = new Date(p.createdAt);
                return created >= dateFrom;
            });
        }
        if (this.filterDateTo) {
            const dateTo = new Date(this.filterDateTo);
            dateTo.setHours(23, 59, 59, 999); // Incluir todo el día
            filtered = filtered.filter(p => {
                if (!p.createdAt) return true;
                const created = new Date(p.createdAt);
                return created <= dateTo;
            });
        }

        this.products = filtered;
    }

    get filteredProducts(): ProductModel[] {
        return this.products;
    }

    onFilterInfo() {
        this.applyFilters();
    }

    getCategoryName(categoryId: number | null | undefined): string {
        if (!categoryId) return '-';
        const cat = this.categories.find(c => c.categoryId === categoryId);
        return cat?.name ?? '-';
    }

    onImagesSelected(event: any) {
        const files: File[] = Array.from(event.target.files);

        // Validaciones básicas
        for (const file of files) {

            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error', 'Maximo 5MB por imagen', 'error');
                return;
            }

            if (!file.type.startsWith('image/')) continue;
            if (file.size > 5 * 1024 * 1024) continue; // 5MB
            this.selectedFiles.push(file);
        }

        this.uploadSelectedImages();
    }

    uploadSelectedImages() {

        if (this.selectedFiles.length === 0) return;

        this.uploadingImages = true;
        this.sharedService.setLoading(true);

        let uploadedCount = 0;

        this.selectedFiles.forEach((file, index) => {

            this.uploadImageService.uploadImage(file).subscribe({
                next: (url) => {

                    const img = new ProductImageModel({
                        imageUrl: url,
                        isActive: true,
                        isMain: this.uploadedImages.length === 0, // primera = principal
                    });

                    this.uploadedImages.push(img);
                },
                complete: () => {
                    uploadedCount++;
                    if (uploadedCount === this.selectedFiles.length) {
                        this.uploadingImages = false;
                        this.sharedService.setLoading(false);
                        this.selectedFiles = [];
                    }
                },
                error: () => {
                    uploadedCount++;
                    this.sharedService.setLoading(false);
                }
            });
        });
    }

    setMainImage(img: ProductImageModel) {
        this.uploadedImages.forEach(i => i.isMain = false);
        img.isMain = true;
    }

    removeImage(img: ProductImageModel) {
        this.uploadedImages = this.uploadedImages.filter(i => i !== img);

        // asegurar que siempre haya una principal
        if (!this.uploadedImages.some(i => i.isMain) && this.uploadedImages.length > 0) {
            this.uploadedImages[0].isMain = true;
        }
    }

    toggleImageStatus(img: ProductImageModel) {

        if (img.isMain && img.isActive) {

            // Buscar otra imagen activa que NO sea esta
            const replacement = this.uploadedImages.find(i =>
                i !== img && i.isActive
            );

            // Si no hay reemplazo, no permitir
            if (replacement) {
                replacement.isMain = true;
            }

            // Asignar nueva imagen principal
            img.isMain = false;
        }

        img.isActive = !img.isActive;
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

        this.uploadedImages = product.productImages ? [...product.productImages] : [];

        this.showFormModal = true;
    }

    closeFormModal() {
        this.uploadedImages = [];
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

        const payload = new ProductModel({
            ...this.productForm.value,
            productImages: this.uploadedImages
        });

        this.sharedService.setLoading(true);

        if (this.isEditing) {
            this.apiProductService.update(payload)
                .pipe(finalize(() => this.sharedService.setLoading(false)))
                .subscribe({
                    next: () => {
                        this.uploadedImages = [];
                        this.showFormModal = false;
                        this.loadProducts();
                    }
                });
        } else {
            this.apiProductService.create(payload)
                .pipe(finalize(() => this.sharedService.setLoading(false)))
                .subscribe({
                    next: () => {
                        this.uploadedImages = [];
                        this.showFormModal = false;
                        this.loadProducts();
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

        this.apiProductService.updateStatus(this.productToDelete.productId, !(this.productToDelete.isActive ?? true))
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
