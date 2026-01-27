import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedService } from '../../services/shared.service';


@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnDestroy {

    isSpinnerVisible = false; 

    private loadingSubscription: Subscription | null = null;

    constructor(public sharedService: SharedService, 
        private cdr: ChangeDetectorRef,
    ) { 

        // Set loading from state manual
        this.loadingSubscription = this.sharedService.loadingSubject.subscribe((isVisible: boolean) => {


            if (isVisible){ 
                
                this.isSpinnerVisible = isVisible;
                this.cdr.detectChanges();
                return;
            }
            
            setTimeout(() => {
                this.isSpinnerVisible = isVisible;
                this.cdr.detectChanges();
            }, 100);
        });
    }

    ngOnDestroy() {

        this.isSpinnerVisible = false;

        if (this.loadingSubscription) { this.loadingSubscription.unsubscribe(); }
    }
}
