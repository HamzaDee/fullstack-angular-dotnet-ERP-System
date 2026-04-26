import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FixedAssetsContractsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

 //.................. Asset Sales Contracts
//list
public GetAssetsContractsHDList(): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsContract/AssetsContractsList/' +
    this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`)
    .pipe(
      catchError(this.handleError)
    )
}

//Get
public GetAssetsContractsForm(id, opType): Observable<any> {
  debugger
  if(id > 0){
    if(opType == 'Copy'){
      return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsContract/CopyAssetContract/' + this.jwtAuth.getLang()  +
      '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId() + '/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
    }
     else if(opType == 'Show'){
      return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsContract/ShowAssetsContractForm/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
    }
    else{
      return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsContract/EditAssetsContractForm/' + this.jwtAuth.getLang() 
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
    }
  }
  else{
    return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsContract/AssetsContractForm/' + this.jwtAuth.getLang() 
    + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + id}`)
      .pipe(
        catchError(this.handleError)
      )
  }   
}

// save 
public saveAssetContractsForm(post): Observable<any> {
debugger
  return this.http.post<any>(`${environment.apiURL_Main + '/api/FixedAssetsContract/AddAssetContract/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, post)
  .pipe(
    catchError(this.handleError)
  )    
}


 // ترحيل 
/* public PostContract(id): Observable<any> {
  debugger
  const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  return this.http.put(`${environment.apiURL_Main + '/api/FixedAssetsContract/PostAssetContract/'
    + id + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,null,httpOptions)
    .pipe(
      catchError(this.handleError)
    )
} */

    public PostContract(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetsContract/PostAssetContract/' + id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

//حذف
/* public DeleteContract(id): Observable<any> {
  var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetsContract/deleteAssetContract/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
  return this.http.delete(urlDelete)
    .pipe(
      catchError(this.handleError)
    );
} */

    public DeleteContract(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/FixedAssetsContract/deleteAssetContract/' + id +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }


public printAssetContract(id): Observable<any> {
        
  return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsContract/PrintAssetContract/' + this.jwtAuth.getLang() + '/' + id +
    '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
    .pipe(
      catchError(this.handleError)
    )
}

// get contact no 
public CheckContractNo(ContractNo): Observable<any> {
  debugger
    return this.http.get(`${environment.apiURL_Main + '/api/FixedAssetsContract/CheckContractNo/' + ContractNo + '/' + this.jwtAuth.getUserId()}`)
      .pipe(
        catchError(this.handleError)
      )
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
//.................. End Asset Sales Contracts

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
