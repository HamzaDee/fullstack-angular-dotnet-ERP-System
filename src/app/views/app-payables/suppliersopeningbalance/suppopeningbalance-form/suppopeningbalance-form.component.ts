import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AppPayablesService } from '../app-suppopeningbalance.service';


@Component({
  selector: 'app-suppopeningbalance-form',
  templateUrl: './suppopeningbalance-form.component.html',
  styleUrls: ['./suppopeningbalance-form.component.scss']
})
export class SuppopeningbalanceFormComponent implements OnInit {
  suppOpeningBalanceAddForm: FormGroup;
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
  voucherId: any;
  decimalPlaces: number;
  disableAll:boolean=false;
//VoucherTypeSetting
  allowEditDate:boolean= false;
  allowEditVoucherSerial:boolean= false;
  allowEditBranch:boolean= false;
//End
  disableCurrRate:boolean;
  defaultCurrencyId: number;
  disableSave:boolean;
  disableVouchertype:boolean = false;
  Lang: String;
  newDate:any;
  showsave: boolean;
  voucherType:any;
  voucherNo: number = 0;
  
  constructor
            (
              private title: Title,
              private jwtAuth: JwtAuthService,
              private alert: sweetalert,
              private suppOpeningService: AppPayablesService,
              private translateService: TranslateService,
              public router: Router,
              private formbulider: FormBuilder,
              public routePartsService: RoutePartsService,
              private http: HttpClient,
              private appCommonserviceService : AppCommonserviceService,
              private dialog: MatDialog,
            ) { }

  ngOnInit(): void 
  {
   this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;
    this.voucherType ="Accounting";
    this.SetTitlePage();
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
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
    this.SetTitlePage();
    debugger
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['SuppliersOpeningBalance/SuppOpeningBalanceList']);
    }
    this.InitiailEntryVoucherForm();
    this.GetInitailOpeningBalance();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SuppopeningbalanceForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.suppOpeningBalanceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum : [0],
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
      suppliersOpeningBalanceList: [null, [Validators.required, Validators.minLength(1)]],
      defaultCurrency: [0]

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
    debugger
    var lang = this.jwtAuth.getLang();
    this.suppOpeningService.GetInitailOpeningBalance(this.voucherId,this.opType).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['SuppliersOpeningBalance/SuppOpeningBalanceList']);
          return;
        }
      result.voucherDate = formatDate( result.voucherDate , "yyyy-MM-dd" ,"en-US")     
      this.voucherTypeList = result.voucherTypeList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.voucherNameA : item.voucherNameE,
        isDefault: item.isDefault,
        branchId: item.branchId,
        preventChangeSerial: item.preventChangeSerial,
        preventChangeDate: item.preventChangeDate,
        preventChangeBranch:item.preventChangeBranch,
        serialType: item.serialType,
        currencyId: item.currencyId,
        serialByMonth: item.serialByMonth,
        printAfterSave: item.printAfterSave
      }));
      debugger
      this.branchesList = result.companyBranchesList;
      this.currencyList = result.currenciesList;
      this.accountsList = result.dealersList;
      this.decimalPlaces = result.currenciesList.find(option => option.id === result.defaultCurrency).data2;
      this.suppOpeningBalanceAddForm.get("defaultCurrency").setValue(result.defaultCurrency);
      this.defaultCurrencyId = result.defaultCurrency;
      this.suppOpeningBalanceAddForm.patchValue(result);
      if(result.suppliersTranDTList !== undefined && result.suppliersTranDTList !== null)
      {
        this.accVouchersDTsList = result.suppliersTranDTList;
        this.suppOpeningBalanceAddForm.get("suppliersOpeningBalanceList").setValue(result.suppliersTranDTList);
      }
      else
      {
        this.accVouchersDTsList = [];

      }
      if(this.opType == 'Edit')
        {
          this.disableVouchertype= true;
        }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
      this.disableSave = false;
        if(this.voucherId > 0){
          this.suppOpeningBalanceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.suppOpeningBalanceAddForm.get("currencyId").setValue(result.currencyId);
          this.suppOpeningBalanceAddForm.get("branchId").setValue(result.branchId);  
          this.suppOpeningBalanceAddForm.get("voucherDate").setValue(result.voucherDate);


          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currenciesList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency]; 
            this.suppOpeningBalanceAddForm.get("currencyId").setValue(result.currencyId);          
          }
  
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.companyBranchesList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche]; 
            this.suppOpeningBalanceAddForm.get("branchId").setValue(result.branchId); 
          }
        }
        else{
          debugger
          this.suppOpeningBalanceAddForm.get("currencyId").setValue(result.defaultCurrency);
          this.suppOpeningBalanceAddForm.get("branchId").setValue(result.defaultBranchId);        
          var currRate = result.currenciesList.find(option => option.id === result.defaultCurrency).data1;
          this.suppOpeningBalanceAddForm.get("currRate").setValue(currRate);
          this.suppOpeningBalanceAddForm.get("voucherDate").setValue(result.voucherDate);
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.suppOpeningBalanceAddForm.get("voucherTypeId").setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currenciesList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency]; 
            this.suppOpeningBalanceAddForm.get("currencyId").setValue(result.defaultCurrency); 
          }
  
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.companyBranchesList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche]; 
           this.suppOpeningBalanceAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          
        }
        this.GetVoucherTypeSetting(this.suppOpeningBalanceAddForm.value.voucherTypeId)
        debugger
        if(this.suppOpeningBalanceAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
        else
          {
            this.disableCurrRate = false;
          }
      });
    })
  }
 
  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    this.accVouchersDTsList.forEach(element=> {

      if(element.debit == "" || element.debit == null)
        {
          element.debit = 0;
        }
        if(element.credit == "" || element.credit == null)
          {
            element.credit = 0;
          }

        
      if(element.supplierId <= 0 || ((element.debit === '' || element.debit === null || element.debit <= 0) && (element.credit === '' || element.credit === null || element.credit <= 0))){
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.index = index.toString();
      index++;
    })


    for (let element of this.accVouchersDTsList) {
      debugger
      if(element.supplierId <= 0 || ((element.debit === '' || element.debit === null || element.debit <= 0) && (element.credit === '' || element.credit === null || element.credit <= 0))){
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.index = index.toString();
      index++;
    }

    //var debitTotal = this.accVouchersDTsList.reduce((sum, item) => sum + item.debit, 0);
    var debitTotal = this.accVouchersDTsList.reduce((sum, item) => sum + Number(item.debit), 0);
    var creditTotal = this.accVouchersDTsList.reduce((sum, item) => sum + Number(item.credit), 0);
/*     if (parseFloat(debitTotal) !== parseFloat(creditTotal)) {
      this.alert.ShowAlert("msgUnbalancedDebitCredit", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
  } */

    this.suppOpeningBalanceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.suppOpeningBalanceAddForm.value.userId = this.jwtAuth.getUserId();
    this.suppOpeningBalanceAddForm.value.voucherNo = this.suppOpeningBalanceAddForm.value.voucherNo.toString();
    this.suppOpeningBalanceAddForm.value.suppliersOpeningBalanceList = this.accVouchersDTsList;
    this.suppOpeningService.SaveSuppOpeningBalance(this.suppOpeningBalanceAddForm.value)
      .subscribe((result) => {
        debugger
        if (result) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.suppOpeningBalanceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintOpeningBalance(Number(result.message),this.suppOpeningBalanceAddForm.value.voucherDate,this.suppOpeningBalanceAddForm.value.voucherTypeId,this.suppOpeningBalanceAddForm.value.voucherNo);
          }


          if(this.opType == 'Edit')
            {
              this.router.navigate(['SuppliersOpeningBalance/SuppOpeningBalanceList']);    
            }
            this.voucherId =0;
            this.opType ='Add'
            this.accVouchersDTsList = [];
            this.ngOnInit();
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
    var voucherCategory = this.suppOpeningBalanceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.suppOpeningBalanceAddForm.value.voucherTypeId;
    var date = new Date(this.suppOpeningBalanceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var defaultCurrency = this.suppOpeningBalanceAddForm.value.defaultCurrency;


debugger
    if (voucherTypeId > 0) {
      this.suppOpeningService.GetSerialOpeningBalance(serialType,voucherTypeId,voucherCategory,year,month).subscribe((results) => {
        debugger
        if (results) {
          this.suppOpeningBalanceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.suppOpeningBalanceAddForm.get("voucherNo").setValue(1);
        }

        if(currencyId == null)
          {
            this.suppOpeningBalanceAddForm.get("currencyId").setValue(defaultCurrency);
            var currRate = this.currencyList.find(option => option.id === defaultCurrency).data1;
            this.suppOpeningBalanceAddForm.get("currRate").setValue(currRate);
          }
          else{
            this.suppOpeningBalanceAddForm.get("currencyId").setValue(currencyId);
            var currRate = this.currencyList.find(option => option.id === defaultCurrency).data1;
            this.suppOpeningBalanceAddForm.get("currRate").setValue(currRate);
          }

       // this.suppOpeningBalanceAddForm.get("currencyId").setValue(currencyId);
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
        var currRate = this.currencyList.find(option => option.id === currencyId).data1;
        this.suppOpeningBalanceAddForm.get("currRate").setValue(currRate);
        if(branchId == null || branchId == undefined)
          {
            this.suppOpeningBalanceAddForm.get("branchId").setValue(0);
          }
          else
          {
            this.suppOpeningBalanceAddForm.get("branchId").setValue(branchId);
          }
        
      });
    }
    else
    {
      this.suppOpeningBalanceAddForm.get("voucherNo").setValue(0);
    }
    debugger
    if( currencyId!= 0 && currencyId != null && currencyId != undefined)
      {
        this.suppOpeningBalanceAddForm.get("currencyId").setValue(currencyId);
        var currRate = this.currencyList.find(option => option.id === currencyId).data1;
        this.suppOpeningBalanceAddForm.get("currRate").setValue(currRate);
        if(this.suppOpeningBalanceAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
          else
          {
            this.disableCurrRate = false;
          }
      }
      else
      {
        this.suppOpeningBalanceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
        let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
        this.suppOpeningBalanceAddForm.get("currRate").setValue(currRate);
        if(this.suppOpeningBalanceAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
          else
          {
            this.disableCurrRate = false;
          }
      }
    if(voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined)
      {
        this.GetVoucherTypeSetting(voucherTypeId);
      }
  }

  getCurrencyRate(event: any){
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    this.suppOpeningBalanceAddForm.get("currRate").setValue(currRate);
    if(event.value == this.defaultCurrencyId)
      {
        this.disableCurrRate=true;
      }
    else
      {
        this.disableCurrRate = false;
      }
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
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

  AddNewLine(){    
    debugger  
    if(this.disableAll ==true)
      {
        return;
      }
    this.accVouchersDTsList.push(
    {
      supplierId: 0,
      debit: "",
      credit: "",
      note: "",
      index: ""
    });
    this.suppOpeningBalanceAddForm.get("suppliersOpeningBalanceList").setValue(this.accVouchersDTsList);
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

  formatAmt(row: any,type: number){
    debugger
    if(type==0)
      row.debit = row.debit.toFixed(this.decimalPlaces);
    else if(type==1)
      row.credit = row.credit.toFixed(this.decimalPlaces);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.accVouchersDTsList.splice(rowIndex, 1);
    }
    this.suppOpeningBalanceAddForm.get("suppliersOpeningBalanceList").setValue(this.accVouchersDTsList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  isOneEmpty(row: any){
    if((row.debit === '' || row.debit === null || row.debit <= 0) && (row.credit === '' || row.credit === null || row.credit <= 0)){
      return true;
    }
    else{
      return false;
    }
  }

  isValidVoucherDate(event){
    debugger
    this.validDate = true;
    if(event.target.value == ""){
      this.validDate = false;
      return;
    }
    this.appCommonserviceService.isValidVoucherDate(event.target.value).subscribe(res => {
      if(!res){
        this.validDate = false;
        this.alert.ShowAlert("msgInvalidDate",'error');
      }         
    }, err => {
      this.validDate = false;
    })
  }

  onAddRowBefore(rowIndex: number) {
    const newRow = 
    {
      supplierId: 0,
      debit: "",
      credit: "",
      note: "",
      index: ""
    };

    this.accVouchersDTsList.splice(rowIndex, 0, newRow);
    this.suppOpeningBalanceAddForm.get("suppliersOpeningBalanceList").setValue(this.accVouchersDTsList);
  }
 
  DeleteOpeningBalance(id: any) {
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
        this.suppOpeningService.DeleteOpeningBalance(id).subscribe((results) => {
          if (results) {
            this.alert.DeleteSuccess();
            this.router.navigate(['SuppliersOpeningBalance/SuppOpeningBalanceList']);
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

  GetVoucherTypeSetting(voucherTypeId:number)
  {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial; 
    this.allowEditBranch =this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  OpenDealerStatementForm(dealerId: number) {
    this.routePartsService.GuidToEdit = dealerId;

    // Construct the URL you want to navigate to
    const url = `/PayablesReport/GetSupplierAccountStatementForm?acc=${dealerId}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  PrintOpeningBalance(voucherId, voucherDate, voucherTypeId, voucherNo) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    voucherDate = formatDate( voucherDate, "dd-MM-yyyy" , "en-US" );

    if(this.Lang == "ar")
    { 
      const reportUrl = `RptSuppliersOpeningBalanceAR?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptSuppliersOpeningBalanceEN?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }


  voucherNoBlur(VoucherNo , VoucherTypeId)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.suppOpeningService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
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


/* 
  voucherNoBlur(voucherNo, voucherTypeId) {
    debugger
    this.suppOpeningService.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
      debugger
      if (result !=  null) {
        this.voucherId = result.id;
        this.opType = 'Edit';
        if(result.status == 67)
          {
              this.opType = 'Show';
          }
        this.GetInitailOpeningBalance();
      }
      else {
        this.voucherId = 0;
        this.opType = 'Add';
        this.clearFormdata(voucherNo);
      }
    });
  } */


  clearFormdata(VoucherNo)
  {    debugger
    this.newDate = new Date;
    this.suppOpeningBalanceAddForm.get("id").setValue(0);
    this.suppOpeningBalanceAddForm.get("voucherNo").setValue(VoucherNo);
    this.suppOpeningBalanceAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.suppOpeningBalanceAddForm.get("branchId").setValue(0);
    this.suppOpeningBalanceAddForm.get("currencyId").setValue(0);
    this.suppOpeningBalanceAddForm.get("currRate").setValue(0);
    this.suppOpeningBalanceAddForm.get("note").setValue("");
    this.accVouchersDTsList = [];
    this.suppOpeningBalanceAddForm.value.accVouchersDocModelList = []
  }

  CopyRow(row,index)
  {
    debugger
    this.accVouchersDTsList.push(
      {
        supplierId: row.supplierId,
        debit: row.debit,
        credit: row.credit,
        note: row.note,
        index: ""
      });
  }

  handleF3Key(event: KeyboardEvent, row, index) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index);
    }
  }
}
