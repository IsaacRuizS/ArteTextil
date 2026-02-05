import { ProductImageModel } from './productImage.model';
import { PromotionModel } from './promotion.model';

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

            if (init.promotions?.length) {
                init.promotions = init.promotions.map(promo => new PromotionModel(promo));
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
    promotions?: PromotionModel[];

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;

    get bestPromotion(): PromotionModel | null {

        if (!this.promotions || this.promotions.length === 0) {
            return null;
        }

        return this.promotions
            ?.filter(x => x.discountPercent != null)
            .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))[0]
            || null;
    }

    get mainImageUrl(): string {

        if (this.productImages && this.productImages.length > 0) {
            const mainImage = this.productImages.find(img => img.isMain);
            if (mainImage) {
                return mainImage.imageUrl;
            }
            return this.productImages[0].imageUrl;
        }
        return 'assets/images/no-image.jpg';
    }
}

