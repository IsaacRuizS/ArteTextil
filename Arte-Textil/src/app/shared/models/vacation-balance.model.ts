export class VacationBalanceModel {

    constructor(init?: Partial<VacationBalanceModel>) {
        if (init) {
            if (typeof init.hireDate === 'string') {
                init.hireDate = new Date(init.hireDate);
            }
            Object.assign(this, init);
        }
    }

    userId!: number;
    userName!: string;
    hireDate!: Date;

    /** Meses completos trabajados desde el ingreso. */
    monthsWorked!: number;

    /** Días ganados: 1 por cada mes completo trabajado. */
    earnedDays!: number;

    /** Días ya aprobados. */
    approvedDays!: number;

    /** Días de solicitudes pendientes de resolución (también reservan saldo). */
    pendingDays!: number;

    /** earnedDays - approvedDays - pendingDays (nunca negativo). */
    availableDays!: number;
}
