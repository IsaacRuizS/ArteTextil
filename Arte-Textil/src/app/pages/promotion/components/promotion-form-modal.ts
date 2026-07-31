import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromotionModel } from '../../../shared/models/promotion.model';
import { ProductModel } from '../../../shared/models/product.model';

@Component({
    selector: 'app-promotion-form-modal',
    imports: [FormsModule],
    templateUrl: './promotion-form-modal.html',
    styleUrl: '../promotion.component.scss',
})
export class PromotionFormModal implements OnInit {

    @Input() promotion: PromotionModel | null = null;
    @Input() products: ProductModel[] = [];

    @Output() close = new EventEmitter();
    @Output() saveCreate = new EventEmitter<any>();
    @Output() saveUpdate = new EventEmitter<any>();

    form = {
        name: '',
        description: '',
        productId: 0,
        discountPercent: 0,
        startDate: '',
        endDate: '',
        isActive: true
    };

    title = 'Crear promoción';

    // Un mensaje por campo en lugar de un único texto genérico.
    errors: Record<string, string> = {};

    // Campos que el usuario ya tocó, para no mostrar todo en rojo de entrada.
    touched: Record<string, boolean> = {};

    today = this.formatDate(new Date());

    ngOnInit() {
        if (this.promotion) {
            this.title = 'Editar promoción';
            this.form = {
                name: this.promotion.name,
                description: this.promotion.description || '',
                productId: this.promotion.productId || 0,
                discountPercent: this.promotion.discountPercent || 0,
                startDate: this.promotion.startDate ? this.formatDate(this.promotion.startDate) : '',
                endDate: this.promotion.endDate ? this.formatDate(this.promotion.endDate) : '',
                isActive: this.promotion.isActive
            };
        }

        this.validate();
    }

    formatDate(date: Date): string {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    }

    markTouched(field: string) {
        this.touched[field] = true;
    }

    showError(field: string): string | null {
        return this.touched[field] ? (this.errors[field] ?? null) : null;
    }

    get isValid(): boolean {
        return Object.keys(this.errors).length === 0;
    }

    validate() {

        const errors: Record<string, string> = {};

        // NOMBRE
        const name = (this.form.name ?? '').trim();

        if (!name) {
            errors['name'] = 'El nombre de la promoción es obligatorio.';
        } else if (name.length < 3) {
            errors['name'] = 'El nombre debe tener al menos 3 caracteres.';
        } else if (name.length > 100) {
            errors['name'] = 'El nombre no puede superar los 100 caracteres.';
        }

        // DESCRIPCIÓN
        if ((this.form.description ?? '').length > 250) {
            errors['description'] = 'La descripción no puede superar los 250 caracteres.';
        }

        // PRODUCTO (el select devuelve string, por eso se normaliza a número)
        const productId = Number(this.form.productId);

        if (!productId) {
            errors['productId'] = 'Debe seleccionar el producto al que aplica la promoción.';
        }

        // DESCUENTO
        const discount = Number(this.form.discountPercent);

        if (this.form.discountPercent === null || this.form.discountPercent === undefined ||
            (this.form.discountPercent as any) === '') {
            errors['discountPercent'] = 'El porcentaje de descuento es obligatorio.';
        } else if (isNaN(discount)) {
            errors['discountPercent'] = 'El descuento debe ser un número.';
        } else if (discount <= 0) {
            errors['discountPercent'] = 'El descuento debe ser mayor que 0%.';
        } else if (discount > 100) {
            errors['discountPercent'] = 'El descuento no puede ser mayor que 100%.';
        }

        // FECHA INICIO
        if (!this.form.startDate) {
            errors['startDate'] = 'Debe indicar la fecha de inicio.';
        } else if (!this.promotion && this.form.startDate < this.today) {
            // Solo al crear: una promoción nueva no puede arrancar en el pasado.
            errors['startDate'] = 'La fecha de inicio no puede ser anterior a hoy.';
        }

        // FECHA FIN
        if (!this.form.endDate) {
            errors['endDate'] = 'Debe indicar la fecha de finalización.';
        } else if (this.form.startDate && this.form.endDate < this.form.startDate) {
            errors['endDate'] = 'La fecha de finalización no puede ser anterior a la fecha de inicio.';
        }

        this.errors = errors;
    }

    save() {

        this.validate();

        if (!this.isValid) {
            // Marca todo como tocado para que se vean todos los mensajes.
            ['name', 'description', 'productId', 'discountPercent', 'startDate', 'endDate']
                .forEach(field => this.touched[field] = true);
            return;
        }

        const payload = {
            ...this.form,
            productId: Number(this.form.productId),
            discountPercent: Number(this.form.discountPercent),
            name: this.form.name.trim(),
            description: (this.form.description ?? '').trim()
        };

        if (this.promotion) {
            this.saveUpdate.emit(payload);
        } else {
            this.saveCreate.emit(payload);
        }

        this.close.emit();
    }
}
