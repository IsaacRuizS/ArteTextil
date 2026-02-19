export class CustomerModel {

    constructor(init?: Partial<CustomerModel>) {
        if (init) {

            if (typeof init.createdAt === 'string') {
                init.createdAt = new Date(init.createdAt);
            }

            if (typeof init.updatedAt === 'string') {
                init.updatedAt = new Date(init.updatedAt);
            }

            if (typeof init.deletedAt === 'string') {
                init.deletedAt = new Date(init.deletedAt);
            }

            Object.assign(this, init);
        }
    }

    customerId?: number;
    fullName!: string;
    email?: string;
    phone?: string;
    classification?: string;
    activityScore?: number;
    lastQuoteDate?: Date;
    userId?: number;
    isActive?: boolean;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
