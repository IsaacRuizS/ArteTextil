import { OrderItemModel } from "./order-items.model";
import { OrderStatusHistoryModel } from "./order-status-history.model";

export class OrderModel {

    constructor(init?: Partial<OrderModel>) {
        if (init) {

            if (typeof init.deliveryDate === 'string') {
                init.deliveryDate = new Date(init.deliveryDate);
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

            // Mapear arrays si vienen
            if (Array.isArray(init.items)) {
                init.items = init.items.map(x => new OrderItemModel(x));
            }

            if (Array.isArray(init.statusHistory)) {
                init.statusHistory = init.statusHistory.map(x => new OrderStatusHistoryModel(x));
            }

            Object.assign(this, init);
        }
    }

    orderId?: number;
    quoteId?: number;
    customerId!: number;
    status!: string;
    deliveryDate?: Date | null;
    notes?: string;
    isActive!: boolean;

    items?: OrderItemModel[];
    statusHistory?: OrderStatusHistoryModel[];

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}