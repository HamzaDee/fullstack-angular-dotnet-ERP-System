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
export class ReminderNotesService {
  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateServie: TranslateService) { }


    //list
    public getReminderNoteList(): Observable<any> {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/ReminderNotes/GetReminderNoteList/'  +
      this.jwtAuth.getLang() + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }
  

    //get
    public getReminderNoteinfo(id): Observable<any> {
      debugger
      return this.http.get(`${environment.apiURL_Main + '/api/ReminderNotes/GetReminderNoteForm/'  +
       id + '/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()} `)
        .pipe(
          catchError(this.handleError)
        )
    }


  // save 
  public saveReminderNotesForm(post): Observable<any> {
      debugger   
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ReminderNotes/PostReminderNotes/'
     + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `,JSON.stringify(post),httpOptions)
    .pipe(
      catchError(this.handleError)
    )
  }

//delete
  public deleteReminderNotes(id): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    var urlDelete = `${environment.apiURL_Main + '/api/ReminderNotes/DeleteReminderNotes/' + id +'/' + this.jwtAuth.getUserId() + '/' + this.jwtAuth.getCompanyId()}`;
    return this.http.post<any>(urlDelete,'',httpOptions)
      .pipe(
        catchError(this.handleError)
      );
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
