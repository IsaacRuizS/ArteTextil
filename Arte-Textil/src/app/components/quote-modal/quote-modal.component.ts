import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuoteModel } from '../../shared/models/quote.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from '../../shared/pipes/crc-currency.pipe';

@Component({
    imports: [CommonModule, CustomCurrencyPipe],
    selector: 'app-quote-modal',
    templateUrl: './quote-modal.component.html'
})
export class QuoteModalComponent {

    @Input() quote?: QuoteModel;
    @Output() closed = new EventEmitter<void>();

    close() {
        this.closed.emit();
    }

}