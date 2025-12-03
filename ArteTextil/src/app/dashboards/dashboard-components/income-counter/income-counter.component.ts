import { Component } from '@angular/core';
@Component({
    selector: 'app-income-counter',
    templateUrl: './income-counter.component.html'
})
export class IncomeCounterComponent {
    constructor() { }
    // bar chart
    public barChartData: Array<any> = [
        { data: [1.1, 1.4, 1.1, 0.9, 2.1, 1, 0.3], label: 'Cost' }
    ];
    public barChartLabels: Array<any> = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7'
    ];
    public barChartOptions: any = {
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                display: false
            }],
            yAxes: [{
                display: false
            }]
        }
    };
    public barChartColors: Array<any> = [
        {
            backgroundColor: '#26c6da',
            hoverBackgroundColor: '#26c6da',
            hoverBorderWidth: 2,
            hoverBorderColor: '#26c6da'
        }
    ];
    public barChartLegend = false;
    public barChartType = 'bar';

    // bar chart
    public barChartData1: Array<any> = [
        { data: [1.1, 1.4, 1.1, 0.9, 2.1, 1, 0.3], label: 'Cost' }
    ];
    public barChartLabels1: Array<any> = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7'
    ];
    public barChartOptions1: any = {
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                display: false
            }],
            yAxes: [{
                display: false
            }]
        }
    };
    public barChartColors1: Array<any> = [
        {
            backgroundColor: '#7460ee',
            hoverBackgroundColor: '#7460ee',
            hoverBorderWidth: 2,
            hoverBorderColor: '#7460ee'
        }
    ];
    public barChartLegend1 = false;
    public barChartType1 = 'bar';

    // bar chart
    public barChartData2: Array<any> = [
        { data: [1.1, 1.4, 1.1, 0.9, 2.1, 1, 0.3], label: 'Cost' }
    ];
    public barChartLabels2: Array<any> = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7'
    ];
    public barChartOptions2: any = {
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                display: false
            }],
            yAxes: [{
                display: false
            }]
        }
    };
    public barChartColors2: Array<any> = [
        {
            backgroundColor: '#03a9f3',
            hoverBackgroundColor: '#03a9f3',
            hoverBorderWidth: 2,
            hoverBorderColor: '#03a9f3'
        }
    ];
    public barChartLegend2 = false;
    public barChartType2 = 'bar';

    // bar chart
    public barChartData3: Array<any> = [
        { data: [1.1, 1.4, 1.1, 0.9, 2.1, 1, 0.3], label: 'Cost' }
    ];
    public barChartLabels3: Array<any> = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7'
    ];
    public barChartOptions3: any = {
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                display: false
            }],
            yAxes: [{
                display: false
            }]
        }
    };
    public barChartColors3: Array<any> = [
        {
            backgroundColor: '#f62d51',
            hoverBackgroundColor: '#f62d51',
            hoverBorderWidth: 2,
            hoverBorderColor: '#f62d51'
        }
    ];
    public barChartLegend3 = false;
    public barChartType3 = 'bar';
}
