export class AlertModel {

    constructor(init?: Partial<AlertModel>) {
        if (init) {
            if (typeof init.createdAt === 'string') {
                init.createdAt = new Date(init.createdAt);
            }
            Object.assign(this, init);
        }
    }

    alertId!: number;
    title!: string;
    message!: string;
    isRead!: boolean;
    createdAt!: Date;
}