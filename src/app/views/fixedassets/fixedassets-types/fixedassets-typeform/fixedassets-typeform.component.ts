import { Component, Inject, OnInit } from '@angular/core';
import { FixedassetsTypelistComponent } from '../fixedassets-typelist/fixedassets-typelist.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { isThisSecond } from 'date-fns';
import { FixedassetsTypeService } from '../fixedassets-type.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DropDownModel } from 'app/shared/models/DropDownModel';
import { FixedAssetsTypeModel } from '../FixedAssetsTypeModel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fixedassets-typeform',
  templateUrl: './fixedassets-typeform.component.html',
  styleUrls: ['./fixedassets-typeform.component.scss']
})
export class FixedassetsTypeformComponent implements OnInit {
  FixedassetsTypeForm: FormGroup;
  public Data: FixedAssetsTypeModel = new FixedAssetsTypeModel();
  public MainTypeNameList: DropDownModel[];
  public selectedMainTypeName: Number = 0;
  public PaymentMethodList: DropDownModel[];
  public selectedPaymentMethod: Number = 0;
  public AccountsModelList: DropDownModel[];
  public selectedassetAccId: Number = 0;
  public selecteddepreriationAccId: Number = 0;
  public selectedaccumulatedDeprAccId: Number = 0;
  public selectedexpensesAccId: Number = 0;
  public selectedprofitLossAccId: Number = 0;
  disableSave: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<FixedassetsTypelistComponent>,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public router: Router,
    private FixedassetsTypeService: FixedassetsTypeService) { }

  ngOnInit(): void {
    this.FixedassetsTypeForm = this.formbulider.group({
      id: [0 || this.data.id],
      typeNameA: ['', [Validators.required, Validators.min(1)]],
      typeNameE: ['', [Validators.required, Validators.min(1)]],
      depreciationMethod: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],        // طريقة الحساب 
      depreciationPercentage: [0, [Validators.required, Validators.min(1)]],                         // نسبه الاهلاك 
      isMain: [false],                                                             // النوع الرئيسي 
      assetAccId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],     //حساب الاصل
      depreriationAccId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],    // حساب الاستهلاك
      accumulatedDeprAccId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],   // حساب مجمع الاستهلاك 
      expensesAccId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],  // حساب الصيانة
      profitLossAccId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]], // حساب الارباح والخسائر 
      note: [""],                                                          // ملاحظات
      mainTypeId: [0],
    });

    if (this.data.id == null || this.data.id == undefined || this.data.id === "") {
      this.router.navigate(['FixedAssetsType/FixedassetsTypelist']);
    }
    this.GetFixedassetsTypeformInfo();
  }


  GetFixedassetsTypeformInfo() {
    this.FixedassetsTypeService.getFixedAssetsTypeInfo(this.data.id).subscribe((result) => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['FixedAssetsType/FixedassetsTypelist']);
        this.dialogRef.close(false);
        return;
      }
      this.disableSave = false;
      this.MainTypeNameList = result.mainTypeList;
      this.PaymentMethodList = result.paymentMethodList;
      this.AccountsModelList = result.accountsModelList;

      this.Data = result;

      if (this.data.isNew == false) {
        this.FixedassetsTypeForm.patchValue(result);
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {

        this.selectedMainTypeName = this.Data.mainTypeId;
        this.selectedPaymentMethod = this.Data.depreciationMethod;
        this.selectedassetAccId = this.Data.assetAccId;
        this.selecteddepreriationAccId = this.Data.depreriationAccId;
        this.selectedaccumulatedDeprAccId = this.Data.accumulatedDeprAccId;
        this.selectedexpensesAccId = this.Data.expensesAccId;
        this.selectedprofitLossAccId = this.Data.profitLossAccId;
      });

    });
  }


  OnSaveForms() {
    debugger
    this.disableSave = true;
    this.FixedassetsTypeService.SaveFixedAssetsType(this.FixedassetsTypeForm.value).subscribe(() => {

      if (!this.data.isNew) {
        this.data.isNew = true
        this.data.id = 0
        this.alert.SaveSuccess();
        this.GetFixedassetsTypeformInfo();
        this.data.GetAllMainSystemsDefinitionList();
      }
      else {
        this.alert.SaveSuccess();
        this.GetFixedassetsTypeformInfo();
        this.data.GetAllMainSystemsDefinitionList()
      }
      this.disableSave = false;
    })
  }

  GetMainTypeInfo() {

    this.FixedassetsTypeService.getMainTypeInfo(this.FixedassetsTypeForm.value.mainTypeId).subscribe((result) => {

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {

        this.selectedPaymentMethod = this.Data.depreciationMethod;
        this.selectedassetAccId = this.Data.assetAccId;
        this.selecteddepreriationAccId = this.Data.depreriationAccId;
        this.selectedaccumulatedDeprAccId = this.Data.accumulatedDeprAccId;
        this.selectedexpensesAccId = this.Data.expensesAccId;
        this.selectedprofitLossAccId = this.Data.profitLossAccId;
      });
      this.Data = result;
    })
  }
}
