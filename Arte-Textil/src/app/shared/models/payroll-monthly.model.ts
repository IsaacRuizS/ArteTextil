export class PayrollMonthlyModel {
    constructor(init?: Partial<PayrollMonthlyModel>) {
        if (init?.month && typeof init.month === 'string') { /* noop */ }
        Object.assign(this, init);
    }

    payrollId!: number;
    userId!: number;
    userName?: string;
    month!: string; // e.g. "2026-03"
    total!: number;
    status!: string; // Pendiente / Aprobada
    createdAt?: string | Date;
}