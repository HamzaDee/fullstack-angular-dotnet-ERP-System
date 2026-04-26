import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

interface LeadData {
  fromDate: any;
  toDate: any;
  followUpTypeId: any;
  relatedId: any;
  assignedToUserId: any;
  status: any;
}

@Component({
  selector: 'app-follow-up-search',
  templateUrl: './follow-up-search.component.html',
  styleUrl: './follow-up-search.component.scss'
})
export class FollowUpSearchComponent {
 @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  searchCriteria: LeadData;
  data: any;
  showLoader: boolean;
  oldMultiValue: string | string[];
  @Input() vfollowUpTypeList: any;
  @Input() vConvertedToList: any;
  @Input() vStatusList: any;
  @Input() vfromDate: Date;
  @Input() vtoDate: Date;
  followUpTypeList: any;
  ConvertedToList: any;
  StatusList: any;

  constructor (
      private formbulider: FormBuilder,
      private http: HttpClient,
      private jwtAuth: JwtAuthService,
      private appEntryvouchersService: AppEntryvouchersService,
      private translateService: TranslateService,
      private egretLoader: AppLoaderService,
    ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.followUpTypeList = this.vfollowUpTypeList;
    this.ConvertedToList = this.vConvertedToList;
    this.StatusList = this.vStatusList;
    this.searchCriteria = {
      fromDate: this.vfromDate ? formatDate(this.vfromDate, "yyyy-MM-dd", "en-US") : '',
      toDate: this.vtoDate ? formatDate(this.vtoDate, "yyyy-MM-dd", "en-US") : '',
      followUpTypeId: 0,
      relatedId: 0,
      assignedToUserId: 0,
      status: -1,
    };
  }

  getData() {
    debugger
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.GetFollowUpSearchList(this.searchCriteria).subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
      this.egretLoader.close();
    },
      (error) => {
        console.error('Error occurred:', error);
        this.egretLoader.close();
      });
  }

  

  public GetFollowUpSearchList(searchCriteria): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/FollowUp/GetFollowUpBySearch/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(searchCriteria), httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetFollowUpList(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/FollowUp/GetFollowUpList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  GetMainData() {
    this.GetFollowUpList().subscribe(result => {
      this.data = result;
      this.searchResultEvent.emit(result);
    },
      (error) => {
        console.error('Error occurred:', error);
      })
  }

   EmptySearch() {
    this.showLoader = true;
    this.searchCriteria.followUpTypeId = 0;
    this.searchCriteria.relatedId = 0;
    this.searchCriteria.assignedToUserId = '';
    this.searchCriteria.status = 0;
    this.GetSearchFormValues();
    this.GetMainData();
    this.showLoader = false;
  }

  private handleError(error: HttpErrorResponse) {
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
