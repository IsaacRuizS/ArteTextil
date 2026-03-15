import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiAlertService } from '../../services/api-alert.service';
import { AlertModel } from '../../shared/models/alert.model';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  constructor(
    private api: ApiAlertService,
    private shared: SharedService
  ) {}

  ngOnInit(): void {
    this.shared.setLoading(true);
    this.api.getAll().subscribe({
      next: data => {
        this.alerts = data.slice(0, 4);
        this.shared.setLoading(false);
      },
      error: () => this.shared.setLoading(false)
    });
  }
  // Filtros (solo UI)
  filter = {
    from: '',
    to: '',
    category: 'Todas',
    status: 'Todos',
  };

  categories = ['Todas', 'Camisas', 'Pantalones', 'Uniformes'];
  statuses = ['Todos', 'Activo', 'Finalizado', 'Atrasado'];

  // Indicadores (mock; luego los conectas a datos reales)
  kpis = {
    activeOrders: 12,
    finishedOrders: 48,
    stockAvailable: 320,
    totalSales: 1850000, // CRC
  };

  // Producción en curso (mock)
  productionStages = [
    { name: 'Diseño', active: 4, total: 10 },
    { name: 'Corte', active: 6, total: 10 },
    { name: 'Costura', active: 5, total: 10 },
    { name: 'Acabado', active: 3, total: 10 },
    { name: 'Empaque', active: 2, total: 10 },
  ];

  // Productividad (mock)
  productivityByEmployee = [
    { name: 'Ana López', area: 'Costura', units: 42, efficiency: 88 },
    { name: 'Carlos Mora', area: 'Corte', units: 35, efficiency: 81 },
    { name: 'María Rojas', area: 'Acabado', units: 29, efficiency: 76 },
    { name: 'José Vega', area: 'Empaque', units: 25, efficiency: 72 },
  ];

  productivityByArea = [
    { area: 'Diseño', units: 55, efficiency: 84 },
    { area: 'Corte', units: 78, efficiency: 80 },
    { area: 'Costura', units: 96, efficiency: 86 },
    { area: 'Acabado', units: 62, efficiency: 74 },
    { area: 'Empaque', units: 41, efficiency: 70 },
  ];

  alerts: AlertModel[] = [];

  lastUpdateLabel = 'Hace 15s'; // UI placeholder (luego lo conectas a “tiempo real”)
}
