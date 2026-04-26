import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ManordersService {
  paramSource$ = new BehaviorSubject([]);
  sharedParam$ = this.paramSource$.asObservable();
  changeParam(param) {
    this.paramSource$.next(param);
  }

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  GetProdOrder(orderId) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/GetProdOrder/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
    .pipe(
      catchError(this.handleError)
    )  
  }

  GetManOrdersList() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/GetManOrdersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  ApproveOrder(orderId) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/ApproveManOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetItemRawMaterials(itemNo) : Observable<any> {
    debugger
    itemNo = itemNo.replaceAll('/','%2F');
    return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/GetItemRawMaterials/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetItemSuppliers(itemNo) : Observable<any> {
    debugger
    itemNo = itemNo.replaceAll('/','%2F');
    return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/GetItemSuppliers/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetManOrder(orderId, opType) : Observable<any> {
    debugger
    if(orderId === undefined)
      orderId = 0;
    if(opType == 'Edit'  || opType == 'Copy'){
      return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/EditManOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId + '/' + opType} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else if (opType == 'Show')
      {
      return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/ShowManOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId + '/' + opType} `)
      .pipe(
        catchError(this.handleError)
      )
      }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/GetManOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    
  }

  GetItemUnits(itemNo) : Observable<any> {
    debugger
    itemNo = itemNo.replaceAll('/','%2F');
    return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/GetItemInfo/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo + '/0'} `)
      .pipe(
        catchError(this.handleError)
      )
  }

/*   DeleteManOrder(orderId) : Observable<any> {
    debugger
    return this.http.delete<any>(`${environment.apiURL_Main + '/api/ManOrder/DeleteManOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId }`)
      .pipe(
        catchError(this.handleError)
      )
  } */

          //delete
    public DeleteManOrder(orderId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/ManOrder/DeleteManOrder/' + this.jwtAuth.getLang() +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + orderId }`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  public SaveManOrder(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ManOrder/SaveManOrder/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSerialVoucher(serialType): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/GetSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSalesOrder(orderId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/GetSalesOrder/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + orderId } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message)
    } else {
      console.log(error.status)
    }
    return throwError(
      console.log('Something is wrong!'));
  }
}
