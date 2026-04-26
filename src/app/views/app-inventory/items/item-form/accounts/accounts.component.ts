import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryTypeEnum } from 'app/shared/Enum/enum';
import { LinkingAccountItemGruop } from '../../model/linking-account-item-gruop'; 

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styles: [
  ]
})
export class AccountsComponent implements OnInit {
  accountForm: FormGroup;
  salesList: any
  purchasesList: any
  costGoodsSoldList: any
  storesList: any
  periodic = InventoryTypeEnum.Periodic;
  continuous = InventoryTypeEnum.Continuous;
  inventoryType: number;
  inventoryAccType: number;
  @Input() accountFormData;
  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.inialiazeForm();
  }

  setLinkingAccountItemGruop(linkingAccountItemGruop: LinkingAccountItemGruop) {
    if (linkingAccountItemGruop) {
      this.accountForm.get('storeAccNo').setValue(linkingAccountItemGruop.storeAccNo);
      this.accountForm.get('costGoodsSoldAccNo').setValue(linkingAccountItemGruop.costGoodsSoldAccNo);
      this.accountForm.get('purchaseAccNo').setValue(linkingAccountItemGruop.purchaseAccNo);
      this.accountForm.get('salesAccNo').setValue(linkingAccountItemGruop.salesAccNo);
    }
  }

  inialiazeForm() {
    this.accountForm = this.formBuilder.group({
      storeAccNo: [0],
      costGoodsSoldAccNo: [0],
      purchaseAccNo: [0],
      salesAccNo: [0],
    })
    this.getInialiazeForm();
  }

  getInialiazeForm() {
    if (this.accountFormData) {
      debugger
      this.accountForm.patchValue(this.accountFormData);
      this.inventoryType = this.accountFormData.inventoryType;
      this.inventoryAccType = this.accountFormData.inventoryAccType;  
      this.salesList = this.accountFormData.salesList;
      this.purchasesList = this.accountFormData.purchasesList;
      this.costGoodsSoldList = this.accountFormData.costGoodsSoldList;
      this.storesList = this.accountFormData.storesList;
      this.setAccountValidators(this.accountFormData.inventoryType);
      if(this.accountFormData.storeAccNo == null || this.accountFormData.storeAccNo == undefined)
        {
          this.accountForm.get("storeAccNo").setValue(0);
        }
      if(this.accountFormData.costGoodsSoldAccNo == null || this.accountFormData.costGoodsSoldAccNo == undefined)
        {
          this.accountForm.get("costGoodsSoldAccNo").setValue(0);
        }
      if(this.accountFormData.purchaseAccNo == null || this.accountFormData.purchaseAccNo == undefined)
        {
          this.accountForm.get("purchaseAccNo").setValue(0);
        }
      if(this.accountFormData.salesAccNo == null || this.accountFormData.salesAccNo == undefined)
        {
          this.accountForm.get("salesAccNo").setValue(0);
        }
    }
  }

  setAccountValidators(inventoryType) {
    debugger
    if (inventoryType == InventoryTypeEnum.Continuous ) {
      // this.accountForm.get('costGoodsSoldAccNo').setValidators(Validators.required);
      // this.accountForm.get('storeAccNo').setValidators(Validators.required);
    }
    else if (inventoryType == InventoryTypeEnum.Periodic) {
      // this.accountForm.get('salesAccNo').setValidators([Validators.required, Validators.min(1)]);
      // this.accountForm.get('purchaseAccNo').setValidators([Validators.required, Validators.min(1)]);
    }
  }
}