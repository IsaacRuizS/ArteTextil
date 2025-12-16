import { Injectable, signal, computed } from '@angular/core';

// DB Table: ProductionStages
export interface ProductionStage {
    StageId: number;
    Name: string;
    OrderNumber: number;
    isActive: boolean;
}

// DB Table: ProductionOrders
export interface ProductionOrder {
    ProductionOrderId: number;
    ProductId: number;
    QuantityRequired: number;
    Status: 'Pendiente' | 'En producción' | 'Finalizado';
    DueDate: Date;
    isActive: boolean;
    // Relational / UI helpers
    Product?: { Name: string; ProductCode: string };
}

// DB Table: ProductionProgress
export interface ProductionProgress {
    ProgressId: number;
    ProductionOrderId: number;
    StageId: number;
    EmployeeId: number;
    Status: 'Pendiente' | 'En progreso' | 'Finalizado';
    Notes?: string;
    isActive: boolean;
    // Relational / UI helpers
    EmployeeName?: string;
    StageName?: string;
}

// DB Table: DashboardAlerts (simplified/mocked)
export interface DashboardAlert {
    AlertId: number;
    Type: string;
    Description: string;
    RelatedEntityId?: number;
    isActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ProductionService {

    // Mock Data matching DB structure
    readonly productionStages: ProductionStage[] = [
        { StageId: 1, Name: 'Corte', OrderNumber: 1, isActive: true },
        { StageId: 2, Name: 'Confección', OrderNumber: 2, isActive: true },
        { StageId: 3, Name: 'Estampado', OrderNumber: 3, isActive: true },
        { StageId: 4, Name: 'Terminado', OrderNumber: 4, isActive: true }
    ];

    private ordersSignal = signal<ProductionOrder[]>(this.getMockOrders());
    private progressSignal = signal<ProductionProgress[]>(this.getMockProgress());
    private alertsSignal = signal<DashboardAlert[]>([]);

    readonly orders = computed(() => this.ordersSignal());
    readonly progress = computed(() => this.progressSignal());
    readonly alerts = computed(() => this.alertsSignal());

    constructor() {
        this.checkDelays();
    }

    // --- MOCK DATA GENERATORS ---
    private getMockOrders(): ProductionOrder[] {
        return Array.from({ length: 8 }).map((_, i) => ({
            ProductionOrderId: 1000 + i + 1,
            ProductId: 500 + i,
            QuantityRequired: 10 * (i + 1),
            Status: i % 3 === 0 ? 'En producción' : 'Pendiente',
            DueDate: new Date(Date.now() + (i - 2) * 86400000), // Some past dates for alarms
            isActive: true,
            Product: { Name: i % 2 === 0 ? 'Camiseta Polo' : 'Jeans Slim Fit', ProductCode: `PRD-${500 + i}` }
        }));
    }

    private getMockProgress(): ProductionProgress[] {
        const progressList: ProductionProgress[] = [];
        const orders = this.getMockOrders();

        orders.forEach(order => {
            this.productionStages.forEach(stage => {
                progressList.push({
                    ProgressId: parseInt(`${order.ProductionOrderId}${stage.StageId}`),
                    ProductionOrderId: order.ProductionOrderId,
                    StageId: stage.StageId,
                    EmployeeId: 0, // Unassigned
                    Status: 'Pendiente',
                    isActive: true,
                    StageName: stage.Name
                });
            });

            // Simulate some progress
            if (order.Status === 'En producción') {
                const firstStage = progressList.find(p => p.ProductionOrderId === order.ProductionOrderId && p.StageId === 1);
                if (firstStage) {
                    firstStage.Status = 'En progreso';
                    firstStage.EmployeeId = 101;
                    firstStage.EmployeeName = 'Juan Perez';
                }
            }
        });

        return progressList;
    }

    // --- ACTIONS ---

    updateProgressStatus(productionOrderId: number, stageId: number, status: 'En progreso' | 'Finalizado') {
        this.progressSignal.update(currentList =>
            currentList.map(item => {
                if (item.ProductionOrderId === productionOrderId && item.StageId === stageId) {
                    return { ...item, Status: status };
                }
                return item;
            })
        );

        // Check if whole order is finished
        if (status === 'Finalizado' && stageId === this.productionStages[this.productionStages.length - 1].StageId) {
            this.ordersSignal.update(orders =>
                orders.map(o => o.ProductionOrderId === productionOrderId ? { ...o, Status: 'Finalizado' } : o)
            );
        }
    }

    assignEmployee(productionOrderId: number, stageId: number, employeeId: number, employeeName: string) {
        this.progressSignal.update(currentList =>
            currentList.map(item => {
                if (item.ProductionOrderId === productionOrderId && item.StageId === stageId) {
                    return { ...item, EmployeeId: employeeId, EmployeeName: employeeName };
                }
                return item;
            })
        );
    }

    private checkDelays() {
        const alerts: DashboardAlert[] = [];
        this.orders().forEach(order => {
            if (order.DueDate < new Date() && order.Status !== 'Finalizado') {
                alerts.push({
                    AlertId: order.ProductionOrderId,
                    Type: 'PedidoAtrasado',
                    Description: `Pedido #${order.ProductionOrderId} vencido el ${order.DueDate.toLocaleDateString()}`,
                    RelatedEntityId: order.ProductionOrderId,
                    isActive: true
                });
            }
        });
        this.alertsSignal.set(alerts);
    }

    getReportData(startDate: Date, endDate: Date, productType: string | null) {
        return this.orders().filter(o => {
            const finished = o.Status === 'Finalizado';
            // Mock createdAt check (assuming created some days before due date)
            const estimatedCreated = new Date(o.DueDate.getTime() - 5 * 86400000);
            const inRange = estimatedCreated >= startDate && estimatedCreated <= endDate;
            const typeMatch = productType ? o.Product?.Name.includes(productType) : true;
            return finished && inRange && typeMatch;
        });
    }
}
