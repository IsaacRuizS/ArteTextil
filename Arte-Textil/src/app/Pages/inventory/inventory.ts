import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InventarioService, ProductoInventario, CrearProducto } from '../../services/inventario.service';

interface Categoria {
  categoryId: number;
  name: string;
  description?: string;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './inventory.html',
    styleUrls: ['./inventory.scss']
})
export class InventoryComponent implements OnInit {
    productos: ProductoInventario[] = [];
    categorias: Categoria[] = [];
    selectedStatus = 'Todos';
    statuses = ['Todos', 'Disponible', 'Agotado', 'Dañado', 'En tránsito'];
    busqueda = '';
    
    // Toast notifications
    toasts: Toast[] = [];
    private toastIdCounter = 0;

    // Nuevo producto
    nuevoProducto = {
        codigo: '',
        nombre: '',
        cantidad: 0,
        ubicacion: '',
        estado: 'Disponible',
        stockMinimo: 5,
        observaciones: '',
        categoriaId: 0,
        precio: 0
    };

    // Movimiento de inventario
    movimiento = {
        productoId: 0,
        tipo: 'Entrada',
        cantidad: 0,
        observaciones: '',
        usuarioId: 1
    };

    // Reportes
    reporteGeneral: any = null;
    reporteStockBajo: any = null;
    reporteMovimientos: any = null;

    constructor(
        private inventarioService: InventarioService,
        private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.cargarCategorias();
        // Cargar todos los productos al inicio (sin filtros)
        setTimeout(() => {
            this.cargarInventario(false);
        }, 100);
    }

    cargarInventario(mostrarToast: boolean = true) {
        // Asegurarse de que 'Todos' no se envíe como filtro
        const estado = (this.selectedStatus && this.selectedStatus !== 'Todos') ? this.selectedStatus : undefined;
        const busqueda = (this.busqueda && this.busqueda.trim() !== '') ? this.busqueda.trim() : undefined;
        
        console.log('Filtrando con:', { estado, busqueda }); // Debug
        
        this.inventarioService.obtenerInventario(estado, undefined, busqueda)
            .subscribe({
                next: (data) => {
                    this.productos = [...data]; // Crear nuevo array para forzar detección
                    console.log('Productos cargados:', data.length); // Debug
                    this.cdr.detectChanges(); // Forzar detección de cambios
                    if (mostrarToast) {
                        this.showToast('success', 'Inventario cargado correctamente');
                    }
                },
                error: (error) => {
                    console.error('Error al cargar inventario:', error);
                    this.showToast('error', 'Error al cargar el inventario');
                }
            });
    }

    cargarCategorias() {
        this.http.get<Categoria[]>('http://localhost:5000/api/category')
            .subscribe({
                next: (data) => {
                    this.categorias = data.filter(c => c.categoryId > 0);
                },
                error: (error) => {
                    console.error('Error al cargar categorías:', error);
                    this.showToast('error', 'Error al cargar categorías');
                }
            });
    }

    crearProducto() {
        if (!this.nuevoProducto.codigo || !this.nuevoProducto.nombre) {
            this.showToast('warning', 'Por favor complete todos los campos obligatorios');
            return;
        }

        if (!this.nuevoProducto.categoriaId || this.nuevoProducto.categoriaId === 0) {
            this.showToast('warning', 'Por favor seleccione una categoría');
            return;
        }

        const producto: CrearProducto = {
            codigo: this.nuevoProducto.codigo,
            nombre: this.nuevoProducto.nombre,
            cantidad: this.nuevoProducto.cantidad,
            ubicacion: this.nuevoProducto.ubicacion,
            estado: this.nuevoProducto.estado,
            stockMinimo: this.nuevoProducto.stockMinimo,
            observaciones: this.nuevoProducto.observaciones,
            categoriaId: this.nuevoProducto.categoriaId,
            precio: this.nuevoProducto.precio
        };

        this.inventarioService.crearProducto(producto)
            .subscribe({
                next: (data) => {
                    this.showToast('success', 'Producto creado exitosamente');
                    this.cargarInventario(false);
                    this.limpiarFormulario();
                },
                error: (error) => {
                    console.error('Error al crear producto:', error);
                    const mensaje = error.error?.message || 'Error al crear el producto';
                    this.showToast('error', mensaje);
                }
            });
    }

    limpiarFormulario() {
        this.nuevoProducto = {
            codigo: '',
            nombre: '',
            cantidad: 0,
            ubicacion: '',
            estado: 'Disponible',
            stockMinimo: 5,
            observaciones: '',
            categoriaId: 0,
            precio: 0
        };
    }

    filtrar() {
        this.cargarInventario(true);
    }

    abrirModalReportes() {
        // Cargar el reporte general automáticamente al abrir el modal
        this.cargarReporteGeneral();
    }

    registrarMovimiento() {
        if (!this.movimiento.productoId || this.movimiento.productoId === 0) {
            this.showToast('warning', 'Por favor seleccione un producto');
            return;
        }

        if (!this.movimiento.cantidad || this.movimiento.cantidad <= 0) {
            this.showToast('warning', 'Por favor ingrese una cantidad válida');
            return;
        }

        this.inventarioService.registrarMovimiento(this.movimiento)
            .subscribe({
                next: (data) => {
                    this.showToast('success', `Movimiento de ${this.movimiento.tipo} registrado exitosamente`);
                    this.cargarInventario(false);
                    this.limpiarMovimiento();
                },
                error: (error) => {
                    console.error('Error al registrar movimiento:', error);
                    const mensaje = error.error?.message || 'Error al registrar el movimiento';
                    this.showToast('error', mensaje);
                }
            });
    }

    limpiarMovimiento() {
        this.movimiento = {
            productoId: 0,
            tipo: 'Entrada',
            cantidad: 0,
            observaciones: '',
            usuarioId: 1
        };
    }

    cargarReporteGeneral() {
        this.reporteGeneral = null;
        console.log('Cargando reporte general...');
        this.inventarioService.generarReporteGeneral()
            .subscribe({
                next: (data) => {
                    console.log('Reporte general recibido:', data);
                    this.reporteGeneral = data;
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error al cargar reporte general:', error);
                    this.showToast('error', 'Error al cargar el reporte general');
                }
            });
    }

    cargarReporteStockBajo() {
        this.reporteStockBajo = null;
        console.log('Cargando reporte stock bajo...');
        this.inventarioService.generarReporteStockBajo()
            .subscribe({
                next: (data) => {
                    console.log('Reporte stock bajo recibido:', data);
                    this.reporteStockBajo = data;
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error al cargar reporte de stock bajo:', error);
                    this.showToast('error', 'Error al cargar el reporte de stock bajo');
                }
            });
    }

    cargarReporteMovimientos() {
        this.reporteMovimientos = null;
        console.log('Cargando reporte movimientos...');
        this.inventarioService.generarReporteMovimientos()
            .subscribe({
                next: (data) => {
                    console.log('Reporte movimientos recibido:', data);
                    this.reporteMovimientos = data;
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error al cargar reporte de movimientos:', error);
                    this.showToast('error', 'Error al cargar el reporte de movimientos');
                }
            });
    }

    // Sistema de toasts
    showToast(type: 'success' | 'error' | 'info' | 'warning', message: string) {
        const toast: Toast = {
            id: this.toastIdCounter++,
            type,
            message
        };
        this.toasts.push(toast);

        setTimeout(() => {
            this.removeToast(toast.id);
        }, 5000);
    }

    removeToast(id: number) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }

    getToastClass(type: string): string {
        const baseClasses = 'toast show mb-2';
        switch(type) {
            case 'success': return `${baseClasses} bg-success text-white`;
            case 'error': return `${baseClasses} bg-danger text-white`;
            case 'warning': return `${baseClasses} bg-warning text-dark`;
            case 'info': return `${baseClasses} bg-info text-white`;
            default: return baseClasses;
        }
    }
}
