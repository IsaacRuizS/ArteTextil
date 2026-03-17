export class CartItemModel {
    constructor(init?: Partial<CartItemModel>) {
        if (init) Object.assign(this, init);
    }

    cartItemId: number = 0;
    cartId: number = 0;
    productId: number = 0;
    quantity: number = 1;
    isActive: boolean = true;
}
