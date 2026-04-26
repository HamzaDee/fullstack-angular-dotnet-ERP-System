import { Component, OnInit, ViewChild ,Input,EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';

interface AuthData 
{
  id : any;
  volunteerName : any;
  volunteerSide : any;
  nationalityId : any;
  governorateId : any;
}

@Component({
  selector: 'app-volunteersadvancedsearch',
  templateUrl: './volunteersadvancedsearch.component.html',
  styleUrl: './volunteersadvancedsearch.component.scss'
})
export class VolunteersadvancedsearchComponent {
 @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() vAuthoritiesList : any; 
  @Input() vNationalitiesList : any; 
  @Input() vGovernorateList : any; 
  


  authoritiesList:any;
  nationalitiesList:any;
  governorateList:any;
  loading: boolean;
  searchCriteria: AuthData;
  data:any;
  showLoader: boolean;
  oldMultiValue:string | string[];
  filteredGover: Array<any> = [];
  filteredCountries: Array<any> = [];

  constructor
            (
              private formbulider: FormBuilder,
              private http: HttpClient,
              private jwtAuth: JwtAuthService,
              private appEntryvouchersService:AppEntryvouchersService,
            ) { }

  ngOnInit(): void 
  {debugger
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.authoritiesList = this.vAuthoritiesList;
    this.nationalitiesList = this.vNationalitiesList;
    this.governorateList= this.vGovernorateList;    
    this.searchCriteria = {
      id:0,
      volunteerName: '',
      volunteerSide: 0,
      nationalityId: 0,
      governorateId: 0
    };
  }
  
  getData() {
    debugger      
    this.GetVolunteersListBySearch(this.searchCriteria).subscribe(result => {      
      debugger       
        this.data = result; 
        this.searchResultEvent.emit(result);
      },
      (error) => {
        console.error('Error occurred:', error);
      });    
  }
  
  public GetVolunteersListBySearch(searchCriteria): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/Volunteers/GetVolunteersListBySearch/'
    + this.jwtAuth.getLang() + '/'  + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `,JSON.stringify(searchCriteria),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetVolunteersList(): Observable<any> {
    debugger
      return this.http.get(`${environment.apiURL_Main + '/api/Volunteers/GetVolunteersList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      ) 
  }

  GetMainData()
  {
    debugger
    this.GetVolunteersList().subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
    },
    (error) => {
      console.error('Error occurred:', error);
    })
  }

  EmptySearch() {
    debugger    
    this.showLoader = true;
    this.searchCriteria.id = 0;
    this.searchCriteria.volunteerName = '';
    this.searchCriteria.volunteerSide = 0;
    this.searchCriteria.nationalityId = 0;
    this.searchCriteria.governorateId = 0;    
    this.GetSearchFormValues();
    this.GetMainData();
    this.showLoader = false;
  }

 AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.authoritiesList) {
      this.authoritiesList = [];
    }

    // Make sure the array is large enough
    while (this.authoritiesList.length < last) {
      this.authoritiesList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.authoritiesList[i] = this.authoritiesList[i];
    }

    this.loading = false;
  }

  private handleError(error: HttpErrorResponse) {
    debugger
    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message);
    } else {
      console.log(error.status);
    }
    return throwError(
      console.log('Something is wrong!')
    );
  }
}
