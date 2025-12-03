import { Component } from '@angular/core';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    templateUrl: './dashboard2.component.html',
    styleUrls: ['./dashboard2.component.css']
})
export class Dashboard2Component {
    subtitle: string;
    constructor() {
        this.subtitle = 'This is some text within a card block.';
    }
    // This is for the dashboar line chart
    // lineChart
    public lineChartData: Array<any> = [
        { data: [0, 130, 80, 70, 180, 105, 250], label: 'Site A' },
        { data: [0, 100, 60, 200, 150, 90, 150], label: 'Site B' }
    ];
    public lineChartData2: Array<any> = [
        { data: [0, 5000, 15000, 8000, 15000, 9000, 30000, 0], label: 'Site A' },
        { data: [0, 3000, 5000, 2000, 8000, 1000, 5000, 0], label: 'Site B' }
    ];
    public lineChartLabels2: Array<any> = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8'
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
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        color: 'rgba(120, 130, 140, 0.13)'
                    }
                }
            ],
            xAxes: [
                {
                    gridLines: {
                        color: 'rgba(120, 130, 140, 0.13)'
                    }
                }
            ]
        },
        responsive: true,
        maintainAspectRatio: false
    };
    public lineChartOptions2: any = {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        color: 'rgba(120, 130, 140, 0.13)'
                    }
                }
            ],
            xAxes: [
                {
                    gridLines: {
                        color: 'rgba(120, 130, 140, 0.13)'
                    }
                }
            ]
        },
        responsive: true,
        maintainAspectRatio: false,
        elements: { line: { tension: 0 } }
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
    public lineChartLegend = true;
    public lineChartLegend2 = false;
    public lineChartType = 'line';

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
            backgroundColor: '#ef5350',
            hoverBackgroundColor: '#ef5350',
            hoverBorderWidth: 2,
            hoverBorderColor: '#ef5350'
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
                display: false,
            }],
            yAxes: [{
                display: false
            }]
        }
    };
    public barChartColors2: Array<any> = [
        {
            backgroundColor: '#7460ee',
            hoverBackgroundColor: '#7460ee',
            hoverBorderWidth: 2,
            hoverBorderColor: '#7460ee'
        }
    ];
    public barChartLegend2 = false;
    public barChartType2 = 'bar';

    // bar chart
    public barChartData3: Array<any> = [
        { data: [1.1, 1.4, 1.1, 0.9, 2.1, 1, 0.3, 1.1, 1.4, 1.1, 0.9, 2.1, 1, 0.3], label: 'Cost' }
    ];
    public barChartLabels3: Array<any> = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14'
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
                display: false,
            }],
            yAxes: [{
                display: false
            }]
        }
    };
    public barChartColors3: Array<any> = [
        {
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            hoverBackgroundColor: 'rgba(255, 255, 255, 0.5)',
            hoverBorderWidth: 2,
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)'
        }
    ];
    public barChartLegend3 = false;
    public barChartType3 = 'bar';

    // bar chart
    public barChartData4: Array<any> = [
        { data: [1.1, 1.4, 1.1, 0.9, 2.1, 1, 0.3, 1.1, 1.4, 1.1, 0.9, 2.1, 1, 0.3], label: 'Cost' }
    ];
    public barChartLabels4: Array<any> = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14'
    ];
    public barChartOptions4: any = {
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                display: false,
            }],
            yAxes: [{
                display: false
            }]
        }
    };
    public barChartColors4: Array<any> = [
        {
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            hoverBackgroundColor: 'rgba(255, 255, 255, 0.5)',
            hoverBorderWidth: 2,
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)'
        }
    ];
    public barChartLegend4 = false;
    public barChartType4 = 'bar';
}
