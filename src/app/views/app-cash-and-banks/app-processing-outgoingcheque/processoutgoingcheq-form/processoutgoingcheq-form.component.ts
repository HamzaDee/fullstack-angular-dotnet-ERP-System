import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ProcOutcheqService } from '../procoutgoingcheq.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { NgZone } from '@angular/core';
import Swal from 'sweetalert2';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-processoutgoingcheq-form',
  templateUrl: './processoutgoingcheq-form.component.html',
  styleUrls: ['./processoutgoingcheq-form.component.scss']
})
export class ProcessoutgoingcheqFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher!: FinancialvoucherComponent;
  ProcOutcheqAddForm: FormGroup = new FormGroup({});
  public TitlePage: string = "";
  tabelData: any[] = [];
  loading: boolean = false;
  opType: string = "";
  accountsList: any;
  accountsList2: any;
  inchequesList: any;
  bankList: any;
  statusList: any;
  currencyList: any;
  accVouchersDTsList: any[] = [];
  debitAccountsList: any[] = [];
  creditAccountsList: any[] = [];
  chequesList: any[] = [];
  suppliersList: any;
  voucherTypeList: any;
  voucherTypeList2: any;
  defaultList: any;
  branchesList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string = "";
  isExistAccNo: boolean = true;
  total: number = 0;
  selectedDropdownValue: any;
  selectedacc1: any;
  selectedacc2: any;
  selectedacc3: any;
  voucherId: any;
  voucherType: any;
  showsave: boolean = false;
  istype: number = 0;
  isOut: number = 0;
  selectedVoucherType: any;
  decimalPlaces: number = 0;
  public Amount: any;
  disableAll: boolean = false;
  voucherNo: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  defaultCurrencyId: number = 0;
  disableCurrRate: boolean = false;
  disableSave: boolean = false;
  Lang: string = "";
  disableVouchertype: boolean = false;
  newDate: any;
  toChequeStatus : number = 0;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private procOutcheqService: ProcOutcheqService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private changeDetectorRef: ChangeDetectorRef,
      private ngZone: NgZone

    ) { }

  ngOnInit(): void {
    debugger
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.voucherType = "Accounting";
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
      this.disableSave = false;
    });
    if (this.voucherId !== 0 || this.voucherId !== null || this.voucherId !== "" || this.voucherId == undefined) {
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    else {
      this.showsave = true;
    }
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
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['ProcessingOutcomingCheque/ProcoutcheqList']);
    }
    this.SetTitlePage();
    this.ProcessingIncomingChequeForm();
    this.GetProcessingIncomingChequeForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProcoutcheqForm');
    this.title.setTitle(this.TitlePage);
  }

  ProcessingIncomingChequeForm() {
    this.ProcOutcheqAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      // receipt:[0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      branchId: [null],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      debitAccountId: [0, [Validators.required, Validators.min(1)]],
      creditAccountId: [0, [Validators.required, Validators.min(1)]],
      referenceDate: [""],
      referenceNo: [""],
      note: [""],
      accVouchersDocModelList: [null],
      accVouchersDTModelList: [null],
      isCanceled: [false],
      isPosted: [false],
      status: [null],
      amount: [0],
      paymentMethod: [''],
      chequesTranModelList: [null],
      generalAttachModelList: [null],
    });
  }

  GetProcessingIncomingChequeForm() {

    var lang = this.jwtAuth.getLang();
    this.procOutcheqService.GetInitailProcessingOutgoingCheque(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ProcessingOutcomingCheque/ProcoutcheqList']);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US")
      this.voucherTypeList = result.voucherTypeList.map((item: any) => ({
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
        debitAccId: item.debitAccId,
        creditAccId: item.creditAccId,
        fromChequeStatus : item.fromChequeStatus,
        toChequeStatus : item.toChequeStatus,
        printAfterSave: item.printAfterSave,
        categoryId : item.categoryId
      }));


      debugger
      this.total = result.amount;
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find((option: any) => option.id === result.defaultCurrency)?.data2;
      this.accountsList = result.accountList;
      this.accountsList2 = result.accountList;
      this.inchequesList = result.incomingChequesList;
      this.defaultList = this.voucherTypeList;
      this.bankList = result.bankList;
      this.statusList = result.statusList;
      this.suppliersList = result.suppliersList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.ProcOutcheqAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.ProcOutcheqAddForm.get("accVouchersDocModelList")?.setValue(result.accVouchersDocModelList);
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.ProcOutcheqAddForm.get("generalAttachModelList")?.setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      debugger
      if (result.chequesTranModelList != null) {
        result.chequesTranModelList.forEach((element: any) => {
          this.chequesList.push(
            {
              id: element.cheqId,
              dueDate: formatDate(element.dueDate1, "yyyy-MM-dd", "en-US"),
              docNo: element.voucherNo,
              bankName: element.bankName,
              amount: element.amount,
              drawerName: element.drawerName,
              accountName: element.accountName,
              chequeStatus: element.chequeStatus,
            })
        })
      }
      this.calculateSum();
      debugger
      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        if (this.voucherId > 0) {
          var pm = result.paymentMethod.split(',').map(Number)
          this.ProcOutcheqAddForm.get("currencyId")?.setValue(result.currencyId);
          this.ProcOutcheqAddForm.get("branchId")?.setValue(result.branchId);
          this.ProcOutcheqAddForm.get("note")?.setValue(result.note);
          this.ProcOutcheqAddForm.get("voucherNo")?.setValue(result.voucherNo);
          this.ProcOutcheqAddForm.get("currencyId")?.setValue(result.currencyId);
          this.ProcOutcheqAddForm.get("currRate")?.setValue(result.currRate);
          this.ProcOutcheqAddForm.get("creditAccountId")?.setValue(result.creditAccountId);
          this.ProcOutcheqAddForm.get("debitAccountId")?.setValue(result.debitAccountId);
          this.ProcOutcheqAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.ProcOutcheqAddForm.get("currencyId")?.setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.ProcOutcheqAddForm.get("branchId")?.setValue(result.branchId);
          }

          // this.ProcOutcheqAddForm.get("receipt").setValue(result.chequeModelList[0].receipt);                                                                 
        }
        else {
          this.ProcOutcheqAddForm.get("branchId")?.setValue(result.defaultBranchId);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.ProcOutcheqAddForm.get("currencyId")?.setValue(result.defaultCurrency);
            this.ProcOutcheqAddForm.get("currRate")?.setValue(defaultCurrency.data1);

          }
          if (this.voucherTypeList.isDefault !== undefined) {
            var defaultVoucher = result.voucherTypeList.find((option: any) => option.isDefault === true).id;
            this.ProcOutcheqAddForm.get("voucherTypeId")?.setValue(defaultVoucher);
            this.getVoucherNo(defaultVoucher);
          }
          this.ProcOutcheqAddForm.get("paymentMethod")?.setValue(result.paymentMethod);
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.ProcOutcheqAddForm.get("branchId")?.setValue(result.defaultBranchId);
          }
          debugger
          if (this.ProcOutcheqAddForm.value.currencyId == 0) {
            this.ProcOutcheqAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId).data1;
            this.ProcOutcheqAddForm.get("currRate")?.setValue(currRate);
          }
        }
        this.GetVoucherTypeSetting(this.ProcOutcheqAddForm.value.voucherTypeId)
        if (this.ProcOutcheqAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
    })
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.defaultList.find((option: any) => option.label === selectedValue).serialType;
    var currencyId = this.defaultList.find((option: any) => option.label === selectedValue).currencyId;
    var branchId = this.defaultList.find((option: any) => option.label === selectedValue).branchId;
    var voucherCategory = 0
    this.toChequeStatus = this.defaultList.find((option: any) => option.label === selectedValue).toChequeStatus;
    var fromChequeStatus = this.defaultList.find((option: any) => option.label === selectedValue).fromChequeStatus;
    const values = fromChequeStatus.split(',').map((v: string) => parseInt(v.trim(), 10));
    this.inchequesList = this.inchequesList.filter((item: any) => values.includes(item.data2));
    var voucherTypeId = this.ProcOutcheqAddForm.value.voucherTypeId;
    var date = new Date(this.ProcOutcheqAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var debitAccId = this.defaultList.find((option: any) => option.label === selectedValue).debitAccId;
    var creditAccId = this.defaultList.find((option: any) => option.label === selectedValue).creditAccId;

    if (currencyId !== null) {
      var currRate = this.currencyList.find((option: any) => option.id === currencyId)?.data1 ?? 0;
      this.ProcOutcheqAddForm.get("currRate")?.setValue(currRate);
    }
    if (voucherTypeId > 0) {
      this.procOutcheqService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.ProcOutcheqAddForm.get("voucherNo")?.setValue(results);
        }
        else {
          this.ProcOutcheqAddForm.get("voucherNo")?.setValue(1);
        }
        if (branchId == null || branchId == undefined) {
          this.ProcOutcheqAddForm.get("branchId")?.setValue(0);
        }
        else {
          this.ProcOutcheqAddForm.get("branchId")?.setValue(branchId);
        }
        this.ProcOutcheqAddForm.get("creditAccountId")?.setValue(creditAccId);
        this.ProcOutcheqAddForm.get("debitAccountId")?.setValue(debitAccId);
      });
      if (currencyId != 0 && currencyId != null && currencyId != undefined) {
        this.decimalPlaces = this.currencyList.find((option: any) => option.id === currencyId).data2;
      }
      else {
        this.decimalPlaces = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId).data2;
      }
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.ProcOutcheqAddForm.get("currencyId")?.setValue(currencyId);
      var currRate = this.currencyList.find((option: any) => option.id === currencyId)?.data1 ?? 0;
      this.ProcOutcheqAddForm.get("currRate")?.setValue(currRate);
      if (this.ProcOutcheqAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.ProcOutcheqAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId)?.data1 ?? 0;
      this.ProcOutcheqAddForm.get("currRate")?.setValue(currRate);
      if (this.ProcOutcheqAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find((option: any) => option.id === selectedValue)?.data1 ?? 0;
    this.decimalPlaces = this.currencyList.find((option: any) => option.id === selectedValue)?.data2 ?? 0;
    this.ProcOutcheqAddForm.get("currRate")?.setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
  }

  formatCurrency(value: number): string {
    debugger
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  isEmpty(input: any): boolean {
    return input === '' || input === null;
  }

  isValidVoucherDate(event: any) {
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

  DeleteVoucher(id: any) {
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
        this.procOutcheqService.DeleteProcessingOutgoingCheque(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['ProcessingOutcomingCheque/ProcoutcheqList']);
              return;
            } else {
              this.alert.DeleteSuccess();
              this.router.navigate(['ProcessingOutcomingCheque/ProcoutcheqList']);
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

  OnSaveForms() {
    debugger
    this.disableSave = true;
    this.changeDetectorRef.detectChanges();
    let stopExecution = false;
    var index = 0;
    if (this.chequesList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }
    debugger
    for (let element of this.chequesList) {
      if (element.id <= 0 || element.chequeStatus <= 0) {
        this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.index = index.toString();
      index++;
    }
    setTimeout(() => {
      debugger
      this.ProcOutcheqAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.ProcOutcheqAddForm.value.userId = this.jwtAuth.getUserId();
      this.ProcOutcheqAddForm.value.voucherNo = this.ProcOutcheqAddForm.value.voucherNo.toString();
      //this.ProcOutcheqAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();

    });
    this.ProcOutcheqAddForm.get("amount")?.setValue(this.total);
    this.ProcOutcheqAddForm.get("voucherNo")?.setValue(this.ProcOutcheqAddForm.value.voucherNo.toString());
    this.ProcOutcheqAddForm.get("paymentMethod")?.setValue("77");
    this.ProcOutcheqAddForm.get("chequesTranModelList")?.setValue(this.chequesList);
    this.changeDetectorRef.detectChanges();
    this.ProcOutcheqAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    this.procOutcheqService.SaveProcessingOutgoingCheque(this.ProcOutcheqAddForm.value)
      .subscribe((result) => {
        if (result) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option: any) => option.label === this.ProcOutcheqAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintProcessingOutCheque(Number(result.message));
          }

          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ProcessingOutcomingCheque/ProcoutcheqList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ClearFormData();
          this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
          this.disableSave = false;
        }
      })
    this.ngZone.run(() => { });
  }

  AddNewLine(grid: number, ff: any) {
    if (this.disableAll == true) {
      return;
    }
    debugger
    if (grid == 1) { //credit accounts
      this.chequesList.push(
        {
          id: 0,
          dueDate: "",
          docNo: "",
          bankName: "",
          amount: 0,
          drawerName: "",
          accountName: "",
          chequeStatus: 0,
        });
    }
  }

  deleteRow(rowIndex: number, grid: number) {
    if (rowIndex !== -1) {
      if (grid == 1)
        this.chequesList.splice(rowIndex, 1);
    }
    this.calculateSum();
  }

  onAddRowBefore(rowIndex: number, grid: number) {
    if (grid == 1) {
      const newRow =
      {
        id: 0,
        dueDate: "",
        docNo: "",
        bankName: "",
        amount: 0,
        drawerName: "",
        accountName: "",
        chequeStatus: 0,

      };
      this.chequesList.splice(rowIndex, 0, newRow);
    }
  }

  isOneEmpty(row: any) {
    if ((row.debit === '' || row.debit === null || row.debit <= 0) && (row.credit === '' || row.credit === null || row.credit <= 0)) {
      return true;
    }
    else {
      return false;
    }
  }

  calculateSum() {
    this.total = this.chequesList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  }

  onDropdownChange(event: any, selectedRow: any) {
    debugger
    if (this.chequesList.length > 1) {
      let stopExecution = false;
      const cheq = event.value;

      for (let i = 0; i < this.chequesList.length; i++) {
        const element = this.chequesList[i];

        // Check if the id matches and it's not the current element
        if (cheq === element.id && i !== selectedRow) {
          this.alert.ShowAlert("msgUCantRepeatSameCheqInSameVoucher", 'error');
          stopExecution = true;
          this.chequesList.splice(selectedRow, 1);
          return false;
        }
      }
    }
    const selectedOption = this.procOutcheqService.GetgOutgoingChequesInfo(event.value,this.ProcOutcheqAddForm.value.voucherTypeId).subscribe(result => {
      debugger
      this.chequesList[selectedRow].dueDate = formatDate(result.dueDate, "yyyy-MM-dd", "en-US");
      this.chequesList[selectedRow].docNo = result.voucherNo;
      this.chequesList[selectedRow].bankName = result.bankName;
      this.chequesList[selectedRow].amount = parseFloat(result.amount);
      this.chequesList[selectedRow].amount = this.chequesList[selectedRow].amount.toFixed(this.decimalPlaces);
      this.chequesList[selectedRow].drawerName = result.drawerName;
      this.chequesList[selectedRow].accountName = result.accountName;
      this.chequesList[selectedRow].chequeStatus = result.statusId;
      this.calculateSum()
    })
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeBranch;
  }

  ClearFormData() {
    this.chequesList = [];
    this.ProcOutcheqAddForm.get("branchId")?.setValue(0);
    this.ProcOutcheqAddForm.get("note")?.setValue("");
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ProcOutcheqAddForm.value.voucherTypeId);
    });
  }

  PrintProcessingOutCheque(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptProcessingOutChequeAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptProcessingOutChequeEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo: string, VoucherTypeId: number) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.procOutcheqService.GetValidVoucherNo(VoucherNo, VoucherTypeId).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            //this.childAttachment.data = [];
            this.disableAll = false;
            this.GetProcessingIncomingChequeForm();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            // this.childAttachment.data = [];
            this.showsave = true;
            this.GetProcessingIncomingChequeForm();
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

  /*   voucherNoBlur(voucherNo, voucherTypeId) {
      debugger
      this.procOutcheqService.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
        debugger
        if (result !=  null) {
          this.voucherId = result.id;
          this.opType = 'Edit';
          if(result.status == 67)
            {
                this.opType = 'Show';
            }
          this.GetProcessingIncomingChequeForm();
        }
        else {
          this.voucherId = 0;
          this.opType = 'Add';
          this.clearFormdata(voucherNo);
        }
      });
    }
   */

  clearFormdata(VoucherNo: string) {
    debugger
    this.newDate = new Date;
    this.ProcOutcheqAddForm.get("id")?.setValue(0);
    this.ProcOutcheqAddForm.get("voucherNo")?.setValue(VoucherNo);
    this.ProcOutcheqAddForm.get("voucherDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.ProcOutcheqAddForm.get("branchId")?.setValue(0);
    this.ProcOutcheqAddForm.get("currencyId")?.setValue(0);
    this.ProcOutcheqAddForm.get("currRate")?.setValue(0);
    this.ProcOutcheqAddForm.get("debitAccountId")?.setValue(0);
    this.ProcOutcheqAddForm.get("creditAccountId")?.setValue(0);
    this.ProcOutcheqAddForm.get("note")?.setValue("");
    this.chequesList = [];
    this.ProcOutcheqAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.ProcOutcheqAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ProcOutcheqAddForm.value.voucherTypeId);
    });
  }
}
