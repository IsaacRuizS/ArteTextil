import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ApiAlertService } from '../../services/api-alert.service';
import { ApiOrderService } from '../../services/api-order.service';
import { ApiProductService } from '../../services/api-product.service';
import { ApiQuoteService } from '../../services/api-quote.service';
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
    private alertApi: ApiAlertService,
    private orderApi: ApiOrderService,
    private productApi: ApiProductService,
    private quoteApi: ApiQuoteService,
    private shared: SharedService
  ) {}

  ngOnInit(): void {
    this.shared.setLoading(true);

    forkJoin({
      allOrders: this.orderApi.getAll(),
      products: this.productApi.getAll(),
      quotes: this.quoteApi.getAll(),
      alerts: this.alertApi.getAll(),
    }).subscribe({
      next: ({ allOrders, products, quotes, alerts }) => {
        const terminalStatuses = ['Entregado', 'Cancelado'];
        this.kpis.activeOrders = allOrders.filter(o => !terminalStatuses.includes(o.status)).length;
        this.kpis.finishedOrders = allOrders.filter(o => o.status === 'Entregado').length;
        this.kpis.stockAvailable = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
        this.kpis.totalSales = quotes.filter(q => q.isActive).reduce((sum, q) => sum + (q.total ?? 0), 0);
        this.alerts = alerts.slice(0, 4);

        const total = allOrders.length || 1;
        this.productionStages = [
          'Nuevo', 'Corte', 'Estampado', 'Procesando', 'En camino', 'Entregado', 'Cancelado'
        ].map(name => ({
          name,
          active: allOrders.filter(o => o.status === name).length,
          total
        }));

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

  kpis = {
    activeOrders: 0,
    finishedOrders: 0,
    stockAvailable: 0,
    totalSales: 0,
  };

  productionStages: { name: string; active: number; total: number }[] = [];

  // Productividad (mock — requiere endpoint backend)
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

  lastUpdateLabel = new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
}
