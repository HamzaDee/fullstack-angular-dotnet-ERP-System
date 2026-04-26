import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
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
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { CardCollectionService } from '../cardcollection.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
@Component({
  selector: 'app-cardscollectionform',
  templateUrl: './cardscollectionform.component.html',
  styleUrl: './cardscollectionform.component.scss'
})
export class CardscollectionformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  EntryVoucherAddForm: FormGroup;
  public TitlePage: string;
  voucherTypeList: any;
  bankAccountsList: any;
  expesnsesAccountsList: any;
  cardAccountsList: any;
  costcenterList1: any;
  costcenterList2: any;
  costcenterList3: any;
  creditCardList:any;

  tabelData: any[];
  loading: boolean;
  opType: string;
  
  currencyList: any;
  creditCardsModelList: any[] = [];
  
  branchesList: any;
  costCenterPolicyList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  voucherType:any;
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
  UseTax: boolean;
  defaultCurrencyId:number;
  allowAccRepeat:any;
// BudgetEdit
  date :any ;
  Balance:any;
  BudgetAmount:number;
//end
  disableCurrRate:boolean;
  Lang: string;
  disableSave:boolean;
  disableVouchertype:boolean = false;
  newDate:any;
  BankAccCostCenterPolicy = 0;
  ExpAccCostCenterPolicy = 0;
  CardAccCostCenterPolicy = 0 

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private service: CardCollectionService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private appCommonserviceService: AppCommonserviceService,
    private dialog: MatDialog,
    private entryvouchersService: AppEntryvouchersService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
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

    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['CreditCardsCollection/Cardscollectionlist']);
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
    this.GetInitailCreditCardVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Cardscollectionform');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.EntryVoucherAddForm = this.formbulider.group({
      id: [0],
      voucherHDId:[0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      branchId: [null],
      amount: [0],
      userId: [0],
      bankAccountId:[0, [Validators.required, Validators.min(1)]],
      expAccountId:[0,],
      creditCardAccId:[0, [Validators.required, Validators.min(1)]],
      bankAmt:[0, [Validators.required]],
      expAmt:[0,],
      creditCardAmt:[0, [Validators.required]],        
      bankCostCenter:[0],
      expCostCenter:[0],
      cardCostCenter:[0],        
      creditCardsCollectionDtModel: [null, [Validators.required, Validators.minLength(1)]],
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
  
  GetInitailCreditCardVoucher() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.service.GetInitailCreditCardVoucher(this.voucherId,this.opType).subscribe(result => {
      if(result.isSuccess == false)
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['CreditCardsCollection/Cardscollectionlist']);
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
        allowAccRepeat : item.allowAccRepeat,
        printAfterSave: item.printAfterSave
      }));
      this.date = new Date;
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.bankAccountsList = result.accountsList;
      this.expesnsesAccountsList = result.accountsList;
      this.cardAccountsList = result.accountsList;
      this.costcenterList1 = result.costCenterList;
      this.costcenterList2 = result.costCenterList;
      this.costcenterList3 = result.costCenterList;
      this.creditCardList = result.creditCardsList;
      this.creditCardsModelList = result.creditCardsList;
      debugger
      this.EntryVoucherAddForm.patchValue(result);
      this.creditCardsModelList = result.creditCardsCollectionDtModel;
      if(this.creditCardsModelList == undefined || this.creditCardsModelList == null || this.creditCardsModelList.length == 0)
        {
          this.creditCardsModelList = result.creditCardsList;
        }
      this.EntryVoucherAddForm.get("creditCardsCollectionDtModel").setValue(this.creditCardsModelList);
      this.EntryVoucherAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      this.childAttachment.data = result.accVouchersDocModelList;
      this.defaultCurrencyId =result.defaultCurrency;
      this.childAttachment.ngOnInit();
      
    if(this.opType == 'Edit')
      {
        this.disableVouchertype= true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
      this.disableSave = false;
      this.useCostCenter = result.useCostCenter;
        debugger
        if (this.voucherId > 0) {
          this.EntryVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.EntryVoucherAddForm.get("currencyId").setValue(result.currencyId);
          this.EntryVoucherAddForm.get("branchId").setValue(result.branchId);    
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
          if(result.defaultBranchId !== 0 && result.defaultBranchId !== null)
            {
              var defaultVoucher =  result.voucherTypeList?.find(option => option.isDefault)?.id || 0;
              this.EntryVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
            }
            else{
              var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id || 0;
              this.EntryVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
            }   
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency]; 
            this.EntryVoucherAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.EntryVoucherAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          if(defaultVoucher !== undefined && defaultVoucher !== null && defaultVoucher !== 0)
            {
              this.getVoucherNo(defaultVoucher);
            }
          debugger
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.EntryVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          }

          if(this.EntryVoucherAddForm.value.currencyId == 0 )
            {
                  this.EntryVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
                  var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
                  this.EntryVoucherAddForm.get("currRate").setValue(currRate);       
              }
              if(this.EntryVoucherAddForm.value .branchId == undefined ||this.EntryVoucherAddForm.value .branchId == null)
              {
                this.EntryVoucherAddForm.get("branchId").setValue(0);
              }
              this.EntryVoucherAddForm.get("bankCostCenter").setValue(0);
              this.EntryVoucherAddForm.get("expCostCenter").setValue(0);
              this.EntryVoucherAddForm.get("cardCostCenter").setValue(0);      
              this.date = formatDate(this.date , "yyyy-MM-dd", "en-US")  
              this.EntryVoucherAddForm.get("voucherDate").setValue(this.date);       
        }
        this.GetVoucherTypeSetting(this.EntryVoucherAddForm.value.voucherTypeId);
        if(this.EntryVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
      if(this.EntryVoucherAddForm.value.bankAccountId == 0 || this.EntryVoucherAddForm.value.bankAccountId == null || this.EntryVoucherAddForm.value.bankAccountId == undefined)
      {
        this.alert.ShowAlert("PleaseInsertBankAccount",'error')
        return;
      }
      if(this.EntryVoucherAddForm.value.bankAmt == 0 || this.EntryVoucherAddForm.value.bankAmt == null || this.EntryVoucherAddForm.value.bankAmt == undefined)
        {
          let AccountName = this.bankAccountsList.find(r => r.id == this.EntryVoucherAddForm.value.bankAccountId).text;
          this.alert.ShowAlert4Fields("PleaseInsertAmount" , " : " , AccountName , 'error');
          this.disableSave = false;
          return false;
        }
      if(this.EntryVoucherAddForm.value.expAccountId > 0)
        {
          if(this.EntryVoucherAddForm.value.expAmt == 0 || this.EntryVoucherAddForm.value.expAmt == null || this.EntryVoucherAddForm.value.expAmt == undefined)
            {
              let AccountName = this.bankAccountsList.find(r => r.id == this.EntryVoucherAddForm.value.expAccountId).text;
              this.alert.ShowAlert4Fields("PleaseInsertAmount" , " : " , AccountName , 'error');
              this.disableSave = false;
              return false;
            }
        }
        

        if(this.EntryVoucherAddForm.value.creditCardAccId == 0 || this.EntryVoucherAddForm.value.creditCardAccId == null || this.EntryVoucherAddForm.value.creditCardAccId == undefined)
          {
            this.alert.ShowAlert("PleaseInsertCreditCardAccount",'error')
            return;
          }
          if(this.EntryVoucherAddForm.value.creditCardAmt == 0 || this.EntryVoucherAddForm.value.creditCardAmt == null || this.EntryVoucherAddForm.value.creditCardAmt == undefined)
            {
              let AccountName = this.bankAccountsList.find(r => r.id == this.EntryVoucherAddForm.value.creditCardAccId).text;
              this.alert.ShowAlert4Fields("PleaseInsertAmount" , " : " , AccountName , 'error');
              this.disableSave = false;
              return false;
            }


      if(this.BankAccCostCenterPolicy== 61 )
        {
          let AccountName = this.bankAccountsList.find(r => r.id == this.EntryVoucherAddForm.value.bankAccountId).text;
          if(this.EntryVoucherAddForm.value.bankCostCenter == 0 || this.EntryVoucherAddForm.value.bankCostCenter == null || this.EntryVoucherAddForm.value.bankCostCenter == undefined)
            {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter" , " : " , AccountName , 'error');
              this.disableSave = false;
              return false;
            }
        }
      else if (this.BankAccCostCenterPolicy== 60)
        {
          let AccountName1 = this.bankAccountsList.find(r => r.id == this.EntryVoucherAddForm.value.bankAccountId).text;
          this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter" , " : " , AccountName1 , 'error');
        }

      if(this.ExpAccCostCenterPolicy== 61 )
        {
          let AccountName = this.bankAccountsList.find(r => r.id == this.EntryVoucherAddForm.value.expAccountId).text;
          if(this.EntryVoucherAddForm.value.expCostCenter == 0 || this.EntryVoucherAddForm.value.expCostCenter == null || this.EntryVoucherAddForm.value.expCostCenter == undefined)
            {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter" , " : " , AccountName , 'error');
              this.disableSave = false;
              return false;
            }
        }
      else if (this.ExpAccCostCenterPolicy== 60)
        {
          let AccountName = this.bankAccountsList.find(r => r.id == this.EntryVoucherAddForm.value.expAccountId).text;
          this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter" , " : " , AccountName , 'error');
        }

      if(this.CardAccCostCenterPolicy== 61 )
        {
          let AccountName = this.bankAccountsList.find(r => r.id == this.EntryVoucherAddForm.value.creditCardAccId).text;
          if(this.EntryVoucherAddForm.value.cardCostCenter == 0 || this.EntryVoucherAddForm.value.cardCostCenter == null || this.EntryVoucherAddForm.value.cardCostCenter == undefined)
            {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter" , " : " , AccountName , 'error');
              this.disableSave = false;
              return false;
            }
        }
      else if (this.CardAccCostCenterPolicy== 60)
        {
          let AccountName1 = this.bankAccountsList.find(r => r.id == this.EntryVoucherAddForm.value.creditCardAccId).text;
          this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter" , " : " , AccountName1 , 'error');
        }
        
        
    if((Number(this.EntryVoucherAddForm.value.bankAmt) + Number(this.EntryVoucherAddForm.value.expAmt)) != Number(this.EntryVoucherAddForm.value.creditCardAmt))
      {
        this.alert.ShowAlert("TheresDefferentBetweenAmounts",'error')
        return;
      }
    
      let SumTotal = 0;
      for (let i = 0; i < this.creditCardsModelList.length; i++) 
      {
        let row = this.creditCardsModelList[i];
        if(row.isProcurement)
          {
            SumTotal +=  row.amount
          }          
      }
      if(SumTotal == 0)
        {
          this.alert.ShowAlert("PleaseChooseOneCreditCardAtleast",'error')
          return false;
        }
        if(SumTotal != Number(this.EntryVoucherAddForm.value.creditCardAmt))
        {
          this.alert.ShowAlert("TheresDefferentBetweenAmountAndTable",'error')
          return false;
        }
      

      let rows = this.EntryVoucherAddForm.value.creditCardsCollectionDtModel.filter(r => r.isProcurement == true);
      this.EntryVoucherAddForm.get("creditCardsCollectionDtModel").setValue([]);
      for (let i = 0; i < rows.length; i++) 
        {
          this.EntryVoucherAddForm.value.creditCardsCollectionDtModel.push(
            {
              id: this.EntryVoucherAddForm.value.id,
              voucherHDId: rows[i].voucherHDId,
              creditCardId:rows[i].cardId,
              bankAccountId: this.EntryVoucherAddForm.value.bankAccountId,
              bankAmt: this.EntryVoucherAddForm.value.bankAmt,
              expAccountId: this.EntryVoucherAddForm.value.expAccountId,
              expAmt: this.EntryVoucherAddForm.value.expAmt,
              creditCardAmt:this.EntryVoucherAddForm.value.creditCardAmt,
              creditCardAccId: this.EntryVoucherAddForm.value.creditCardAccId,
              creditCardNo:rows[i].cardNo,
              bankCostCenter: this.EntryVoucherAddForm.value.bankCostCenter,
              expCostCenter: this.EntryVoucherAddForm.value.expCostCenter,
              cardCostCenter: this.EntryVoucherAddForm.value.cardCostCenter,
              cardId:rows[i].cardId,
            });
        }        
      this.EntryVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.EntryVoucherAddForm.value.userId = this.jwtAuth.getUserId();
      this.EntryVoucherAddForm.value.voucherNo = this.EntryVoucherAddForm.value.voucherNo.toString();
      this.EntryVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
      debugger
      this.service.SaveCreditCardCollection(this.EntryVoucherAddForm.value).subscribe((result) => {
        if (result) {
          this.alert.SaveSuccess();


            debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.EntryVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintCreditCardsCollection(Number(result.message));
          }


          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['CreditCardsCollection/Cardscollectionlist']);
            }
          this.opType = 'Add';
          this.voucherId = 0;
          this.ClearFormData();
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
      this.service.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.EntryVoucherAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.EntryVoucherAddForm.get("voucherNo").setValue(1);
        }

        this.EntryVoucherAddForm.get("branchId").setValue(branchId);
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
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if( currencyId!= 0 && currencyId != null && currencyId != undefined)
      {
        this.EntryVoucherAddForm.get("currencyId").setValue(currencyId);
        var currRate = this.currencyList.find(option => option.id === currencyId).data1;
        this.EntryVoucherAddForm.get("currRate").setValue(currRate);
        if(this.EntryVoucherAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
          else
          {
            this.disableCurrRate = false;
          }
        this.cdr.detectChanges();
      }
      else
      {
        this.EntryVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
        let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
        this.EntryVoucherAddForm.get("currRate").setValue(currRate);
        if(this.EntryVoucherAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
          else
          {
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

  calculateSum() {
          return this.formatCurrency(this.creditCardsModelList.filter(r => r.isProcurement == true).reduce((sum, item) => {
              const amount = parseFloat(item.amount) || 0; 
              return sum + amount;
          }, 0));
      
  }

  formatAmt(row: any, type: number) {
    debugger
    if (type == 0)
      row.debit = row.debit.toFixed(this.decimalPlaces);
    else
      row.credit = row.credit.toFixed(this.decimalPlaces);
    // if(row.debit > 0 || row.credit > 0)
    //   {
    //     if(this.BudgetAmount != 0 )
    //       {
    //         if(this.Balance + Number(row.debit + row.credit) > this.BudgetAmount)
    //           {
    //             if(row.accountBudgetPolicy == 60)
    //               {
    //                 this.showBalance = false;
    //                 this.showPrevent = false;
    //                 this.showAlert = true;
    //                 this.hideLabelAfterDelay();
    //               }
    //               else if(row.accountBudgetPolicy == 61)
    //               {
    //                 row.credit = 0;
    //                 row.debit = 0;
    //                 this.showBalance = false;
    //                 this.showAlert = false;
    //                 this.showPrevent = true;
    //                 this.hideLabelAfterDelay();
    //               }
    //           }
    //       }
    //   }
      
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
        this.service.DeleteVoucher(id).subscribe((results) => {
          if (results) {
            if(results.isSuccess == false && results.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                this.router.navigate(['CreditCardsCollection/Cardscollectionlist']);
                return;
              }
              else
              {
                this.alert.DeleteSuccess();
                this.router.navigate(['CreditCardsCollection/Cardscollectionlist']);
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
  
    PrintCreditCardsCollection(Id: number) {
      debugger
      this.Lang = this.jwtAuth.getLang();
      if(this.Lang == "ar")
      { 
        const reportUrl = `RptCreditCardsCollectionAR?Id=${Id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else{ 
        const reportUrl = `RptCreditCardsCollectionEN?Id=${Id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
    }
  voucherNoBlur(voucherNo, voucherTypeId)
  {
    debugger
    this.service.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
      debugger
      if (result !=  null) {
        this.voucherId = result.id;
        this.opType = 'Edit';         
        this.GetInitailCreditCardVoucher();
      }
      else {
        this.voucherId = 0;
        this.opType = 'Add';
        this.ClearFormData();
        this.GetInitailCreditCardVoucher();
        this.disableVouchertype =false;
      }
    });
  }

  UpdatecheckBox(event,row,index)
  {
    debugger 
    if(event.currentTarget.checked)
      {
        row.isProcurement = true;
      }
      else
      {
        row.isProcurement = false;
      }
  }

  ClearFormData()
  {
    this.EntryVoucherAddForm.get("id").setValue(0);
    this.EntryVoucherAddForm.get("currencyId").setValue(0);
    this.EntryVoucherAddForm.get("currRate").setValue(0);
    this.EntryVoucherAddForm.get("branchId").setValue(0);
    this.EntryVoucherAddForm.get("amount").setValue(0);
    this.EntryVoucherAddForm.get("bankAccountId").setValue(0);
    this.EntryVoucherAddForm.get("expAccountId").setValue(0);
    this.EntryVoucherAddForm.get("creditCardAccId").setValue(0);
    this.EntryVoucherAddForm.get("bankAmt").setValue(0);
    this.EntryVoucherAddForm.get("expAmt").setValue(0);
    this.EntryVoucherAddForm.get("creditCardAmt").setValue(0);
    this.EntryVoucherAddForm.get("bankCostCenter").setValue(0);
    this.EntryVoucherAddForm.get("expCostCenter").setValue(0);
    this.EntryVoucherAddForm.get("cardCostCenter").setValue(0);
    this.EntryVoucherAddForm.get("creditCardsCollectionDtModel").setValue([]);
    this.EntryVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.EntryVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
    this.disableVouchertype= false;
  }

  OnAccountChange(event,type)
  {
    debugger
    let BranchId = this.EntryVoucherAddForm.value.branchId;
    if(BranchId == 0 || BranchId == null || BranchId == undefined)
      {
        BranchId = 0;
      }
      if(event.value)
        {
          this.entryvouchersService.GetAccountInfo(event.value,BranchId).subscribe((result) => {
            if(type == 1)
              {
                this.BankAccCostCenterPolicy = result.costCenterPolicy;
              }
            else if (type == 2)
              {
                this.ExpAccCostCenterPolicy = result.costCenterPolicy;                              
              }
            else
            {
              this.CardAccCostCenterPolicy = result.costCenterPolicy;
            }
          });
        }
        else
        {
          if(type == 1)
            {
              this.BankAccCostCenterPolicy = 0;
            }
          else if (type == 2)
            {
              this.ExpAccCostCenterPolicy = 0;
            }
            else
            {
              this.CardAccCostCenterPolicy = 0;
            }
        }
   

  }
}
