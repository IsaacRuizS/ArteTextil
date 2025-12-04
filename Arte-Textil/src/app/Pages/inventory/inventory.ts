import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductDetailComponent } from './components/product-detail.component';
import { StatusModalComponent } from './components/status-modal.component';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [
        FormsModule,
        ProductDetailComponent,
        StatusModalComponent,
    ],
    templateUrl: './inventory.html',
    styleUrls: ['./inventory.scss']
})
export class InventoryComponent {

    // Filtro
    selectedStatus = 'Todos';

    statuses = ['Todos', 'Disponible', 'Agotado', 'Dañado', 'En tránsito'];

    // Listado visual
    products = [
        {
            code: 'PR-001',
            name: 'Tela Algodón Azul',
            qty: 120,
            location: 'Estante A-3',
            lastMovement: 'Entrada',
            date: '2025-01-05',
            status: 'Disponible',
            details: {
                entradas: 15,
                salidas: 3,
                observaciones: 'Ninguna'
            }
        },
        {
            code: 'PR-002',
            name: 'Tela Licra Negra',
            qty: 0,
            location: 'Estante B-1',
            lastMovement: 'Salida',
            date: '2025-02-12',
            status: 'Agotado',
            details: {
                entradas: 4,
                salidas: 6,
                observaciones: 'Se espera reposición'
            }
        }
    ];

    selectedProduct: any = null;
    statusModalProduct: any = null;
    showLowStockAlert = true;

    get lowStockProducts() {

        const products = this.products.filter(p => p.qty <= 0);

        // Si aparecen productos nuevos, vuelve a mostrar la alerta
        if (products.length > 0 && this.showLowStockAlert) {
            this.showLowStockAlert = true;
        }

        return products;
    }

    constructor() { }

    selectProduct(p: any) {
        this.selectedProduct = p;
    }

    openStatusModal(product: any) {
        this.statusModalProduct = {
            ...product,
            newStatus: product.status,
            description: ''
        };
    }

    saveStatusChange() {

    }

    onCloseLowStockAlert() {
        console.log('Cerrando alerta de bajo stock');
        this.showLowStockAlert = false;
    }

    onGenerateExcel() {
        console.log('Generar Excel (solo visual)');
    }
}
