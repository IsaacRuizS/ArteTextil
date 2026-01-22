export class CategoryModel {
    constructor(init?: Partial<CategoryModel>) {
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

            Object.assign(this, init);
        }
    }

    categoryId!: number;
    name!: string;
    description?: string;
    isActive!: boolean;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
