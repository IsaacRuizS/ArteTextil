import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CustomCurrencyPipe
    ],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
    productId!: number;

    // Producto de prueba (no usamos modelos)
    product: any = {
        id: 1,
        name: 'Camisa Azul Premium',
        description: 'Camisa de algodón suave, perfecta para uso diario.',
        price: 8500,
        category: 'Camisas',
        stock: 10,
        images: [
            'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000',
            'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000/1',
            'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000/2',
        ],
        promotion: {
            percentage: 20,
            until: '2025-12-30'
        }
    };

    selectedImage = '';
    qty = 1;

    constructor(private route: ActivatedRoute) {
        // Simular cargar el id
        this.productId = Number(this.route.snapshot.paramMap.get('id'));

        // Imagen principal
        this.selectedImage = this.product.images[0];
    }

    changeImage(img: string) {
        this.selectedImage = img;
    }

    increaseQty() {
        if (this.qty < this.product.stock) {
            this.qty++;
        }
    }

    decreaseQty() {
        if (this.qty > 1) {
            this.qty--;
        }
    }

    addToCart() {
        window.location.href = '/cart';
    }

    onBackToMarketplace(){
        window.location.href = '/marketplace';
    }
}
