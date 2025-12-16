import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

    products: Product[] = [];
    productForm: FormGroup;

    // UI State
    showFormModal = false;
    showDeleteModal = false;
    isEditing = false;
    productToDelete: Product | null = null;
    searchTerm = '';

    constructor(
        private productService: ProductService,
        private fb: FormBuilder
    ) {
        this.productForm = this.fb.group({
            productId: [0],
            code: ['', [Validators.required]],
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(1)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            categoryId: [1], // Default mockup
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts() {
        this.products = this.productService.getProducts();
    }

    get filteredProducts() {
        if (!this.searchTerm) return this.products;
        const term = this.searchTerm.toLowerCase();
        return this.products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.code.toLowerCase().includes(term)
        );
    }

    // ACTIONS
    openCreateModal() {
        this.isEditing = false;
        this.productForm.reset({ productId: 0, price: 0, stock: 0, categoryId: 1, isActive: true });
        this.showFormModal = true;
    }

    openEditModal(product: Product) {
        this.isEditing = true;
        this.productForm.patchValue(product);
        this.showFormModal = true;
    }

    onSearch(event: any) {
        this.searchTerm = event.target.value;
    }

    saveProduct() {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            return;
        }

        try {
            this.productService.saveProduct(this.productForm.value);
            this.showFormModal = false;
            alert(this.isEditing ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
            this.loadProducts();
        } catch (error) {
            alert('Error al guardar el producto.');
        }
    }

    // DELETE
    openDeleteModal(product: Product) {
        this.productToDelete = product;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (this.productToDelete) {
            this.productService.deleteProduct(this.productToDelete.productId);
            this.showDeleteModal = false;
            this.productToDelete = null;
            this.loadProducts();
            alert('Producto desactivado correctamente.');
        }
    }
}
