import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders , HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SalesReportsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
 


//#region  Detailed Sales Report
public GetSalesDetailedModelForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/DetailedSaleReport/GetDetailedSalesReport/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetSalesDetailed( 
  fromDate:string,
  toDate: string,
  customer:number,
  customerType: number,
  represntedId: number,
  area: number,  
  category: number,
  storeId: number,
  itemId: number,
  branchId:number,
  collective:number,
  currancyId:number,
  itemGroupId:number,
  invoiceType:number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('Customer', customer)
    .set('CustomerType', customerType)
    .set('RepresntedId', represntedId)
    .set('Area', area)
    .set('Category', category)
    .set('StoreId', storeId)
    .set('ItemId', itemId)
    .set('BranchId', branchId)
    .set('Collective', collective)
    .set('CurrancyId', currancyId)   
    .set('InvoiceType', invoiceType) 
    .set('GroupId', itemGroupId)  
  return this.http.get(`${environment.apiURL_Main}/api/DetailedSaleReport/GetDetailedSales/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
}  
//#endregion


//#region Categories Sales Report
public GetCategoriesForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/ItemSalesReport/GetItemSalesReportModel/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetCategoriesSalesRpt( 
  fromDate:string,
  toDate: string,
  categoryId:number,
  dealerId: number,
  itemId:number,
  brandId: number,
  storeId:number,
  represntedId: number,  
  collective: number,
  withTax: number,
  maxUnit: number,
  excludeBouns:number,
  withReturns:number,
  branchId:number,
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
    .set('CategoryId', categoryId)
    .set('CustomerId', dealerId)
    .set('ItemId', itemId)
    .set('BrandId', brandId)
    .set('StoreId', storeId)
    .set('RepresntedId', represntedId)
    .set('Collective', collective)
    .set('WithTax', withTax)
    .set('MaxUnit', maxUnit)      
    .set('ExcludeBouns', excludeBouns)   
    .set('WithReturns', withReturns) 
    .set('BranchId', branchId)     
    .set('CurrencyId', currencyId) 
    .set('CurrRate', currRate) 
    
  return this.http.get(`${environment.apiURL_Main}/api/ItemSalesReport/GetCategoriesSalesRpt/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 

public GetCollectiveCategoriesSalesRpt( 
  fromDate:string,
  toDate: string,
  categoryId:number,
  dealerId: number,
  itemId:number,
  brandId: number,
  storeId:number,
  represntedId: number,  
  collective: number,
  withTax: number,
  maxUnit: number,
  excludeBouns:number,
  withReturns:number,
  branchId:number,
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
    .set('CategoryId', categoryId)
    .set('CustomerId', dealerId)
    .set('ItemId', itemId)
    .set('BrandId', brandId)
    .set('StoreId', storeId)
    .set('RepresntedId', represntedId)
    .set('Collective', collective)
    .set('WithTax', withTax)
    .set('MaxUnit', maxUnit)      
    .set('ExcludeBouns', excludeBouns)   
    .set('WithReturns', withReturns) 
    .set('BranchId', branchId)  
    .set('CurrencyId', currencyId) 
    .set('CurrRate', currRate)            
  return this.http.get(`${environment.apiURL_Main}/api/ItemSalesReport/GetCollectiveCategoriesSalesRpt/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 
//#endregion

//#region Requested Items Report
public GetRequestedItemsReportForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/RequestedItemsReport/GetRequestedItemsForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetRequestedItemsReport( 
  fromDate:string,
  toDate: string,
  salesOrderId:number,
  customerId: number,
  categoryId:number,
  itemId: number,
  represntedId:number,
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
    .set('SalesOrderId', salesOrderId)
    .set('CustomerId', customerId)
    .set('CategoryId', categoryId)
    .set('ItemId', itemId)
    .set('RepresntedId', represntedId)
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)            
  return this.http.get(`${environment.apiURL_Main}/api/RequestedItemsReport/GetRequestedItemsRpt/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 
//#endregion

//#region Return Sales Report
public GetListOfReturneditemReportForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/ListOfReturneditemReport/GetListOfReturneditemReport/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}
public GetReturnedSalesInvoiceReport( 
  fromDate:string,
  toDate: string,
  customerId: number,
  categoryId:number,
  represntedId:number,
  itemId: number,
  currencyId: number,
  currRate: number,
  
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate', fromDate)
    .set('ToDate', toDate)  
    .set('CustomerId', customerId)
    .set('CategoryId', categoryId)
    .set('RepresntedId', represntedId)
    .set('ItemId', itemId)
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)       
  return this.http.get(`${environment.apiURL_Main}/api/ListOfReturneditemReport/GetReturnSalesInvoiceRpt/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 
//#endregion Item Taxes Report
public GetItemsTaxReportForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/ItemsTaxReport/GetItemsTaxReport/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}


public GetItemsTaxReport( 
  fromDate:string,
  toDate: string,
  itemId: number,
  categoryId:number,
  taxId: number,
  currencyId: number,
  currRate  : number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate', fromDate)
    .set('ToDate', toDate)  
    .set('ItemId', itemId)
    .set('CategoryId', categoryId)    
    .set('TaxId', taxId)    
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)            
  return this.http.get(`${environment.apiURL_Main}/api/ItemsTaxReport/GetItemsTaxesRpt/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 

//#region 



//#region Material Profit Report
public GetHemsProfitReportForm(): Observable<any> {
  return this.http.get(`${environment.apiURL_Main + '/api/HemsProfitReport/GetHemsProfitReport/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}



public GetMaterialProfitReport( 
  fromDate:string,
  toDate: string,
  itemId: number,
  categoryId:number,
  customerId: number,
  storeId: number,
  representId: number,
  detailed: number,        
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate', fromDate)
    .set('ToDate', toDate)  
    .set('ItemId', itemId)
    .set('CategoryId', categoryId)    
    .set('CustomerId', customerId) 
    .set('StoreId', storeId)
    .set('RepresentId', representId)
    .set('Detailed', detailed)               
  return this.http.get(`${environment.apiURL_Main}/api/HemsProfitReport/GetMaterialProfitRpt/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 


public GetDetaliedMaterialProfitReport( 
  fromDate:string,
  toDate: string,
  itemId: number,
  categoryId:number,
  customerId: number,
  storeId: number,
  representId: number,
  detailed: number,  
  currencyId: number,
  currRate: number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate', fromDate)
    .set('ToDate', toDate)  
    .set('ItemId', itemId)
    .set('CategoryId', categoryId)    
    .set('CustomerId', customerId) 
    .set('StoreId', storeId)
    .set('RepresentId', representId)
    .set('Detailed', detailed)      
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)          
  return this.http.get(`${environment.apiURL_Main}/api/HemsProfitReport/GetMaterialProfitDetailedRpt/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 
//#endregion



//#region  Representative Sales Statement
public GetSalesRepresentativeReportForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/SalesRepresentativeReport/GetSalesRepresentativeReport/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}


public GetSalesRepresentative( 
  representId: number,
  itemId: number,
  categoryId:number,
  customerId: number,
  fromDate:string,
  toDate: string,
  month: number,  
  year: number,  
  currYear: number,
  type: number,
  withReturns:number,
  currencyId:number,
  currRate:number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('RepresentId',representId )
    .set('ItemId', itemId)  
    .set('CategoryId', categoryId)
    .set('CustomerId',customerId )    
    .set('FromDate',fromDate ) 
    .set('ToDate', toDate)
    .set('Month', month)
    .set('Year', year)
    .set('Type', type) 
    .set('WithReturns', withReturns)     
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)            
  return this.http.get(`${environment.apiURL_Main}/api/SalesRepresentativeReport/GetSalesRepresentative/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 


public GetSalesRepresentativeByMonth( 
  representId: number,
  itemId: number,
  categoryId:number,
  customerId: number,
  fromDate:string,
  toDate: string,
  month: number,  
  year: number,  
  currYear: number,
  type: number,
  withReturns:number,
  currencyId:number,
  currRate:number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('RepresentId',representId )
    .set('ItemId', itemId)  
    .set('CategoryId', categoryId)
    .set('CustomerId',customerId )    
    .set('FromDate',fromDate ) 
    .set('ToDate', toDate)
    .set('Month', month)
    .set('Year', year)
    .set('Type', type) 
    .set('WithReturns', withReturns)     
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)       
  return this.http.get(`${environment.apiURL_Main}/api/SalesRepresentativeReport/GetSalesRepresentativeByMonth/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 




public GetSalesRepresentativeByYear( 
  representId: number,
  itemId: number,
  categoryId:number,
  customerId: number,
  fromDate:string,
  toDate: string,
  month: number,  
  year: number,  
  currYear: number,
  type: number,
  withReturns:number,
  currencyId:number,
  currRate:number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('RepresentId',representId )
    .set('ItemId', itemId)  
    .set('CategoryId', categoryId)
    .set('CustomerId',customerId )    
    .set('FromDate',fromDate ) 
    .set('ToDate', toDate)
    .set('Month', month)
    .set('Year', currYear)
    .set('Type', type) 
    .set('WithReturns', withReturns)   
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)         
  return this.http.get(`${environment.apiURL_Main}/api/SalesRepresentativeReport/GetSalesRepresentativeByYear/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 
//#endregion


//#region  Taxses Report
public GetTaxesReportForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/TaxesReport/GetTaxesReportForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}



public GetDetailedTaxesReport( 
  fromDate:string,
  toDate: string,
  taxId: number,
  categoryId: number, 
  collective: number,
  currencyId: number,
  currRate: number,
  dealerTypeId: number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate',fromDate )
    .set('ToDate', toDate)  
    .set('TaxId',taxId )
    .set('VoucherType',categoryId)    
    .set('Collective',collective )  
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate)  
    .set('DealerTypeId', dealerTypeId)                    
  return this.http.get(`${environment.apiURL_Main}/api/TaxesReport/GetDetailedTaxesReport/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 


public GetCollectiveTaxesReport( 
  fromDate:string,
  toDate: string,
  taxId: number,
  voucherTypeId: number, 
  collective: number,
  currencyId:number,
  currRate:number,
  dealerTypeId: number,
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate',fromDate )
    .set('ToDate', toDate)  
    .set('TaxId',taxId )
    .set('VoucherType',voucherTypeId)    
    .set('Collective',collective )      
    .set('CurrencyId', currencyId)
    .set('CurrRate', currRate) 
    .set('DealerTypeId', dealerTypeId)                                
  return this.http.get(`${environment.apiURL_Main}/api/TaxesReport/GetCollectiveTaxesReport/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    ); 
} 

//#endregion







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
