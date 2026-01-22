import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})  
export class SharedService {

    public loadingSubject: Subject<boolean> = new Subject<boolean>();

    setLoading(loading: boolean): void {
        
        if (loading) {
            this.loadingSubject.next(loading);
        } else {
            setTimeout(() => this.loadingSubject.next(loading), 300);
        }
    }
}
