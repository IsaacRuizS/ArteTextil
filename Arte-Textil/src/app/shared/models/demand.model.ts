export class DemandModel {

    constructor(init?: Partial<DemandModel>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    productId!: number;
    productName!: string;
    year!: number;
    monthNumber!: number;
    month!: string;
    totalQuantity!: number;
    isForecast!: boolean;
}
