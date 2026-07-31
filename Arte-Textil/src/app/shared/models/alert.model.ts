export type AlertType = 'Stock' | 'Orden' | 'Promocion';
export type AlertSeverity = 'Alta' | 'Media' | 'Baja';

export class AlertItemModel {
    entityId!: number;

    // "Gorra", "Orden #26"
    label!: string;

    // "Disponible 0 · stock 2 · reservado 1 · mínimo 10"
    detail!: string;

    // Stock sin disponibilidad, orden vencida
    critical!: boolean;
}

export class AlertDetailModel {
    count!: number;
    items: AlertItemModel[] = [];
}

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

    // Los tres vienen vacíos en las alertas anteriores al cambio.
    type?: AlertType;
    severity?: AlertSeverity;
    detail?: AlertDetailModel;
}
