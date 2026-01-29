import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SharedService {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    setLoading(value: boolean): void {
        Promise.resolve().then(() => {
            this.loadingSubject.next(value);
        });
    }
}
