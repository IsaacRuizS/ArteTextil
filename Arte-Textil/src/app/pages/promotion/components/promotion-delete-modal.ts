import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-promotion-delete-modal',
    imports: [],
    templateUrl: './promotion-delete-modal.html',
    styleUrl: '../promotion.component.scss',
})
export class PromotionDeleteModal {
    @Input() promotion: any;
    @Output() close = new EventEmitter();
    @Output() confirm = new EventEmitter();
}
