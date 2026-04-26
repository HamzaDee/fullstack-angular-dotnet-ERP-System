import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PurchaseReportService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }


    publicGetMaterialRequiredReportForm (): Observable<any> {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseReports/GetMaterialRequiredReport/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
        .pipe(
          catchError(this.handleError)
        )
    }
    
    public GetMaterialRequiredSearch (fromDate, toDate, itemId, supplierId,currencyId,currRate): Observable<any> {
      debugger
      const lang = this.jwtAuth.getLang();
      const companyId = this.jwtAuth.getCompanyId();
      const userId = this.jwtAuth.getUserId();
      
      const params = new HttpParams()
        .set('fromDate', fromDate)
        .set('toDate', toDate)
        .set('itemId', itemId)
        .set('supplierId', supplierId)
        .set('CurrencyId', currencyId)
        .set('CurrRate', currRate)
      return this.http.get(`${environment.apiURL_Main}/api/PurchaseReports/FilterMaterialRequired/${lang}/${companyId}/${userId}`, { params })
        .pipe(
          catchError(this.handleError)
        );
    } 

    GetMaterialPurchaseReportForm (): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseReports/GetMaterialPurchaseReport/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
        .pipe(
          catchError(this.handleError)
        )
    }

    public GetFilterMaterialPurchase( 
      fromDate:string,
      toDate:string,
      itemId:number,
      supplierId:number,
      categoryId:number,
      storeId:number,
      type:number,
      invoiceType:number,
      currencyId:number,
      currRate:number,
    ): Observable<any> {
      debugger
      const lang = this.jwtAuth.getLang();
      const companyId = this.jwtAuth.getCompanyId();
      const userId = this.jwtAuth.getUserId();
      
      const params = new HttpParams()
        .set('FromDate', fromDate)
        .set('ToDate', toDate)
        .set('itemId', itemId)
        .set('supplierId', supplierId)
        .set('typeId', categoryId)
        .set('storeId', storeId)
        .set('type', type)
        .set('invoiceType', invoiceType)
        .set('CurrencyId', currencyId)
        .set('CurrRate', currRate)
      return this.http.get(`${environment.apiURL_Main}/api/PurchaseReports/FilterMaterialPurchase/${lang}/${companyId}/${userId}`, { params })
        .pipe(
          catchError(this.handleError)
        );
    } 

    public GetReportOfItemsReceivedReportForm(): Observable<any> {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseReports/GetReportOfItemsReceivedReport/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
        .pipe(
          catchError(this.handleError)
        )
    }

    public GetReportOfItemsReceivedReport( 
      fromDate:string,
      toDate: string,
      purchaseOrderNo:number,
      SupplierId: number,
      categoryId:number,
      itemId: number,
      currencyId:number,
      currRate:number,
    ): Observable<any> {
      debugger
      const lang = this.jwtAuth.getLang();
      const companyId = this.jwtAuth.getCompanyId();
      const userId = this.jwtAuth.getUserId();
      
      const params = new HttpParams()
        .set('FromDate', fromDate)
        .set('ToDate', toDate)
        .set('PurchaseOrderNo', purchaseOrderNo)
        .set('SupplierId', SupplierId)
        .set('CategoryId', categoryId)
        .set('ItemId', itemId)
        .set('CurrencyId', currencyId)
        .set('CurrRate', currRate)       
      return this.http.get(`${environment.apiURL_Main}/api/PurchaseReports/FilterReportOfItemsReceived/${lang}/${companyId}/${userId}`, { params })
        .pipe(
          catchError(this.handleError)
        ); 
    }

    GetPurchaseExpensesStatementReportForm (): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/PurchaseReports/GetPurchaseExpensesStatementReport/' + this.jwtAuth.getLang()
        + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
        .pipe(
          catchError(this.handleError)
        )
    }

    public GetFilterPurchaseExpenses( 
      fromDate:string,
      toDate:string,
      expensesId:number,
      itemId:number,
      supplierId:number,
      categoryId:number,
      storeId:number,
      currencyId:number,
      currRate:number,
    ): Observable<any> {
      debugger
      const lang = this.jwtAuth.getLang();
      const companyId = this.jwtAuth.getCompanyId();
      const userId = this.jwtAuth.getUserId();
      
      const params = new HttpParams()
        .set('FromDate', fromDate)
        .set('ToDate', toDate)
        .set('ExpensesId', expensesId)
        .set('itemId', itemId)
        .set('supplierId', supplierId)
        .set('categoryId', categoryId)
        .set('storeId', storeId)
        .set('CurrencyId', currencyId)
        .set('CurrRate', currRate)  
      return this.http.get(`${environment.apiURL_Main}/api/PurchaseReports/FilterPurchaseExpenses/${lang}/${companyId}/${userId}`, { params })
        .pipe(
          catchError(this.handleError)
        );
    } 

    public UpdateFavourite(screenId):Observable<any>
    {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
          + screenId } `,null,httpOptions)
          .pipe(
            catchError(this.handleError)
          )
    }
    
    public GetFavouriteStatus(screenId)
    {
      return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId } `)
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

