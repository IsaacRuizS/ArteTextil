import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductModel } from '../../../shared/models/product.model';

@Component({
    selector: 'app-product-detail',
    imports: [CommonModule],
    templateUrl: './product-detail.component.html',
    styleUrl: '../inventory.scss',
})
export class ProductDetailComponent {

    @Input() selectedProduct!: ProductModel;
    @Output() onCloseEmmit = new EventEmitter<void>();

    onClose() {
        this.onCloseEmmit.emit();
    }
}
