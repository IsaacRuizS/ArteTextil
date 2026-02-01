import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-production-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './production-layout.component.html',
    styleUrls: ['./production-layout.component.scss']
})
export class ProductionLayoutComponent { }
