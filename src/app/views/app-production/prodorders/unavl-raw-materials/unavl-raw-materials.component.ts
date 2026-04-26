import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProdordersService } from '../prodorders.service'; 
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RawMaterialsSuppliersComponent } from '../raw-materials-suppliers/raw-materials-suppliers.component';
import { sweetalert } from 'sweetalert';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-unavl-raw-materials',
  templateUrl: './unavl-raw-materials.component.html',
  styleUrls: ['./unavl-raw-materials.component.scss']
})
export class UnavlRawMaterialsComponent implements OnInit {
  RawMaterialForm: FormGroup;
  public TitlePage: string;
  vendorsList: any[];
  RawMaterialList: any[] = [];
  selectedRawMaterialList: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private appCommonserviceService : AppCommonserviceService,
    private prodordersService: ProdordersService,
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
  ) { }

  ngOnInit(): void {
    this.InitiailRawMaterialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('UnavlItems');
    this.title.setTitle(this.TitlePage);
  }

  InitiailRawMaterialForm() { 
    debugger;
    const requests = this.data.itemsList.map(element =>
      this.prodordersService.GetItemRawMaterials(element.itemNo).pipe(
        map(result => result.filter(c => c.qty * element.manFactQty > c.avlQty)
          .map(e => ({
            ...e,
            reqQty: e.qty * element.manFactQty
          }))
        )
      )
    );
  
    forkJoin(requests).subscribe((responses: any[][]) => { 
      // Flatten the array of arrays
      this.RawMaterialList = responses.reduce((acc, curr) => acc.concat(curr), []);
      
      // Log the full RawMaterialList to ensure all data is there before unifying
      console.log('Full RawMaterialList:', this.RawMaterialList);
  
      // Unify duplicate items by summing quantities
      const unifiedMaterials = this.RawMaterialList.reduce((acc, item) => {
        const existingItem = acc.find(i => i.itemNo === item.itemNo && i.Itemname === item.Itemname);
        if (existingItem) {
          existingItem.reqQty += item.reqQty;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, []);
  
      // Log unifiedMaterials to check if the grouping is correct
      console.log('Unified RawMaterialList:', unifiedMaterials);
  
      // Assign the unified list back to RawMaterialList
      this.RawMaterialList = unifiedMaterials;
    });
  }

  SelectSupplier(itemList){
    debugger
    let title = this.translateService.instant('SuppliersList');
    let dialogRef: MatDialogRef<any> = this.dialog.open(RawMaterialsSuppliersComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title,itemNo: itemList.itemNo, companyid: this.jwtAuth.getCompanyId()}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          itemList.supplierName = res.dealerName;
          itemList.supplierId = res.dealerId;
          itemList.cost = res.price;
          return;
        }
      })
  }

  OpenPO(){
    debugger
    if (this.selectedRawMaterialList.length > 0) {
      const itemsBySupplier = this.selectedRawMaterialList.reduce((acc, item) => {
        if (!acc[item.supplierId]) {
          acc[item.supplierId] = [];
        }
        acc[item.supplierId].push(item);
        return acc;
      }, {});
    
      Object.keys(itemsBySupplier).forEach(supplierId => {
        const items = itemsBySupplier[supplierId];
        const uniqueKey = `items_${supplierId}`;
        localStorage.setItem(uniqueKey, JSON.stringify(items));
        const url = `ProdOrder/PurorderForm?opType=createPO&storageKey=${uniqueKey}`;
        window.open(url, '_blank');
      });
    }    
    else{
      this.alert.ShowAlert("SelectItems",'error');
    }
    
  }

  calculateSum(){
      return this.RawMaterialList.reduce((sum, item) => sum + parseFloat(item.amount), 0); 
  }
}


