import { Injectable } from '@angular/core';

export interface Product {
    productId: number;
    code: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number; // For future relation
    isActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private products: Product[] = [
        { productId: 1, code: 'TEL-001', name: 'Tela Algodón Premium', description: '100% Algodón', price: 5500, stock: 150, categoryId: 1, isActive: true },
        { productId: 2, code: 'HIL-055', name: 'Hilo Poliéster Azul', description: 'Alta resistencia', price: 1200, stock: 500, categoryId: 2, isActive: true },
        { productId: 3, code: 'BTN-88', name: 'Botón Madera 15mm', description: 'Paquete de 100', price: 3500, stock: 80, categoryId: 3, isActive: true }
    ];

    getProducts() {
        return this.products;
    }

    saveProduct(product: Product) {
        if (product.productId === 0) {
            // Create
            const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.productId)) + 1 : 1;
            this.products.push({ ...product, productId: newId, isActive: true });
        } else {
            // Update
            const index = this.products.findIndex(p => p.productId === product.productId);
            if (index !== -1) {
                this.products[index] = { ...this.products[index], ...product };
            }
        }
    }

    deleteProduct(id: number) {
        const product = this.products.find(p => p.productId === id);
        if (product) {
            product.isActive = false;
        }
    }
}
