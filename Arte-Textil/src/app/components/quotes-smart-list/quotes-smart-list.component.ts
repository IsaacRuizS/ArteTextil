import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { QuoteModel } from '../../shared/models/quote.model';
import { CustomCurrencyPipe } from '../../shared/pipes/crc-currency.pipe';

@Component({
    selector: 'app-quotes-smart-list',
    standalone: true,
    imports: [CommonModule, NgxPaginationModule, CustomCurrencyPipe],
    templateUrl: './quotes-smart-list.component.html',
})
export class QuotesSmartListComponent {

    @Input() quotes: QuoteModel[] = [];
    @Input() page: number = 1;
    @Input() itemsPerPage: number = 50;
    @Input() showActions: boolean = true;

    @Output() pageChange = new EventEmitter<number>();
    @Output() edit = new EventEmitter<QuoteModel>();
    @Output() toggleActive = new EventEmitter<QuoteModel>();

    expandedQuoteId: number | null = null;

    toggleExpand(quoteId: number) {
        this.expandedQuoteId = this.expandedQuoteId === quoteId ? null : quoteId;
    }

    getItemSubtotal(item: any): number {
        return ((item.price ?? 0) - (item.discountAmount ?? 0)) * (item.quantity ?? 0);
    }

    onEdit(q: QuoteModel) {
        this.edit.emit(q);
    }

    onToggle(q: QuoteModel) {
        this.toggleActive.emit(q);
    }

    getStatusClass(status?: string): string {

        const s = status || '';

        if (s == 'Pendiente') return 'bg-warning-subtle text-warning';
        if (s == 'Entregado') return 'bg-success-subtle text-success';
        if (s == 'Pedido Realizado') return 'bg-info-subtle text-info';

        return 'bg-primary-subtle text-primary';
    }
}