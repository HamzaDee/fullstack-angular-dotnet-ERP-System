import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PurordersService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  GetPurOrdersList() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseOrder/GetPurOrdersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetPurorderSearch(fromDate, toDate): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
  
    return this.http.get(`${environment.apiURL_Main}/api/PurchaseOrder/FilterPurorder/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  } 

  GetPurOrder(orderId, opType) : Observable<any> {
    debugger
    if(orderId === undefined)
      orderId = 0;
    if(opType == 'Edit'){
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseOrder/EditPurOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else if (opType == 'Copy' )
      {
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseOrder/CopyPurOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
      }
    else if (opType == 'Show' )
      {
        return this.http.get(`${environment.apiURL_Main + '/api/PurchaseOrder/ShowPurOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
      }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseOrder/GetPurOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    
  }

  GetItemUnits(itemNo) : Observable<any> {
    debugger
    itemNo = itemNo.replaceAll('/','%2F');
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionLines/GetItemUnits/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetItemInfo(itemNo,dealerId) : Observable<any> {
    debugger
    itemNo = itemNo.replaceAll('/','%2F');
    return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/GetItemInfo/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo + '/' + dealerId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  SavePurOrderStatus(orderId, statusId) : Observable<any> {
    debugger
    return this.http.post<any>(`${environment.apiURL_Main + '/api/PurchaseOrder/SavePurOrderStatus/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId + '/' + statusId} `,null)
      .pipe(
        catchError(this.handleError)
      )
  }
/* 
  DeletePurOrder(orderId) : Observable<any> {
    debugger
    return this.http.delete<any>(`${environment.apiURL_Main + '/api/PurchaseOrder/DeletePurOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId }`)
      .pipe(
        catchError(this.handleError)
      )
  } */

             //delete
    public DeletePurOrder(orderId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/PurchaseOrder/DeletePurOrder/' + this.jwtAuth.getLang() +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + orderId }`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  public SavePurOrder(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/PurchaseOrder/SavePurOrder/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSerialVoucher(serialType): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseOrder/GetSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType } `)
      .pipe(
        catchError(this.handleError)
      )
  }

   GetSupplierItemsList(DealerId) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurchaseOrder/GetDealersItemsList/'
      + this.jwtAuth.getLang() + '/' + DealerId} `)
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
