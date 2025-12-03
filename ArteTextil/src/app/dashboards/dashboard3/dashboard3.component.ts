import { Component, ViewChild } from '@angular/core';
import * as Chartist from 'chartist';
import { ChartType, ChartEvent } from 'ng-chartist';
declare var require: any;

declare var require: any;
const data2: any = require('./company.json');
const data: any = require('./data.json');

export interface Chart {
    type: ChartType;
    data: Chartist.IChartistData;
    options?: any;
    responsiveOptions?: any;
    events?: ChartEvent;
}

@Component({
    templateUrl: './dashboard3.component.html',
    styleUrls: ['./dashboard3.component.css']
})
export class Dashboard3Component {
    subtitle: string;

    editing = {};
    rows = [];
    temp = [...data2];

    loadingIndicator = true;
    reorderable = true;

    columns = [{ prop: 'name' }, { name: 'Status' }, { name: 'Company' }];

    @ViewChild(Dashboard3Component, { static: false }) table: Dashboard3Component;

    constructor() {
        this.rows = data2;
        this.temp = [...data2];
        setTimeout(() => {
            this.loadingIndicator = false;
        }, 1500);

    }
    // This is for the dashboar line chart
    public lineChartData: Array<any> = [
        { data: [0, 130, 80, 70, 180, 105, 250], label: 'Site A' },
        { data: [0, 100, 60, 200, 150, 90, 150], label: 'Site B' }
    ];
    public lineChartLabels: Array<any> = [
        '2010',
        '2011',
        '2012',
        '2013',
        '2014',
        '2015',
        '2016'
    ];
    public lineChartOptions: any = {
        responsive: true
    };
    public lineChartColors: Array<any> = [
        {
            // grey
            backgroundColor: 'rgba(25,118,210,0.0)',
            borderColor: 'rgba(25,118,210,1)',
            pointBackgroundColor: 'rgba(25,118,210,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(25,118,210,0.5)'
        },
        {
            // dark grey
            backgroundColor: 'rgba(38,218,210,0.0)',
            borderColor: 'rgba(38,218,210,1)',
            pointBackgroundColor: 'rgba(38,218,210,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(38,218,210,0.5)'
        }
    ];
    public lineChartLegend = false;
    public lineChartType = 'line';

    // This is for the donute chart
    donuteChart1: Chart = {
        type: 'Pie',
        data: data['Pie'],
        options: {
            height: 200,
            donut: true,
            showLabel: false,
            donutWidth: 30
        }
        // events: {
        //   draw(data: any): boolean {
        //     return data;
        //   }
        // }
    };

    // Table
    updateFilter(event) {
        const val = event.target.value.toLowerCase();

        // filter our data
        const temp = this.temp.filter(function (d) {
            return d.name.toLowerCase().indexOf(val) !== -1 || !val;
        });

        // update the rows
        this.rows = temp;
        // Whenever the filter changes, always go back to the first page
        this.table = data2;
    }
    updateValue(event, cell, rowIndex) {
        console.log('inline editing rowIndex', rowIndex);
        this.editing[rowIndex + '-' + cell] = false;
        this.rows[rowIndex][cell] = event.target.value;
        this.rows = [...this.rows];
        console.log('UPDATED!', this.rows[rowIndex][cell]);
    }

}
