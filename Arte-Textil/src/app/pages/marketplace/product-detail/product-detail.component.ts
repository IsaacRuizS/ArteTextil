import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductModel } from '../../../shared/models/product.model';
import { finalize } from 'rxjs';
import { ApiProductService } from '../../../services/api-product.service';
import { SharedService } from '../../../services/shared.service';
import { CartService } from '../../../services/cart.service';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CustomCurrencyPipe
    ],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {

    productId?: number;
    product: ProductModel = new ProductModel();

    selectedImage = '';

    added = false;

    constructor(private route: ActivatedRoute,
        private apiProductService: ApiProductService,
        private sharedService: SharedService,
        private cartService: CartService,
        private cdr: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {

        // Simular cargar el id
        this.productId = Number(this.route.snapshot.paramMap.get('id'));

        this._loadProduct();

    }

    changeImage(img: string) {
        this.selectedImage = img;
    }

    increaseQty() {

        if (this.product!.quantitySelected < this.product!.stock) {
            this.product!.quantitySelected++;
        }
    }

    decreaseQty() {

        if (this.product!.quantitySelected > 1) {
            this.product!.quantitySelected--;
        }
    }

    addToCart() {

        this.cartService.addProduct(this.product);

        this.added = true;

        setTimeout(() => {
            this.added = false;
            this.cdr.markForCheck();
        }, 1500);

        this.cartService.addProduct(this.product);

        const img = document.querySelector('.image-main img') as HTMLElement;
        const cartIcon = document.querySelector('.cart-icon') as HTMLElement;

        if (!img || !cartIcon) return;

        const clone = img.cloneNode(true) as HTMLElement;
        const imgRect = img.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        clone.style.position = 'fixed';
        clone.style.left = imgRect.left + 'px';
        clone.style.top = imgRect.top + 'px';
        clone.style.width = imgRect.width + 'px';
        clone.style.transition = 'all 0.7s ease-in-out';
        clone.style.zIndex = '1000';

        document.body.appendChild(clone);

        setTimeout(() => {
            clone.style.left = cartRect.left + 'px';
            clone.style.top = cartRect.top + 'px';
            clone.style.width = '40px';
            clone.style.opacity = '0';
        }, 10);

        setTimeout(() => {
            clone.remove();
        }, 800);
    }

    onBackToMarketplace() {
        window.location.href = '/marketplace';
    }

    private _loadProduct() {

        // DATA LOAD

        this.sharedService.setLoading(true);

        this.apiProductService.getById(this.productId!)
            .pipe(finalize(() => this.sharedService.setLoading(false)))
            .subscribe({
                next: (product: ProductModel) => {

                    this.product = product;

                    // Imagen principal
                    this.selectedImage = this.product?.mainImageUrl ?? '';

                    this.cdr.markForCheck();
                },
                error: (err) => {
                    // manejar error
                }
            });
    }
}
