export class DemandModel {

    constructor(init?: Partial<DemandModel>) {
        if (init) {
            Object.assign(this, init);
        }
    }

    productId!: number;
    productName!: string;
    month!: string;
    totalQuantity!: number;
}