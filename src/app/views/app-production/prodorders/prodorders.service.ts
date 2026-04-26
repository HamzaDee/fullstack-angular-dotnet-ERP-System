import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProdordersService {
  paramSource$ = new BehaviorSubject([]);
  sharedParam$ = this.paramSource$.asObservable();
  changeParam(param) {
    this.paramSource$.next(param);
  }

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }



  GetProdOrdersList() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/GetProdOrdersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  ApproveOrder(orderId) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/ApproveProdOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetItemRawMaterials(itemNo) : Observable<any> {
    debugger
    itemNo = itemNo.replaceAll('/','%2F');
    return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/GetItemRawMaterials/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetItemQtyByCountry(itemNo) : Observable<any> {
    debugger
    itemNo = itemNo.replaceAll('/','%2F');
    return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/GetItemQtyByCountry/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetItemSuppliers(itemNo) : Observable<any> {
    debugger
    itemNo = itemNo.replaceAll('/','%2F');
    return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/GetItemSuppliers/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + itemNo} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetProdOrder(orderId, opType) : Observable<any> {
    debugger
    if(orderId === undefined)
      orderId = 0;
    if(opType == 'Edit' || opType == 'Copy'){
      return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/EditProdOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId + '/' + opType} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else if(opType == 'Show')
      {
       return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/ShowProdOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId + '/' + opType} `)
      .pipe(
        catchError(this.handleError)
      )
      }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/GetProdOrder/'
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

 /*  DeleteProdOrder(orderId) : Observable<any> {
    debugger
    return this.http.delete<any>(`${environment.apiURL_Main + '/api/ProdOrder/DeleteProdOrder/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId }`)
      .pipe(
        catchError(this.handleError)
      )
  } */

             //delete
    public DeleteProdOrder(orderId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/ProdOrder/DeleteProdOrder/' + this.jwtAuth.getLang() +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + orderId }`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  public SaveProdOrder(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProdOrder/SaveProdOrder/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSerialVoucher(serialType): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/GetSerialVoucher/'
      + this.jwtAuth.getCompanyId() + '/' + serialType } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetSalesOrder(orderId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProdOrder/GetSalesOrder/'
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
