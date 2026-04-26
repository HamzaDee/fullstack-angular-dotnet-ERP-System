import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QaproductionService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  GetQAList() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/QAProduction/GetQAList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetProdItems() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProdItemsList/GetProdList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetInventoryItems() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/InventoryReceiving/GetProdList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetQA(qaId, opType) : Observable<any> {
    debugger
    if(qaId === undefined)
      qaId = 0;
    if(opType == 'Show' || opType == 'Copy'){
      return this.http.get(`${environment.apiURL_Main + '/api/QAProduction/GetQA/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + qaId } `)
      .pipe(
        catchError(this.handleError)
      )
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/QAProduction/GetQA/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + qaId} `)
      .pipe(
        catchError(this.handleError)
      )
    }
    
  }

  CheckBatchNo(batchNo) : Observable<any>{
    return this.http.get(`${environment.apiURL_Main + '/api/QAProduction/CheckBatchNo/'
      +  this.jwtAuth.getCompanyId() + '/' + batchNo} `)
      .pipe(
        catchError(this.handleError)
      )  
  }

  GetManufOrder(orderId) : Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/QAProduction/GetManOrder/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId} `)
    .pipe(
      catchError(this.handleError)
    )  
  }
  
/*   DeleteQA(orderId) : Observable<any> {
    debugger
    return this.http.delete<any>(`${environment.apiURL_Main + '/api/QAProduction/DeleteQA/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + orderId }`)
      .pipe(
        catchError(this.handleError)
      )
  } */

             //delete
    public DeleteQA(orderId): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/QAProduction/DeleteQA/' + this.jwtAuth.getLang() +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + orderId }`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  public GetSalesOrder(orderId): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ManOrder/GetSalesOrder/'
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + orderId } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveQA(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/QAProduction/SaveQA/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveProdItems(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProdItemsList/SaveProdItems/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveInventoryItems(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/InventoryReceiving/SaveProdItems/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
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
