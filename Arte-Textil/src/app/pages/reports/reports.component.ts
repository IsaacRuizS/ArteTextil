import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ReportType =
  | 'Ventas por producto'
  | 'Ventas por cliente'
  | 'Ventas por período'
  | 'Productividad por empleado'
  | 'Productividad por etapa'
  | 'Inventario: rotación'
  | 'Inventario: consumo'
  | 'Inventario: niveles de stock'
  | 'Comparativo mensual: ventas'
  | 'Comparativo mensual: producción';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  // Filtros (solo UI)
  filters = {
    from: '',
    to: '',
    period: 'Mensual',
    product: '',
    client: '',
    employee: 'Todos',
    stage: 'Todas',
  };

  periodOptions = ['Diario', 'Semanal', 'Mensual', 'Anual'];
  employees = ['Todos', 'Ana López', 'Carlos Mora', 'María Jiménez', 'Luis Sánchez'];
  stages = ['Todas', 'Corte', 'Costura', 'Bordado', 'Empaque'];

  selectedReport: ReportType = 'Ventas por período';

  // Datos mock para tablas
  salesByProduct = [
    { product: 'Camisa blanca', units: 120, revenue: '₡ 780,000' },
    { product: 'Pantalón gris', units: 85, revenue: '₡ 935,000' },
    { product: 'Uniforme completo', units: 40, revenue: '₡ 1,120,000' }
  ];

  salesByClient = [
    { client: 'APF Liceo Samuel Sáenz', orders: 12, revenue: '₡ 2,450,000' },
    { client: 'Cliente Mostrador', orders: 48, revenue: '₡ 1,880,000' },
    { client: 'Institución X', orders: 6, revenue: '₡ 920,000' }
  ];

  productivityByEmployee = [
    { employee: 'Ana López', output: 52, target: 60 },
    { employee: 'Carlos Mora', output: 63, target: 70 },
    { employee: 'María Jiménez', output: 39, target: 50 }
  ];

  productivityByStage = [
    { stage: 'Corte', output: 48, target: 60 },
    { stage: 'Costura', output: 62, target: 70 },
    { stage: 'Bordado', output: 31, target: 40 },
    { stage: 'Empaque', output: 55, target: 55 }
  ];

  inventoryRotation = [
    { item: 'Tela blanca', rotation: '3.2x/mes', days: 9 },
    { item: 'Tela gris', rotation: '2.1x/mes', days: 14 },
    { item: 'Botones metálicos', rotation: '4.0x/mes', days: 7 }
  ];

  rawMaterialConsumption = [
    { item: 'Tela blanca (m)', used: 220, unit: 'm', period: 'Mes' },
    { item: 'Hilo (rollos)', used: 34, unit: 'rollos', period: 'Mes' },
    { item: 'Botones (u)', used: 520, unit: 'u', period: 'Mes' }
  ];

  stockLevels = [
    { item: 'Tela blanca', current: 45, min: 60, max: 200 },
    { item: 'Tela gris', current: 120, min: 80, max: 220 },
    { item: 'Botones metálicos', current: 30, min: 50, max: 300 }
  ];

  monthlyComparative = [
    { month: 'Ago', sales: '₡ 1,350,000', production: 210, orders: 42 },
    { month: 'Sep', sales: '₡ 1,620,000', production: 240, orders: 51 },
    { month: 'Oct', sales: '₡ 1,480,000', production: 225, orders: 46 }
  ];

  // Helpers visuales
  exportFormats = ['PDF', 'Excel', 'CSV'];
  selectedExport = 'PDF';

  isSalesReport() {
    return this.selectedReport.startsWith('Ventas');
  }
  isProductivityReport() {
    return this.selectedReport.startsWith('Productividad');
  }
  isInventoryReport() {
    return this.selectedReport.startsWith('Inventario');
  }
  isComparativeReport() {
    return this.selectedReport.startsWith('Comparativo mensual');
  }
}
