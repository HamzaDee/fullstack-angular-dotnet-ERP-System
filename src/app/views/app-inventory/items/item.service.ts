import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Injectable()
export class ItemService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetItemList(voucherTypeEnum): Observable<any> 
  {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Items/GetItemList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetItemsList(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Items/ItemsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public IsValidItemCode(itemCode): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Items/IsValidItemCode/'
      + this.jwtAuth.getCompanyId() + '/' + itemCode} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public isValidItemNameA(itemNameA): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Items/isValidItemNameA/'
      + this.jwtAuth.getCompanyId() + '/' + itemNameA} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public isValidItemNameE(itemNameE): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Items/isValidItemNameE/'
      + this.jwtAuth.getCompanyId() + '/' + itemNameE} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemForm(id,isCopied,opType): Observable<any> {
    debugger
    if(id > 0)
      {
        if(opType == "Show")
          {
            return this.http.get(`${environment.apiURL_Main + '/api/Items/ShowItemForm/' + this.jwtAuth.getLang()
            + '/' + id + '/' + this.jwtAuth.getCompanyId()+ '/' + isCopied + '/' + this.jwtAuth.getUserId()} `)
            .pipe(
              catchError(this.handleError)
            )
          }
          else
          {
            return this.http.get(`${environment.apiURL_Main + '/api/Items/EditItemForm/' + this.jwtAuth.getLang()
            + '/' + id + '/' + this.jwtAuth.getCompanyId()+ '/' + isCopied + '/' + this.jwtAuth.getUserId()} `)
            .pipe(
              catchError(this.handleError)
            )
          }
      }
    else
    {
      return this.http.get(`${environment.apiURL_Main + '/api/Items/AddItemForm/' + this.jwtAuth.getLang()
      + '/' + id + '/' + this.jwtAuth.getCompanyId()+ '/' + isCopied + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    
  }

  public GetLinkingAccountItemGruop(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Items/GetLinkingAccountItemGruop/' + this.jwtAuth.getCompanyId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  //delete
  public DeleteItem(id): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/Items/DeleteItem/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public PostItemForm(post): Observable<any> {
    debugger
    return this.http.post<any>(`${environment.apiURL_Main + '/api/Items/PostItemForm/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`, post)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemsPrices(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Items/GetItemsPrices/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetItemsPricesByUintId(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Items/GetItemsPricesByUintId/' + this.jwtAuth.getLang()
      + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetMaxItemNo(groupId): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/Items/GetMaxItemNo/'
      + this.jwtAuth.getCompanyId() + '/' + groupId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  private handleError(error: HttpErrorResponse) {
    debugger
    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message)
    } else {
      console.log(error.status)
    }
    return throwError(
      console.log('Something is wrong!'));
  }
}