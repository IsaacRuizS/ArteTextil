export class SupplierModel {

    constructor(init?: Partial<SupplierModel>) {
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

    supplierId!: number;
    name!: string;
    phone!: string;
    email!: string;
    contactPerson!: string;
    isActive!: boolean;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
