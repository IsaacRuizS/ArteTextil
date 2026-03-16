export class PaymentModel {
    constructor(init?: Partial<PaymentModel>) {
        Object.assign(this, init);
    }

    paymentId!: number;
    payrollId!: number;
    userName?: string;
    amount!: number;
    paymentDate?: string | Date;
    method?: string;
}