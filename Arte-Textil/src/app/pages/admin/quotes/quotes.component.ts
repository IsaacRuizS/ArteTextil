import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

import { QuoteModel } from '../../../shared/models/quote.model';
import { ApiQuoteService } from '../../../services/api-quote.service';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';
import { QuotesModalComponent } from './quotes-modal/quotes-modal.component';
import { QuotesSmartListComponent } from '../../../components/quotes-smart-list/quotes-smart-list.component';


@Component({
    selector: 'app-quotes',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule, NgxPaginationModule, FormsModule, QuotesModalComponent, QuotesSmartListComponent],
    templateUrl: './quotes.component.html',
    styleUrls: ['./quotes.component.scss']
})
export class QuotesComponent implements OnInit {

    quotes: QuoteModel[] = [];
    quotesOrigins: QuoteModel[] = [];

    showFormModal = false;
    showDeleteModal = false;

    isEditing = false;
    quoteSelected: QuoteModel | null = null;

    searchTerm = '';
    statusFilter = 1;

    page = 1;

    constructor(
        private apiQuoteService: ApiQuoteService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadQuotes();
    }

    loadQuotes() {

        this.sharedService.setLoading(true);

        this.apiQuoteService.getAll().subscribe({

            next: (quotes) => {

                this.quotes = quotes;
                this.quotesOrigins = quotes;

                this.onFilterInfo();

                this.sharedService.setLoading(false);
                this.cdr.markForCheck();
            },

            error: () => {
                this.notificationService.error('Error al cargar las cotizaciones. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }

        });

    }

    onSearch(event: any) {

        this.searchTerm = event.target.value;

        this.onFilterInfo();

    }

    onStatusChanged() {

        this.onFilterInfo();

    }

    onFilterInfo() {

        this.quotes = this.quotesOrigins;

        if (this.statusFilter > 0) {

            if (this.statusFilter === 1) {
                this.quotes = this.quotes.filter(q => q.isActive);
            }

            if (this.statusFilter === 2) {
                this.quotes = this.quotes.filter(q => !q.isActive);
            }

        }

        if (this.searchTerm?.trim()) {

            const term = this.searchTerm.toLowerCase();

            this.quotes = this.quotes.filter(q =>
                q.customer?.fullName?.toLowerCase().includes(term) ||
                q.notes?.toLowerCase().includes(term) ||
                q.quoteNumber?.toLowerCase().includes(term) ||
                q.status?.toLowerCase().includes(term)
            );

        }

        this.page = 1;

        this.cdr.markForCheck();

    }

    openCreateModal() {

        this.isEditing = false;
        this.quoteSelected = null;

        this.showFormModal = true;

    }

    openEditModal(quote: QuoteModel) {

        this.isEditing = true;
        this.quoteSelected = quote;

        this.showFormModal = true;

    }

    onSaved() {

        this.showFormModal = false;

        this.loadQuotes();

    }

    openDeleteModal(quote: QuoteModel) {

        this.quoteSelected = quote;

        this.showDeleteModal = true;

    }

    confirmDelete() {

        if (!this.quoteSelected) return;

        const current = this.quoteSelected.isActive;

        this.apiQuoteService.updateStatus(
            this.quoteSelected.quoteId!,
            !current
        ).subscribe({

            next: () => {

                this.showDeleteModal = false;

                this.loadQuotes();

            },

            error: () => {
                this.notificationService.error('Error al cambiar el estado de la cotización. Intente de nuevo.');
            }

        });

    }

}