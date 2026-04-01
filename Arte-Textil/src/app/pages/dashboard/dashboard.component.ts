import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ApiAlertService } from '../../services/api-alert.service';
import { ApiOrderService } from '../../services/api-order.service';
import { ApiProductService } from '../../services/api-product.service';
import { ApiQuoteService } from '../../services/api-quote.service';
import { AlertModel } from '../../shared/models/alert.model';
import { OrderModel } from '../../shared/models/order.model';
import { QuoteModel } from '../../shared/models/quote.model';
import { SharedService } from '../../services/shared.service';
import { NotificationService } from '../../services/notification.service';

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
    private shared: SharedService,
    private notificationService: NotificationService
  ) {}

  private _allOrders: OrderModel[] = [];
  private _allQuotes: QuoteModel[] = [];
  private readonly terminalStatuses = ['Entregado', 'Cancelado'];

  ngOnInit(): void {
    this.shared.setLoading(true);

    forkJoin({
      allOrders: this.orderApi.getAll(),
      products: this.productApi.getAll(),
      quotes: this.quoteApi.getAll(),
      alerts: this.alertApi.getAll(),
    }).subscribe({
      next: ({ allOrders, products, quotes, alerts }) => {
        this._allOrders = allOrders;
        this._allQuotes = quotes;
        this.kpis.stockAvailable = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
        this.alerts = alerts;
        this.alertIndex = 0;
        this.recalculate(allOrders, quotes);
        this.shared.setLoading(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar los datos del dashboard. Intente de nuevo.');
        this.shared.setLoading(false);
      }
    });
  }

  private recalculate(orders: OrderModel[], quotes: QuoteModel[]): void {
    this.kpis.activeOrders = orders.filter(o => !this.terminalStatuses.includes(o.status)).length;
    this.kpis.finishedOrders = orders.filter(o => o.status === 'Entregado').length;
    this.kpis.totalSales = quotes.filter(q => q.isActive).reduce((sum, q) => sum + (q.total ?? 0), 0);

    const total = orders.length || 1;
    this.productionStages = [
      'Nuevo', 'Corte', 'Estampado', 'Procesando', 'En camino', 'Entregado', 'Cancelado'
    ].map(name => ({
      name,
      active: orders.filter(o => o.status === name).length,
      total
    }));
  }

  applyFilters(): void {
    const from = this.filter.from ? new Date(this.filter.from) : null;
    const to = this.filter.to ? new Date(this.filter.to + 'T23:59:59') : null;
    const now = new Date();

    let filteredOrders = this._allOrders.filter(o => {
      if (from && o.createdAt && o.createdAt < from) return false;
      if (to && o.createdAt && o.createdAt > to) return false;

      if (this.filter.status !== 'Todos') {
        if (this.filter.status === 'Activo' && this.terminalStatuses.includes(o.status)) return false;
        if (this.filter.status === 'Finalizado' && o.status !== 'Entregado') return false;
        if (this.filter.status === 'Atrasado') {
          const isOverdue = o.deliveryDate && o.deliveryDate < now && !this.terminalStatuses.includes(o.status);
          if (!isOverdue) return false;
        }
      }

      return true;
    });

    let filteredQuotes = this._allQuotes.filter(q => {
      if (from && q.createdAt && q.createdAt < from) return false;
      if (to && q.createdAt && q.createdAt > to) return false;
      return true;
    });

    this.recalculate(filteredOrders, filteredQuotes);
    this.lastUpdateLabel = new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  }

  clearFilters(): void {
    this.filter = { from: '', to: '', category: 'Todas', status: 'Todos' };
    this.recalculate(this._allOrders, this._allQuotes);
    this.lastUpdateLabel = new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  }

  // Filtros
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

  alerts: AlertModel[] = [];
  alertIndex = 0;

  get currentAlert(): AlertModel | null {
    return this.alerts[this.alertIndex] ?? null;
  }

  lastUpdateLabel = new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
}
