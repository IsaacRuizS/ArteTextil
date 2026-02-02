export class VacationModel {

    constructor(init?: Partial<VacationModel>) {
        if (init) {
            if (typeof init.startDate === 'string') init.startDate = new Date(init.startDate);
            if (typeof init.endDate === 'string') init.endDate = new Date(init.endDate);
            Object.assign(this, init);
        }
    }

    vacationId!: number;
    userId!: number;
    startDate!: Date;
    endDate!: Date;
    status!: string;
    approvedByUserId?: number;
    isActive!: boolean;
}