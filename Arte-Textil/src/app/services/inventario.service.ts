import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoInventario {
  productId: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  stock: number;
  stockMinimo: number;
  ubicacion?: string;
  estado?: string;
  precio: number;
  categoriaId: number;
  categoriaNombre?: string;
}

export interface CrearProducto {
  codigo: string;
  nombre: string;
  cantidad: number;
  ubicacion?: string;
  estado?: string;
  stockMinimo: number;
  observaciones?: string;
  categoriaId: number;
  precio?: number;
}

export interface MovimientoInventario {
  productoId: number;
  tipo: string;
  cantidad: number;
  observaciones?: string;
  usuarioId: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = 'http://localhost:5000/api/inventario';

  constructor(private http: HttpClient) { }

  obtenerInventario(estado?: string, categoria?: string, busqueda?: string): Observable<ProductoInventario[]> {
    let params: any = {};
    if (estado) params.estado = estado;
    if (categoria) params.categoria = categoria;
    if (busqueda) params.busqueda = busqueda;
    
    return this.http.get<ProductoInventario[]>(this.apiUrl, { params });
  }

  crearProducto(producto: CrearProducto): Observable<ProductoInventario> {
    // Transformar a PascalCase para el backend
    const payload = {
      Codigo: producto.codigo,
      Nombre: producto.nombre,
      Cantidad: producto.cantidad,
      Ubicacion: producto.ubicacion,
      Estado: producto.estado,
      StockMinimo: producto.stockMinimo,
      Observaciones: producto.observaciones,
      CategoriaId: producto.categoriaId,
      Precio: producto.precio
    };
    return this.http.post<ProductoInventario>(this.apiUrl, payload);
  }

  registrarMovimiento(movimiento: MovimientoInventario): Observable<any> {
    // Transformar a PascalCase para el backend
    const payload = {
      ProductoId: movimiento.productoId,
      Tipo: movimiento.tipo,
      Cantidad: movimiento.cantidad,
      Observaciones: movimiento.observaciones,
      UsuarioId: movimiento.usuarioId
    };
    return this.http.post(`${this.apiUrl}/movimiento`, payload);
  }

  consultarDisponibilidad(codigo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/disponibilidad/${codigo}`);
  }

generarReporteGeneral(): Observable<any> {
        return this.http.get(`${this.apiUrl}/reporte/general`);
    }

    generarReporteStockBajo(): Observable<any> {
        return this.http.get(`${this.apiUrl}/reporte/stock-bajo`);
    }

    generarReporteMovimientos(fechaInicio?: string, fechaFin?: string): Observable<any> {
        let params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
        
        const queryString = params.toString();
        const url = queryString ? `${this.apiUrl}/reporte/movimientos?${queryString}` : `${this.apiUrl}/reporte/movimientos`;
        return this.http.get(url);
  }

  obtenerAlertas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/alertas`);
  }

  marcarAlertaLeida(alertaId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/alertas/${alertaId}/leer`, {});
  }

  obtenerMovimientos(productoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/movimientos/${productoId}`);
  }
}
