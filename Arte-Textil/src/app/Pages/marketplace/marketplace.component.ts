import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from '../../shared/pipes/crc-currency.pipe';


@Component({
    selector: 'app-marketplace',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CustomCurrencyPipe
    ],
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent {

    categories = ['Camisas', 'Pantalones', 'Accesorios', 'Otros'];

    products: any[] = [
        {
            id: 1,
            name: 'Camisa Azul',
            price: 8500,
            category: 'Camisas',
            stock: 10,
            image: 'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000',
            promotion: {
                percentage: 15,
                until: '2025-12-30'
            }
        },
        {
            id: 2,
            name: 'Pantalón Negro',
            price: 12500,
            category: 'Pantalones',
            stock: 0,
            image: 'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000',
            promotion: null
        },
        {
            id: 3,
            name: 'Gorra Roja',
            price: 4500,
            category: 'Accesorios',
            stock: 5,
            image: 'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000',
            promotion: { percentage: 10, until: '2025-11-01' }
        }
    ];

    // FILTROS
    selectedCategory: string = 'Todos';
    minPrice: number | null = null;
    maxPrice: number | null = null;
    onlyPromotions: boolean = false;

    // FILTRO PRINCIPAL
    get filteredProducts() {
        return this.products.filter(p => {

            let pass = true;

            // Categoría
            if (this.selectedCategory !== 'Todos') {
                pass = pass && p.category === this.selectedCategory;
            }

            // Precio mínimo
            if (this.minPrice !== null) {
                pass = pass && p.price >= this.minPrice;
            }

            // Precio máximo
            if (this.maxPrice !== null) {
                pass = pass && p.price <= this.maxPrice;
            }

            // Solo promociones
            if (this.onlyPromotions) {
                pass = pass && p.promotion !== null;
            }

            return pass;
        });
    }

    onOpenProduct(p: any){
        window.location.href = `/product/${p.id}`;
    }

}
