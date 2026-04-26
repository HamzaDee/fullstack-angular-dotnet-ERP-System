import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { BankSettlmentService } from '../bankSettlment.service';
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
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';


interface tabel1Data {
  id: number;
  voucherNumber: string;
  voucherName: string;
  voucherDate: string;
  chequeNo: string;
  voucherNote: string;
  debit: number;
  credit: number;
  settled: boolean,
  unsetteld: boolean,
  tablediff: number;
  tablediff2: number;
  voucherHdrId: number;
  voucherDtlId: number;
}

interface tabel2Data {
  id: number;
  voucherNumber: string;
  voucherName: string;
  voucherDate: string;
  chequeNo: string;
  voucherNote: string;
  debit: number;
  credit: number;
  settled: boolean,
  unsetteld: boolean,
  tablediff: number;
  tablediff2: number;
  voucherHdrId: number;
  voucherDtlId: number;
}

@Component({
  selector: 'app-bank-settlement-form',
  templateUrl: './bank-settlement-form.component.html',
  styleUrls: ['./bank-settlement-form.component.scss']
})
export class BankSettlementFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  BankSettelmentAddForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  accountsList: any;
  bankList: any;
  accVouchersDTsList: any[] = [];
  tabel1Data: tabel1Data[] = [];
  tabel2Data: tabel2Data[] = [];
  isdisabled: boolean;
  previousTablediff: number = 0;
  branchesList: any;
  validDate = true;
  showLoader = false;
  sumDebit: number = 0;
  sumCredit: number = 0;
  sumDebit2: number = 0;
  sumCredit2: number = 0;
  sumdiff: number = 0;
  sumdiff1: number = 0;
  sumdiff2: number = 0;
  total: number = 0;
  total2: number = 0;
  voucherId: any;
  showsave: boolean;
  showTable: boolean = true;
  selectAllEqual: boolean = false;
  selectAllNotEqual: boolean = false;
  selectedValue: number = 0;
  selectedValue2: number = 0;
  // totals 
  debitAmtSum: number = 0;
  creditAmtSum: number = 0;
  bookBalanceSum: number = 0;
  bankBalanceSum: number = 0;
  defferenceSum: number = 0;
  debitAmtSum2: number = 0;
  creditAmtSum2: number = 0;
  disableAll:boolean = true;
  disableSave:boolean;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private bankSettlmentService: BankSettlmentService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private changeDetectorRef: ChangeDetectorRef,
      private ngZone: NgZone,
      private egretLoader: AppLoaderService,
    ) { }
      
  ngOnInit(): void {
    debugger
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    if (this.voucherId !== 0 || this.voucherId !== null || this.voucherId !== "" || this.voucherId == undefined) {
      this.showsave = this.routePartsService.Guid3ToEdit;
      setTimeout(() => {
        debugger
        // if (this.opType === 'Show' || this.opType === "Edit") {
        //   this.showTable = true;
        //   this.BankSettelmentAddForm.get('settlementNo')?.disable(); 
        //   this.BankSettelmentAddForm.get('settlementDate')?.disable(); 
        //   this.BankSettelmentAddForm.get('fromDate')?.disable(); 
        //   this.BankSettelmentAddForm.get('toDate')?.disable(); 
        //   this.BankSettelmentAddForm.get('branchId')?.disable(); 
        //   // this.BankSettelmentAddForm.get('bankId')?.disable(); 
        //   this.BankSettelmentAddForm.get('note')?.disable(); 
        // }
        // else {
        //   this.showTable = false;
        //   this.BankSettelmentAddForm.get('settlementNo')?.enable(); 
        //   this.BankSettelmentAddForm.get('settlementDate')?.enable(); 
        //   this.BankSettelmentAddForm.get('fromDate')?.enable(); 
        //   this.BankSettelmentAddForm.get('toDate')?.enable(); 
        //   this.BankSettelmentAddForm.get('branchId')?.enable(); 
        //   this.BankSettelmentAddForm.get('bankId')?.enable(); 
        //   this.BankSettelmentAddForm.get('note')?.enable(); 
        // }
         if (this.opType === 'Show' || this.opType === "Edit")
          {
            this.isdisabled = true;
          }
          else
          {
            this.isdisabled = false;
          }
      });
    }
    else {
      this.showsave = true;
    }
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['BankSettlement/BankSattlmentList']);
    }
    this.SetTitlePage();
    this.ProcessingIncomingChequeForm();
    this.GetProcessingIncomingChequeForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('BankSattlmentForm');
    this.title.setTitle(this.TitlePage);
  }

  ProcessingIncomingChequeForm() {
    this.BankSettelmentAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      settlementNo: [""],
      settlementDate: [""],
      fromDate: [""],
      toDate: [""],
      branchId: [null],
      note: [""],
      bankId: [0, [Validators.required, Validators.min(1)]],
      accVouchersDTs: [null],
      bankBalance: [0],
      isPosted: [0],
      plusAmt: [0],
      minusAmt: [0],
      status: [0],
      accVouchersDocModelList: [null]
    });
  }

  GetProcessingIncomingChequeForm() {
    var lang = this.jwtAuth.getLang();
    this.disableSave = false;
    this.bankSettlmentService.GetInitailBankSettlement(this.voucherId, this.opType).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['BankSettlement/BankSattlmentList']);
          return;
        }
      result.settlementDate = formatDate(result.settlementDate, "yyyy-MM-dd", "en-US")
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.branchesList = result.companyBranchModels;
      this.accountsList = result.accountList;
      this.bankList = result.accountList;
      this.BankSettelmentAddForm.patchValue(result);      
      this.tabel2Data = result.bankSettlementStatementList;  
      debugger
      if(this.tabel2Data != null){
        this.tabel2Data.forEach(element => {
          if (element.settled == false) {
            element.unsetteld = true;           
          }
          if (element.settled) {
            this.onSettleChange2(element, 0)
          }
          if (element.unsetteld) {
            this.onSettleChange3(element, 0)
          }
        });
      }
      
      
      this.calculateSum();
      if (result.accVouchersDocModelList !== undefined) {
        this.BankSettelmentAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
        if (result.accVouchersDocModelList.length !== 0) {
          this.childAttachment.data = result.accVouchersDocModelList;
          this.childAttachment.ngOnInit();
        }
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        if (this.voucherId > 0) {
          debugger
          this.BankSettelmentAddForm.get("settlementNo").setValue(result.settlementNo);
          this.BankSettelmentAddForm.get("settlementDate").setValue(formatDate(result.settlementDate, "yyyy-MM-dd", "en-US"));
          this.BankSettelmentAddForm.get("fromDate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
          this.BankSettelmentAddForm.get("toDate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
          this.BankSettelmentAddForm.get("branchId").setValue(result.branchId);
          this.BankSettelmentAddForm.get("bankId").setValue(result.bankId);
          this.BankSettelmentAddForm.get("note").setValue(result.note);
          this.BankSettelmentAddForm.get("plusAmt").setValue(result.plusAmt);
          this.BankSettelmentAddForm.get("minusAmt").setValue(result.minusAmt);
          this.creditAmtSum2 = result.minusAmt;
          this.debitAmtSum2 = result.plusAmt;
          this.selectedValue = result.bankId;
          this.selectedValue2 = result.branchId;
          this.calcTotals();

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.companyBranchModels.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche]; 
            this.BankSettelmentAddForm.get("branchId").setValue(result.branchId); 
          }

        }
        else {
          this.BankSettelmentAddForm.get("settlementNo").setValue(result.settlementNo);
          this.BankSettelmentAddForm.get("settlementDate").setValue(formatDate(result.settlementDate, "yyyy-MM-dd", "en-US"));
          this.BankSettelmentAddForm.get("fromDate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
          this.BankSettelmentAddForm.get("toDate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
          this.BankSettelmentAddForm.get("branchId").setValue(0);
          this.BankSettelmentAddForm.get("bankId").setValue(result.bankId);
          this.BankSettelmentAddForm.get("note").setValue(result.note);

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.companyBranchModels.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche]; 
           this.BankSettelmentAddForm.get("branchId").setValue(result.defaultBranchId);
          }
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

  isEmpty(input) {
    return input === '' || input === null;
  }

  isValidVoucherDate(event) {
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
        this.bankSettlmentService.DeleteBankSettlement(id).subscribe((results) => {
          debugger
          if (results) {
            if(results.isSuccess == false && results.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                this.router.navigate(['BankSettlement/BankSattlmentList']);
                return;
              }
              else
              {
                this.alert.DeleteSuccess();
                this.router.navigate(['BankSettlement/BankSattlmentList']);
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
    this.BankSettelmentAddForm.value.accVouchersDTs = this.tabel1Data.concat(this.tabel2Data);
    var index = 0;
    if (this.BankSettelmentAddForm.value.accVouchersDTs <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }


    for (let element of this.tabel1Data) {    
        if( element.voucherName !== 'رصيد بداية المدة')
        {
          if (element.settled === false && element.unsetteld === false || element.settled === null && element.unsetteld === null || element.settled === undefined  || element.unsetteld === undefined) {
            this.alert.ShowAlert("msgEnterAllData", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }        
        }
        index++;
      }


    for (let element of this.tabel2Data) {
      if( element.voucherName !== 'رصيد بداية المدة')
      {
        if (element.settled === false && element.unsetteld === false || element.settled === null && element.unsetteld === null || element.settled === undefined  || element.unsetteld === undefined) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }        
      }
      index++;
    }
    setTimeout(() => {
      this.BankSettelmentAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.BankSettelmentAddForm.value.userId = this.jwtAuth.getUserId();
      this.BankSettelmentAddForm.value.settlementNo = this.BankSettelmentAddForm.value.settlementNo;
      this.BankSettelmentAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
      this.BankSettelmentAddForm.get("plusAmt").setValue(this.debitAmtSum2);
      this.BankSettelmentAddForm.get("minusAmt").setValue(this.creditAmtSum2);
      
    });
    this.BankSettelmentAddForm.get("accVouchersDTs").setValue(this.tabel1Data.concat(this.tabel2Data));
    debugger
    this.BankSettelmentAddForm.value.accVouchersDTs.forEach(element => {
      if (element.hasOwnProperty('voucherDtlId')) {
        element.Id = element.voucherDtlId;
        delete element.voucherDtlId;
      }

      if (element.hasOwnProperty('voucherHdrId')) {
        element.voucherHDId = element.voucherHdrId;
        delete element.voucherHdrId;
      }

      element.index = index.toString();
      index++;
    });
    debugger
    if (this.BankSettelmentAddForm.value.bankId === undefined || this.BankSettelmentAddForm.value.bankId === 0 || this.BankSettelmentAddForm.value.bankId === null) {
      this.BankSettelmentAddForm.get("bankId").setValue(this.selectedValue);
    }
    if (this.BankSettelmentAddForm.value.branchId === undefined || this.BankSettelmentAddForm.value.branchId === 0 || this.BankSettelmentAddForm.value.branchId === null) {
      this.BankSettelmentAddForm.get("branchId").setValue(this.selectedValue2);
    }
    this.BankSettelmentAddForm.get("plusAmt").setValue(this.debitAmtSum2);
    this.BankSettelmentAddForm.get("minusAmt").setValue(this.creditAmtSum2);
    this.BankSettelmentAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.changeDetectorRef.detectChanges();
    this.bankSettlmentService.SaveBankSettlement(this.BankSettelmentAddForm.value)
      .subscribe((result) => {
        if (result) {
          this.alert.SaveSuccess();
          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['BankSettlement/BankSattlmentList']);
            }
            this.voucherId = 0;
            this.opType = 'Add';
            this.ClearDataForm();
            this.ngOnInit();          
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
    this.ngZone.run(() => { });
  }

  getdata() {
    debugger
    setTimeout(() => {
      const formValues = this.BankSettelmentAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      formValues.id = 0;
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.bankSettlmentService.getdata(
        formValues.bankId,
        formValues.id,
        formValues.branchId,
        formValues.fromDate,
        formValues.toDate,
      ).subscribe((result) => {
        debugger
        this.tabel2Data = result
          .filter(item => item.vid !== -1)
          .map(item => ({
            id: item.id,
            voucherNumber: item.voucherNumber,
            voucherName: item.voucherName,
            voucherDate: item.voucherDate,
            chequeNo: item.chequeNo,
            voucherNote: item.voucherNote,
            debit: item.debit,
            credit: item.credit,
            settled: item.settled !== undefined ? item.settled : false,
            unsetteld: item.unsetteld !== undefined ? item.unsetteld : item.settled,
            tablediff: item.tablediff,
            tablediff2: item.tablediff2,
            voucherHdrId: item.voucherHdrId,
            voucherDtlId: item.voucherDtlId
          }));

        this.tabel1Data = result
          .filter(item => item.vid === -1)
          .map(item => ({
            id: item.id,
            voucherNumber: item.voucherNumber,
            voucherName: item.voucherName,
            voucherDate: item.voucherDate,
            chequeNo: item.chequeNo,
            voucherNote: item.voucherNote,
            debit: item.debit,
            credit: item.credit,
            settled: item.settled !== undefined ? item.settled : false,
            unsetteld: item.unsetteld !== undefined ? item.unsetteld : item.settled,
            tablediff: item.tablediff,
            tablediff2: item.tablediff2,
            voucherHdrId: item.voucherHdrId,
            voucherDtlId: item.voucherDtlId
          }));
        debugger
        this.calculateSum();
        this.egretLoader.close();
      });
    });
  }

  calculateSum() {
    if(this.tabel2Data == null){
      return;
    }
    this.sumdiff = 0;
    this.sumDebit = this.tabel2Data.reduce((sum, item) => sum + item.debit, 0);
    this.sumCredit = this.tabel2Data.reduce((sum, item) => sum + item.credit, 0);
    this.bookBalanceSum = +(this.sumDebit - this.sumCredit).toFixed(3);
    this.bankBalanceSum = this.tabel2Data.reduce((sum, item) => {
      if (item.voucherName === "رصيد بداية المدة") {
        sum += item.debit - item.credit;
      }
      return sum;
    }, 0);
    this.defferenceSum = +((this.bookBalanceSum - this.bankBalanceSum) + (this.debitAmtSum2 - this.creditAmtSum2)).toFixed(3)
  }

  EmptyTotals(event: any) {
    debugger
    this.sumDebit = 0;
    this.sumCredit = 0;
    this.bookBalanceSum = 0;
    this.bankBalanceSum = 0;
    this.defferenceSum = 0;
    this.debitAmtSum = 0;
    this.creditAmtSum = 0;
    this.bookBalanceSum = 0;
    this.bankBalanceSum = 0;
    this.defferenceSum = 0;
    this.debitAmtSum2 = 0;
    this.creditAmtSum2 = 0;
    this.sumDebit2 = 0;
    this.sumCredit2 = 0;
    this.sumdiff = 0;
    this.sumdiff1 = 0;
    this.sumdiff2 = 0;
    this.tabel1Data = [];
    this.tabel2Data = [];
  }


  calcTotals() {
    this.sumDebit = 0;
    this.sumCredit = 0;
    this.bookBalanceSum = 0;
    this.bankBalanceSum = 0;
    this.defferenceSum = 0;
    this.sumDebit = this.tabel2Data.reduce((sum, item) => sum + item.debit, 0);
    this.sumCredit = this.tabel2Data.reduce((sum, item) => sum + item.credit, 0);
    this.bookBalanceSum = +(this.sumDebit - this.sumCredit).toFixed(3);
    this.bankBalanceSum = this.tabel2Data.reduce((sum, item) => {
      if (item.voucherName === "رصيد بداية المدة") {
        sum += item.debit + item.credit;
      }
      return sum;
    }, 0);
    this.defferenceSum = +((this.bookBalanceSum - this.bankBalanceSum) + (this.debitAmtSum2 - this.creditAmtSum2)).toFixed(3)
  }


  onSettleChange3(table, index) {
    debugger
    if (table.unsetteld == true) {
      table.settled = false;
    }

    this.calculateTableDiff2(table);
  }


  onSettleChange2(table, index) {
    debugger
    if (table.settled == true) {
      table.unsetteld = false;
    }

    this.calculateTableDiff2(table);
  }

  calculateTableDiff2(table) {
     debugger
    if (table.settled === true) {
      if (table.tablediff2 > 0) {
        this.sumdiff1 = Number(this.sumdiff1) + table.tablediff2;
        this.sumdiff2 = this.sumdiff2 - table.tablediff2;
        this.debitAmtSum = +(this.debitAmtSum - table.debit).toFixed(3);
        this.creditAmtSum = +(this.creditAmtSum - table.credit).toFixed(3);
      }
      else
      {
        this.debitAmtSum = +(this.debitAmtSum + table.debit).toFixed(3);
        this.creditAmtSum = +(this.creditAmtSum + table.credit).toFixed(3);
        this.sumdiff1 = this.debitAmtSum + this.creditAmtSum;
      }
      table.tablediff2 = 0
    }
    else if (table.unsetteld === true) {

      table.tablediff2 = Math.max(0, table.debit + table.credit);     
      this.sumdiff2 = this.sumdiff2 + table.tablediff2;
      if(Number(this.sumdiff1 > 0))
        {
          this.sumdiff1 = this.sumdiff1 - table.tablediff2;
        }      
      this.debitAmtSum = +(this.debitAmtSum + table.debit).toFixed(3);
      this.creditAmtSum = +(this.creditAmtSum + table.credit).toFixed(3);
    }
    else if (table.unsetteld === false && table.settled === false) {
      if (table.tablediff2 > 0) {
        // this.sumdiff1 = this.sumdiff1 - table.tablediff2;
        this.sumdiff2 = this.sumdiff2 - table.tablediff2;
        table.tablediff2 = 0;
        this.debitAmtSum = +(this.debitAmtSum - table.debit).toFixed(3);
        this.creditAmtSum = +(this.creditAmtSum - table.credit).toFixed(3);
      }
      else
      {
        this.debitAmtSum = +(this.debitAmtSum - table.debit).toFixed(3);
        this.creditAmtSum = +(this.creditAmtSum - table.credit).toFixed(3);
        this.sumdiff1 = this.debitAmtSum - this.creditAmtSum;
      }
    }
  }


  onSettleChange(table, index) {
    debugger
    if (table.unsetteld == true) {
      table.settled = false;
    }

    this.calculateTableDiff1(table);
  }


  onSettleChange0(table, index) {
    debugger
    if (table.settled == true) {
      table.unsetteld = false;
    }

    this.calculateTableDiff1(table);
  }

  calculateTableDiff1(table) {

    if (table.settled === true) {
      if (table.tablediff > 0) {
        this.sumdiff = this.sumdiff - table.tablediff;
        this.debitAmtSum = +(this.debitAmtSum - table.debit).toFixed(3);
        this.creditAmtSum = +(this.creditAmtSum - table.credit).toFixed(3);
      }
      table.tablediff = 0
    }
    else if (table.unsetteld === true) {

      table.tablediff = Math.max(0, table.debit + table.credit);
      this.sumdiff = this.sumdiff + table.tablediff;
      this.debitAmtSum = +(this.debitAmtSum + table.debit).toFixed(3);
      this.creditAmtSum = +(this.creditAmtSum + table.credit).toFixed(3);
    }
    else if (table.unsetteld === false && table.settled === false) {
      if (table.tablediff > 0) {
        this.sumdiff = this.sumdiff - table.tablediff;
        table.tablediff = 0;
        this.debitAmtSum = +(this.debitAmtSum - table.debit).toFixed(3);
        this.creditAmtSum = +(this.creditAmtSum - table.credit).toFixed(3);
      }

    }
  }
  onToggleAllCheckboxes(isEqual: boolean, tableName: string) {
    debugger
    if (tableName == 'table1') {
      const table = this.tabel1Data;
      this.tabel1Data.forEach(item => {
        debugger
        if (isEqual) {
          item.settled = !item.settled;
          if (item.settled) {
            item.unsetteld = false;
            this.onSettleChange0(item, 0)
          }
        } else {
          item.unsetteld = !item.unsetteld;
          if (item.unsetteld) {
            item.settled = false;
            debugger
            this.onSettleChange0(item, 0)
          }
        }
      });
    }
    else {
      const table = this.tabel2Data;
      this.tabel2Data.forEach(item => {
        debugger
        if (isEqual) {
          item.settled = !item.settled;
          if (item.settled) {
            item.unsetteld = false;
            this.onSettleChange2(item, 0)
          }
        } else {
          item.unsetteld = !item.unsetteld;
          if (item.unsetteld) {
            item.settled = false;
            debugger
            this.onSettleChange3(item, 0)
          }
        }
      });

    }

  }

  setsettale ()
  {
    this.tabel2Data.forEach(item => {
      debugger
      if (item.settled) {
        item.settled = !item.settled;
        if (item.settled) {
          item.unsetteld = false;
          this.onSettleChange2(item, 0)
        }
      } else {
        item.unsetteld = !item.unsetteld;
        if (item.unsetteld) {
          item.settled = false;
          debugger
          this.onSettleChange3(item, 0)
        }
      }
    });


  }

  ClearDataForm()
  {    
    this.tabel1Data = [];
    this.tabel2Data = [];
    this.BankSettelmentAddForm.get("branchId").setValue(0);
    this.BankSettelmentAddForm.get("note").setValue("");
    this.BankSettelmentAddForm.get("bankId").setValue(0);
    this.BankSettelmentAddForm.get("plusAmt").setValue(0);
    this.BankSettelmentAddForm.get("minusAmt").setValue(0);
  }
}