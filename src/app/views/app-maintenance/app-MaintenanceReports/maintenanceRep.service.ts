import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class MaintReportsService {

  constructor(
    private readonly http: HttpClient,
    private readonly jwtAuth: JwtAuthService,
  ) { }


  //#region  Maintenance Orders Report
  public GetMaintenanceOrdersForm(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceReports/GetMaintenanceOrdersForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetMaintenanceOrders(model: any): Observable<any> {
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();

    return this.http.post(
      `${environment.apiURL_Main}/api/MaintenanceReports/GetMaintenanceOrders/${lang}/${companyId}/${userId}`,
      model
    ).pipe(
      catchError(this.handleError)
    );
  }

  //#endregion




  public GetMaintenanceRequestReportForm(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceReports/GetMaintenanceRequestReportForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetMaintenanceRequestReport(
    fromDate: string,
    toDate: string,
    inRequest: number,
    requestType: number,
    priorityId: number,
    branchId: number,
    technicianId: number,
    serialNo: number,
    itemId: number,
    underWarranty: number,
    damageId: number,
    areaId: number,
    customerId: number,
    model: number,
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    const params = new HttpParams()
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('InRequest', inRequest)
      .set('RequestType', requestType)
      .set('PriorityId', priorityId)
      .set('BranchId', branchId)
      .set('TechnicianId', technicianId)
      .set('SerialNo', serialNo)
      .set('ItemId', itemId)
      .set('UnderWarranty', underWarranty)
      .set('DamageId', damageId)
      .set('AreaId', areaId)
      .set('ItemId', itemId)
      .set('CustomerId', customerId)
      .set('Model', model)
    return this.http.get(`${environment.apiURL_Main}/api/MaintenanceReports/GetMaintenanceRequestReport/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }




  public GetMaintenanceTechnicalReportForm(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/MaintenanceReports/GetMaintenanceTechnicalReportForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  public GetMaintenanceOrderReport(
    fromDate: string,
    toDate: string,
    inorder: number,
    reqOrderId: number,
    priorityId: number,
    status:number
  ): Observable<any> {
    debugger
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
    const params = new HttpParams()
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('Inorder', inorder)
      .set('ReqOrderId', reqOrderId)
      .set('PriorityId', priorityId)
      .set('Status', status)
    return this.http.get(`${environment.apiURL_Main}/api/MaintenanceReports/GetMaintenanceOrderReport/${lang}/${companyId}/${userId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }




  public UpdateFavourite(screenId: any): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId: any) {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId} `)
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



    public GetMaintenanceFaultForm(): Observable<any> {
    return this.http.get(
      `${environment.apiURL_Main}/api/MaintenanceReports/MaintenanceFaultSearchModel/` +
      this.jwtAuth.getLang() + '/' +
      this.jwtAuth.getCompanyId() + '/' +
      this.jwtAuth.getUserId()
    ).pipe(
      catchError(this.handleError)
    );
    }

    
 
  public GetMaintenanceFault(model: any): Observable<any> {
    const lang = this.jwtAuth.getLang();
    const companyId = this.jwtAuth.getCompanyId();
    const userId = this.jwtAuth.getUserId();
debugger
    return this.http.post(
      `${environment.apiURL_Main}/api/MaintenanceReports/GetMaintenanceFault/${lang}/${companyId}/${userId}`,
      model
    ).pipe(
      catchError(this.handleError)
    );
    }

}
