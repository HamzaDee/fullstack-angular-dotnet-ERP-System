import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ItemsGroupService } from '../items-group.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { InventoryTypeEnum } from 'app/shared/Enum/enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-items-group-form',
  templateUrl: './items-group-form.component.html',
  styleUrls: ['./items-group-form.component.scss']
})
export class ItemsGroupFormComponent implements OnInit {
  ItemsGroupsForm: FormGroup;
  showLoader = false;
  titlePage: string;
  maxId: number;
  mainGroupNamesList: any[];
  categorysList: any[];
  discounsList: any[];
  taxsList: any[];
  storeAccsList: any[];
  costGoodsSoldAccsList: any[];
  purchaseAccsList: any[];
  salesAccsList: any[];
  dataList: any[];
  opType: string;
  periodic = InventoryTypeEnum.Periodic;
  continuous = InventoryTypeEnum.Continuous;
  inventoryType: number;
  inventoryAccType: number;
  disableAll: boolean = false;
  disableSave: boolean;
  disableIsMain: boolean;
  storesList: any;
  itemClassesList: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private itemsGroupService: ItemsGroupService,
    private alert: sweetalert,
    private translateService: TranslateService,
    private jwtAuth: JwtAuthService,
    public router: Router,
  ) { }
  UseTax: boolean;

  ngOnInit(): void {
    debugger
    setTimeout(() => {
      this.disableAll = this.data.ishidden;
      this.disableSave = false;
    });

    this.InitialItemsGroupsForm();
    if (this.data.id == undefined) {
      this.data.id = 0;
      this.GetMaxId()
    }
    debugger
    // if(this.data.id > 0)
    //   {
    //     this.opType = 'Edit';
    //   }
    //   else
    //   {
    //     this.opType = 'Add';
    //   }
    debugger
    this.opType = this.data.optype;
    this.GetInitailItemsGroups();
  }

  hasPermesion() {
    const isMain = this.ItemsGroupsForm.get('isMain').value;
    if (isMain) { return true; }
    else { return false; }
  }

  InitialItemsGroupsForm() {
    this.ItemsGroupsForm = this.formbulider.group({
      id: [0, Validators.required],
      companyId: [0],
      mainGroupName: [""],
      mainGroupId: [0],
      groupNameA: ['', Validators.required],
      groupNameE: ['', Validators.required],
      categoryId: [0],
      discountId: [0],
      taxId: [0],
      storeAccNo: [0],
      costGoodsSoldAccNo: [0],
      purchaseAccNo: [0],
      salesAccNo: [0],
      inventoryType: [0],
      note: [""],
      isActive: true,
      isMain: false,
      mainGroupNames: [null],
      categorys: [null],
      discouns: [null],
      taxs: [null],
      storeAccs: [null],
      costGoodsSoldAccs: [null],
      purchaseAccs: [null],
      salesAccs: [null],
      hasExpDate: false,
      storeId: [0],
      itemClassesIds: [""]
    });
  }

  GetMaxId() {
    debugger
    this.itemsGroupService.GetMaxIdItemsGroups(0).subscribe((result) => {
      this.maxId = result
    });
  }

  checkInventoryIdPre() {
    var invType = this.ItemsGroupsForm.get('inventoryType').value;
    if (invType == 123) {
      return true;
    }
    return false;

  }

  onCategorySelection(event: any) {
    this.ItemsGroupsForm.get('categoryId')?.setValue(event.value);
  }

  onMainCollectionSelection(event: any) {
    debugger
    var mainGroupIdTemp = this.ItemsGroupsForm.value.mainGroupId;
    this.itemsGroupService.GetInfoByMainGroupId(mainGroupIdTemp).subscribe((result) => {
      debugger
      if (result.categoryId == null || result.categoryId == undefined) {
        result.categoryId = 0;
      }
      if (result.taxId == null || result.taxId == undefined) {
        result.taxId = 0;
      }
      if (result.discountId == null || result.discountId == undefined) {
        result.discountId = 0;
      }
      if (result.storeAccNo == null || result.storeAccNo == undefined) {
        result.storeAccNo = 0;
      }
      if (result.costGoodsSoldAccNo == null || result.costGoodsSoldAccNo == undefined) {
        result.costGoodsSoldAccNo = 0;
      }
      if (result.purchaseAccNo == null || result.purchaseAccNo == undefined) {
        result.purchaseAccNo = 0;
      }
      if (result.salesAccNo == null || result.salesAccNo == undefined) {
        result.salesAccNo = 0;
      }
      if (result.storeId == null || result.storeId == undefined) {
        result.storeId = 0;
      }
      this.ItemsGroupsForm.get('id')?.setValue(result.id);
      this.ItemsGroupsForm.get('categoryId')?.setValue(result.categoryId);
      this.ItemsGroupsForm.get('discountId')?.setValue(result.discountId);
      this.ItemsGroupsForm.get('taxId')?.setValue(result.taxId);
      this.ItemsGroupsForm.get('storeAccNo')?.setValue(result.storeAccNo);
      this.ItemsGroupsForm.get('costGoodsSoldAccNo')?.setValue(result.costGoodsSoldAccNo);
      this.ItemsGroupsForm.get('purchaseAccNo')?.setValue(result.purchaseAccNo);
      this.ItemsGroupsForm.get('salesAccNo')?.setValue(result.salesAccNo);
      this.ItemsGroupsForm.get('isActive')?.setValue(true);
      this.ItemsGroupsForm.get('hasExpDate')?.setValue(result.hasExpDate);
      this.ItemsGroupsForm.get('storeId')?.setValue(result.storeId);
      this.ItemsGroupsForm.get('itemClassesIds')?.setValue(result.itemClassesIds);
    });
  }

  GetInitailItemsGroups() {
    debugger
    this.itemsGroupService.InitailItemsGroups(this.data.id, this.data.optype).subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ItemsGroups/ItemsGroupsList']);
        this.dialogRef.close(false);
        return;
      }
      console.log(result)
      this.dataList = result[0];
      console.log(this.dataList)
      this.categorysList = result.categorys;
      this.taxsList = result.taxes;
      this.discounsList = result.discouns;
      this.salesAccsList = result.salesAccs;
      this.storeAccsList = result.storeAccs;
      this.purchaseAccsList = result.purchaseAccs;
      this.mainGroupNamesList = result.mainGroupNames;
      this.costGoodsSoldAccsList = result.costGoodsSoldAccs;
      this.ItemsGroupsForm.patchValue(result);
      this.inventoryType = result.inventoryType;
      this.inventoryAccType = result.inventoryAccType;
      this.storesList = result.stores;
      this.itemClassesList = result.itemClassesList;

      if (this.data.id == 0) {
        this.ItemsGroupsForm.get('id')?.setValue(result.id);
        result.isActive = true;
        this.ItemsGroupsForm.get("isActive").setValue(result.isActive);
      }
      if (this.data.id > 0) {
        if (result.isMain) {
          this.disableIsMain = true;
        }
        else {
          this.disableIsMain = false;
        }
      }

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        if (result.categoryId == null || result.categoryId == undefined) {
          result.categoryId = 0;
        }
        if (result.taxId == null || result.taxId == undefined) {
          result.taxId = 0;
        }
        if (result.discountId == null || result.discountId == undefined) {
          result.discountId = 0;
        }
        if (result.storeAccNo == null || result.storeAccNo == undefined) {
          result.storeAccNo = 0;
        }
        if (result.costGoodsSoldAccNo == null || result.costGoodsSoldAccNo == undefined) {
          result.costGoodsSoldAccNo = 0;
        }
        if (result.purchaseAccNo == null || result.purchaseAccNo == undefined) {
          result.purchaseAccNo = 0;
        }
        if (result.salesAccNo == null || result.salesAccNo == undefined) {
          result.salesAccNo = 0;
        }
        if (result.storeId == null || result.storeId == undefined) {
          result.storeId = 0;
        }
        if (result.itemClassesIds == null || result.itemClassesIds == undefined) {
          result.itemClassesIds = "";
        }

        this.ItemsGroupsForm.get("storeAccNo").setValue(result.storeAccNo);
        this.ItemsGroupsForm.get("salesAccNo").setValue(result.salesAccNo);
        this.ItemsGroupsForm.get("purchaseAccNo").setValue(result.purchaseAccNo);
        this.ItemsGroupsForm.get("mainGroupId").setValue(result.mainGroupId);
        this.ItemsGroupsForm.get("discountId").setValue(result.discountId);
        this.ItemsGroupsForm.get("costGoodsSoldAccNo").setValue(result.costGoodsSoldAccNo);
        this.ItemsGroupsForm.get("categoryId").setValue(result.categoryId);
        this.ItemsGroupsForm.get("isActive").setValue(result.isActive);
        this.ItemsGroupsForm.get('hasExpDate')?.setValue(result.hasExpDate);
        this.ItemsGroupsForm.get("taxId").setValue(result.taxId);
        this.ItemsGroupsForm.get('storeId')?.setValue(result.storeId);
        this.UseTax = result.useTax;

        if (this.data.id > 0) {
          var pm = result.itemClassesIds.split(',').map(Number)
          this.ItemsGroupsForm.get("itemClassesIds").setValue(pm);
        }
      });
    });
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    const formData = new FormData();

    formData.append('id', this.ItemsGroupsForm.value.id)
    formData.append("companyId", this.jwtAuth.getCompanyId())
    if (this.ItemsGroupsForm.value.mainGroupId == null) {
      this.ItemsGroupsForm.get("mainGroupId").setValue(0);
    }
    if (this.ItemsGroupsForm.value.taxId == null) {
      this.ItemsGroupsForm.get("taxId").setValue(0);
    }

    let itemClassesIdsArray = this.ItemsGroupsForm.value.itemClassesIds;
    if (Array.isArray(itemClassesIdsArray)) {
      let validitemClasses = itemClassesIdsArray
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let itemClassesString = validitemClasses.join(',');
      this.ItemsGroupsForm.get("itemClassesIds").setValue(itemClassesString);
      formData.append("itemClassesIds", itemClassesString);
    } else {
      console.error('itemClassesIds is not an array');
    }

    formData.append("mainGroupId", this.ItemsGroupsForm.value.mainGroupId);
    formData.append("groupNameA", this.ItemsGroupsForm.value.groupNameA);
    formData.append("groupNameE", this.ItemsGroupsForm.value.groupNameE);
    formData.append("categoryId", this.ItemsGroupsForm.value.categoryId);
    formData.append("discountId", this.ItemsGroupsForm.value.discountId);
    formData.append("storeAccNo", this.ItemsGroupsForm.value.storeAccNo);
    formData.append("costGoodsSoldAccNo", this.ItemsGroupsForm.value.costGoodsSoldAccNo);
    formData.append("purchaseAccNo", this.ItemsGroupsForm.value.purchaseAccNo ?? 0);
    formData.append("salesAccNo", this.ItemsGroupsForm.value.salesAccNo);
    formData.append("taxId", this.ItemsGroupsForm.value.taxId);
    formData.append("isMain", this.ItemsGroupsForm.value.isMain);
    formData.append("isActive", this.ItemsGroupsForm.value.isActive);
    formData.append("note", this.ItemsGroupsForm.value.note);
    formData.append("hasExpDate", this.ItemsGroupsForm.value.hasExpDate);
    formData.append("storeId", this.ItemsGroupsForm.value.storeId);

    // var invType = this.ItemsGroupsForm.get('inventoryType').value;
    // if (invType == 123) {
    //   var valueOfPurchaseAccNo = this.ItemsGroupsForm.get('purchaseAccNo').value;
    //   var valueOfSalesAccNo = this.ItemsGroupsForm.get('salesAccNo').value;
    //   if (valueOfPurchaseAccNo == 0 || valueOfSalesAccNo == 0) {
    //     this.alert.ShowAlert('pleaseFillTheRequiredFields','error');
    //     this.disableSave = false;
    //     return;
    //   }
    // } 
    // else if (invType == 124) {
    //   var valueOfCostGoodsSoldAccNo = this.ItemsGroupsForm.get('costGoodsSoldAccNo').value;
    //   var valueOfStoreAccNo = this.ItemsGroupsForm.get('storeAccNo').value;
    //   if(this.inventoryType !== this.periodic && this.inventoryAccType === 179 &&  (valueOfCostGoodsSoldAccNo <= 0 || valueOfStoreAccNo <= 0) ){
    //     this.alert.ShowAlert("EnterAccounts","error");
    //     this.disableSave = false;
    //     return;
    //   }
    // }
    try {
      this.itemsGroupService.AddItemsGroups(formData)
        .subscribe((res) => {
          if (res) {

          }
          debugger
          this.alert.SaveSuccess();
          this.GetMaxId();
          this.GetInitailItemsGroups();
          this.data.GetAllItemsGroups();
          this.disableSave = false;
          if (this.opType == 'Edit') {
            this.dialogRef.close(false);
          }
        });
    } catch {
      this.alert.SaveFaild();
      this.disableSave = false;
    }
    //this.dialogRef.close();


  }
}
