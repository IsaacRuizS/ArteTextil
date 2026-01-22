import { ProductImageModel } from './productImage.model';

export class ProductModel {
    constructor(init?: Partial<ProductModel>) {
        if (init) {
            if (typeof init.createdAt === 'string') {
                init.createdAt = new Date(init.createdAt);
            }
            if (typeof init.updatedAt === 'string') {
                init.updatedAt = new Date(init.updatedAt);
            }
            if (typeof init.deletedAt === 'string') {
                init.deletedAt = new Date(init.deletedAt);
            }

            if (init.productImages?.length) {
                init.productImages = init.productImages.map(img => new ProductImageModel(img));
            }

            Object.assign(this, init);
        }
    }

    productId!: number;
    name!: string;
    description?: string;
    productCode?: string;
    price!: number;
    stock!: number;
    minStock!: number;
    status?: string;
    categoryId!: number;
    supplierId!: number;
    isActive!: boolean;

    productImages?: ProductImageModel[];

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

