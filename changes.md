Aquí van los **6 conflictos** (1 al 6), **textualizados** con lo que aparece como **Current change (fix/promotions_and_products)** vs  **Incoming change (main)** , para que puedas decirle a Claude cuál aceptar.

---

## 1) Constructor (inyecciones)

**Current (fix/promotions_and_products):**

```ts
private cdr: ChangeDetectorRef
```

**Incoming (main):**

```ts
private sharedService: SharedService,
private cdr: ChangeDetectorRef,
```

---

## 2) loadProducts() -> subscribe (manejo de next/error)

**Current (fix/promotions_and_products):**

```ts
next: (data) => {
  this.products = data;
  this.cdr.markForCheck();
},
error: (err) => {
  console.error('Error al cargar productos:', err);
  Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
}
```

**Incoming (main):**

```ts
next: data => this.products = data,
error: () => Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
```

---

## 3) loadPromotions() -> next (qué se hace con la data)

**Current (fix/promotions_and_products):**

```ts
next: (data) => {
  this.promotions = [...data];
}
```

**Incoming (main):**

```ts
next: data => {
  this.promotions = data;
  this.promotionsOrigins = data;
  this.onFilterInfo();
  this.sharedService.setLoading(false)
}
this.cdr.markForCheck();
```

---

## 4) Cambio de estado (changeStatus vs onStatusChanged)

**Current (fix/promotions_and_products):**

```ts
this.apiPromotionService.changeStatus(promo.promotionId, newStatus).subscribe({
  next: () => {
    this.loadPromotions();
    Swal.fire(`Éxito`, `Promoción ${newStatus ? 'activada' : 'desactivada'} correctamente`, 'success');
  },
  error: (err) => {
    console.error('Error al cambiar estado:', err);
    Swal.fire('Error', 'No se pudo cambiar el estado de la promoción', 'error');
  }
});
```

**Incoming (main):**

```ts
onStatusChanged() {
  this.onFilterInfo();
}
```

---

## 5) saveCreatedPromotion(formData) (cómo construyes el objeto para crear)

**Current (fix/promotions_and_products):**

```ts
const newPromotion = new PromotionModel({
  name: formData.name,
  description: formData.description || '',
  discountPercent: Number(formData.discountPercent),
  startDate: new Date(formData.startDate),
  endDate: new Date(formData.endDate),
  productId: Number(formData.productId),
  isActive: true
});

this.apiPromotionService.create(newPromotion).subscribe({
  ...
});
```

**Incoming (main):**

```ts
const promo = new PromotionModel({
  ...formData,
  isActive: true
});

this.apiPromotionService.create(promo).subscribe({
  next: () => {
    this.showFormModal = false;
    this.loadPromotions();
    Swal.fire('Éxito', 'Promoción creada correctamente', 'success');
  }
});
```

---

## 6) Update de promoción (objeto “normalizado” vs spread + update simple)

**Current (fix/promotions_and_products):**

```ts
const updatedPromotion = new PromotionModel({
  name: formData.name,
  description: formData.description,
  discountPercent: Number(formData.discountPercent),
  startDate: new Date(formData.startDate),
  endDate: new Date(formData.endDate),
  productId: Number(formData.productId),
  isActive: formData.isActive
});

this.apiPromotionService.update(updatedPromotion).subscribe({
  next: () => {
    this.showFormModal = false;
    this.loadPromotions();
    Swal.fire('Éxito', 'Promoción actualizada correctamente', 'success');
  },
  error: (err) => {
    console.error('Error al actualizar promoción:', err);
    Swal.fire('Error', err?.message || 'No se pudo actualizar la promoción', 'error');
  }
});
```

**Incoming (main):**

```ts
...formData

this.apiPromotionService.update(promo).subscribe({
  next: () => {
    this.showFormModal = false;
    this.loadPromotions();
    Swal.fire('Éxito', 'Promoción actualizada correctamente', 'success');
  }
});
```

---

Si quieres, dime cuál es tu intención funcional (ej: “quiero que siempre haga loading + filtros + markForCheck”, o “quiero lo más simple”), y te digo exactamente **qué elegir en cada conflicto** y por qué (incluyendo qué combinación “Accept both changes” tiene sentido).
