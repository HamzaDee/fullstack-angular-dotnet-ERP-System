import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListOfNewStudentsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }

  public GetNewStudents(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ListOfNewStudents/GetNewStudents/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public AddStudent(studentId, studentName, totalDebit,accId): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ListOfNewStudents/AddStudent/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + studentId + '/' + studentName + '/' + totalDebit + '/' + accId} `, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }
 
  UpdateStudent(studentsList: any[]) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ListOfNewStudents/UpdateStudent/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,studentsList, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  AddAllStudent(studentsList: any[]) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ListOfNewStudents/AddStudent/'
      + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,studentsList, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetListOfStudentInfo(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ListOfNewStudents/GetListOfStudentsInfo/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetListOfStudentAdjustmentForm(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ListOfNewStudents/GetListOfStudentAdjustmentForm/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public UpdateReceipts(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ListOfNewStudents/UpdateAllReceipts/' } `)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetListOfStudentAdjustment(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/ListOfNewStudents/GetListOfStudentAdjustment/' + this.jwtAuth.getLang()
      + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
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

public HideShowStudent(DealerNo: number,showAll: number): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ListOfNewStudents/HideShowStudent/'
      + this.jwtAuth.getCompanyId() + '/' + showAll + '/' + DealerNo} `, httpOptions)
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
