import { HttpHeaders, HttpErrorResponse, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductionReportService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

    public GetProdectionhart(periodType, todate): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/EmergencyDashboard/GetDashboardEmergancychart/' + periodType + '/' + todate}`)
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

  public GetItemsDatesArrival(): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetItemsDatesArrival/' 
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
  } 

  public GetProdByCountriesList(): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetProdByCountriesList/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
  } 

  public getForecastingData(year,month,CountryId): Observable<any>
  {debugger;
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetForecastingData/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + year + '/' + month + '/' + CountryId} `)
    .pipe(
      catchError(this.handleError)
    )
  } 

  public GetProductivity(fromYear,toYear): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetProductivity/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + fromYear + '/' + toYear} `)
    .pipe(
      catchError(this.handleError)
    )
  }

  public GetAnnualProductivity(itemId,fromYear,toYear): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetAnnualProductivity/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + itemId + '/' +  fromYear + '/' + toYear} `)
    .pipe(
      catchError(this.handleError)
    )
  }  

  public GetItemsList(): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetItemsList/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
  }

  public GetPerformance(type,year): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetPerformance/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + type + '/' + year} `)
    .pipe(
      catchError(this.handleError)
    )
  }

  public GetFinishItemsBalance(): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetFinishItemsBalance/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
  } 

  public GetProducedQty(fromDate,toDate): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetProducedQty/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() 
    + '/' + fromDate + '/' + toDate} `)
    .pipe(
      catchError(this.handleError)
    )
  } 

  public GetProdCapacity(): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetProductionCapacity/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
    .pipe(
      catchError(this.handleError)
    )
  } 

  GetPromotionalMaterialStock() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PromotionalMaterialStock/GetPromotionalMaterialStock/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public SaveProdCapacity(post): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProductionReports/SaveProductionCapacity/'
      + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `,JSON.stringify(post),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetSalesForcastForm() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetSalesForcastForm/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetActualSalesVsSalesOrdersForm() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetActualSalesVsSalesOrdersorm/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetShippedPromotionalMaterialsVsOrders() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetShippedPromotionalMaterialsVsOrders/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetActualSalesVsSalesOrdersSearch (countryId, agentId, orderId, itemId, fromdate, todate, year): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('CountryId', countryId)
      .set('AgentId', agentId)
      .set('OrderId', orderId)
      .set('ItemId', itemId)
      .set('Fromdate', fromdate)
      .set('Todate', todate)
      .set('Year', year)

    return this.http.get(`${environment.apiURL_Main}/api/ProductionReports/FilterActualSalesVsSalesOrdersReport/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  } 

  GetSalesForcastData(CountryId,AgentId,Year,fromdate,todate,ItemId,ShowItems) : Observable<any> {
    debugger
    AgentId = parseInt(AgentId);
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionReports/GetSalesForcastData/'
      + CountryId + '/' + AgentId + '/' + Year + '/' + fromdate    + '/' +  todate   + '/' + ItemId + '/' + this.jwtAuth.getUserId() + '/' + ShowItems} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetShippedPromotionalSearch (countryId, agentId, orderId, itemId, fromdate, todate, year): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    
    const params = new HttpParams()
      .set('CountryId', countryId)
      .set('AgentId', agentId)
      .set('OrderId', orderId)
      .set('ItemId', itemId)
      .set('Fromdate', fromdate)
      .set('Todate', todate)
      .set('Year', year)

    return this.http.get(`${environment.apiURL_Main}/api/ProductionReports/FilterShippedPromotionalReport/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  } 


  public GetMaterialsReportForm(): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProdReports/GetMaterialsReportForm/' 
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
  } 


  public GetPrdoucedMaterials(FromDate,ToDate,ItemId,VoucherTypeId): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProdReports/GetPrdoucedMaterials/' 
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + FromDate + '/' + ToDate + '/' + ItemId + '/' + VoucherTypeId} `)
    .pipe(
      catchError(this.handleError)
    )
  } 


 public GetConsumedRawMaterialsForm(): Observable<any>
  {
    return this.http.get(`${environment.apiURL_Main + '/api/ProdReports/GetConsumedRawMaterialsForm/' 
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
  } 


  public GetConsumedRawMaterials( fromDate: string,toDate: string,prodId: number,itemId: number,storeId: number,): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();  
  const params = new HttpParams()
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('ProductionId', prodId)
    .set('ProducedItemId', itemId)
    .set('StoreId', storeId)
  return this.http.get(`${environment.apiURL_Main}/api/ProdReports/GetConsumedRawMaterials/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
} 



   public GetProductionCostReportForm(): Observable<any>
  {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ProductionCostRpt/GetProductionCostReportForm/' 
    + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
  } 

  public ProductionCostDataModel( fromDate: string,toDate:string,itemId: number,voucherId: number): Observable<any> {
  debugger    
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();  
  const params = new HttpParams()
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('ItemId', itemId)
    .set('VoucherId', voucherId)
  return this.http.get(`${environment.apiURL_Main}/api/ProductionCostRpt/GetProductionCostReportData/${lang}/${companyId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
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
