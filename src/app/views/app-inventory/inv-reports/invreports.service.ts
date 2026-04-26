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
export class InventoryReportsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }
 


//#region  Item Balances
public GetItemBalancesForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetItemsBalancesForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetItemBalances( 
  fromDate:string,
  toDate: string,
  itemGroupId:number,
  itemId: number,
  typeId: number,
  storeId: number,  
  onlyShowZeroBalance: number,
  branchId: number,
  unitType: number,
  itemAddInfo: string,
  deliveredTo:number,
  authorityId:number,
  projectId:number,
  byStore: number
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('GroupId', itemGroupId)
    .set('catID', typeId)
    .set('ItemId', itemId)
    .set('StoreId', storeId)
    .set('BranchId', branchId)
    .set('ShowZeroBalance', onlyShowZeroBalance)
    .set('UnitType', unitType)
    .set('itemAddInfo', itemAddInfo)
    .set('EntityId', deliveredTo)
    .set('AuthorityId', authorityId)
    .set('ProjectId', projectId)
    .set('ByStore', byStore)

  return this.http.get(`${environment.apiURL_Main}/api/InventoryReports/GetItemsBalances/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion
 
//#region  Order Limit Items
public GetOrderLimitItemsForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetOrderLimitItemsForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetOrderLimitItems( 
  typeId: number,
  itemGroupId:number,
  storeId: number,      
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();  
  const params = new HttpParams()
    .set('catID', typeId)
    .set('GroupId', itemGroupId)
    .set('StoreId', storeId)    
  return this.http.get(`${environment.apiURL_Main}/api/InventoryReports/GetOrderLimitItems/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
} 



//#endregion

//#region item Transactions
public GetItemTranactionsForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetItemTransactionsForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetInvoiceId(id): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetInvoiceId/' + id } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetItemTranactions( 
  fromDate:string,
  toDate: string,
  itemGroupId:number,
  typeId: number,
  itemId: number,  
  branchId: number,
  storeId: number, 
  voucherTypeId: number,  
  batchNo:string,
  serialNo:string,
  expierDate:string,
  itemAddInfo:string,
  deliveredTo: number
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('GroupId', itemGroupId)
    .set('catID', typeId)
    .set('ItemId', itemId)
    .set('BranchId', branchId)
    .set('StoreId', storeId)    
    .set('VoucherTypeId', voucherTypeId)
    .set('BatchNo', batchNo)
    .set('SerialNo', serialNo)
    .set('ExpierDate', expierDate)  
    .set('itemAddInfo', itemAddInfo)  
    .set('deliveredTo', deliveredTo)  
  return this.http.get(`${environment.apiURL_Main}/api/InventoryReports/GetItemTransactions/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion

//#region Item Batch
public GetItemBatchForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetItemBatchExpiryForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetItemBatch( 
  fromDate:Date,
  toDate: Date ,
  groupId:number,
  typeId: number,
  itemId: number,  
  branchId: number,
  storeId: number, 
  batchNo:string,
  showStore: number,  
  showEndItems:number,
  dontShowZeroBalance:number,
  toThisDate:number,
  forThisDate:number,  
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();
  
  const params = new HttpParams()
    .set('FromDate', formatDate(fromDate, "yyyy-MM-dd", "en-US"))
    .set('ToDate', formatDate(toDate, "yyyy-MM-dd", "en-US"))
    .set('GroupId', groupId)
    .set('catID', typeId)
    .set('ItemId', itemId)
    .set('BranchId', branchId)
    .set('StoreId', storeId)    
    .set('BatchNo', batchNo)
    .set('ShowStore', showStore)    
    .set('ShowEndItems', showEndItems)
    .set('DontShowZeroBalance', dontShowZeroBalance)
    .set('ThisDate', toThisDate)
    .set('ThisToDate', forThisDate)
  return this.http.get(`${environment.apiURL_Main}/api/InventoryReports/GetItemBatchExpiry/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion

//#region Reserved Items
public GetReservedItemsForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetReservedItemsForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetReservedItems( 
  isDetaild:number,
  fromDate:string,
  toDate: string ,
  groupId:number,
  typeId: number,
  itemId: number,  
  branchId: number,
  storeId: number,   
  customerId: number,   
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();  
  const params = new HttpParams()
    .set('IsDetaild', isDetaild) 
    .set('FromDate', fromDate )
    .set('ToDate', toDate)
    .set('GroupId', groupId)
    .set('catID', typeId)
    .set('ItemId', itemId)
    .set('BranchId', branchId)
    .set('StoreId', storeId)    
    .set('CustomerId', customerId)
  return this.http.get(`${environment.apiURL_Main}/api/InventoryReports/GetReservedItems/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion

//#region Items Locations
public GetItemsLocationsForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetItemsLocationsForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetItemsLocations( 
  groupId:number,
  catId: number,
  itemId: number, 
  storeId: number,      
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();  
  const params = new HttpParams()
    .set('GroupId', groupId)
    .set('catID', catId)
    .set('ItemId', itemId)
    .set('StoreId', storeId)    
  return this.http.get(`${environment.apiURL_Main}/api/InventoryReports/GetItemsLocations/${lang}/${companyId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}  
//#endregion

//#region Items Serials Report
public GetItemsSerialsReportForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetItemsSerialsReportForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetItemsSerialsReport(
  reportType: number,
  fromDate: string,
  toDate: string,
  companyId: number,
  groupId: number,
  catId: number,
  itemId: number,
  branchId: number,
  storeId: number,
  statusId: number,
  serialNo: string,
  langFromScreen: string
): Observable<any> {
  debugger
  const lang = langFromScreen || this.jwtAuth.getLang();
  const compId = companyId || this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();

  const params = new HttpParams()
    .set('ReportType', reportType)
    .set('FromDate', fromDate)
    .set('ToDate', toDate)
    .set('CompanyId', compId)
    .set('GroupId', groupId)
    .set('catID', catId)
    .set('ItemId', itemId)
    .set('BranchId', branchId)
    .set('StoreId', storeId)
    .set('StatusId', statusId)
    .set('SerialNo', serialNo)
    .set('Lang', lang);

  return this.http.get(`${environment.apiURL_Main}/api/InventoryReports/GetItemsSerials/${lang}/${compId}/${userId}`, { params })
    .pipe(
      catchError(this.handleError)
    );
}
//#endregion

//#region  ReorderItems
public GetReorderItemsForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetReorderItemsForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}
//#endregion

//#region  Other Services 

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
//#endregion
 
//#region  Item Prices 
public GetItemsPricesForm(): Observable<any> {
  debugger
  return this.http.get(`${environment.apiURL_Main + '/api/InventoryReports/GetItemsPricesForm/' + this.jwtAuth.getLang()
    + '/' + this.jwtAuth.getCompanyId()  + '/' +this.jwtAuth.getUserId() } `)
    .pipe(
      catchError(this.handleError)
    )
}

public GetItemsPrices( 
  itemId:number,
  categoryId:number,
  unitId:number,
  groupId:number,
  typeId:number,
  priceCatId:number,
     
): Observable<any> {
  debugger
  const lang = this.jwtAuth.getLang();
  const companyId = this.jwtAuth.getCompanyId();
  const userId = this.jwtAuth.getUserId();  
  const params = new HttpParams()
    .set('ItemId', itemId)
    .set('CategoryId', categoryId)
    .set('UnitId', unitId)
    .set('GroupId', groupId)
    .set('TypeId', typeId)
    .set('PriceCatId', priceCatId)

  return this.http.get(`${environment.apiURL_Main}/api/InventoryReports/GetItemsPrices/${lang}/${companyId}/${userId}`, { params })
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
