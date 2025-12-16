import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HrService, PayrollStub } from '../../../services/hr.service';

@Component({
    selector: 'app-payroll',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './payroll.component.html',
    styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {

    payrolls: PayrollStub[] = [];
    currentRole = 'Admin';

    // Adjust Modal
    showAdjustModal = false;
    adjustForm: FormGroup;
    selectedStub: PayrollStub | null = null;

    constructor(
        private hrService: HrService,
        private fb: FormBuilder
    ) {
        this.adjustForm = this.fb.group({
            deductions: [0, [Validators.required, Validators.min(0)]],
            bonuses: [0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.loadPayroll();
    }

    loadPayroll() {
        this.hrService.getPayrolls().subscribe(data => this.payrolls = data);
    }

    switchRole(role: string) {
        this.currentRole = role;
    }

    // ACTIONS
    openAdjustModal(stub: PayrollStub) {
        this.selectedStub = stub;
        this.adjustForm.patchValue({
            deductions: stub.deductions,
            bonuses: stub.bonuses
        });
        this.showAdjustModal = true;
    }

    saveAdjustment() {
        if (this.adjustForm.valid && this.selectedStub) {
            this.hrService.updatePayroll(
                this.selectedStub.id,
                this.adjustForm.value
            );
            this.showAdjustModal = false;
            this.loadPayroll();
            alert('Ajustes aplicados correctamente.');
        }
    }

    notifyPayment() {
        // Simulation of mass email notification
        alert('Se han enviado las notificaciones de pago por correo a todos los colaboradores.');
    }

    downloadStub(stub: PayrollStub) {
        // Simulation of PDF download
        alert(`Descargando colilla de pago para ${stub.period}...`);
    }
}
