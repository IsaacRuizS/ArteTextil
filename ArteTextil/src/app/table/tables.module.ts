import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TablesRoutes } from './tables.routing';
import { DatatableComponent } from './data-table/data-table.component';
import { BasicComponent } from './basic/basic.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(TablesRoutes),
        NgxDatatableModule,
    ],
    declarations: [DatatableComponent, BasicComponent]
})
export class TablesModule { }
