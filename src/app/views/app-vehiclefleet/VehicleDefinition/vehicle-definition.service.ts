import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleDefinitionService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }


    public getVehicleDefinitionList(): Observable<any> {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/VehicleDefinition/GetVehicleDefinitionList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }


    public getVehicleDefinitionInfo(id,opType): Observable<any> {
      if(id > 0)
        {
          if(opType =='Show')
            {
              return this.http.get(`${environment.apiURL_Main + '/api/VehicleDefinition/ShowVehicleDefinitionInfo/' + this.jwtAuth.getLang()
              + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
              .pipe(
                catchError(this.handleError)
              )
            }
            else
            {
              return this.http.get(`${environment.apiURL_Main + '/api/VehicleDefinition/EditVehicleDefinitionInfo/' + this.jwtAuth.getLang()
              + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
              .pipe(
                catchError(this.handleError)
              )
            }
        }
        else
        {
          return this.http.get(`${environment.apiURL_Main + '/api/VehicleDefinition/AddVehicleDefinitionInfo/' + this.jwtAuth.getLang()
          + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
          .pipe(
            catchError(this.handleError)
          )
        }      
    }

    public saveVehicleDefinition(post): Observable<any> {        
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/VehicleDefinition/PostVehicleDefinition/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }

    public deleteVehicleDefinition(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/VehicleDefinition/DeleteVehicleDefinition/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

    

  public UpdateFavourite(screenId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post(`${environment.apiURL_Main + '/api/General/UpdateFavourite/'
      + screenId} `, null, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFavouriteStatus(screenId) {
    return this.http.get(`${environment.apiURL_Main + '/api/General/GetFavouriteStatus/' + screenId} `)
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
