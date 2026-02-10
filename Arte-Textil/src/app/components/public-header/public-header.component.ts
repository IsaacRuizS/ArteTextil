import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-public-header',
    templateUrl: './public-header.component.html',
    styleUrl: './public-header.component.scss',
})
export class PublicHeaderComponent implements OnInit {

    cartCount = 0;

    @Output() toggleSidebar = new EventEmitter<void>();

    constructor(
        private cartService: CartService,
        private router: Router
    ) {}

    ngOnInit() {
        this.cartService.cartCount$.subscribe(count => {
            this.cartCount = count;
        });
    }

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    onOpenCart() {
        this.router.navigate(['/cart']);
    }
}
