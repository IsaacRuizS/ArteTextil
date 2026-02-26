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
    errorMsg = '';

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
    }

    formatDate(date: Date): string {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    }

    save() {
        this.errorMsg = '';

        if (!this.form.name || !this.form.productId || !this.form.discountPercent || !this.form.startDate || !this.form.endDate) {
            this.errorMsg = 'Todos los campos son obligatorios.';
            return;
        }

        if (this.form.discountPercent <= 0 || this.form.discountPercent > 100) {
            this.errorMsg = 'El descuento debe estar entre 1 y 100%.';
            return;
        }

        if (new Date(this.form.endDate) < new Date(this.form.startDate)) {
            this.errorMsg = 'La fecha final no puede ser menor a la fecha inicial.';
            return;
        }

        if (this.promotion) {
            this.saveUpdate.emit({ ...this.form });
        } else {
            this.saveCreate.emit({ ...this.form });
        }

        this.close.emit();
    }
}
