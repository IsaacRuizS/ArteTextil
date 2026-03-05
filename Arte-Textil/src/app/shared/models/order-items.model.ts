export class OrderItemModel {

    constructor(init?: Partial<OrderItemModel>) {
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

    orderItemId!: number;
    orderId!: number;
    productId!: number;
    quantity!: number;
    price!: number;
    isActive!: boolean;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}