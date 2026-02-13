import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PromotionModel } from '../../../shared/models/promotion.model';

@Component({
    selector: 'app-promotion-delete-modal',
    imports: [],
    templateUrl: './promotion-delete-modal.html',
    styleUrl: '../promotion.component.scss',
})
export class PromotionDeleteModal {
    @Input() promotion: PromotionModel | null = null;
    @Output() close = new EventEmitter();
    @Output() confirm = new EventEmitter();
}
