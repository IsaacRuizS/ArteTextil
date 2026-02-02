export class PayrollAdjustmentModel {

    constructor(init?: Partial<PayrollAdjustmentModel>) {
        if (init) {
            if (typeof init.createdAt === 'string') init.createdAt = new Date(init.createdAt);
            if (typeof init.updatedAt === 'string') init.updatedAt = new Date(init.updatedAt);
            if (typeof init.deletedAt === 'string') init.deletedAt = new Date(init.deletedAt);
            Object.assign(this, init);
        }
    }

    adjustmentId!: number;
    userId!: number;
    amount!: number;
    type!: string;
    reason?: string;
    isActive!: boolean;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}