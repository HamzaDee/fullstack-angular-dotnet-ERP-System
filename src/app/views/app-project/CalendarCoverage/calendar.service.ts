import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from "environments/environment";

// Interface for a single event
export interface MonthEvent {
  id: number;
  eventName: string;
  eventDateTime: string;
}

@Injectable({ providedIn: 'root' })
export class MonthlyCalendarService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService
  ) { }

  /** Get all events for a specific month */
    public getMonthEvents(year: number, month: number): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Calendar/GetCoverageEvents/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + year + '/' + month} `)
        .pipe(
        catchError(this.handleError)
        )
    }

  /** Handle HTTP errors */
  private handleError(error: HttpErrorResponse): Observable<MonthEvent[]> {
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      console.error('Client-side error:', error.error.message);
    } else {
      // Backend error
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }

    // Return empty array so calendar still renders
    return of([]);
  }
}



