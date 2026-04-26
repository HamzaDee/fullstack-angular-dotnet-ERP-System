import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { ItemSetService } from 'app/views/app-inventory/items-sets/items-sets.service'; 
import { DropDownModel } from 'app/shared/models/DropDownModel';
import { ItemSequencesComponent } from './item-sequences/item-sequences.component';
import { ItemEntryVoucerSettings } from '../../../model/item-entry-voucer-settings.model';
import { InventoryTypeEnum } from 'app/shared/Enum/enum';
import { delay } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-voucher-terms',
  templateUrl: './voucher-terms.component.html',
  styleUrls: ['./voucher-terms.component.scss']
})
export class VoucherTermsComponent implements OnInit {

  @Input() termsVouchersFormData: any;
  @Input() itemEntryVoucerSettings: ItemEntryVoucerSettings;
  @Input() isViewMode: boolean = false;

  periodic = InventoryTypeEnum.Periodic;
  continuous = InventoryTypeEnum.Continuous;
  costCentersList: DropDownModel[] = [];
  itemsList: DropDownModel[] = [];
  storesList: DropDownModel[] = [];
  accountList: DropDownModel[] = [];
  invVouchersDtFormArray: FormArray;
  constructor(
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private alert: sweetalert,
    private itemSetService: ItemSetService,
  ) { }

  ngOnInit(): void {
    this.initializeTable();
  }

  checkViewMode(formGroup) {
    if (this.isViewMode) {
      formGroup.disable();
      this.invVouchersDtFormArray.disable();
    }
  }

  initializeTable() {
    this.storesList = this.termsVouchersFormData?.value?.storesList;
    this.accountList = this.termsVouchersFormData?.value?.accountList;
    this.itemsList = this.termsVouchersFormData?.value?.itemsList;
    this.costCentersList = this.termsVouchersFormData?.value?.costCentersList;
    this.invVouchersDtFormArray = this.formBuilder.array([]);
    debugger
    let invVouchersDtFormModels = this.termsVouchersFormData?.value?.invVouchersDtFormModels;
    if (invVouchersDtFormModels && invVouchersDtFormModels.length > 0) {
      invVouchersDtFormModels.forEach((invVouchersDt) => {
        const invVoucherDtForm = this.addNewFormGroup();
        invVouchersDt.expiryDate = invVouchersDt.expiryDate === null? null : formatDate( invVouchersDt.expiryDate  , "yyyy-MM-dd" ,"en-US")
        invVouchersDt.productDate = invVouchersDt.productDate === null? null : formatDate( invVouchersDt.productDate  , "yyyy-MM-dd" ,"en-US")
        invVoucherDtForm.patchValue(invVouchersDt);
        this.calculateTotal(invVoucherDtForm)

        this.invVouchersDtFormArray.push(invVoucherDtForm);

        this.checkViewMode(invVoucherDtForm);

      });
    } else {
      this.addNewRow();
    }
  }

  addNewRow() {
    if (!this.isViewMode) {
      const newFormGroup = this.addNewFormGroup();
      this.invVouchersDtFormArray.push(newFormGroup);
    }
  }

  addNewFormGroup(): FormGroup {
    return this.formBuilder.group({
      id: [0],
      hdid: [0],
      itemId: [0, [Validators.required, Validators.min(1)]],
      unitId: [0, [Validators.required, Validators.min(1)]],
      storeId: [0],
      qty: [null, Validators.required],
      price: [null, Validators.required],
      total: [null],
      cost: [null],
      costCenterId: [0],
      productDate: [null],//[new Date().toISOString().split('T')[0]],
      expiryDate: [null],//[new Date().toISOString().split('T')[0]],
      batchNo: [null],
      accountId: [0],
      unitsList: [[]],
      unitRate:[0],
      invItemSerialsFormModel: [[]],
    });
  }

  onChangeItem(itemId, formGroup) {
    this.itemSetService.GetItemUintbyItemId(itemId).subscribe(res => {
      formGroup.get('unitsList').setValue(res);
    });
  }

  getUnitFormGroupIndex(unitFormGroup: FormGroup): number {
    return this.invVouchersDtFormArray.controls.findIndex(control => control === unitFormGroup);
  }

  deleteRow(index: number) {
    if (!this.isViewMode && this.invVouchersDtFormArray.length > 1) {
      this.invVouchersDtFormArray.removeAt(index);
    }
  }

  openItemSequencesPopup(termVoucherForm: any) {
    debugger
    let itemId = termVoucherForm?.value.itemId;
    let quantity = termVoucherForm?.value?.qty * termVoucherForm?.value?.unitRate;
    let invVoucherDtid = termVoucherForm?.value?.hdid;
    if (itemId > 0 && +quantity) {
      let title = this.translateService.instant('itemSequencesForm');
      let dialogRef: MatDialogRef<any> = this.dialog.open(ItemSequencesComponent, {
        width: '1000px',
        height: '700px',
        disableClose: true,
        direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
        data: {
          title: title,
          itemId: itemId,
          invItemSerialsFormModel: termVoucherForm?.value?.invItemSerialsFormModel,
          itemsList: this.itemsList,
          quantity: quantity,
          invVoucherDtid: invVoucherDtid
        }
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const itemSerialsForms = result.itemSerialsForms.controls.map((formGroup: FormGroup) => formGroup.value);
          const formGroup = this.invVouchersDtFormArray.at(this.getUnitFormGroupIndex(termVoucherForm));          
          formGroup.get('invItemSerialsFormModel').setValue(itemSerialsForms);
        } else {
          return;
        }
      });

    }
    else {
      this.alert.ShowAlert('pleaseSelectItemAndQuantity','error');
    }

  }

  handleOnlyOneCheckedChange(currentFormGroup: FormGroup, controlName: string): void {
    const currentIsDefaultControl = currentFormGroup.get(controlName);

    if (currentIsDefaultControl.value) {
      this.invVouchersDtFormArray.controls.forEach((control: AbstractControl) => {
        const isDefaultControl = control.get(controlName);

        if (isDefaultControl !== currentIsDefaultControl) {
          isDefaultControl.setValue(false, { emitEvent: false });
        }
      });
    }
  }

  calculateTotal(formGroup: FormGroup) {
    const quantity = formGroup.get('qty').value;
    const cost = formGroup.get('price').value;
    let total = +quantity * +cost;
    formGroup.get('total').setValue(total.toFixed(3));
  }

  calculateAllTotal(): number {
    let grandTotal = 0;

    this.invVouchersDtFormArray.controls.forEach((formGroup: FormGroup) => {
      grandTotal += parseFloat(formGroup.get('total').value) || 0;
    });

    return grandTotal;
  }


  async onChangeUnit(unitId, formGroup: FormGroup) {
    debugger    
    if(formGroup.value.itemId == 0 || formGroup.value.itemId == null || formGroup.value.itemId == undefined)
    {
      return;
    }
    if (unitId!== 0 && unitId !== null && unitId !== undefined) {
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
      this.itemSetService.GetUnitRate(formGroup.value.itemId, unitId).subscribe(res => {
        debugger
        formGroup.get('unitRate').setValue(res);
        // formGroup.value.unitRate = res;
      }); 
    });      
    }

  }
}