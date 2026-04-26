import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { Observable, throwError } from 'rxjs';
import { ItemService } from '../../item.service';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

interface entryVData 
{
  itemNo:string;
  itemName:string;
  itemGroupId:any;
  categoryId:any;
  modelId:any;
  brandId:any;
}

@Component({
  selector: 'app-item-search-form',
  templateUrl: './item-search-form.component.html',
  styleUrls: ['./item-search-form.component.scss']
})
export class ItemSearchFormComponent implements OnInit {
  @Output() searchResultEvent: EventEmitter<any> = new EventEmitter();
  showLoader: boolean;
  searchCriteria: entryVData;
  data:any;
  oldMultiValue:string | string[];
  customersList: any;

  @Input() vGroupList : any; 
  @Input() vCategoriesList : any; 
  @Input() vModelsList : any; 
  @Input() vBrandIList : any; 
  @Input() itemNo : string; 
  @Input() itemName : string; 

  ItemGroupList: any;
  CategoriesList: any;
  ModelsList: any;
  BrandIsList: any;
  allcategoreis: any;
  @Input() voucherTypeEnum : any; 
  
  constructor(
            private formbulider: FormBuilder,
            private http: HttpClient,
            private jwtAuth: JwtAuthService,
            private itemService: ItemService,
  ) { }

  ngOnInit(): void {
    this.GetSearchFormValues();
  }


  GetSearchFormValues() {
    debugger
    this.ItemGroupList = this.vGroupList;
    this.CategoriesList = this.vCategoriesList;
    this.ModelsList= this.vModelsList;    
    this.BrandIsList= this.vBrandIList;    
    this.allcategoreis = this.CategoriesList;
    this.searchCriteria = {
      itemNo     : '',
      itemName   : '',
      itemGroupId: 0,
      categoryId : 0,
      modelId    : 0,
      brandId    : 0,
    };
  }

  getData(){
    debugger
    this.GeItemSearchList(this.searchCriteria).subscribe(result => {      
      debugger       
        this.data = result; 
        this.searchResultEvent.emit(result);
      },
      (error) => {
        console.error('Error occurred:', error);
      });  
  }

  public GeItemSearchList(searchCriteria): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }; 
    const url = `${environment.apiURL_Main}/api/Items/GetItemListBySearch/${this.jwtAuth.getLang()}/${this.jwtAuth.getCompanyId()}/${this.jwtAuth.getUserId()}/${this.voucherTypeEnum}`;
    return this.http.post<any>(url, JSON.stringify(searchCriteria), httpOptions)
   .pipe(
      catchError(this.handleError)
   ); 
  }


  EmptySearch(){
    this.showLoader = true;
    this.searchCriteria.itemNo = '';
    this.searchCriteria.itemName = '';
    this.GetSearchFormValues();
    this.GetMainData();
    this.showLoader = false;
  }

  GetMainData(){
    debugger
    this.GetItemList(this.voucherTypeEnum).subscribe(result => {
      debugger
      this.data = result;
      this.searchResultEvent.emit(result);
    },
    (error) => {
      console.error('Error occurred:', error);
    })
  }


  public GetItemList(voucherTypeEnum): Observable<any> 
  {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/Items/GetItemList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + voucherTypeEnum} `)
      .pipe(
        catchError(this.handleError)
      )
  }


  onChangeItemGroup(event){
    debugger
    if(event != null && event != undefined && event != 0)
    {
      this.CategoriesList = this.allcategoreis.filter(x => x.data1 == event);
    }
    else
      {
        this.CategoriesList = this.allcategoreis;
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
