export class SalaryModel {
    constructor(init?: Partial<SalaryModel>) {
        Object.assign(this, init);
    }

    salaryId!: number;
    userId!: number;
    userName?: string;
    baseSalary!: number;
    createdAt?: string | Date;
}