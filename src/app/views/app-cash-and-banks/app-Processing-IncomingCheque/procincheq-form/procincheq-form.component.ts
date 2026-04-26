import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ProcincheqService } from '../procincomingcheq.service';
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
import { th } from 'date-fns/locale';

@Component({
  selector: 'app-procincheq-form',
  templateUrl: './procincheq-form.component.html',
  styleUrls: ['./procincheq-form.component.scss']
})
export class ProcincheqFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher!: FinancialvoucherComponent;
  ProcincheqAddForm: FormGroup = new FormGroup({});
  public TitlePage: string = "";
  tabelData: any[] = [];
  loading: boolean = false;
  opType: string = "";
  accountsList: any;
  accountsList2:any;
  inchequesList:any;
  allinchequesList:any;
  bankList:any;
  statusList:any;
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
  voucherType:any;
  showsave: boolean = true;
  istype: number = 0;
  isOut: number = 0;
  selectedVoucherType: any;
  decimalPlaces: number = 0;
  toChequeStatus : number = 0;
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
  disableSave:boolean = false;
  Lang: string = "";
  disableVouchertype:boolean = false;
  newDate:any;
  debitAccId:any;


  constructor
  (
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private procincheqService: ProcincheqService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private appCommonserviceService : AppCommonserviceService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }
          
            
  ngOnInit(): void 
  {
    debugger
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.voucherType ="Accounting";
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
      this.disableSave = false;
    });
    if(this.voucherId !== 0 || this.voucherId !== null || this.voucherId !== ""|| this.voucherId == undefined )
    {
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    else
    {
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
      this.router.navigate(['ProcessingIncomingCheque/ProcincheqList']);
    }
    this.SetTitlePage();
    this.ProcessingIncomingChequeForm();
    this.GetProcessingIncomingChequeForm();
  }


  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProcincheqForm');
    this.title.setTitle(this.TitlePage);
  }

  ProcessingIncomingChequeForm() {
    this.ProcincheqAddForm = this.formbulider.group({
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
      debitAccountId:[0],
      creditAccountId:[0],
      referenceDate : [""],
      referenceNo : [""], 
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
    this.procincheqService.GetInitailProcessingIncomingCheque(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ProcessingIncomingCheque/ProcincheqList']);
        return;
      }
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
        debitAccId : item.debitAccId,
        creditAccId : item.creditAccId,
        fromChequeStatus : item.fromChequeStatus,
        toChequeStatus : item.toChequeStatus,
        printAfterSave: item.printAfterSave,
        categoryId : item.categoryId
      }));

      debugger
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find((option: any) => option.id === result.defaultCurrency).data2;
      this.accountsList = result.accountList;
      this.accountsList2 = result.accountList ;
      this.allinchequesList = result.incomingChequesList;
      this.defaultList = this.voucherTypeList;  
      this.bankList = result.bankList;
      this.statusList = result.statusList;
      this.suppliersList = result.suppliersList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.ProcincheqAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.ProcincheqAddForm.get("accVouchersDocModelList")?.setValue(result.accVouchersDocModelList);
      if (result.accVouchersDocModelList.length !== 0) {
        this.childAttachment.data = result.accVouchersDocModelList;
        this.childAttachment.ngOnInit();
      }
      debugger
      var fromChequeStatus = this.defaultList.find((option: any) => option.label === this.ProcincheqAddForm.value.voucherTypeId).fromChequeStatus;
      if(fromChequeStatus){
        const values = fromChequeStatus.split(',').map((v: string) => parseInt(v.trim(), 10));
        this.inchequesList = this.allinchequesList.filter((item: any) => values.includes(item.data2) || 
            result.chequesTranModelList.some((cheque: any) => cheque.cheqId === item.id));       
      }
      debugger
      if (result.chequesTranModelList != null) {
        result.chequesTranModelList.forEach((element: any) => {
          this.chequesList.push(
            {
              id: element.cheqId,
              dueDate: formatDate(element.dueDate1, "yyyy-MM-dd", "en-US"),
              docName: element.voucherName,
              docNo: element.voucherNo,
              bankName: element.bankName,
              amount: element.amount,
              drawerName: element.drawerName,
              accountName: element.accountName,
              chequeStatus: element.chequeStatus,
              debitAccountId :element.debitAccountId,
              creditAccountId :element.creditAccountId,
            })
        })
      }
      this.calculateSum();
      debugger


      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.ProcincheqAddForm.get("generalAttachModelList")?.setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
    if(this.opType == 'Edit')
      {
        this.disableVouchertype= true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
      this.disableSave = false;
        if (this.voucherId > 0) {
          var pm = result.paymentMethod.split(',').map(Number)
          this.ProcincheqAddForm.get("currencyId")?.setValue(result.currencyId);
          this.ProcincheqAddForm.get("branchId")?.setValue(result.branchId);
          this.ProcincheqAddForm.get("note")?.setValue(result.note);
          this.ProcincheqAddForm.get("voucherNo")?.setValue(result.voucherNo);
          this.ProcincheqAddForm.get("currencyId")?.setValue(result.currencyId);
          this.ProcincheqAddForm.get("currRate")?.setValue(result.currRate);
          this.ProcincheqAddForm.get("creditAccountId")?.setValue(result.debitAccountId);
          this.ProcincheqAddForm.get("debitAccountId")?.setValue(result.creditAccountId);
          this.ProcincheqAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.ProcincheqAddForm.get("currencyId")?.setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.ProcincheqAddForm.get("branchId")?.setValue(result.branchId);
          }

        }
        else {
          debugger
          this.ProcincheqAddForm.get("branchId")?.setValue(result.defaultBranchId);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.ProcincheqAddForm.get("currencyId")?.setValue(result.defaultCurrency);
            this.ProcincheqAddForm.get("currRate")?.setValue(defaultCurrency.data1);
          }
          if (this.voucherTypeList.isDefault !== undefined) {
            var defaultVoucher = result.voucherTypeList.find((option: any) => option.isDefault === true).id;
            this.ProcincheqAddForm.get("voucherTypeId")?.setValue(defaultVoucher);
            this.getVoucherNo(defaultVoucher);
          }
          this.ProcincheqAddForm.get("paymentMethod")?.setValue(result.paymentMethod);
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.ProcincheqAddForm.get("branchId")?.setValue(result.defaultBranchId);
          }
          if (this.ProcincheqAddForm.value.currencyId == 0) {
            this.ProcincheqAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId).data1;
            this.ProcincheqAddForm.get("currRate")?.setValue(currRate);
          }
        }
        this.GetVoucherTypeSetting(this.ProcincheqAddForm.value.voucherTypeId)
        if (this.ProcincheqAddForm.value.currencyId == this.defaultCurrencyId) {
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
    this.chequesList = [];
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.defaultList.find((option: any) => option.label === selectedValue).serialType;
    var currencyId = this.defaultList.find((option: any) => option.label === selectedValue).currencyId;
    var branchId = this.defaultList.find((option: any) => option.label === selectedValue).branchId;
    var voucherCategory = this.defaultList.find((option: any) => option.label === selectedValue).categoryId;
    this.toChequeStatus = this.defaultList.find((option: any) => option.label === selectedValue).toChequeStatus;
    var fromChequeStatus = this.defaultList.find((option: any) => option.label === selectedValue).fromChequeStatus;
    const values = fromChequeStatus.split(',').map((v: string) => parseInt(v.trim(), 10));
    this.inchequesList = this.allinchequesList.filter((item: any) => values.includes(item.data2));
    var voucherTypeId = this.ProcincheqAddForm.value.voucherTypeId;
    var date = new Date(this.ProcincheqAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var debitAccId = this.defaultList.find((option: any) => option.label === selectedValue).debitAccId;
    var creditAccId = this.defaultList.find((option: any) => option.label === selectedValue).creditAccId;
    if (currencyId !== null) {
      var currRate = this.currencyList.find((option: any) => option.id === currencyId).data1;
      this.ProcincheqAddForm.get("currRate")?.setValue(currRate);
    }
    if (voucherTypeId > 0) {
      this.procincheqService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.ProcincheqAddForm.get("voucherNo")?.setValue(results);
        }
        else {
          this.ProcincheqAddForm.get("voucherNo")?.setValue(1);
        }

        if (currencyId != 0 && currencyId != null && currencyId != undefined) {
          this.decimalPlaces = this.currencyList.find((option: any) => option.id === currencyId).data2;
        }
        else {
          this.decimalPlaces = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId).data2;
        }
        if (branchId == null || branchId == undefined) {
          this.ProcincheqAddForm.get("branchId")?.setValue(0);
        }
        else {
          this.ProcincheqAddForm.get("branchId")?.setValue(branchId);
        }
        this.ProcincheqAddForm.get("creditAccountId")?.setValue(creditAccId);
        this.ProcincheqAddForm.get("debitAccountId")?.setValue(debitAccId);
      });
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.ProcincheqAddForm.get("currencyId")?.setValue(currencyId);
      var currRate = this.currencyList.find((option: any) => option.id === currencyId).data1;
      this.ProcincheqAddForm.get("currRate")?.setValue(currRate);
      if (this.ProcincheqAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.ProcincheqAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId).data1;
      this.ProcincheqAddForm.get("currRate")?.setValue(currRate);
      if (this.ProcincheqAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    if(voucherCategory == 25)
      {
        this.debitAccId = debitAccId;
      }
    else
      {
        this.debitAccId = 0;
      }
    
    


  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find((option: any) => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find((option: any) => option.id === selectedValue).data2;
    this.ProcincheqAddForm.get("currRate")?.setValue(currRate);
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
        this.procincheqService.DeleteProcessingIncomingCheque(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['ProcessingIncomingCheque/ProcincheqList']);
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.router.navigate(['ProcessingIncomingCheque/ProcincheqList']);
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
    if(this.ProcincheqAddForm.value.debitAccountId == null || this.ProcincheqAddForm.value.debitAccountId == undefined )
      {
        this.ProcincheqAddForm.get("debitAccountId")?.setValue(0);
      }
    if(this.ProcincheqAddForm.value.creditAccountId == null || this.ProcincheqAddForm.value.creditAccountId == undefined )
      {
        this.ProcincheqAddForm.get("creditAccountId")?.setValue(0);
      }
      
    debugger
    for (let element of this.chequesList) {
      if(element.id <= 0 || element.chequeStatus <= 0 || element.debitAccountId <=0 ||  element.creditAccountId <=0){
        this.alert.ShowAlert("msgEnterAllDataCheques",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.index = index.toString();
      index++;
    }
    debugger
    setTimeout(() => {
      debugger
      this.ProcincheqAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.ProcincheqAddForm.value.userId = this.jwtAuth.getUserId();
      this.ProcincheqAddForm.value.voucherNo = this.ProcincheqAddForm.value.voucherNo.toString();

    });
    this.ProcincheqAddForm.get("amount")?.setValue(this.total);
    this.ProcincheqAddForm.get("voucherNo")?.setValue(this.ProcincheqAddForm.value.voucherNo.toString());
    this.ProcincheqAddForm.get("paymentMethod")?.setValue("77");
    this.ProcincheqAddForm.get("chequesTranModelList")?.setValue(this.chequesList);
    this.changeDetectorRef.detectChanges();
    this.ProcincheqAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    debugger
    this.procincheqService.SaveProcessingIncomingCheque(this.ProcincheqAddForm.value)
      .subscribe((result) => {
        if (result) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option : any) => option.label === this.ProcincheqAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintProcessingIncomingCheque(Number(result.message));
          }

          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ProcessingIncomingCheque/ProcincheqList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ClearFormData();
          this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
    this.ngZone.run(() => { });
  }

  AddNewLine(grid: number, ff: any){   
    if(this.disableAll == true)
    {
      return;
    }   
    if(grid == 1){ //credit accounts
      this.chequesList.push(
        {
          id: 0,
          dueDate: "",
          docName:"",
          docNo: "",
          bankName: "",
          amount: 0,
          drawerName: "",
          accountName: "",
          chequeStatus: 0,    
          debitAccountId: this.debitAccId,
          creditAccountId: 0,   
        });
    }
  }

  deleteRow(rowIndex: number, grid: number) {
    if (rowIndex !== -1) {
      if (grid == 1)
        this.chequesList.splice(rowIndex, 1);
      this.calculateSum();
    }
  }

  isOneEmpty(row: any){
    if((row.debit === '' || row.debit === null || row.debit <= 0) && (row.credit === '' || row.credit === null || row.credit <= 0)){
      return true;
    }
    else {
      return false;
    }
  }

  calculateSum() {
    debugger
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
    let cheqsts = this.voucherTypeList.find((r : any) => r.label == this.ProcincheqAddForm.value.voucherTypeId);
    this.toChequeStatus = cheqsts.toChequeStatus;
    debugger
    const selectedOption = this.procincheqService.GetIncomingChequesInfo(event.value,this.ProcincheqAddForm.value.voucherTypeId).subscribe(result => {
      debugger
      this.chequesList[selectedRow].dueDate = formatDate(result.dueDate, "yyyy-MM-dd", "en-US");
      this.chequesList[selectedRow].docName = result.voucherName;
      this.chequesList[selectedRow].docNo = result.voucherNo;
      this.chequesList[selectedRow].bankName = result.bankName;
      this.chequesList[selectedRow].amount = parseFloat(result.amount);
      this.chequesList[selectedRow].amount = this.chequesList[selectedRow].amount.toFixed(this.decimalPlaces);
      this.chequesList[selectedRow].drawerName = result.drawerName;
      this.chequesList[selectedRow].accountName = result.accountName;
      this.chequesList[selectedRow].chequeStatus = this.toChequeStatus;
      this.chequesList[selectedRow].creditAccountId = result.chequeAccId;
      
      this.calculateSum()
    })
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    this.allowEditDate = this.voucherTypeList.find((option : any) => option.label === voucherTypeId)?.preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find((option : any) => option.label === voucherTypeId)?.preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find((option : any) => option.label === voucherTypeId)?.preventChangeBranch;
  }

  ClearFormData() {
    this.chequesList = [];
    this.ProcincheqAddForm.get("branchId")?.setValue(0);
    this.ProcincheqAddForm.get("note")?.setValue("");
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ProcincheqAddForm.value.voucherTypeId);
    });
  }

  PrintProcessingIncomingCheque(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `rptProcessingIncomingChequeAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptProcessingIncomingChequeEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo : string , VoucherTypeId : number)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.procincheqService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
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
                    this.GetProcessingIncomingChequeForm();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                   // this.childAttachment.data = [];
                    this.showsave = true;
                    this.GetProcessingIncomingChequeForm();
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

  clearFormdata(VoucherNo : string)
  {    debugger
    this.newDate = new Date;
    this.ProcincheqAddForm.get("id")?.setValue(0);
    this.ProcincheqAddForm.get("voucherNo")?.setValue(VoucherNo);
    this.ProcincheqAddForm.get("voucherDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.ProcincheqAddForm.get("branchId")?.setValue(0);
    this.ProcincheqAddForm.get("currencyId")?.setValue(0);
    this.ProcincheqAddForm.get("currRate")?.setValue(0);
    this.ProcincheqAddForm.get("note")?.setValue("");
    this.chequesList = [];
    this.ProcincheqAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.ProcincheqAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }
}
