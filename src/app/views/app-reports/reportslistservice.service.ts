import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportslistserviceService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
) { }

  public GetAllReportsList(): Observable<any> {
      return this.http.get(`${environment.apiURL_Main + '/api/General/GetReportsList/' + this.jwtAuth.getLang()}`)
  }

  public ResetReports(reportName): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/General/ResetReports/' + this.jwtAuth.getLang() + '/' + reportName}`)
  }
}
