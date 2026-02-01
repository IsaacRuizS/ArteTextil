import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';

@Component({
    selector: 'app-quote',
    standalone: true,
    imports: [FormsModule, CustomCurrencyPipe],
    templateUrl: './quote.component.html',
    styleUrl: './quote.component.scss',
})
export class QuoteComponent {

    cart = [
        { id: 1, name: 'Camisa Azul', qty: 2, price: 8500 },
        { id: 2, name: 'Pantalón Negro', qty: 1, price: 12500 }
    ];

    // Formulario
    form = {
        nombre: '',
        correo: '',
        mensaje: '',
        whatsapp: '',
    };

    errorMsg = '';
    successMsg = '';

    // Total
    get total() {
        return this.cart.reduce((s, p) => s + (p.qty * p.price), 0);
    }

    // Validar el email
    isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    enviar() {
        this.errorMsg = '';
        this.successMsg = '';

        // Validaciones obligatorias
        if (!this.form.nombre.trim() || !this.form.correo.trim() || !this.form.mensaje.trim()) {
            this.errorMsg = 'Todos los campos obligatorios deben completarse.';
            return;
        }

        if (!this.isValidEmail(this.form.correo)) {
            this.errorMsg = 'El correo ingresado no es válido.';
            return;
        }

        // Validación opcional de WhatsApp si se llena
        if (this.form.whatsapp.trim().length > 0) {
            if (!/^[0-9+\s-]{8,15}$/.test(this.form.whatsapp)) {
                this.errorMsg = 'El número de WhatsApp no es válido.';
                return;
            }
        }

        if (this.cart.length === 0) {
            this.errorMsg = 'Tu carrito está vacío, no puedes enviar una cotización.';
            return;
        }

        // Simulación de envío
        this.successMsg = 'Tu cotización ha sido enviada correctamente. Muy pronto nos pondremos en contacto contigo.';

        // Reset visual
        this.form = { nombre: '', correo: '', whatsapp: '', mensaje: '' };
    }

    goBack() {
        window.history.back();
    }

}
