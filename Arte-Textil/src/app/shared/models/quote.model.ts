import { QuoteItemModel } from './quote-item.model';
import { CustomerModel } from './customer.model';

export class QuoteModel {

    constructor(init?: Partial<QuoteModel>) {

        if (init) {
            if (init?.items?.length) {
                init.items = init.items.map(i => new QuoteItemModel(i));
            }

            if (init?.customer) {
                init.customer = new CustomerModel(init.customer);
            }

            if (typeof init.createdAt === 'string') {
                init.createdAt = new Date(init.createdAt);
            }

            if (typeof init.updatedAt === 'string') {
                init.updatedAt = new Date(init.updatedAt);
            }

            if (typeof init.deletedAt === 'string') {
                init.deletedAt = new Date(init.deletedAt);
            }
        }

        Object.assign(this, init);
    }

    quoteId?: number;
    customerId!: number;
    status!: string;
    total!: number;
    notes?: string;
    createdByUserId!: number;
    sentToEmail?: string;
    isActive!: boolean;

    items?: QuoteItemModel[];
    customer?: CustomerModel;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
