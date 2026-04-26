import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectedItemsService {
  private selectedItemsSubject = new BehaviorSubject<any[]>([]);
  selectedItems$ = this.selectedItemsSubject.asObservable();

  updateSelectedItems(items: any[]): void {
    this.selectedItemsSubject.next(items);
  }
}




