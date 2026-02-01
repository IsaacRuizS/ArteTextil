import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';

@Component({
    selector: 'app-cart.component',
    standalone: true,
    imports: [RouterLink, CustomCurrencyPipe],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
})
export class CartComponent {

    // MOCK: carrito temporal para vista
    cart = [
        {
            id: 1,
            name: 'Camisa Azul',
            price: 8500,
            qty: 2,
            stock: 10,
            image: 'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000   ',
            promotion: null
        },
        {
            id: 2,
            name: 'Pantalón Negro',
            price: 12500,
            qty: 1,
            stock: 1,
            image: 'https://tommycostarica.vtexassets.com/arquivos/ids/306245/Camisa-Heritage-de-manga-corta.jpg?v=638842935963770000   ',
            promotion: { percentage: 15 }
        }
    ];

    alertMsg: string | null = null;

    // Aumentar cantidad
    increaseQty(item: any) {
        if (item.qty + 1 > item.stock) {
            this.alertMsg = `No puedes agregar más unidades de ${item.name}, solo hay ${item.stock}.`;
            return;
        }

        item.qty++;
        this.alertMsg = null;
    }

    // Disminuir cantidad
    decreaseQty(item: any) {
        if (item.qty > 1) item.qty--;
    }

    // Eliminar item
    removeItem(item: any) {
        this.cart = this.cart.filter(p => p.id !== item.id);
    }

    // Cálculo del subtotal por producto
    getSubtotal(item: any) {
        const discount = item.promotion ? (item.price * item.promotion.percentage) / 100 : 0;
        return (item.price - discount) * item.qty;
    }

    // Total general
    get total() {
        return this.cart.reduce((sum, item) => sum + this.getSubtotal(item), 0);
    }

    closeAlert() {
        this.alertMsg = null;
    }
}
