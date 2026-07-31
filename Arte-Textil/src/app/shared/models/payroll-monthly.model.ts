export class PayrollMonthlyModel {

    constructor(init?: Partial<PayrollMonthlyModel>) {
        if (init && typeof init.createdAt === 'string') {
            init.createdAt = new Date(init.createdAt);
        }
        Object.assign(this, init);
    }

    payrollId!: number;

    userId!: number;

    userName?: string;

    year!: number;

    month!: number;

    baseSalary!: number;

    extras!: number;

    deductions!: number;

    total!: number;

    approvedByUserId?: number;

    isActive!: boolean;

    /** Fecha de generación de la planilla. Se usa para ordenar el listado. */
    createdAt?: Date;

}