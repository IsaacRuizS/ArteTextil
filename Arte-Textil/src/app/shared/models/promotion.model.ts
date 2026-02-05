export class PromotionModel {
    constructor(init?: Partial<PromotionModel>) {
        if (init) {
            if (typeof init.startDate === 'string') {
                init.startDate = new Date(init.startDate);
            }

            if (typeof init.endDate === 'string') {
                init.endDate = new Date(init.endDate);
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

            Object.assign(this, init);
        }
    }

    promotionId!: number;
    name!: string;
    description?: string;
    discountPercent?: number;
    startDate?: Date;
    endDate?: Date;
    productId?: number;
    isActive!: boolean;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
