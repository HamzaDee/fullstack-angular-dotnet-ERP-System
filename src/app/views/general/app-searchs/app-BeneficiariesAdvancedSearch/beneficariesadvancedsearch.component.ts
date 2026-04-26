import { Component,Input,EventEmitter, Output } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';

interface AuthData 
{
  id : any;
  beneficiaryName : any;
  nationalityId : any;
  sexId : any;
  governorateId : any;
}

@Component({
  selector: 'app-beneficariesadvancedsearch',
  templateUrl: './beneficariesadvancedsearch.component.html',
  styleUrl: './beneficariesadvancedsearch.component.scss'
})
export class BeneficariesadvancedsearchComponent {
    @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
    @Input() vNationalitiesList : any; 
    @Input() vSexIdentityList : any; 
    @Input() vGovernoratesList : any; 
    
  
  
    nationalitiesList:any;
    sexIdentityList:any;
    governoratesList:any;
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
      this.nationalitiesList = this.vNationalitiesList;
      this.sexIdentityList = this.vSexIdentityList;
      this.governoratesList= this.vGovernoratesList;    
      this.searchCriteria = {
        id:0,
        beneficiaryName: '',
        nationalityId:0,
        sexId:0,
        governorateId:0
      };
    }
    
    getData() {
      debugger      
      this.GetBeneficiarieListBySearch(this.searchCriteria).subscribe(result => {      
        debugger       
          this.data = result; 
          this.searchResultEvent.emit(result);
        },
        (error) => {
          console.error('Error occurred:', error);
        });    
    }
    
    public GetBeneficiarieListBySearch(searchCriteria): Observable<any> {
      debugger
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        return this.http.post<any>(`${environment.apiURL_Main + '/api/Beneficiaries/GetBeneficiarieListBySearch/'
      + this.jwtAuth.getLang() + '/'  + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() } `,JSON.stringify(searchCriteria),httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
  
    public GetBeneficiarieList(): Observable<any> {
      debugger
        return this.http.get(`${environment.apiURL_Main + '/api/Beneficiaries/GetBeneficiarieList/'
        + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
        .pipe(
          catchError(this.handleError)
        ) 
    }
  
    GetMainData()
    {
      debugger
      this.GetBeneficiarieList().subscribe(result => {
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
      this.searchCriteria.beneficiaryName = '';
      this.searchCriteria.nationalityId = 0;
      this.searchCriteria.sexId = 0;
      this.searchCriteria.governorateId = 0;          
      this.GetSearchFormValues();
      this.GetMainData();
      this.showLoader = false;
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
