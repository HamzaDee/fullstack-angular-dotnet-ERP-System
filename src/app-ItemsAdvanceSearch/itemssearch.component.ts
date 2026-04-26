import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Observable, throwError } from 'rxjs';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders , HttpParams } from "@angular/common/http";
import { catchError } from 'rxjs/operators';
import { environment } from "environments/environment";
import { SelectedItemsService } from './itemssearh.service';
import { sweetalert } from 'sweetalert';


@Component({
  selector: 'app-itemssearch',
  templateUrl: './itemssearch.component.html',
  styleUrls: ['./itemssearch.component.scss']
})
export class ItemssearchComponent implements OnInit {

  selectedRowIndex: number | null = null; 
  public CostcenterTransForm: FormGroup;
  storeId: any; 
  itemNo:any;
  public TitlePage: string;
  itemsBatchesList: any[];
  selectedRawMaterialList: any[] = [];
  hidden:boolean = false;
  selectedItem: any = null;

  constructor
          (
            @Inject(MAT_DIALOG_DATA) public data: any,
            public dialogRef: MatDialogRef<any>,
            public routePartsService: RoutePartsService,
            public router: Router,
            private title: Title,
            private translateService: TranslateService,
            private formbulider: FormBuilder,
            private egretLoader: AppLoaderService,
            private appCommonserviceService : AppCommonserviceService,
            private jwtAuth: JwtAuthService,
            private alert: sweetalert,
            private http: HttpClient,
            private selectedItemsService: SelectedItemsService,
            
          ) { }

  ngOnInit(): void 
  {
    debugger
    this.storeId = this.data.store;
    this.itemNo = this.data.itemId;    
    this.hidden = false;
    this.SetTitlePage();        
    this.GetItemsBatches(this.storeId,this.itemNo);

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsQuery');
    this.title.setTitle(this.TitlePage);
  }

  GetItemsBatches(store:number,item:string) {
    debugger
    setTimeout(() => {
      this.itemsBatchesList = [];
      debugger

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.GetItems(store,item,).subscribe((result) => {
        debugger
        // this.itemsBatchesList = result; 
        this.itemsBatchesList = result.map((item, index) => ({ ...item, row: index + 1 }));
        debugger 
        // this.itemsBatchesList = result.map(item => ({ ...item, isSelected: false }));      
        this.egretLoader.close();
      });
    });
  }

    public GetItems( 
      storeId:number,
      itemId: string,
     
    ): Observable<any> {
      debugger
      const lang = this.jwtAuth.getLang();
      const companyId = this.jwtAuth.getCompanyId();
      const userId = this.jwtAuth.getUserId();  
      const params = new HttpParams()
        .set('StoreId', storeId) 
        .set('ItemId', itemId)
           
      return this.http.get(`${environment.apiURL_Main}/api/InventoryVouchers/GetItemsSearch/${lang}/${companyId}/${userId}`, { params })
        .pipe(
          catchError(this.handleError)
        );
    }  


 
    onRowClick(item: any) {
      debugger
      if (this.selectedItem === item) {
          // If the clicked item is already selected, deselect it
          this.selectedItem = null;
      } else {
          // If a different item is clicked, update the selection
          this.selectedItem = item;
      }
  
      console.log('onRowClick', this.selectedItem); // Log to console for debugging
  }



  OpenPO(){
    debugger
    if(this.selectedRawMaterialList.length>0){
      localStorage.setItem('items',JSON.stringify(this.selectedRawMaterialList));
      this.selectedItemsService.updateSelectedItems(this.selectedRawMaterialList);
      this.closeDialog();
      // this.selectedItemsService.updateSelectedItems(null);
    }
    else{
      this.alert.ShowAlert("SelectItems",'error');
    }
    
  }



//   isSelected(item: any) {    
//     this.selectedItem = item;
// }

onSingleCheckboxChange(item: any): void {
  // If same item clicked again → unselect
  debugger
  if (
    this.selectedRawMaterialList.length === 1 && this.selectedRawMaterialList[0] != item
  ) {
    this.selectedRawMaterialList = [];
    return;
  }

  // Force single selection
  this.selectedRawMaterialList = [item];
}

closeDialog() {
  // You can optionally pass a result to be returned when the dialog is closed
  this.dialogRef.close(/* your result here */);
}



  private handleError(error: HttpErrorResponse) {
      debugger
      if (error.error instanceof ErrorEvent) {
        console.log(error.error.message)
      } else {
        console.log(error.status)
      }
      return throwError(
        console.log('Something is wrong!'));
    }
}
