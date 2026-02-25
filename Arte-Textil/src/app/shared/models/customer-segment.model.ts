export class CustomerSegmentModel {

    constructor(init?: Partial<CustomerSegmentModel>) {
        if (init) {
            if (typeof init.lastQuote === 'string') {
                init.lastQuote = new Date(init.lastQuote);
            }
            Object.assign(this, init);
        }
    }

    customerId!: number;
    fullName!: string;
    quotesCount!: number;
    lastQuote?: Date;
    segment!: string;
}