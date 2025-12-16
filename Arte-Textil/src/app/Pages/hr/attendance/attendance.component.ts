import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HrService, Attendance } from '../../../services/hr.service';

@Component({
    selector: 'app-attendance',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './attendance.component.html',
    styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

    records: Attendance[] = [];
    currentRole = 'Admin'; // Mock Role: 'Admin', 'Manager', 'Collab'

    // Edit Modal
    showEditModal = false;
    editForm: FormGroup;
    selectedRecord: Attendance | null = null;

    constructor(
        private hrService: HrService,
        private fb: FormBuilder
    ) {
        this.editForm = this.fb.group({
            checkIn: ['', Validators.required],
            checkOut: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadAttendance();
    }

    loadAttendance() {
        this.hrService.getAttendance().subscribe(data => this.records = data);
    }

    // Role Simulation
    switchRole(role: string) {
        this.currentRole = role;
    }

    // ACTIONS
    onCheckIn() {
        this.hrService.checkIn(99, 'Usuario Actual'); // Mock User
        this.loadAttendance();
        alert('Entrada registrada.');
    }

    onCheckOut() {
        this.hrService.checkOut(99);
        this.loadAttendance();
        alert('Salida registrada.');
    }

    openEditModal(record: Attendance) {
        this.selectedRecord = record;
        this.editForm.patchValue({
            checkIn: record.checkIn,
            checkOut: record.checkOut
        });
        this.showEditModal = true;
    }

    saveEdit() {
        if (this.editForm.valid && this.selectedRecord) {
            this.hrService.updateAttendance(
                this.selectedRecord.id,
                this.editForm.value.checkIn,
                this.editForm.value.checkOut
            );
            this.showEditModal = false;
            this.loadAttendance();
            alert('Registro corregido.');
        }
    }
}
