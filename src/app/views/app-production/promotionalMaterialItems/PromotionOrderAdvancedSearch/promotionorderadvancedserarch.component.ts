import { Component, OnInit, ViewChild ,Input,EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { PromotionOrdersService } from '../promotionorders.service';

interface entryVData 
{
  year:any;
  agentId:any;
  countryId:any; 
}
@Component({
  selector: 'app-promotionorderadvancedserarch',
  templateUrl: './promotionorderadvancedserarch.component.html',
  styleUrl: './promotionorderadvancedserarch.component.scss'
})
export class PromotionorderadvancedserarchComponent {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  @Input() vagentsList : any; 
  @Input() vcountryList : any; 
  @Input() vyear : any; 
  @Input() vtype : any; 
  agentsList:any
  countrylist:any
  allagentList: any;
  year:any
  searchCriteria: entryVData;
  data:any;
  showLoader: boolean;
  type:any;
  AgentId:any;
  // oldMultiValue:string | string[];


  constructor
  ( 
    private formbulider: FormBuilder,
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private service:PromotionOrdersService,  
  ) { }

  ngOnInit(): void 
  {
    this.GetSearchFormValues();
  }

  GetSearchFormValues() {
    this.AgentId = -1;
    this.agentsList = this.vagentsList;
    this.countrylist = this.vcountryList;
    this.allagentList = this.vagentsList;
    this.type = this.vtype;
    this.year = this.service;
    this.searchCriteria = {
      year: '',
      agentId:'',
      countryId: 0,
    };
  }

  getData() {
    debugger
    this.searchCriteria.year ??= 0;
    if(this.searchCriteria.year =='')
      {
        this.searchCriteria.year = 0;
      }
    this.searchCriteria.countryId ??= 0;
    if(this.AgentId > 0)
      {
        this.searchCriteria.agentId = this.AgentId
        // this.searchCriteria.agentId = Number(this.searchCriteria.agentId);
      }
    else
      {
        this.searchCriteria.agentId = 0;
      }
    this.GetPromotionItemsSearchList(this.searchCriteria).subscribe(result => {      
             
        this.data = result; 
        this.searchResultEvent.emit(result);
      },
      (error) => {
        console.error('Error occurred:', error);
      });    
  }
  
  public GetPromotionItemsSearchList(searchCriteria): Observable<any> {
    debugger
    if(this.type == 1 )
      {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }; 
        const url = `${environment.apiURL_Main}/api/Promotion/GetPromotionOrdersSearchList/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}`;
        return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
        catchError(this.handleError)
      ); 
      }
    else if (this.type == 2 )
      {
        const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }; 
        const url = `${environment.apiURL_Main}/api/PromotionItemsPlans/GetPromotionPlansSearchList/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}`;
        return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
        .pipe(
        catchError(this.handleError)
      ); 
      }
            
  }

  public GetMainListPromotionItems(): Observable<any> {    
    debugger
    if(this.type == 1)
      {
        return this.http.get(`${environment.apiURL_Main + '/api/Promotion/GetPromotionOrdersList/'
          + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
          .pipe(
            catchError(this.handleError)
          )    
      }
    else if (this.type == 2)
      {
        return this.http.get(`${environment.apiURL_Main + '/api/PromotionItemsPlans/GetPromotionPlansList/'
          + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
          .pipe(
            catchError(this.handleError)
          )    
      }
  }

  GetMainData()
  {
    debugger
    this.GetMainListPromotionItems().subscribe(result => {
      
      this.data = result;
      this.searchResultEvent.emit(result);
    },
    (error) => {
      console.error('Error occurred:', error);
    })
  }

  EmptySearch() { 
    this.showLoader = true;    
    this.searchCriteria.agentId = 0;
    this.searchCriteria.year = '';
    this.searchCriteria.countryId = 0;
    this.AgentId = -1;
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

   getCustomers(event: any){
    debugger
    const countryId = event.value === undefined ? event : event.value;
    if(countryId == 0)
      this.agentsList = this.allagentList;
    else
      this.agentsList = this.allagentList.filter(c => c.id == countryId || c.id == -1);
  }

}
