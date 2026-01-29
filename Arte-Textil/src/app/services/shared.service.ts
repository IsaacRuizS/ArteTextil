import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SharedService {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    setLoading(loading: boolean): void {
        if (loading) {
            this.loadingSubject.next(true);
        } else {
            setTimeout(() => this.loadingSubject.next(false), 0);
        }
    }
}
