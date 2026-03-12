export class CartModel {
    constructor(init?: Partial<CartModel>) {
        if (init) Object.assign(this, init);
    }

    cartId: number = 0;
    customerId: number = 0;
    status: string = 'Active';
    isActive: boolean = true;
}
