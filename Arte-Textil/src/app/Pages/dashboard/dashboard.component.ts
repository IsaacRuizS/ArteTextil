import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type AlertType = 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
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

  // Alertas (mock)
  alerts: { type: AlertType; title: string; detail: string; time: string }[] = [
    { type: 'danger', title: 'Pedidos atrasados', detail: '3 pedidos superaron la fecha estimada.', time: 'Hoy 10:15' },
    { type: 'warning', title: 'Inventario bajo', detail: 'Tela blanca: 8 unidades restantes.', time: 'Hoy 09:40' },
    { type: 'info', title: 'Promoción por vencer', detail: 'Descuento “Regreso a clases” vence en 2 días.', time: 'Ayer 18:05' },
    { type: 'warning', title: 'Datos inconsistentes', detail: '1 pedido sin categoría asignada.', time: 'Ayer 16:22' },
  ];

  lastUpdateLabel = 'Hace 15s'; // UI placeholder (luego lo conectas a “tiempo real”)
}
