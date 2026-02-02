import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceModel } from '../../../shared/models/attendance.model';
import { ApiAttendanceService } from '../../../services/api-attendance.service';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-attendance',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [CommonModule],
    templateUrl: './attendance.component.html',
    styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

    attendances: AttendanceModel[] = [];
    attendancesOrigin: AttendanceModel[] = [];

    searchTerm = '';
    currentUserId = 1; // sacarlo despues del token o de la sesion

    constructor(
        private apiAttendance: ApiAttendanceService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadAttendances();
    }

    loadAttendances() {
        this.sharedService.setLoading(true);

        this.apiAttendance.getAll().subscribe({
            next: (data) => {
                this.attendances = data;
                this.attendancesOrigin = data;
                this.cdr.markForCheck();
                this.sharedService.setLoading(false);
            },
            error: () => this.sharedService.setLoading(false)
        });
    }

    // CHECK IN
    checkIn() {
        this.sharedService.setLoading(true);

        this.apiAttendance.checkIn(this.currentUserId).subscribe({
            next: () => {
                this.loadAttendances();
            },
            error: () => this.sharedService.setLoading(false)
        });
    }

    // CHECK OUT
    checkOut() {
        this.sharedService.setLoading(true);

        this.apiAttendance.checkOut(this.currentUserId).subscribe({
            next: () => {
                this.loadAttendances();
            },
            error: () => this.sharedService.setLoading(false)
        });
    }

    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.onFilter();
    }

    onFilter() {
        this.attendances = this.attendancesOrigin;

        if (!this.searchTerm || this.searchTerm.trim() === '') return;

        const term = this.searchTerm.toLowerCase();

        this.attendances = this.attendances.filter(a =>
            a.userId.toString().includes(term) ||
            (a.checkIn && a.checkIn.toString().toLowerCase().includes(term))
        );
    }
}