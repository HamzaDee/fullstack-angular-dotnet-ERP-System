import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { VoucherIterationService } from '../voucher-iteration.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DatePipe, formatDate } from '@angular/common';
import { T } from '@angular/cdk/keycodes';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'

@Component({
  selector: 'app-voucheriterationform',
  templateUrl: './voucheriterationform.component.html',
  styleUrls: ['./voucheriterationform.component.scss']
})
export class VoucheriterationformComponent implements OnInit {
  voucheriterationForm: FormGroup;
  selectedrep: any;
  repeatList: any;
  DateNow: Date = new Date();
  isdate: number;
  isnumber: number;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  disableAll: boolean = false;
  voucherTypeList: any;
  // public fromDate: any = (new Date()).toISOString().substring(0, 10);
  // public toDate: any = (new Date()).toISOString().substring(0, 10);
  disabledDate: boolean = false;
  disablediterationNo: boolean = false;
  voucherTypesList:any;
  accountsList:any;
  voucherIterationDTList: any[] = [];
  decimalPlaces: number = 3;
  loading:boolean;
  constructor
    (
      @Inject(MAT_DIALOG_DATA) public data: any,
      private formbulider: FormBuilder,
      public dialogRef: MatDialogRef<any>,
      private IterationService: VoucherIterationService,
      // public validatorsService:ValidatorsService,
      private alert: sweetalert,
      private jwtAuth: JwtAuthService,
      private entryvouchersService: AppEntryvouchersService,
      private appCommonserviceService: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    debugger

    setTimeout(() => {
      this.disableAll = this.data.ishidden;
    });


    if (this.data.Add == true) {
      this.GetVoucherIterationInfo();

    } else {
      this.GetVoucherIteration();
    }

    this.VoucherIterationInitialForm()
  }

  VoucherIterationInitialForm() {
    this.voucheriterationForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      startDate: [''  ],//this.fromDate,[Validators.required, Validators.min(1)]
      endDate: [''],//this.toDate,[Validators.required, Validators.min(1)]
      iterationNo: [0],
      iterationType: [0, [Validators.required, Validators.min(1)]],
      every: [0, [Validators.required, Validators.min(1)]],
      status: [0],
      dateis: [null],
      numberis: [null],
      voucherHDId: [0],
      voucherName: [""],
      voucherNo: [""],
      voucherTypeId:[0,[Validators.required, Validators.min(1)]],
      voucherIterationDTModels:[null,[Validators.required, Validators.min(2)]]
    });
  }

  GetVoucherIterationInfo() {
    debugger
    var lang = this.jwtAuth.getLang();

    this.IterationService.GetVoucherIretationInfo(this.data.id).subscribe((result) => {
      debugger
      this.repeatList = result.reapeatType;
      this.voucheriterationForm.patchValue(result);
      this.voucherTypeList = result.voucherTypeList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.voucherNameA : item.voucherNameE,
        isDefault: item.isDefault,
        branchId: item.branchId,
        preventChangeSerial: item.preventChangeSerial,
        preventChangeDate: item.preventChangeDate,
        preventChangeBranch: item.preventChangeBranch,
        serialType: item.serialType,
        currencyId: item.currencyId,
        serialByMonth: item.serialByMonth,
        allowAccRepeat: item.allowAccRepeat,
        storeId: item.storeId,
        printAfterSave: item.printAfterSave
      }));
      this.accountsList = result.accountList;
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        if(this.data.id > 0)
        {
            this.voucheriterationForm.get('voucherTypeId').setValue(result.voucherTypeId);
            this.voucheriterationForm.get('voucherNo').setValue(result.voucherNo);
            this.voucheriterationForm.get('voucherHDId').setValue(this.data.id);
            this.voucheriterationForm.get('status').setValue(66);
            this.voucheriterationForm.get('id').setValue(0);  
            const now = new Date();
            const formattedDate = formatDate(now, 'yyyy-MM-dd', 'en-US');
            this.voucheriterationForm.get('startDate')?.setValue(formattedDate);
            this.voucheriterationForm.get('endDate')?.setValue(formattedDate); 
            result.iterationType ??= 0;
            this.voucheriterationForm.get('iterationType').setValue(result.iterationType); 
            if (result.iterationNo !== null && result.iterationNo !== 0 && result.iterationNo !== undefined) {
                this.isdate = 0;
                this.isnumber = 1;
              }
              else {
                this.isdate = 1;
                this.isnumber = 0;
              }
            if(result.voucherIterationDTModels.length > 0)
              {
                this.voucherIterationDTList = result.voucherIterationDTModels
                this.voucheriterationForm.get("voucherIterationDTModels").setValue(this.voucherIterationDTList)          
              } 
        }
        else
          {
            this.voucheriterationForm.get('voucherTypeId').setValue(0);
            this.voucheriterationForm.get('voucherNo').setValue(0);
            this.voucheriterationForm.get('voucherHDId').setValue(0);
            const now = new Date();
            const formattedDate = formatDate(now, 'yyyy-MM-dd', 'en-US');
            this.voucheriterationForm.get('startDate')?.setValue(formattedDate);
            this.voucheriterationForm.get('endDate')?.setValue(formattedDate);  
            this.isdate = 1;
          }
     
      });
    });
  }

  GetVoucherIteration() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.IterationService.GetVoucherIterationById(this.data.id).subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.dialogRef.close(false)
        return;
      }
      debugger
      this.voucherTypeList = result.voucherTypeList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.voucherNameA : item.voucherNameE,
        isDefault: item.isDefault,
        branchId: item.branchId,
        preventChangeSerial: item.preventChangeSerial,
        preventChangeDate: item.preventChangeDate,
        preventChangeBranch: item.preventChangeBranch,
        serialType: item.serialType,
        currencyId: item.currencyId,
        serialByMonth: item.serialByMonth,
        allowAccRepeat: item.allowAccRepeat,
        storeId: item.storeId,
        printAfterSave: item.printAfterSave
      }));
      this.repeatList = result.reapeatType;
      this.accountsList = result.accountList;
      if(result.voucherIterationDTModels.length > 0)
        {
          this.voucherIterationDTList = result.voucherIterationDTModels
          this.voucheriterationForm.get("voucherIterationDTModels").setValue(this.voucherIterationDTList)          
        }

      this.voucheriterationForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.voucheriterationForm.get("startDate").setValue(formatDate(result.startDate, "yyyy-MM-dd", "en-US"))
        if (result.endDate !== null) {
          this.voucheriterationForm.get("endDate").setValue(formatDate(result.endDate, "yyyy-MM-dd", "en-US"))
        }
        this.voucheriterationForm.get("iterationNo").setValue(result.iterationNo)
        this.voucheriterationForm.get("iterationType").setValue(result.iterationType)
        this.voucheriterationForm.get("every").setValue(result.every)
        this.voucheriterationForm.get("status").setValue(result.status)
        this.voucheriterationForm.get("voucherHDId").setValue(result.voucherHDId)
        this.voucheriterationForm.get("voucherTypeId").setValue(result.voucherTypeId)
        this.voucheriterationForm.get('voucherNo').setValue(result.voucherNo);
        if (result.iterationNo !== null && result.iterationNo !== 0) {
          this.isdate = 0;
          this.isnumber = 1;
        }
        else {
          this.isdate = 1;
          this.isnumber = 0;
        }
        // this.selectedrep= result.status;
      });
    });
  }

  OnSaveForms() {
    debugger
    let stopExecution = false;
    var index = 0;
    if(this.voucherIterationDTList.length < 2)
      {
        this.alert.ShowAlert("PleaseInsertAtLeastTowRowsToCompleteTheSave","error")
        stopExecution = true;
        return false;
      }
    this.voucherIterationDTList.forEach(element => {
      if (element.debit == "" || element.debit == null) {
        element.debit = 0;
      }
      if (element.credit == "" || element.credit == null) {
        element.credit = 0;
      }
      if (element.accountId <= 0 || ((element.debit === '' || element.debit === null || element.debit <= 0) && (element.credit === '' || element.credit === null || element.credit <= 0))) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        return false;
      }
      element.index = index.toString();
      index++;
    })
    let debitTotal = this.voucherIterationDTList.reduce((sum, item) => sum + parseFloat(item.debit), 0);
    let creditTotal = this.voucherIterationDTList.reduce((sum, item) => sum + parseFloat(item.credit), 0);
    if (debitTotal != creditTotal) {
      this.alert.ShowAlert("msgUnbalancedDebitCredit", 'error');
      stopExecution = true;
      return false;
    }
    if (stopExecution) {
      return;
    }
    if (this.isdate) {
      this.voucheriterationForm.value.iterationNo = 0;
    }
    if (this.voucheriterationForm.value.endDate == null || this.voucheriterationForm.value.endDate == "dd/MM/yyyy") {
      this.voucheriterationForm.value.endDate = this.DateNow;
    }
    const formvalues = this.voucheriterationForm.value;
    if ((this.isdate && (formvalues.endDate == null || formvalues.endDate === '')) || (this.isnumber && (formvalues.iterationNo == null || formvalues.iterationNo === 0))) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      // stopExecution = true;
      return false;
    }

    if (this.voucheriterationForm.value.startDate > this.voucheriterationForm.value.endDate) {
      this.alert.ShowAlert("ToDateValidation", 'error');
      return false;
    }

    this.voucheriterationForm.value.companyId = this.jwtAuth.getCompanyId();

    this.IterationService.EditVoucherIretation(this.voucheriterationForm.value)
      .subscribe(() => {
        debugger
        this.alert.SaveSuccess();
        this.data.GetVoucheriterationListFromParent();
        this.dialogRef.close();
        
      })
  }

  isdateChange() {
    debugger
    if (this.isdate) {
      this.isnumber = 0;
      this.isdate = 1
      this.voucheriterationForm.get("iterationNo").setValue(0);
      this.disabledDate = false;
      this.disablediterationNo = true;
    }
  }

  isnumberChange() {
    debugger
    if (this.isnumber) {
      this.isdate = 0;
      this.isnumber = 1;
      this.voucheriterationForm.get("endDate").setValue('dd/MM/yyyy');
      this.disabledDate = true;
      this.disablediterationNo = false;

    }
  }

  validateEndDate(control: AbstractControl): ValidationErrors | null {
    const endDateValue = control.value;
    if (endDateValue === null || endDateValue === '') {
      return null; // Allow empty endDate
    }

    if (isNaN(Date.parse(endDateValue))) {
      return { invalidDate: true };
    }

    return null;
  }

  calculateSum(type) {
    if (type == 0) {
      return this.formatCurrency(this.voucherIterationDTList.reduce((sum, item) => {
        const debit = parseFloat(item.debit) || 0;
        const credit = parseFloat(item.credit) || 0;
        return sum + debit - credit;
      }, 0));
    } else if (type == 1) {
      return this.formatCurrency(this.voucherIterationDTList.reduce((sum, item) => {
        const debit = parseFloat(item.debit) || 0;
        return sum + debit;
      }, 0));
    } else if (type == 2) {
      return this.formatCurrency(this.voucherIterationDTList.reduce((sum, item) => {
        const credit = parseFloat(item.credit) || 0;
        return sum + credit;
      }, 0));
    }
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  AddNewLine() {
    this.voucherIterationDTList.push(
      {
        accountId: 0,
        debit: "",
        credit: "",
        note: "",
        index: ""
      });
    this.voucheriterationForm.get("voucherIterationDTModels").setValue(this.voucherIterationDTList);
  }

  onDebitChange(row: any) {
    if (row.debit) {
      row.credit = 0;
    }
  }

  onCreditChange(row: any) {
    if (row.credit) {
      row.debit = 0;
    }
  }

  formatAmt(row: any, type: number) 
  {
    debugger
    if (type == 0)
      row.debit = row.debit.toFixed(this.decimalPlaces);
    else
      row.credit = row.credit.toFixed(this.decimalPlaces);
  }

  isOneEmpty(row: any) {
    if ((row.debit === '' || row.debit === null || row.debit <= 0) && (row.credit === '' || row.credit === null || row.credit <= 0)) {
      return true;
    }
    else {
      return false;
    }
  }

   deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.voucherIterationDTList.splice(rowIndex, 1);
    }
    this.voucheriterationForm.get("voucherIterationDTList").setValue(this.voucherIterationDTList);
  }

}

