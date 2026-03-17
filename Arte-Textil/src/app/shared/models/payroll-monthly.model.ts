export class PayrollMonthlyModel {

    constructor(init?: Partial<PayrollMonthlyModel>) {
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

}