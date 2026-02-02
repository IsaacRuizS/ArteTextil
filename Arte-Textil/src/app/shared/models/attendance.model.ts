export class AttendanceModel {

    constructor(init?: Partial<AttendanceModel>) {
        if (init) {
            if (typeof init.checkIn === 'string') init.checkIn = new Date(init.checkIn);
            if (typeof init.checkOut === 'string') init.checkOut = new Date(init.checkOut);
            if (typeof init.createdAt === 'string') init.createdAt = new Date(init.createdAt);
            if (typeof init.updatedAt === 'string') init.updatedAt = new Date(init.updatedAt);
            if (typeof init.deletedAt === 'string') init.deletedAt = new Date(init.deletedAt);
            Object.assign(this, init);
        }
    }

    attendanceId!: number;
    userId!: number;
    checkIn?: Date;
    checkOut?: Date;
    isActive!: boolean;

    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}