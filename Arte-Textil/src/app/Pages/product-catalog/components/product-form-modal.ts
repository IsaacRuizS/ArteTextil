import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-form-modal.html',
  styleUrls: ['./product-form-modal.scss']
})
export class ProductFormModal implements OnInit {

  @Input() product: any | null = null;   // Si viene → modo edición
  @Input() categories: string[] = [];
  @Input() materials: string[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() saveCreate = new EventEmitter<any>();
  @Output() saveUpdate = new EventEmitter<any>();

  title = 'Crear producto';

  form = {
    name: '',
    price: null,
    stock: null,
    category: '',
    status: 'Activo',
    materials: [] as string[],
    images: [] as string[]
  };

  errorMsg = '';

  ngOnInit() {
    if (this.product) {
      this.title = 'Editar producto';
      this.loadProductData();
    }
  }

  loadProductData() {
    this.form = {
      name: this.product.name,
      price: this.product.price,
      stock: this.product.stock,
      category: this.product.category,
      status: this.product.status,
      materials: [...this.product.materials],
      images: [...this.product.images]
    };
  }

  toggleMaterial(m: string) {
    if (this.form.materials.includes(m)) {
      this.form.materials = this.form.materials.filter(x => x !== m);
    } else {
      this.form.materials.push(m);
    }
  }

  onImagesSelected(event: any) {
    const files: FileList = event.target.files;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.form.images.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  save() {
    this.errorMsg = '';

    if (!this.form.name || !this.form.price || !this.form.stock || !this.form.category) {
      this.errorMsg = 'Todos los campos obligatorios deben completarse.';
      return;
    }

    if (this.product) {
      this.saveUpdate.emit(this.form);
    } else {
      this.saveCreate.emit(this.form);
    }

    this.close.emit();
  }
}
