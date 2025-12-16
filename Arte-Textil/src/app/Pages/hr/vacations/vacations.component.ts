import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HrService, VacationRequest } from '../../../services/hr.service';

@Component({
    selector: 'app-vacations',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './vacations.component.html',
    styleUrls: ['./vacations.component.scss']
})
export class VacationsComponent implements OnInit {

    requests: VacationRequest[] = [];
    requestForm: FormGroup;
    currentRole = 'Collab';

    showFormModal = false;

    constructor(
        private hrService: HrService,
        private fb: FormBuilder
    ) {
        this.requestForm = this.fb.group({
            startDate: ['', Validators.required],
            endDate: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadVacations();
    }

    loadVacations() {
        this.hrService.getVacations().subscribe(data => this.requests = data);
    }

    switchRole(role: string) {
        this.currentRole = role;
    }

    // ACTIONS
    openRequestModal() {
        this.requestForm.reset();
        this.showFormModal = true;
    }

    submitRequest() {
        if (this.requestForm.valid) {
            this.hrService.requestVacation({
                userId: 99,
                userName: 'Usuario Actual',
                startDate: new Date(this.requestForm.value.startDate),
                endDate: new Date(this.requestForm.value.endDate)
            });
            this.showFormModal = false;
            this.loadVacations();
            alert('Solicitud enviada.');
        }
    }

    approve(req: VacationRequest) {
        this.hrService.updateVacationStatus(req.id, 'Approved', 'Disfrute sus vacaciones');
        this.loadVacations();
        alert('Solicitud aprobada.');
    }

    reject(req: VacationRequest) {
        this.hrService.updateVacationStatus(req.id, 'Rejected', 'Lo sentimos, requerimos su presencia');
        this.loadVacations();
        alert('Solicitud rechazada.');
    }
}
