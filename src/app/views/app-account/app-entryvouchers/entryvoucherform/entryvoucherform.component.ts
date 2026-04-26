import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { AppEntryvouchersService } from '../app-entryvouchers.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CostcentertransComponent } from '../../costcentertrans/costcentertrans.component';
import { ProjectstransComponent } from '../../projectstrans/projectstrans.component';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-entryvoucherform',
  templateUrl: './entryvoucherform.component.html',
  styleUrls: ['./entryvoucherform.component.scss']
})
export class EntryvoucherformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  showsave: boolean;
  EntryVoucherAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  accountsList: any;
  currencyList: any;
  paymentTypeList: any;
  accVouchersDTsList: any[] = [];
  voucherTypeList: any;
  branchesList: any;
  costCenterPolicyList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  costcenterList: any;
  subledgerList:any;
  projectsList: any;
  voucherId: any;
  decimalPlaces: number;
  voucherNo: number = 0;
  disableAll: boolean = false;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  useCostCenter: boolean;
  UseProjects: boolean;
  UseTax: boolean;
  defaultCurrencyId: number;
  allowAccRepeat: any;
  // BudgetEdit
  NoteBalance: any;
  NoteAlert: any;
  NotePrevenet: any;
  showBalance: boolean;
  showAlert: boolean;
  showPrevent: boolean;
  Balance: any;
  BudgetAmount: number;
  //end
  disableCurrRate: boolean;
  Lang: string;
  disableSave: boolean;
  disableVouchertype: boolean = false;
  newDate: any;
  CompanyName: string;
  semesterList: any;

  headers = [
    { field: 'accountId', label: this.translateService.instant('AccountNumber') },
    { field: 'debit', label: this.translateService.instant('Debit') },
    { field: 'credit', label: this.translateService.instant('Credit') },
    { field: 'note', label: this.translateService.instant('Notes') },
  ];
  constructor(
    private readonly title: Title,
    private readonly jwtAuth: JwtAuthService,
    private readonly alert: sweetalert,
    private readonly entryvouchersService: AppEntryvouchersService,
    private readonly translateService: TranslateService,
    public readonly router: Router,
    private readonly formbulider: FormBuilder,
    public readonly routePartsService: RoutePartsService,
    private readonly http: HttpClient,
    private readonly appCommonserviceService: AppCommonserviceService,
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.CompanyName = window.localStorage.getItem('companyName');
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
    }
    else if (this.voucherNo > 0) {
      this.voucherId = 0;
      this.opType = 'Add';
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
    }

    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['EntryVouchers/EntryVouchersList']);
    }
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    this.InitiailEntryVoucherForm();
    this.GetInitailEntryVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('EntryVoucher');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.EntryVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      isCanceled: [false],
      isPosted: [false],
      note: [""],
      branchId: [null],
      amount: [0],
      status: [null],
      userId: [0],
      isDue: [false],
      accVouchersDTModelList: [null, [Validators.required, Validators.minLength(1)]],
      costCenterTranModelList: [null],
      projectTransModelList: [null],
      accVouchersDocModelList: [null]
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailEntryVoucher() {
    var lang = this.jwtAuth.getLang();
    this.entryvouchersService.GetInitailEntryVoucher(this.voucherId, this.opType).subscribe(result => {
      //EditByHam___Za
      if (result.isSuccess == false) {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['EntryVouchers/EntryVouchersList']);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
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
        printAfterSave: item.printAfterSave
      }));

      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.accountsList = result.accountList;
      this.costcenterList = result.costCenterList;
      this.subledgerList = result.customerAndSupplierList;
      this.projectsList = result.projectsList;
      this.paymentTypeList = result.noorPaymentList;
      this.semesterList = result.semesterList;
      this.EntryVoucherAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.EntryVoucherAddForm.get("costCenterTranModelList").setValue(result.costCenterTranModelList);
      this.EntryVoucherAddForm.get("projectTransModelList").setValue(result.projectTransModelList);
      this.EntryVoucherAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      this.childAttachment.data = result.accVouchersDocModelList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.childAttachment.ngOnInit();
      if(result.status == 71)
        {
          $("#tempSave").prop('checked', true);
        }
      else
        {
          $("#tempSave").prop('checked', false);
        }

      if(result.isDue)
        {
          $("#isdue").prop('checked', true);
        }
        else
        {
          $("#isdue").prop('checked', false);
        } 
      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        debugger
        if (this.voucherId > 0) {
          this.EntryVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.EntryVoucherAddForm.get("currencyId").setValue(result.currencyId);
          this.EntryVoucherAddForm.get("branchId").setValue(result.branchId);

          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.EntryVoucherAddForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.EntryVoucherAddForm.get("branchId").setValue(result.branchId);
          }

        }
        else {
          this.EntryVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          if (result.defaultBranchId !== 0 && result.defaultBranchId !== null) {
            var defaultVoucher = result.voucherTypeList?.find(option => option.isDefault)?.id || 0;
            this.EntryVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
          }
          else {
            var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id || 0;
            this.EntryVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
          }
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.EntryVoucherAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.EntryVoucherAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          debugger
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;

          if (result.allowMultiBranch == false) {
            if (this.EntryVoucherAddForm.value.branchId == 0 || this.EntryVoucherAddForm.value.branchId == null || this.EntryVoucherAddForm.value.branchId == undefined) {
              const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
              this.branchesList = [defaultBranche];
              this.EntryVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
            }
          }

          if (this.EntryVoucherAddForm.value.currencyId == 0) {
            this.EntryVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.EntryVoucherAddForm.get("currRate").setValue(currRate);
          }

        }
        this.GetVoucherTypeSetting(this.EntryVoucherAddForm.value.voucherTypeId);
        if (this.EntryVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
        debugger
        if (defaultVoucher !== undefined && defaultVoucher !== null && defaultVoucher !== 0) {
          this.getVoucherNo(defaultVoucher);
        }
      });
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    this.accVouchersDTsList.forEach(element => {
      if (element.debit == "" || element.debit == null) {
        element.debit = 0;
      }
      if (element.credit == "" || element.credit == null) {
        element.credit = 0;
      }
      if (element.accountId <= 0 || ((element.debit === '' || element.debit === null || element.debit <= 0) && (element.credit === '' || element.credit === null || element.credit <= 0))) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        stopExecution = true;
        return false;
      }
      element.index = index.toString();
      index++;
    })
    var debitTotal = this.accVouchersDTsList.reduce((sum, item) => sum + parseFloat(item.debit), 0);
    var creditTotal = this.accVouchersDTsList.reduce((sum, item) => sum + parseFloat(item.credit), 0);
    debitTotal = parseFloat(debitTotal.toFixed(3));
    creditTotal = parseFloat(creditTotal.toFixed(3));
    var tempSave = $("#tempSave").prop('checked');
    if (tempSave) {
      this.EntryVoucherAddForm.value.status = 71;
    }
    else {
      this.EntryVoucherAddForm.value.status = 66;
    }

    var isDue = $("#isdue").prop('checked');
    if(isDue)
    {  this.EntryVoucherAddForm.value.isDue = true; }
    else
    {  this.EntryVoucherAddForm.value.isDue = false; }

    if (!tempSave && debitTotal != creditTotal) {
      this.alert.ShowAlert("msgUnbalancedDebitCredit", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }

    debugger
    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      const element = this.accVouchersDTsList[i];
      if (element.accountId > 0) {
        var AccountName = this.accountsList.find(r => r.id == element.accountId).text;
        if (this.useCostCenter) {
          if (element.costCenterPolicy == 61) {
            if (this.EntryVoucherAddForm.value.costCenterTranModelList.length > 0) {
              var isExist = this.EntryVoucherAddForm.value.costCenterTranModelList.filter(r => r.amount > 0 && r.index == i).reduce((sum, current) => sum + current.amount, 0);
              if (isExist == 0) {
                this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
                stopExecution = true;
                this.disableSave = false;
                return false;
              }
            }
            else {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
              stopExecution = true;
              this.disableSave = false;
              return false;
            }
          }
          else if (element.costCenterPolicy == 60) {
            var isExist = this.EntryVoucherAddForm.value.costCenterTranModelList.find(r => r.accountId == element.accountId)
            if (!isExist) {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
            }
          }
        }
        if (this.UseProjects) {
          if (element.projectPolicy == 61) {
            if (this.EntryVoucherAddForm.value.projectTransModelList.length > 0) {
              var isExist = this.EntryVoucherAddForm.value.projectTransModelList.filter(r => r.amount > 0 && r.index == i).reduce((sum, current) => sum + current.amount, 0);
              if (isExist == 0) {
                this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
                stopExecution = true;
                this.disableSave = false;
                return false;
              }
            }
            else {
              this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
              stopExecution = true;
              this.disableSave = false;
              return false;
            }

          }
          else if (element.projectPolicy == 60) {
            var isExist = this.EntryVoucherAddForm.value.projectTransModelList.find(r => r.accountId == element.accountId)
            if (!isExist) {
              this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
            }
          }
        }
      }
      element.i = i.toString();
    }

    if (stopExecution) {
      return;
    }
    this.EntryVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.EntryVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.EntryVoucherAddForm.value.voucherNo = this.EntryVoucherAddForm.value.voucherNo.toString();
    this.EntryVoucherAddForm.value.accVouchersDTModelList = this.accVouchersDTsList;
    this.EntryVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();

    this.entryvouchersService.SaveEntryVoucher(this.EntryVoucherAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.EntryVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintEntryvoucher(Number(result.message));
          }

          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['EntryVouchers/EntryVouchersList']);
          }
          this.opType = 'Add';
          this.voucherId = 0;
          this.ngOnInit()
          setTimeout(() => {
            this.GetVoucherTypeSetting(this.EntryVoucherAddForm.value.voucherTypeId);
          });
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.EntryVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.EntryVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.EntryVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.entryvouchersService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.EntryVoucherAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.EntryVoucherAddForm.get("voucherNo").setValue(1);
        }
        if (branchId != 0 && branchId != undefined && branchId != null) {
          this.EntryVoucherAddForm.get("branchId").setValue(branchId);
          this.cdr.detectChanges();
        }

      });

      if (currencyId != 0 && currencyId != null && currencyId != undefined) {
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      }
      else {
        this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
      }
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.EntryVoucherAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.EntryVoucherAddForm.get("currRate").setValue(currRate);
      if (this.EntryVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      this.cdr.detectChanges();
    }
    else {
      this.EntryVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.EntryVoucherAddForm.get("currRate").setValue(currRate);
      if (this.EntryVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }

  }

  getCurrencyRate(event: any) {
    debugger
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    this.EntryVoucherAddForm.get("currRate").setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }

  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  AddNewLine() {
    this.accVouchersDTsList.push(
      {
        accountId: 0,
        dealerId:0,
        noorPaymentTypeId:0,
        debit: "",
        credit: "",
        note: "",
        costcenterList: null,
        projectsList: null,
        accountBudgetPolicy: 0,
        costCenterPolicy: 0,
        projectPolicy: 0,
        index: ""
      });
    this.EntryVoucherAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
  }

  calculateSum(type) {
    if (type == 0) {
      return this.formatCurrency(this.accVouchersDTsList.reduce((sum, item) => {
        const debit = parseFloat(item.debit) || 0;
        const credit = parseFloat(item.credit) || 0;
        return sum + debit - credit;
      }, 0));
    } else if (type == 1) {
      return this.formatCurrency(this.accVouchersDTsList.reduce((sum, item) => {
        const debit = parseFloat(item.debit) || 0;
        return sum + debit;
      }, 0));
    } else if (type == 2) {
      return this.formatCurrency(this.accVouchersDTsList.reduce((sum, item) => {
        const credit = parseFloat(item.credit) || 0;
        return sum + credit;
      }, 0));
    }
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

  formatAmt(row: any, type: number) {
    debugger
    if (type == 0)
      row.debit = row.debit.toFixed(this.decimalPlaces);
    else
      row.credit = row.credit.toFixed(this.decimalPlaces);
    if (row.debit > 0 || row.credit > 0) {
      if (this.BudgetAmount != 0) {
        if (this.Balance + Number(row.debit + row.credit) > this.BudgetAmount) {
          if (row.accountBudgetPolicy == 60) {
            this.showBalance = false;
            this.showPrevent = false;
            this.showAlert = true;
            this.hideLabelAfterDelay();
          }
          else if (row.accountBudgetPolicy == 61) {
            row.credit = 0;
            row.debit = 0;
            this.showBalance = false;
            this.showAlert = false;
            this.showPrevent = true;
            this.hideLabelAfterDelay();
          }
        }
      }
    }

  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.accVouchersDTsList.splice(rowIndex, 1);
    }
    this.EntryVoucherAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  isOneEmpty(row: any) {
    if ((row.debit === '' || row.debit === null || row.debit <= 0) && (row.credit === '' || row.credit === null || row.credit <= 0)) {
      return true;
    }
    else {
      return false;
    }
  }

  isValidVoucherDate(event) {
    debugger
    this.validDate = true;
    if (event.target.value == "") {
      this.validDate = false;
      return;
    }
    this.appCommonserviceService.isValidVoucherDate(event.target.value).subscribe(res => {
      if (!res) {
        this.validDate = false;
        this.alert.ShowAlert("msgInvalidDate", 'error');
      }
      else{
        if(this.EntryVoucherAddForm.value.id === 0){
          this.getVoucherNo(this.EntryVoucherAddForm.value.voucherTypeId);
        }        
      }
    }, err => {
      this.validDate = false;      
    })
  }

  onAddRowBefore(rowIndex: number) {
    const newRow =
    {
      accountId: 0,
      debit: "",
      credit: "",
      note: "",
      costcenterList: null,
      projectsList: null,
      accountBudgetPolicy: 0,
      costCenterPolicy: 0,
      projectPolicy: 0,
      index: ""
    };

    this.accVouchersDTsList.splice(rowIndex, 0, newRow);
    this.EntryVoucherAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
  }

  OpenCostcenterTransForm(row: any, rowIndex: number) {
    debugger
    var accName = this.accountsList.find(option => option.id === row.accountId).text;
    let title = this.translateService.instant('Constcenters');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CostcentertransComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        accName: accName,
        debit: row.debit,
        credit: row.credit,
        rowIndex: rowIndex,
        companyid: this.jwtAuth.getCompanyId(),
        costcenterList: this.costcenterList,
        branchId: this.EntryVoucherAddForm.value.branchId,
        transList: this.EntryVoucherAddForm.value.costCenterTranModelList.filter(item => item.index == rowIndex)
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          var newList = this.EntryVoucherAddForm.value.costCenterTranModelList.filter(item => item.index !== rowIndex);
          newList = [...newList, ...res];
          this.EntryVoucherAddForm.get("costCenterTranModelList").setValue(newList);
          // If user press cancel
          return;
        }
      })
  }

  OpenProjectsTransForm(row: any, rowIndex: number) {
    debugger
    var accName = this.accountsList.find(option => option.id === row.accountId).text;
    let title = this.translateService.instant('Projects');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ProjectstransComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, accName: accName, debit: row.debit, credit: row.credit, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId(), projectsList: this.projectsList, transList: this.EntryVoucherAddForm.value.projectTransModelList.filter(item => item.index == rowIndex) }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          var newList = this.EntryVoucherAddForm.value.projectTransModelList.filter(item => item.index !== rowIndex);
          newList = [...newList, ...res];
          this.EntryVoucherAddForm.get("projectTransModelList").setValue(newList);
          // If user press cancel
          return;
        }
      })
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  DeleteVoucher(id: any) {
    debugger
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.entryvouchersService.DeleteVoucher(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['EntryVouchers/EntryVouchersList']);
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.router.navigate(['EntryVouchers/EntryVouchersList']);
            }

          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OnAccountChange(event, row, index) {
    debugger
    if (row.debit > 0) {
      row.debit = 0;
    }
    if (row.credit > 0) {
      row.credit = 0;
    }
    var BranchId = this.EntryVoucherAddForm.value.branchId;
    if (BranchId == 0 || BranchId == null || BranchId == undefined) {
      BranchId = 0;
    }
    var AccountName = this.accountsList.find(r => r.id == event.value).text;
    debugger
    if (event.value) {
      this.entryvouchersService.GetAccountInfo(event.value, BranchId).subscribe((result) => {
        debugger
        if (result) {
          this.NoteBalance = "رصيد الحساب " + "-" + AccountName + ": " + Math.abs(result.balance).toFixed(3) + " , " + "الموازنة التقديرية للحساب" + ": " + result.budgetAmt.toFixed(3);
          this.Balance = Math.abs(result.balance).toFixed(3);
          this.BudgetAmount = result.budgetAmt;
          this.showBalance = true;
          // this.AccountBudgetPolicy = result.budgetPolicy;
          // this.CostCenterBudgetPolicy = result.costCenterPolicy;
          this.NoteAlert = "TheEnteredAccountBalanceExceededTheBudgetBalance";
          this.NotePrevenet = "TheBalanceExceededTheAmountAllowedByTheBudget";
          this.showAlert = false;
          this.showPrevent = false;
          this.accVouchersDTsList[index].accountBudgetPolicy = result.budgetPolicy;
          this.accVouchersDTsList[index].costCenterPolicy = result.costCenterPolicy;
          this.accVouchersDTsList[index].projectPolicy = result.projectPolicy;
          this.hideLabelAfterDelay();
        }
      });
    }

    debugger
    if (event.value > 0) {
      if (this.accVouchersDTsList.length > 0) {
        let isDuplicate = false;
        for (let i = 0; i < this.accVouchersDTsList.length; i++) {
          if (this.accVouchersDTsList[i].accountId == event.value && i != index) {
            isDuplicate = true;

            if (this.allowAccRepeat == 61) {
              this.alert.ShowAlert("msgCantAddSameAccountForThisVoucherType", 'error');
              break;
            } else if (this.allowAccRepeat == 60) {
              this.alert.ShowAlert("msgTheAccRepeatedReminder", 'error');
              break;
            }
          }
        }
        if (isDuplicate && this.allowAccRepeat == 61) {
          this.accVouchersDTsList[index] = {
            ...this.accVouchersDTsList[index],
            accountId: 0
          };
          this.cdr.detectChanges();
        }
      }
    }
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showBalance = false;
      this.showAlert = false;
      this.showPrevent = false;
    }, 10000);
  }

  PrintEntryvoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptAccountEntryVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptEntryVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo, VoucherTypeId) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.entryvouchersService.GetValidVoucherNo(VoucherNo, VoucherTypeId).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            //this.childAttachment.data = [];
            this.disableAll = false;
            this.GetInitailEntryVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            // this.childAttachment.data = [];
            this.showsave = true;
            this.GetInitailEntryVoucher();
          }
        }
        else {
          this.voucherId = 0;
          this.opType = "Add";
          this.showsave = false;
          this.disableAll = false;
          this.disableVouchertype = false;
          this.clearFormdata(VoucherNo);
        }
      })


    }
  }

  clearFormdata(VoucherNo) {
    debugger
    this.newDate = new Date;
    this.EntryVoucherAddForm.get("id").setValue(0);
    this.EntryVoucherAddForm.get("voucherNo").setValue(VoucherNo);
    this.EntryVoucherAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.EntryVoucherAddForm.get("branchId").setValue(0);
    this.EntryVoucherAddForm.get("currencyId").setValue(0);
    this.EntryVoucherAddForm.get("currRate").setValue(0);
    this.EntryVoucherAddForm.get("note").setValue("");
    this.accVouchersDTsList = [];
    this.EntryVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.EntryVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  CopyRow(row, index) {
    debugger
    if (this.allowAccRepeat == 61) {
      this.accVouchersDTsList.push(
        {
          accountId: 0,
          dealerId: 0,
          debit: row.debit,
          credit: row.credit,
          note: row.note,
          costcenterList: null,
          projectsList: null,
          accountBudgetPolicy: row.accountBudgetPolicy,
          costCenterPolicy: row.costCenterPolicy,
          projectPolicy: row.projectPolicy,
          index: ""
        });
      this.EntryVoucherAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
    }
    else {
      this.accVouchersDTsList.push(
        {
          accountId: row.accountId,
          dealerId: row.dealerId,
          debit: row.debit,
          credit: row.credit,
          note: row.note,
          costcenterList: null,
          projectsList: null,
          accountBudgetPolicy: row.accountBudgetPolicy,
          costCenterPolicy: row.costCenterPolicy,
          projectPolicy: row.projectPolicy,
          index: ""
        });
      this.EntryVoucherAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
    }

  }

  handleF3Key(event: KeyboardEvent, row, index) {

    if (event.key === 'F4') {
      this.CopyRow(row, index);
    }
  }

  exportHeadersToExcel() {
    // Extract header labels only
    const headerNames = this.headers.map(h => h.label);

    // Convert into a worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headerNames]);

    // Create workbook and append sheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Headers');

    // Export to file
    XLSX.writeFile(wb, 'EntryVoucherExcel.xlsx');
  }

  ImportFromExcel(event: any): void {
    debugger
    // this.skipModelChange = true;    
    const target: DataTransfer = <DataTransfer>event.target;
    const fileInput = event.target as HTMLInputElement;
    if (target.files.length !== 1) {
      console.error('Cannot use multiple files');
      return;
    }

    const file: File = target.files[0];
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });
      const firstSheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

      const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Send to backend
      this.entryvouchersService.ImportFromExcel(excelData).subscribe(
        (response) => {
          debugger
          if (response.length > 0) {
            this.accVouchersDTsList = response;
            this.EntryVoucherAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
          }
          else {
            this.alert.ShowAlert('Import failed', 'error')
            fileInput.value = "";
          }

        },
        (error) => { this.alert.ShowAlert('Import failed', 'error'); fileInput.value = ""; }
      );
    };

    reader.readAsBinaryString(file);
  }

  onImportClick(fileInput: HTMLInputElement) {
       fileInput.click();               
  }

  loadLazyAccountss(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.accountsList) {
        this.accountsList = [];
    }

    // Make sure the array is large enough
    while (this.accountsList.length < last) {
        this.accountsList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.accountsList[i] = this.accountsList[i];
    }

    this.loading = false;
  }

}
