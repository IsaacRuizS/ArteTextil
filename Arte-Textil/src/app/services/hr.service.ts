import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// --- INTERFACES ---
export interface Attendance {
    id: number;
    userId: number;
    userName: string;
    date: Date;
    checkIn?: string; // HH:mm
    checkOut?: string; // HH:mm
    status: 'OnTime' | 'Late' | 'Absent';
}

export interface VacationRequest {
    id: number;
    userId: number;
    userName: string;
    requestDate: Date;
    startDate: Date;
    endDate: Date;
    status: 'Pending' | 'Approved' | 'Rejected';
    comment?: string;
}

export interface PayrollStub {
    id: number;
    userId: number;
    userName: string;
    period: string; // e.g., "Dic 2025 - Quincena 1"
    baseSalary: number;
    deductions: number;
    bonuses: number;
    netPay: number;
    isPaid: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class HrService {

    // --- MOCK DATA ---
    private attendanceRecords: Attendance[] = [
        { id: 1, userId: 2, userName: 'Ana Vendedora', date: new Date(), checkIn: '08:00', status: 'OnTime' },
        { id: 2, userId: 3, userName: 'Pedro Almacén', date: new Date(), checkIn: '08:15', status: 'Late' }
    ];

    private vacationRequests: VacationRequest[] = [
        { id: 1, userId: 2, userName: 'Ana Vendedora', requestDate: new Date(), startDate: new Date('2025-12-20'), endDate: new Date('2025-12-25'), status: 'Pending' }
    ];

    private payrollStubs: PayrollStub[] = [
        { id: 1, userId: 2, userName: 'Ana Vendedora', period: 'Dic 2025 - Q1', baseSalary: 450000, deductions: 45000, bonuses: 0, netPay: 405000, isPaid: true },
        { id: 2, userId: 3, userName: 'Pedro Almacén', period: 'Dic 2025 - Q1', baseSalary: 400000, deductions: 40000, bonuses: 20000, netPay: 380000, isPaid: true }
    ];

    constructor() { }

    // --- ATTENDANCE ---
    getAttendance(): Observable<Attendance[]> {
        return of(this.attendanceRecords);
    }

    checkIn(userId: number, userName: string): void {
        const today = new Date();
        const existing = this.attendanceRecords.find(a => a.userId === userId && a.date.toDateString() === today.toDateString());
        if (!existing) {
            this.attendanceRecords.push({
                id: this.attendanceRecords.length + 1,
                userId,
                userName,
                date: today,
                checkIn: new Date().toTimeString().substring(0, 5),
                status: 'OnTime' // Simplify logic for mock
            });
        }
    }

    checkOut(userId: number): void {
        const today = new Date();
        const record = this.attendanceRecords.find(a => a.userId === userId && a.date.toDateString() === today.toDateString());
        if (record) {
            record.checkOut = new Date().toTimeString().substring(0, 5);
        }
    }

    updateAttendance(id: number, checkIn: string, checkOut: string) {
        const record = this.attendanceRecords.find(a => a.id === id);
        if (record) {
            record.checkIn = checkIn;
            record.checkOut = checkOut;
        }
    }

    // --- VACATIONS ---
    getVacations(): Observable<VacationRequest[]> {
        return of(this.vacationRequests);
    }

    requestVacation(req: Omit<VacationRequest, 'id' | 'status' | 'requestDate'>) {
        this.vacationRequests.push({
            ...req,
            id: this.vacationRequests.length + 1,
            requestDate: new Date(),
            status: 'Pending'
        });
    }

    updateVacationStatus(id: number, status: 'Approved' | 'Rejected', comment?: string) {
        const req = this.vacationRequests.find(r => r.id === id);
        if (req) {
            req.status = status;
            req.comment = comment;
        }
    }

    // --- PAYROLL ---
    getPayrolls(): Observable<PayrollStub[]> {
        return of(this.payrollStubs);
    }

    updatePayroll(id: number, adjustments: { deductions: number, bonuses: number }) {
        const stub = this.payrollStubs.find(p => p.id === id);
        if (stub) {
            stub.deductions = adjustments.deductions;
            stub.bonuses = adjustments.bonuses;
            stub.netPay = stub.baseSalary - stub.deductions + stub.bonuses;
        }
    }
}
