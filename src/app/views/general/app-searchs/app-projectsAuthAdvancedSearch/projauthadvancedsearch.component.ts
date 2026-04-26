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
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';

interface AuthData 
{
  id : any;
  entityName : any;
  entityEName : any;
  nationalNo : any;
  authorityAttribute : any;
  entityId : any;
  entityCategory : any;
  countryId : any;
  governorateId : any;
  districtId : any;
  developmentDirectId : any;
}

@Component({
  selector: 'app-projauthadvancedsearch',
  templateUrl: './projauthadvancedsearch.component.html',
  styleUrl: './projauthadvancedsearch.component.scss'
})
export class ProjauthadvancedsearchComponent implements OnInit {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() vDevelopmentDirectList : any; 
  @Input() vAuthorityClassificationList : any; 
  @Input() vAuthorityAttributeList : any; 
  @Input() vEntityCategoryList : any; 
  @Input() vCountryList : any; 
  @Input() vGovernorateList : any; 
  @Input() vDistrictList : any; 
  // @Input() vfromDate : Date; 
  // @Input() vtoDate : Date; 
  // @Input() vnote : string; 
  // @Input() voucherTypeEnum : any; 

  developmentDirectList:any;
  authorityClassificationList:any;
  authorityAttributeList:any;
  entityCategoryList:any;
  countryList:any;
  governorateList:any;
  districtList:any;
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
              private egretLoader: AppLoaderService,
              private translateService: TranslateService,

            ) { }

  ngOnInit(): void 
  {debugger
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    debugger
    this.developmentDirectList = this.vDevelopmentDirectList;
    this.authorityClassificationList = this.vAuthorityClassificationList;
    this.authorityAttributeList= this.vAuthorityAttributeList;    
    this.entityCategoryList= this.vEntityCategoryList;
    this.countryList = this.vCountryList;
    this.governorateList = this.vGovernorateList;
    this.districtList = this.vDistrictList;
    this.searchCriteria = {
      id:0,
      entityName: '',
      entityEName: '',
      nationalNo: '',
      authorityAttribute: 0,
      entityId: 0,
      entityCategory : 0,
      countryId : 0,
      governorateId: 0,
      districtId: 0,
      developmentDirectId: 0
    };
  }
  
  getData() {
    debugger      

    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.GetAuthoritiesSearchList(this.searchCriteria).subscribe(result => {      
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
  
  public GetAuthoritiesSearchList(searchCriteria): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/Authorities/GetAuthoritiesListBySearch/'
    + this.jwtAuth.getLang() + '/'  + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `,JSON.stringify(searchCriteria),httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  public GetAuthoritiesList(): Observable<any> {
    debugger
      return this.http.get(`${environment.apiURL_Main + '/api/Authorities/GetAuthoritiesList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      ) 
  }

  GetMainData()
  {
    debugger
    this.GetAuthoritiesList().subscribe(result => {
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
    this.searchCriteria.entityName = '';
    this.searchCriteria.entityEName = '';
    this.searchCriteria.nationalNo = '';
    this.searchCriteria.authorityAttribute = 0;
    this.searchCriteria.entityId = 0;
    this.searchCriteria.entityCategory = 0;
    this.searchCriteria.countryId = 0;
    this.searchCriteria.governorateId = 0;
    this.searchCriteria.districtId = 0;
    this.searchCriteria.developmentDirectId = 0;
    this.GetSearchFormValues();
    this.GetMainData();
    this.showLoader = false;
  }

  Filtergover(gover: number) {
    debugger
    if (gover > 0) {
      this.filteredGover= this.districtList.filter(x => x.data1 === gover.toString());
    } else {
      this.filteredGover = [];
    }
  }

  Filtercountries(country: number) {
    debugger
    if (country > 0) {
      this.filteredCountries = this.governorateList.filter(x => x.data1 === country.toString());
    } else {
      this.filteredCountries = [];
    }
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
