import { Injectable } from '@angular/core';
import { interval } from 'rxjs';

import { ApiAlertService } from './api-alert.service';
import { NotificationService } from './notification.service';
import { AlertModel } from '../shared/models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertPollingService {

private shownAlerts = new Set<number>(
    JSON.parse(localStorage.getItem('shownAlerts') || '[]')
);  
private started = false;

  constructor(
    private api: ApiAlertService,
    private notifier: NotificationService
  ) {}

  start() {

    if (this.started) return;

    this.started = true;

    interval(300000).subscribe(() => {
        this.checkAlerts();
    });

    this.checkAlerts();
}

  private checkAlerts() {

    this.api.getAll().subscribe((alerts: AlertModel[]) => {

      alerts.forEach((alert: AlertModel) => {

        if (!this.shownAlerts.has(alert.alertId)) {

          this.notifier.show(`${alert.title}: ${alert.message}`);

          this.shownAlerts.add(alert.alertId);

localStorage.setItem(
    'shownAlerts',
    JSON.stringify([...this.shownAlerts])
);

        }

      });

    });

  }
}