import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-product-detail',
    imports: [],
    templateUrl: './product-detail.component.html',
    styleUrl: '../inventory.scss',
})
export class ProductDetailComponent {
    
    @Input() selectedProduct: any = null;
    @Output() onCloseEmmit = new EventEmitter<void>();
    
    constructor() { }

    onClose() {
        this.selectedProduct = null;
        this.onCloseEmmit.emit();
    }

}
