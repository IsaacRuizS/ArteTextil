import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductDetailComponent } from './components/product-detail.component';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [
        FormsModule,
        ProductDetailComponent
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
            qty: 8,
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

    selectProduct(p: any) {
        this.selectedProduct = p;
    }
}
