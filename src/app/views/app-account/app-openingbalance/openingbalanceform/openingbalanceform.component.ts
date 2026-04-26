import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import { AppOpeningBalanceService } from '../app-openingbalance.service';
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
import { number } from 'echarts';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-openingbalanceform',
  templateUrl: './openingbalanceform.component.html',
  styleUrls: ['./openingbalanceform.component.scss']
})
export class OpeningbalanceformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  OpeningBalanceAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  accountsList: any;
  currencyList: any;
  accVouchersDTsList: any[] = [];
  voucherTypeList: any;
  branchesList: any;
  costCenterPolicyList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  selectedVoucherType: any;
  costcenterList: any;
  projectsList: any;
  voucherId: any;
  decimalPlaces: number;
  disableAll: boolean = false;
  voucherNo: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  useCostCenter: boolean;
  UseProjects: boolean;
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
  disableCurrRate: boolean;
  Lang: string;
  disableSave: boolean;
  disableVouchertype: boolean = false;
  newDate:any;
  showsave: boolean;
    headers = [
    { field: 'accountId', label: this.translateService.instant('AccountNumber') },
    { field: 'debit', label: this.translateService.instant('Debit') },
    { field: 'credit', label: this.translateService.instant('Credit') },
    { field: 'note', label: this.translateService.instant('Notes') },
  ];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private openingbalanceService: AppOpeningBalanceService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private appCommonserviceService: AppCommonserviceService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    debugger
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }

      // this.disableCurrRate=true;
    });
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
      this.router.navigate(['OpeningBalance/OpeningBalanceList']);
    }
    this.InitiailEntryVoucherForm();
    this.GetInitailOpeningBalance();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('OpeningBalanceForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.OpeningBalanceAddForm = this.formbulider.group({
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

  GetInitailOpeningBalance() {
    var lang = this.jwtAuth.getLang();
    this.openingbalanceService.GetInitailOpeningBalance(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['OpeningBalance/OpeningBalanceList']);
        return;
      }
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
      this.projectsList = result.projectsList;
      this.OpeningBalanceAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.OpeningBalanceAddForm.get("costCenterTranModelList").setValue(result.costCenterTranModelList);
      this.OpeningBalanceAddForm.get("projectTransModelList").setValue(result.projectTransModelList);
      this.OpeningBalanceAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      this.childAttachment.data = result.accVouchersDocModelList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.childAttachment.ngOnInit();

      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        if (this.voucherId > 0) {
          debugger
          this.OpeningBalanceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.OpeningBalanceAddForm.get("currencyId").setValue(result.currencyId);
          this.OpeningBalanceAddForm.get("branchId").setValue(result.branchId);

          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.OpeningBalanceAddForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.OpeningBalanceAddForm.get("branchId").setValue(result.branchId);
          }

        }
        else {
          debugger
          this.OpeningBalanceAddForm.get("branchId").setValue(result.defaultBranchId);
          // var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id || 0;
          this.OpeningBalanceAddForm.get("voucherTypeId").setValue(defaultVoucher);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.OpeningBalanceAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.OpeningBalanceAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          debugger
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            if (result.defaultBranchId == null || result.defaultBranchId == undefined) {
              result.defaultBranchId = 0;
            }
            this.OpeningBalanceAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          debugger
          if (this.OpeningBalanceAddForm.value.currencyId == 0) {
            this.OpeningBalanceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.OpeningBalanceAddForm.get("currRate").setValue(currRate);
          }
        }
        this.GetVoucherTypeSetting(this.OpeningBalanceAddForm.value.voucherTypeId)
        if (this.OpeningBalanceAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
    })
  }

  OnSaveForms() {
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
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.index = index.toString();
      index++;
    })
    // var debitTotal = this.accVouchersDTsList.reduce((sum, item) => sum + item.debit, 0);
    var debitTotal = this.accVouchersDTsList.reduce((sum, item) => {
      // Check if item.debit is a valid number before adding it to the sum
      const debitValue = parseFloat(item.debit);
      if (!isNaN(debitValue)) {
        return sum + debitValue;
      } else {
        return sum; // If item.debit is not a valid number, skip it
      }
    }, 0);

    // var creditTotal = this.accVouchersDTsList.reduce((sum, item) => sum + item.credit, 0);
    var creditTotal = this.accVouchersDTsList.reduce((sum, item) => {
      // Check if item.credit is a valid number before adding it to the sum
      const creditValue = parseFloat(item.credit);
      if (!isNaN(creditValue)) {
        return sum + creditValue;
      } else {
        return sum; // If item.credit is not a valid number, skip it
      }
    }, 0);
    var tempSave = $("#tempSave").prop('checked');
    if (tempSave) {
      this.OpeningBalanceAddForm.value.status = 71;
    }
    else {
      this.OpeningBalanceAddForm.value.status = 66;
    }
    if (!tempSave && debitTotal != creditTotal) {
      this.alert.ShowAlert("msgUnbalancedDebitCredit", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }

    if (stopExecution) {
      return;
    }
    
    //costcenter check 
    debugger
   
    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      const element = this.accVouchersDTsList[i];
      if (element.accountId > 0) {
        var AccountName = this.accountsList.find(r => r.id == element.accountId).text;
        if(this.useCostCenter)
          {
            if (element.costCenterPolicy == 61) {
              if (this.OpeningBalanceAddForm.value.costCenterTranModelList.length > 0) {
                var isExist = this.OpeningBalanceAddForm.value.costCenterTranModelList.filter(r => r.amount > 0 && r.index == i).reduce((sum, current) => sum + current.amount, 0);
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
              var isExist = this.OpeningBalanceAddForm.value.costCenterTranModelList.find(r => r.accountId == element.accountId)
              if (!isExist) {
                this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
              }
            }
          }
       
        if(this.UseProjects)
          {
            if (element.projectPolicy == 61) {
              if (this.OpeningBalanceAddForm.value.projectTransModelList.length > 0) {
                var isExist = this.OpeningBalanceAddForm.value.projectTransModelList.filter(r => r.amount > 0 && r.index == i).reduce((sum, current) => sum + current.amount, 0);
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
              var isExist = this.OpeningBalanceAddForm.value.projectTransModelList.find(r => r.accountId == element.accountId)
              if (!isExist) {
                this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
              }
            }
          }
      }
      element.i = i.toString();
    }
    //end
    this.OpeningBalanceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.OpeningBalanceAddForm.value.userId = this.jwtAuth.getUserId();
    this.OpeningBalanceAddForm.value.voucherNo = this.OpeningBalanceAddForm.value.voucherNo.toString();
    this.OpeningBalanceAddForm.value.accVouchersDTModelList = this.accVouchersDTsList;
    this.OpeningBalanceAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();

    this.openingbalanceService.SaveOpeningBalance(this.OpeningBalanceAddForm.value)
      .subscribe((result) => {

        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.OpeningBalanceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintOpeningBalance(Number(result.message));
          }
   

          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['OpeningBalance/OpeningBalanceList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
          setTimeout(() => {
            this.GetVoucherTypeSetting(this.OpeningBalanceAddForm.value.voucherTypeId);
          });
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  getVoucherNo(event: any) {
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.OpeningBalanceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.OpeningBalanceAddForm.value.voucherTypeId;
    var date = new Date(this.OpeningBalanceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.openingbalanceService.GetSerialOpeningBalance(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.OpeningBalanceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.OpeningBalanceAddForm.get("voucherNo").setValue(1);
        }
        if (branchId == null || branchId == undefined) {
          branchId = 0;
        }
        this.OpeningBalanceAddForm.get("branchId").setValue(branchId);
      });
      debugger

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
      this.OpeningBalanceAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.OpeningBalanceAddForm.get("currRate").setValue(currRate);
      if (this.OpeningBalanceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      this.cdr.detectChanges();
    }
    else {
      this.OpeningBalanceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.OpeningBalanceAddForm.get("currRate").setValue(currRate);
      if (this.OpeningBalanceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }

  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    this.OpeningBalanceAddForm.get("currRate").setValue(currRate);
    if (this.defaultCurrencyId == selectedValue) {
      this.disableCurrRate = true;
    }
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  AddNewLine() {
    if (this.disableAll == true) {
      return;
    }
    this.accVouchersDTsList.push(
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
      });
    this.OpeningBalanceAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
  }

  GetAccounts() {
    debugger
    this.accVouchersDTsList = [];
    this.accountsList.forEach(elements => {
      if (elements.id > 0) {
        this.accVouchersDTsList.push(
          {
            accountId: elements.id,
            debit: "",
            credit: "",
            note: "",
            costcenterList: null,
            projectsList: null,
            index: ""
          }
        )
      }
    });
    this.OpeningBalanceAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
  }

  DeleteAccountsBudgets() {
    this.accVouchersDTsList = [];
    this.OpeningBalanceAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
    // this.AddNewRowAccountsBudget()
  }

  calculateSum(type) {
   if (type === 0) {
    const total = this.accVouchersDTsList.reduce((sum, item) => {
    const debit = Number(item.debit) || 0;
    const credit = Number(item.credit) || 0;
    return sum + (debit - credit);
  }, 0);

  return this.formatCurrency(total);
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
    debugger
    if (row.debit) {
      row.credit = 0;
    }
    this.calculateSum(0);
  }

  onCreditChange(row: any) {
    debugger
    if (row.credit) {
      row.debit = 0;
    }
    this.calculateSum(0);
  }

  formatAmt(row: any, type: number) {
    debugger
    if (type == 0)
      row.debit = row.debit.toFixed(this.decimalPlaces);
    else if (type == 1)
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
    this.OpeningBalanceAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
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
    this.OpeningBalanceAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
  }

  OpenCostcenterTransForm(row: any, rowIndex: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }
    var accName = this.accountsList.find(option => option.id === row.accountId).text;
    let title = this.translateService.instant('Constcenters');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CostcentertransComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, accName: accName, debit: row.debit, credit: row.credit, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId(), costcenterList: this.costcenterList, transList: this.OpeningBalanceAddForm.value.costCenterTranModelList.filter(item => item.index == rowIndex), branchId: this.OpeningBalanceAddForm.value.branchId }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          var newList = this.OpeningBalanceAddForm.value.costCenterTranModelList.filter(item => item.index !== rowIndex);
          newList = [...newList, ...res];
          this.OpeningBalanceAddForm.get("costCenterTranModelList").setValue(newList);
          // If user press cancel
          return;
        }
      })
  }

  OpenProjectsTransForm(row: any, rowIndex: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }
    var accName = this.accountsList.find(option => option.id === row.accountId).text;
    let title = this.translateService.instant('Projects');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ProjectstransComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, accName: accName, debit: row.debit, credit: row.credit, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId(), projectsList: this.projectsList, transList: this.OpeningBalanceAddForm.value.projectTransModelList.filter(item => item.index == rowIndex) }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          var newList = this.OpeningBalanceAddForm.value.projectTransModelList.filter(item => item.index !== rowIndex);
          newList = [...newList, ...res];
          this.OpeningBalanceAddForm.get("projectTransModelList").setValue(newList);
          // If user press cancel
          return;
        }
      })
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
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
        this.openingbalanceService.DeleteOpeningBalance(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['OpeningBalance/OpeningBalanceList']);
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.router.navigate(['OpeningBalance/OpeningBalanceList']);
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
    var BranchId = this.OpeningBalanceAddForm.value.branchId;
    if (BranchId == 0 || BranchId == null || BranchId == undefined) {
      BranchId = 0;
    }
    var AccountName = this.accountsList.find(r => r.id == event.value).text;
    debugger
    if (event.value) {
      this.openingbalanceService.GetAccountInfo(event.value, BranchId).subscribe((result) => {
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

  PrintOpeningBalance(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptOpeningBalanceAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptOpeningBalanceEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
  
   voucherNoBlur(VoucherNo , VoucherTypeId)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.openingbalanceService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
          {
            debugger
            if(res.id > 0)
              {
                if(res.status ==  66)
                  {
                    this.voucherId =res.id;
                    this.opType = "Edit";
                    this.showsave = false;
                    //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                    //this.childAttachment.data = [];
                    this.disableAll = false;
                    this.GetInitailOpeningBalance();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                   // this.childAttachment.data = [];
                    this.showsave = true;
                    this.GetInitailOpeningBalance();
                  }
              }
              else
              {
                this.voucherId =0;
                this.opType = "Add";
                this.showsave = false;
                this.disableAll = false;
                this.disableVouchertype = false;
                this.clearFormdata(VoucherNo);               
              }
          })
      }
  } 

  clearFormdata(VoucherNo)
  {    debugger
    this.newDate = new Date;
    this.OpeningBalanceAddForm.get("id").setValue(0);
    this.OpeningBalanceAddForm.get("voucherNo").setValue(VoucherNo);
    this.OpeningBalanceAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.OpeningBalanceAddForm.get("branchId").setValue(0);
    this.OpeningBalanceAddForm.get("currencyId").setValue(0);
    this.OpeningBalanceAddForm.get("currRate").setValue(0);
    this.OpeningBalanceAddForm.get("note").setValue("");
    this.accVouchersDTsList = [];
    this.OpeningBalanceAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.OpeningBalanceAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  CopyRow(row,index)
  {
    debugger
    if(this.allowAccRepeat == 61)
      {
        this.accVouchersDTsList.push(
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
          });
        this.OpeningBalanceAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
      }
      else
      {
        this.accVouchersDTsList.push(
          {
            accountId: row.accountId,
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
        this.OpeningBalanceAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
      }
   
  }

  handleF3Key(event: KeyboardEvent, row, index) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index);
    }
  }


    exportHeadersToExcel() {
      const headerNames = this.headers.map(h => h.label);
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headerNames]);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Headers');
      XLSX.writeFile(wb, 'OpeningBalanceExcel.xlsx');
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
        this.openingbalanceService.ImportFromExcel(excelData).subscribe(
          (response) => {
            debugger
            if (response.length > 0) {
              this.accVouchersDTsList = response;
            this.OpeningBalanceAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
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
}
