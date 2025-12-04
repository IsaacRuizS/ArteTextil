import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-promotion-form-modal',
    imports: [FormsModule],
    templateUrl: './promotion-form-modal.html',
    styleUrl: '../promotion.component.scss',
})
export class PromotionFormModal {

    @Input() promotion: any | null = null;
    @Input() products: any[] = [];

    @Output() close = new EventEmitter();
    @Output() saveCreate = new EventEmitter<any>();
    @Output() saveUpdate = new EventEmitter<any>();

    form = {
        name: '',
        productId: null,
        percent: null,
        start: '',
        end: '',
        status: 'Activa'
    };

    title = 'Crear promoción';
    errorMsg = '';

    ngOnInit() {
        if (this.promotion) {
            this.title = 'Editar promoción';
            this.form = { ...this.promotion };
        }
    }

    save() {
        this.errorMsg = '';

        if (!this.form.name || !this.form.productId || !this.form.percent || !this.form.start || !this.form.end) {
            this.errorMsg = 'Todos los campos son obligatorios.';
            return;
        }

        if (new Date(this.form.end) < new Date(this.form.start)) {
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
