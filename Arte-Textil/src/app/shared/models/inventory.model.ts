export class InventoryMovementModel {
    constructor(init?: Partial<InventoryMovementModel>) {
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

    movementId!: number;
    productId!: number;
    type!: string; // Entrada, Salida, Ajuste
    quantity!: number;
    reason?: string;
    previousStock!: number;
    newStock!: number;
    performedByUserId!: number;
    isActive!: boolean;

    // Datos adicionales
    productName?: string;
    productCode?: string;
    performedByUserName?: string;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export class InventoryItemModel {
    constructor(init?: Partial<InventoryItemModel>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    productId!: number;
    productName!: string;
    productCode?: string;
    stock!: number;
    minStock!: number;
    price!: number;
    status?: string;
    categoryName?: string;
    isLowStock!: boolean;
}

export class InventoryReportModel {
    constructor(init?: Partial<InventoryReportModel>) {
        if (init) {
            if (typeof init.reportDate === 'string') {
                init.reportDate = new Date(init.reportDate);
            }
            if (typeof init.generatedAt === 'string') {
                init.generatedAt = new Date(init.generatedAt);
            }

            if (init.items) {
                init.items = init.items.map(item => new InventoryItemModel(item));
            }

            Object.assign(this, init);
        }
    }

    reportDate!: Date;
    generatedAt?: Date; // Alias for reportDate
    totalProducts!: number;
    lowStockProducts!: number;
    outOfStockProducts!: number;
    totalInventoryValue!: number;
    items!: InventoryItemModel[];
}

export class StockAlertModel {
    constructor(init?: Partial<StockAlertModel>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    productId!: number;
    productName!: string;
    productCode?: string;
    currentStock!: number;
    minStock!: number;
    alertLevel!: string; // Crítico, Bajo, Normal
}

export class RegisterMovementModel {
    productId!: number;
    type!: string; // Entrada, Salida, Ajuste
    quantity!: number;
    reason?: string;
    performedByUserId!: number;
}
