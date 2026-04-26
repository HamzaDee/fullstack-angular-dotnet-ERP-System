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
import { CustomerOpeningBalanceService } from '../app-customeropeningbalance.service';

@Component({
  selector: 'app-customersopeningbalance-form',
  templateUrl: './customersopeningbalance-form.component.html',
  styleUrls: ['./customersopeningbalance-form.component.scss']
})
export class CustomersopeningbalanceFormComponent implements OnInit {
 custOpeningBalanceAddForm: FormGroup;
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
  newDate:any; 
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  selectedVoucherType: any;
  voucherId: any;
  decimalPlaces: number;
  disableAll:boolean=false; 
  defaultCurrencyId:number;
//VoucherTypeSetting
  allowEditDate:boolean= false;
  allowEditVoucherSerial:boolean= false;
  allowEditBranch:boolean= false;
//End
  disableCurrRate:boolean;
  disableSave:boolean;
  disableVouchertype:boolean = false;
  Lang: string;
  showsave: boolean;
  voucherType:any;
  voucherNo: number = 0;
  
  constructor
            (
              private title: Title,
              private jwtAuth: JwtAuthService,
              private alert: sweetalert,
              private cusOpeningService: CustomerOpeningBalanceService,
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
      this.router.navigate(['CustomersOpeningBalance/CustOpeningBalanceList']);
    }
    this.InitiailEntryVoucherForm();
    this.GetInitailOpeningBalance();
  }
  
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AddCustomerOpeningBalance');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.custOpeningBalanceAddForm = this.formbulider.group({
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
      customersOpeningBalanceList: [null, [Validators.required, Validators.minLength(1)]],
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
    this.cusOpeningService.GetInitailCustomersOpeningBalance(this.voucherId,this.opType).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['CustomersOpeningBalance/CustOpeningBalanceList']);
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
      this.defaultCurrencyId =result.defaultCurrency;
      this.custOpeningBalanceAddForm.patchValue(result);
      if(result.customersTranDTList !== undefined && result.customersTranDTList !== null)
      {
        this.accVouchersDTsList = result.customersTranDTList;
        this.custOpeningBalanceAddForm.get("customersOpeningBalanceList").setValue(result.customersTranDTList);
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
        debugger
        this.disableSave = false;
        if(this.voucherId > 0){
          this.custOpeningBalanceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.custOpeningBalanceAddForm.get("currencyId").setValue(result.currencyId);
          this.custOpeningBalanceAddForm.get("branchId").setValue(result.branchId);  

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currenciesList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency]; 
            this.custOpeningBalanceAddForm.get("currencyId").setValue(result.currencyId);          
          }
  
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.companyBranchesList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche]; 
            this.custOpeningBalanceAddForm.get("branchId").setValue(result.branchId); 
          }

        }
        else{
          debugger
          this.custOpeningBalanceAddForm.get("branchId").setValue(result.defaultBranchId); 
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currenciesList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency]; 
            this.custOpeningBalanceAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.custOpeningBalanceAddForm.get("currRate").setValue(defaultCurrency.data1);
          }       
          var voucherType = this.voucherTypeList.find(r => r.isDefault == true).label;
          if(voucherType != null && voucherType != undefined && voucherType >0)
            {
              this.custOpeningBalanceAddForm.get("voucherTypeId").setValue(voucherType);
              this.getVoucherNo(this.custOpeningBalanceAddForm.value.voucherTypeId);
            }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.companyBranchesList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche]; 
           this.custOpeningBalanceAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          if(this.custOpeningBalanceAddForm.value.currencyId == 0 )
            {
                 this.custOpeningBalanceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
                 var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
                 this.custOpeningBalanceAddForm.get("currRate").setValue(currRate);       
             }
        }                
        this.GetVoucherTypeSetting(this.custOpeningBalanceAddForm.value.voucherTypeId)
        if(this.custOpeningBalanceAddForm.value.currencyId == this.defaultCurrencyId)
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
      if(element.customerId <= 0 || ((element.debit === '' || element.debit === null || element.debit <= 0) && (element.credit === '' || element.credit === null || element.credit <= 0))){
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
      if(element.customerId <= 0 || ((element.debit === '' || element.debit === null || element.debit <= 0) && (element.credit === '' || element.credit === null || element.credit <= 0))){
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.index = index.toString();
      index++;
    }
    var debitTotal = this.accVouchersDTsList.reduce((sum, item) => sum + Number(item.debit), 0);
    var creditTotal = this.accVouchersDTsList.reduce((sum, item) => sum + Number(item.credit), 0);
  
    this.custOpeningBalanceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.custOpeningBalanceAddForm.value.userId = this.jwtAuth.getUserId();
    this.custOpeningBalanceAddForm.value.voucherNo = this.custOpeningBalanceAddForm.value.voucherNo.toString();
    this.custOpeningBalanceAddForm.value.customersOpeningBalanceList = this.accVouchersDTsList;
  
    
    this.cusOpeningService.SaveCustomersOpeningBalance(this.custOpeningBalanceAddForm.value)
      .subscribe((result) => {
        if (result) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.custOpeningBalanceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintOpeningBalance(Number(result.message),this.custOpeningBalanceAddForm.value.voucherDate,this.custOpeningBalanceAddForm.value.voucherTypeId,this.custOpeningBalanceAddForm.value.voucherNo);
          }


          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['CustomersOpeningBalance/CustOpeningBalanceList']);
            }
            this.opType = 'Add'
            this.voucherId = 0;
            this.ngOnInit();
            setTimeout(() => {
             this.GetVoucherTypeSetting(this.custOpeningBalanceAddForm.value.voucherTypeId); 
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
    var voucherCategory = this.custOpeningBalanceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.custOpeningBalanceAddForm.value.voucherTypeId;
    var date = new Date(this.custOpeningBalanceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
debugger
    if (voucherTypeId > 0) {
      this.cusOpeningService.GetSerialOpeningBalance(serialType,voucherTypeId,voucherCategory,year,month).subscribe((results) => {
        debugger
        if (results) {
          this.custOpeningBalanceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.custOpeningBalanceAddForm.get("voucherNo").setValue(1);
        }       
      });
      if( currencyId!= 0 && currencyId != null && currencyId != undefined)
        {
          this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
        }
        else
        {
          this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;            
        }
    }
    else
    {
      this.custOpeningBalanceAddForm.get("voucherNo").setValue(0);
    }
    debugger
    if(voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined)
      {
        this.GetVoucherTypeSetting(voucherTypeId);
      }
      if( currencyId!= 0 && currencyId != null && currencyId != undefined)
        {
          this.custOpeningBalanceAddForm.get("currencyId").setValue(currencyId);
          var currRate = this.currencyList.find(option => option.id === currencyId).data1;
          this.custOpeningBalanceAddForm.get("currRate").setValue(currRate);
          if(this.custOpeningBalanceAddForm.value.currencyId == this.defaultCurrencyId)
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
          this.custOpeningBalanceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
          let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
          this.custOpeningBalanceAddForm.get("currRate").setValue(currRate);
          if(this.custOpeningBalanceAddForm.value.currencyId == this.defaultCurrencyId)
            {
              this.disableCurrRate = true;
            }
            else
            {
              this.disableCurrRate = false;
            }
        }
  }

  getCurrencyRate(event: any){
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    this.custOpeningBalanceAddForm.get("currRate").setValue(currRate);
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

  AddNewLine(){    
    debugger   
  if(this.disableAll ==true)
    {
      return;
    }
    this.accVouchersDTsList.push(
    {
      customerId: 0,
      debit: "",
      credit: "",
      note: "",
      index: ""
    });
    this.custOpeningBalanceAddForm.get("customersOpeningBalanceList").setValue(this.accVouchersDTsList);
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
  
  formatAmt(row: any,type: number){
    debugger
    if(type==0)
      row.debit = row.debit.toFixed(this.decimalPlaces);
    else if(type==1)
      row.credit = row.credit.toFixed(this.decimalPlaces);
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

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.accVouchersDTsList.splice(rowIndex, 1);
    }
    this.custOpeningBalanceAddForm.get("customersOpeningBalanceList").setValue(this.accVouchersDTsList);
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
      customerId: 0,
      debit: 0,
      credit: 0,
      note: "",
      index: ""
    };

    this.accVouchersDTsList.splice(rowIndex, 0, newRow);
    this.custOpeningBalanceAddForm.get("customersOpeningBalanceList").setValue(this.accVouchersDTsList);
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
        this.cusOpeningService.DeleteCustomersOpeningBalance(id).subscribe((results) => {
          if (results) {
            if(results.isSuccess == false && results.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                return;
              }
              else
              {
                this.alert.DeleteSuccess();
                this.router.navigate(['CustomersOpeningBalance/CustOpeningBalanceList']);
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

  OpenCustomerStatementForm(dealerId: number) {
    this.routePartsService.GuidToEdit = dealerId;

    // Construct the URL you want to navigate to
    const url = `/ReceivableReports/GetCustomersAccountStatementForm?acc=${dealerId}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  GetVoucherTypeSetting(voucherTypeId:number)
  {
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial; 
    this.allowEditBranch =this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  PrintOpeningBalance(voucherId, voucherDate, voucherTypeId, voucherNo) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    voucherDate = formatDate( voucherDate, "dd-MM-yyyy" , "en-US" );

    if(this.Lang == "ar")
    { 
      const reportUrl = `RptCustomerOpeningBalanceAR?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptCustomerOpeningBalanceEN?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

/*   voucherNoBlur(voucherNo, voucherTypeId) {
    debugger
    this.cusOpeningService.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
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
  }
 */

  voucherNoBlur(VoucherNo , VoucherTypeId)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.cusOpeningService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
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
    this.custOpeningBalanceAddForm.get("id").setValue(0);
    this.custOpeningBalanceAddForm.get("voucherNo").setValue(VoucherNo);
    this.custOpeningBalanceAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.custOpeningBalanceAddForm.get("branchId").setValue(0);
    this.custOpeningBalanceAddForm.get("currencyId").setValue(0);
    this.custOpeningBalanceAddForm.get("currRate").setValue(0);
    this.accVouchersDTsList = [];
    this.custOpeningBalanceAddForm.value.accVouchersDocModelList = []
  }

  CopyRow(row,index)
  {
    debugger
    this.accVouchersDTsList.push(
      {
        customerId: row.customerId,
        debit:row.debit,
        credit:row.credit,
        note:row.note,
        index:"",
      });
      this.custOpeningBalanceAddForm.get("customersOpeningBalanceList").setValue(this.accVouchersDTsList);   
  }

  handleF3Key(event: KeyboardEvent, row, index) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index);
    }
  }

   loadLazyCustomerOptions(event: any) {
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
