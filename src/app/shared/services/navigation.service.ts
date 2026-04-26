import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { catchError } from 'rxjs/operators';
import { environment } from "environments/environment";
import { JwtAuthService } from './auth/jwt-auth.service';
interface IMenuItem {
  parentId?: number;
  screenName?: string;
  icon?: string; // Material icon name
  url?: string;
  actionName?: string;
  isEnabled?: boolean;
  isVisible?: boolean;
  subScreen?: IChildItem[]; // Dropdown items
}
interface IChildItem {
  parentId?: number;
  screenName?: string;
  icon?: string;
  url?: string;
  isEnabled?: boolean;
  isVisible?: boolean;
  sub?: IChildItem[];
}
@Injectable()
export class NavigationService {
  // sets iconMenu as default;
    // Icon menu TITLE at the very top of navigation.
  // This title will appear if any icon type item is present in menu.
  iconTypeMenuTitle = 'Frequently Accessed';
  // sets iconMenu as default;
  private menuItems = new BehaviorSubject<IMenuItem[]>([]);
  menuItems$ = this.menuItems.asObservable();
  // menuItems = new BehaviorSubject<IMenuItem[]>(this.PrepareMenuItems()); Hamza
  // navigation component has subscribed to this Observable
  // menuItems$ = this.menuItems.asObservable(); Hamza
  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,) {this.loadMenu();}

loadMenu() {
    this.GetMainMenuFromDB().subscribe((results) => {
      this.menuItems.next(results); // 🔥 push to BehaviorSubject
    });
  }

  public GetMainMenuFromDB(): Observable<IMenuItem[]> {
    return this.http.get<IMenuItem[]>(
      `${environment.apiURL_Main}/api/permission/getMainMenuByUser/` +
      `${this.jwtAuth.getUserId()}/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}`
    ).pipe(
      catchError((error) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
}
  // PrepareMenuItems() {
  //   const menuItems: IMenuItem[] = [];
  //   this.GetMainMenuFromDB().subscribe((results) => {
  //     results.forEach(item => {
  //       menuItems.push(item);
  //     });
  //     return
  //   })
  //   return menuItems
  // }
  // public GetMainMenuFromDB(): Observable<any> {
  //   return this.http.get(`${environment.apiURL_Main}` + '/api/permission/getMainMenuByUser/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId())
  //     .pipe(
  //       catchError((error) => {
  //         return throwError(error);
  //       })
  //     );
  // }
