import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, RequiredValidator } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ReportsService } from '../reports.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ActivatedRoute, Params } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-projectstransactions',
  templateUrl: './projectstransactions.component.html',
  styleUrls: ['./projectstransactions.component.scss']
})
export class ProjectstransactionsComponent implements OnInit {
  ProjectsTrasnactionsAddForm: FormGroup;
  selectedacc: any;
  selectedbranch: any;
  selectedper: any;
  selectedprojId: any;
  hidden:boolean=true;
  accountsList: any;
  userbranchList: any;
  projectsList: any;
  periodsList: any;
  showProjtotals: boolean = false;
  showAccountstotals: boolean = false;
  accVoucherList: any;
  selectedstatus: number;
  statusList: any;
    FromDate : any;

  currentLang = this.jwtAuth.getLang();
   chooseText = this.currentLang === 'en' ? 'Select one' : 'اختر';
/*   statusList: { id: number; text: string }[] = [
    { id: -1, text:  this.chooseText },    // ID 0 for "Choose"
    { id: 1, text: 'مرحل' },    // ID 1 for "Posted"
    { id: 0, text: 'غير مرحل' },  // ID 2 for "Unposted"
  ]; */
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  voucherData: any;
  headerData: any;
  isDisabled: boolean = true;
  selectAll: boolean = false;
  isAnyRowChecked: boolean = false;
  total: number = 0;
  tot1: number = 0;
  tot2: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  totalFormatted: string = '0';
  projectNo: number;
  acc: number;
  screenId: number = 129;
  custom: boolean;
  data: any[];
  public TitlePage: string;

  constructor
    (    
      private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: ReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute ,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    debugger
    this.route.queryParams.subscribe((params: Params) => {
      debugger
      this.projectNo = +params['projectNo'];
      this.acc = +params['acc'];
    });
    this.GetCostCenterTransactionsForm();
    this.GetCostCenterTransactionInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetCostCenterTransactionsForm() {
    debugger
    this.ProjectsTrasnactionsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      accId: [0],
      branchId: [0],
      projectId: [0],
      fromdate: [''],
      todate: [''],
      voucherStatus: [this.selectedstatus],
      yearId: [0],
      currencyId: [0],
      exRate: [0],
      projtotals: [0],
      accountstotals: [0],
    });
  }

  GetCostCenterTransactionInitialForm() {
    this.ReportsService.GetProjectsTransForm().subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      this.accountsList = result.accountList;
      this.userbranchList = result.companyBranchList;
      this.periodsList = result.periodsFiscalYearsList;
      this.projectsList = result.projectsList;
      this.statusList = result.statusList;

      debugger
      this.ProjectsTrasnactionsAddForm.patchValue(result);
      result.fromdate = formatDate(result.fromdate, "yyyy-MM-dd", "en-US")
      result.todate = formatDate(result.todate, "yyyy-MM-dd", "en-US")
       this.FromDate =formatDate(result.fromdate, "yyyy-MM-dd", "en-US");
      this.ProjectsTrasnactionsAddForm.patchValue(result);

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        if(result.accId == null || result.accId == undefined)
          {
            result.accId = 0;
          }
        if(result.branchId == null || result.branchId == undefined)
          {
            result.branchId = 0;
          }
        if(result.yearId == null || result.yearId == undefined)
          {
            result.yearId = 0;
          }
        if(result.projectId == null || result.projectId == undefined)
          {
            result.projectId = 0;
          }
        this.selectedacc = result.accId;
        this.selectedbranch = result.branchId;
        this.selectedper = result.yearId;
        this.selectedprojId = result.projectId;
        this.isDisabled = true;
        // this.ProjectsTrasnactionsAddForm.get("branchId").setValue(result.defaultBranchId);
        debugger
        if (!isNaN(Number(this.projectNo)) && Number(this.projectNo) !== 0) {
          this.selectedprojId = this.projectNo;
        }
        this.selectedstatus = -1;
        this.isPost = 1;
        this.ProjectsTrasnactionsAddForm.value.post = this.isPost;
         var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.ProjectsTrasnactionsAddForm.get('voucherStatus').setValue(defaultStatus);
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    debugger
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      this.ProjectsTrasnactionsAddForm.value.voucherStatus 
      //= this.selectedstatus;


      const formValues = this.ProjectsTrasnactionsAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      if (!this.showProjtotals) {
        formValues.showProjtotals = 0;
      }
      else {
        formValues.showProjtotals = 1;
      }


      if (!this.showAccountstotals) {
        formValues.showAccountstotals = 0;
      }
      else {
        formValues.showAccountstotals = 1;
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetProjectsTransactions(
        formValues.accId,
        formValues.projectId,
        formValues.voucherStatus,
        formValues.branchId,
        formValues.fromdate,
        formValues.todate,
        formValues.showProjtotals,
        formValues.showAccountstotals,

      ).subscribe((result) => {
        debugger

        this.voucherData = result;

        if(currentLang == "ar"){
          this.refresProjectstransactionsArabic(this.voucherData);
         }
         else{
          this.refreshProjectstransactionsEnglish(this.voucherData);
         }


        this.calcultevalues()
        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('projecttransactions');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.ProjectsTrasnactionsAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    //this.GetCostCenterTransactionInitialForm();
    const currentDate = new Date().toISOString().split('T')[0];
    this.ProjectsTrasnactionsAddForm.get('fromdate').setValue(this.FromDate);
    this.ProjectsTrasnactionsAddForm.get('todate').setValue(currentDate);
    this.clearTotals();
    this.ProjectsTrasnactionsAddForm.get('projectId').setValue(0);
    this.ProjectsTrasnactionsAddForm.get('accId').setValue(0);
    this.ProjectsTrasnactionsAddForm.get('branchId').setValue(0);
    this.ProjectsTrasnactionsAddForm.get('yearId').setValue(0);
    this.ProjectsTrasnactionsAddForm.get('voucherStatus').setValue(0);
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;


    for (const row of this.voucherData) {
      const debit = parseFloat(row.debit);
      const credit = parseFloat(row.credit);

      if (!isNaN(debit)) {
        this.tot1 += debit;
      }

      if (!isNaN(credit)) {
        this.tot2 += credit;
      }
    }

    // this.tot1 = tot1;
    // this.tot2 = tot2;
    // this.total = this.tot1 - this.tot2;

    // Format the values with thousand commas
    this.tot1Formatted = this.formatWithCommas(this.tot1);
    this.tot2Formatted = this.formatWithCommas(this.tot2);
    // this.totalFormatted = this.formatWithCommas(this.total);
    debugger


  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot1Formatted = '0';
    this.tot2Formatted = '0';
    this.totalFormatted = '0';
  }

  GetPeriods() {
    debugger
    if (this.ProjectsTrasnactionsAddForm.value.yearId > 0) {
      const formValues = this.ProjectsTrasnactionsAddForm.value;
      this.ReportsService.GetPeriods(formValues.yearId).subscribe((result) => {
        debugger
        this.ProjectsTrasnactionsAddForm.get("fromdate").setValue(formatDate(result[0].startDate, "yyyy-MM-dd", "en-US"));
        this.ProjectsTrasnactionsAddForm.get("todate").setValue(formatDate(result[0].endDate, "yyyy-MM-dd", "en-US"));
      });
    }
  }

  EmptyForm() {
    this.voucherData = [];
    this.clearTotals();
  }

  costchange() {
    this.showAccountstotals = false;
  }

  accountchange() {
    this.showProjtotals = false
  }

  updateFavourite(ScreenId: number) {
    this.serv.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
        this.serv.triggerFavouriteRefresh(); // 🔥 THIS is key
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
  }

  getFavouriteStatus(screenId)
  {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if(result.isSuccess)
      {
        this.custom = true;
      }
      else
      {
        this.custom = false;
      }
      debugger             
    })        
  }

  OpenVoucher(id, catId){
    // alert(catId)
    var url='';
    var invId=0;
    debugger;
    switch (catId) {      
      case 18:   // Entry Voucher
          invId = id;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/EntryVouchers/EntryVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
          window.open(url,'_blank');              
        break; 
        case 55:   // Entry Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/EntryVouchers/EntryVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');              
      break; 
      case 19:   // Receipt Voucher        
          invId = id;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReceiptVoucher/Receiptform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
          window.open(url,'_blank');             
        break;         
      case 20: // Payment Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/PaymentVoucher/Paymentform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break;
      case 21:  //Transfer Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/TransferVoucher/TransferVoucherform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break;
      case 22: //Bank Transfer Voucher
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BankTransfer/BankTransferForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break;
      case 23: //Processing Incoming Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break;
        case 24: //Processing Incoming Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break;
        case26: //Processing Incoming Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break;
      case 29: //Begining Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BeginningCheques/Beginingchequesform?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break; 
        case 30: //Begining Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BeginningCheques/Beginingchequesform?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break;       
      case 31: //Processing Outgoing Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingOutgoingCheque/ProcoutcheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break;       
      case 32: //Assets Depreciation
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/DepreciationList/DepreciationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
        break;           
       case 34: //Output Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/OutputVoucherList/OutputVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
        break; 
      case 39: //Purchase Invoice
      this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/PurchaseInvoiceList/PurchaseInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
      break;    
      case 41: //Return Purchase Invoice
      this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReturnPurInvoiceList/ReturnPurInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
      break;   
      case 44: //Sales Invoice
      this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SalesInvoicesList/SalesInvoicesForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
      break;   
      case 45: //Return Sales Invoice
      this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReturnSalesInvoiceList/ReturnSalesInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })     
      case 48: //Service  Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesInv/ServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');    
      break;  
      case 58: //Opening Balance
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/OpeningBalance/OpeningbalanceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');    
      break;  
      case 99: //Assets Purchase Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedassetsTypelist/AssetPurchaseInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');    
      break;
      case 102: //Assets Sales Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedassetsTypelist/AssetSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');    
      break;
      case 107 : //Assets Operations
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedassetsTypelist/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');    
      break;
      case 108: //Assets Operations
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/FixedassetsTypelist/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 110: // Disposal Assets
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/FixedassetsTypelist/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 125: // Supplier Payment Voucher
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/SupppaymentvoucherList/SupppaymentvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 126: // Supplier Receipt Voucher
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/SuppReceiptvoucherList/SuppReceiptvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 127: // Supplier Purchase Service Invoice
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/SupplierPurServiceInvoiceList/SupplierPurServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 128: // Supplier Debit Note
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/SuppDebitVoucherList/SuppDebitVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 129: // Supplier Credit Note
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/SuppCreditVoucherList/SuppCreditVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 130: // Customer Payment Voucher
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/CustpaymentvoucherList/CustpaymentvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 131: // Customer Receipt Voucher
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/CustRecieptvoucherList/CustRecieptvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 132: // Customer Debit Note
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/CustDebitvoucherList/CustDebitvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 133: // Customer Credit Note
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/CustCreditvoucherList/CustCreditvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      case 134: // Customer Service Sales Invoice
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      url = `/CustServiceSalesInvoiceList/CustServiceSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
      window.open(url,'_blank');    
      break;
      default:
        // Default code if none of the cases match
    }
  }

  refresProjectstransactionsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم السند': x.voucherNumber,
      'نوع السند': x.voucherName,
      'تاريخ السند': x.voucherDate,
      ' المشروع': x.projectName,
      'رمز الحساب': x.accountNumber,
      'اسم الحساب': x.accountName,
      'ملاحظات': x.voucherStatement,
      'مدين': x.debit,
      'دائن': x.credit,
    }));
  }

  refreshProjectstransactionsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Voucher Number': x.voucherNumber,
      'Voucher Type': x.voucherName,
      'Voucher Date': x.voucherDate,
      'Project Name': x.projectName,
      'Account Number ': x.accountNumber,
      'Account Name': x.accountName,
      'Note': x.voucherStatement,
      'Debit ': x.debit,
      'Credit': x.credit,
    }));
  }

  exportExcel1() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // حساب المجاميع
      const totalDebit = this.voucherData.reduce((sum, item) => sum + parseFloat(item.debit || 0), 0);
      const totalCredit = this.voucherData.reduce((sum, item) => sum + parseFloat(item.credit || 0), 0);
      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'مدين': totalDebit,
          'دائن': totalCredit,
        }
        : {
          'Debit': totalDebit,
          'Credit': totalCredit,
        };


      // دالة لتحويل رقم العمود إلى حرف إكسل
      function getExcelColumnLetter(colIndex: number): string {
        let dividend = colIndex + 1;
        let columnName = '';
        let modulo;
        while (dividend > 0) {
          modulo = (dividend - 1) % 26;
          columnName = String.fromCharCode(65 + modulo) + columnName;
          dividend = Math.floor((dividend - modulo) / 26);
        }
        return columnName;
      }

      // حساب الصف الأخير
      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      // إدخال المجاميع في الأعمدة المناسبة
      headers.forEach((header, index) => {
        const trimmedHeader = header.trim(); // إزالة الفراغات من الاسم
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
        }
      });

      // وضع التسمية "Total" أو "المجموع" في أول عمود
      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      // تحديث نطاق الورقة
      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      // إنشاء ملف الإكسل وتصديره
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "products");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportPdf1() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    let head: string[][];

    if(currentLang == "ar"){
       head = [[ 'دائن','مدين','ملاحظات',' اسم الحساب','رمز الحساب','المشروع','تاريخ السند','نوع السند','رقم السند']] }
    else{
         head = [[ 'Credit','Debit','Note','Account Name','Account Number','Project Name','Voucher Date','Voucher Type','Voucher Number']]
      }
    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalDebit = 0;
    let totalCredit = 0;
    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
     temp[0]= part.voucherNumber
     temp[1]= part.voucherName 
     temp[2]= part.voucherDate
     temp[3]= part.projectName
     temp[4]= part.accountNumber 
     temp[5]= part.accountName
     temp[6]= part.voucherStatement 
     temp[7]= part.debit
     temp[8]= part.credit

      totalDebit += parseFloat(part.debit) || 0;
      totalCredit += parseFloat(part.credit) || 0;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // لعكس الأعمدة حسب اللغة
    });

    // عدد الأعمدة
    const columnCount = head[0].length;

    // إنشاء صف التذييل (footer row)
    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[6] = "المجموع";
      footRow[7] = totalDebit.toFixed(2);     // مدين
      footRow[8] = totalCredit.toFixed(2);

    } else {
      footRow[6] = "Total";
      footRow[7] = totalDebit.toFixed(2);     // مدين
      footRow[8] = totalCredit.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ? "كشف حركات المشاريع"
      : "Projects Transactions Report";

    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      foot: foot,
      showFoot: 'lastPage',
      headStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      bodyStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold'
      },
      footStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
        textColor: 'black'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }
}
