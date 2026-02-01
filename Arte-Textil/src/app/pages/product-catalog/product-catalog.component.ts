import { Component } from '@angular/core';
import { CustomCurrencyPipe } from '../../shared/pipes/crc-currency.pipe';
import { ProductFormModal } from './components/product-form-modal';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-product-catalog',
    imports: [CustomCurrencyPipe, ProductFormModal, FormsModule],
    templateUrl: './product-catalog.component.html',
    styleUrl: './product-catalog.component.scss',
})
export class ProductCatalogComponent {

    products = [
        {
            id: 'P-001',
            name: 'Camisa Azul',
            price: 8500,
            category: 'Camisas',
            status: 'Activo',
            image: 'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000',
            materials: ['Tela Algodón 1m', 'Hilo Azul', 'Botones Plásticos'],
            createdAt: new Date()
        },
        {
            id: 'P-002',
            name: 'Pantalón Negro',
            price: 12900,
            category: 'Pantalones',
            status: 'Inactivo',
            image: 'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000',
            materials: ['Tela Licra 1.5m', 'Hilo Negro'],
            createdAt: new Date()
        },
        {
            id: 'P-003',
            name: 'Uniforme Escolar',
            price: 17500,
            category: 'Uniformes',
            status: 'Activo',
            image: 'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000',
            materials: ['Tela Gabardina 1.2m', 'Hilo Blanco', 'Insignia Bordada'],
            createdAt: new Date()
        }
    ];

    categories = ['Camisas', 'Pantalones', 'Uniformes'];
    materials = ['Tela azul', 'Hilo blanco', 'Botones negros', 'Elástico', 'Etiqueta'];

    showCreateModal = false;
    showEditModal = false;
    editProduct: any | null = null;

    filters = {
        minPrice: null,
        maxPrice: null,
        dateFrom: '',
        dateTo: '',
        category: ''
    };

    get activeProducts() {
        return this.products
            .filter(p => p.status === 'Activo')
            .filter(p => {
                // FILTRO PRECIO
                if (this.filters.minPrice !== null && p.price < this.filters.minPrice) return false;
                if (this.filters.maxPrice !== null && p.price > this.filters.maxPrice) return false;

                // FILTRO FECHAS
                if (this.filters.dateFrom && new Date(p.createdAt) < new Date(this.filters.dateFrom)) return false;
                if (this.filters.dateTo && new Date(p.createdAt) > new Date(this.filters.dateTo)) return false;

                // FILTRO CATEGORÍA
                if (this.filters.category && p.category !== this.filters.category) return false;

                return true;
            });
    }

    openCreateModal() {
        this.showCreateModal = true;
    }

    openEditModal(product: any) {
        this.editProduct = product;
        this.showEditModal = true;
    }

    toggleStatus(product: any, event: Event) {
        event.stopPropagation();  // evita abrir el modal de edición

        if (product.status === 'Activo') {
            product.status = 'Inactivo';
        }
        else {
            product.status = 'Activo';
        }
    }

    resetFilters() {
        this.filters = {
            minPrice: null,
            maxPrice: null,
            dateFrom: '',
            dateTo: '',
            category: ''
        };
    }

}
