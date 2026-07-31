export class VacationModel {

    constructor(init?: Partial<VacationModel>) {
        if (init) {
            if (typeof init.startDate === 'string') init.startDate = new Date(init.startDate);
            if (typeof init.endDate === 'string') init.endDate = new Date(init.endDate);
            if (typeof init.createdAt === 'string') init.createdAt = new Date(init.createdAt);
            Object.assign(this, init);
        }
    }

    vacationRequestId!: number;
    userId!: number;
    userName?: string;

    startDate!: Date;
    endDate!: Date;
    status!: string;
    approvedByUserId?: number;
    notes?: string;
    isActive!: boolean;

    /** Fecha en que se envió la solicitud. Se usa para ordenar el listado. */
    createdAt?: Date;
}