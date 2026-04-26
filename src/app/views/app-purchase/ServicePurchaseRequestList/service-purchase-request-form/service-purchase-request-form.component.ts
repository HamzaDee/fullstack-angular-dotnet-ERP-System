import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { sweetalert } from 'sweetalert';
import { PurchaseRequestService } from '../../app-purchaseRequest/purchaserequest.service';
import { PurchaseService } from '../../purchase-service';
import { ServicePurchaseRequestListService } from '../service-purchase-request-list.service';
import { formatDate } from '@angular/common';
import { delay, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-purchase-request-form',
  templateUrl: './service-purchase-request-form.component.html',
  styleUrl: './service-purchase-request-form.component.scss'
})
export class ServicePurchaseRequestFormComponent {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  ServicePurchaseRequestForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  pOServiceDTList: any[] = [];
  validDate = true;
  showLoader = false;
  disableSave: boolean;
  voucherNo: number = 0;
  voucherId: any;
  disableAll: boolean;
  allowEditBranch: boolean = false;
  disableCurrRate: boolean;
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  disapleVoucherType: boolean = false;
  allowAccRepeat: any;
  decimalPlaces: number;
  allowMultCurrency: boolean;
  defaultCurrencyId: number;
  fTotal: any;
  useCostCenter: boolean;
  NewDate: any;
  Lang: string;

  // list
  voucherTypeList: any;
  selectedVoucherType: any;
  requestTypesList: any;
  currencyList: any;
  branchesList: any;
  suppliersList: any;
  requestPartyList: any;
  paymentTermsList: any;
  prioritiesList: any;
  servicesList: any;
  UnitList: any;
  costCenterList: any;
  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private purService: PurchaseRequestService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private servicePurchaseRequestListService: ServicePurchaseRequestListService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;
    this.route.queryParams.subscribe((params: Params) => {
      debugger
      this.voucherNo = +params['voucher'];
    });
    if (isNaN(this.voucherNo)) {
      this.voucherNo = 0;
    }

    if (this.voucherNo == null || this.voucherNo == undefined || this.voucherNo === 0 || isNaN(this.voucherNo)) {

      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.voucherId = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
      }
      else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
      }
    }
    else {
      this.voucherId = 0;
      this.opType = 'Add';
      this.showsave = false;
    }

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['ServicePurchaseRequestList/ServicePurchaseRequestList']);
    }

    this.SetTitlePage();
    this.ServicePurchaseRequestForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherDate: ["", [Validators.required]],
      requestType: [0],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      dealerId: [0],
      pdTerm: [0],
      branchId: [0],
      status: [0],
      requestParty: [0],
      requestedBy: [""],
      deliveryPeriod: [0],
      priority: [0],
      userId: [0],
      note: [""],
      pOServiceDTList: [null, [Validators.required, Validators.minLength(1)]],
      generalAttachModelList: [null],
    });


    this.GetInitailOpeningBalance();
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }

  GetInitailOpeningBalance() {
    var lang = this.jwtAuth.getLang();
    this.servicePurchaseRequestListService.GetInitailServicePurchaseRequest(this.voucherId, this.opType).subscribe(result => {

      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ServicePurchaseRequestList/ServicePurchaseRequestList']);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");

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
        creditAccountId: item.creditAccId,
        debitAccountId: item.debitAccId,
        allowAccRepeat: item.allowAccRepeat,
        printAfterSave: item.printAfterSave
      }));

      this.requestTypesList = result.requestTypesList;
      this.currencyList = result.currencyList;
      this.suppliersList = result.suppliersList;
      this.branchesList = result.userCompanyBranchList;
      this.requestPartyList = result.requestPartyList;
      this.paymentTermsList = result.paymentTermsList;
      this.prioritiesList = result.priorityList;
      this.servicesList = result.serviceInfoModelList;
      this.UnitList = result.unitList;
      this.costCenterList = result.costCenterList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.allowMultCurrency = result.allowMultiCurrency;
      this.defaultCurrencyId = result.defaultCurrency;
      this.ServicePurchaseRequestForm.patchValue(result);

      if (result.poServiceDTList != null)
        this.pOServiceDTList = result.poServiceDTList;
      this.ServicePurchaseRequestForm.get("pOServiceDTList").setValue(result.poServiceDTList);
      this.ServicePurchaseRequestForm.value.pOServiceDTList = result.poServiceDTList;

      for (let i = 0; i < this.pOServiceDTList.length; i++) {
        this.onCheckboxChange()
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.ServicePurchaseRequestForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }




      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.disableSave = false;
        if (this.voucherId > 0) {
          this.ServicePurchaseRequestForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.ServicePurchaseRequestForm.get("currencyId").setValue(result.currencyId);
          this.ServicePurchaseRequestForm.get("branchId").setValue(result.branchId);
          this.ServicePurchaseRequestForm.get("pdTerm").setValue(result.pdTerm);

          this.ServicePurchaseRequestForm.get("representId").setValue(result.representId);
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id || null;
          this.ServicePurchaseRequestForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.onCheckboxChange();
          this.useCostCenter = result.useCostCenter;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.ServicePurchaseRequestForm.get("currencyId").setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.ServicePurchaseRequestForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          debugger
          this.ServicePurchaseRequestForm.get("branchId").setValue(result.defaultBranchId);
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id || null;
          this.ServicePurchaseRequestForm.get("voucherTypeId").setValue(defaultVoucher);
          this.ServicePurchaseRequestForm.get("voucherDate").setValue(result.voucherDate);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.ServicePurchaseRequestForm.get("currencyId").setValue(defaultCurrency.id);
            this.ServicePurchaseRequestForm.get("currRate").setValue(defaultCurrency.data1);
          }

          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.ServicePurchaseRequestForm.get("branchId").setValue(result.defaultBranchId);
          }
          if (this.ServicePurchaseRequestForm.value.currencyId == 0) {
            this.ServicePurchaseRequestForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.ServicePurchaseRequestForm.get("currRate").setValue(currRate);
          }

          this.ServicePurchaseRequestForm.get("requestType").setValue(0);
          this.ServicePurchaseRequestForm.get("dealerId").setValue(0);
          this.ServicePurchaseRequestForm.get("pdTerm").setValue(0);
          this.ServicePurchaseRequestForm.get("requestParty").setValue(0);
          this.ServicePurchaseRequestForm.get("priority").setValue(0);

        }

        this.GetVoucherTypeSetting(this.ServicePurchaseRequestForm.value.voucherTypeId)

        if (this.ServicePurchaseRequestForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
    })

  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;

    if(this.pOServiceDTList.length <= 0)
    {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.disableSave = false;
      return;
    }

    for (let i = 0; i < this.pOServiceDTList.length; i++) {
      const element = this.pOServiceDTList[i];
      if ((element.serviceDescr == "" || element.serviceDescr == null || element.serviceDescr == undefined)
        || element.qty == 0 || element.price == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.i = i.toString();
    }

    this.ServicePurchaseRequestForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ServicePurchaseRequestForm.value.userId = this.jwtAuth.getUserId();
    this.ServicePurchaseRequestForm.value.voucherNo = this.ServicePurchaseRequestForm.value.voucherNo.toString();
    this.ServicePurchaseRequestForm.value.pOServiceDTList = this.pOServiceDTList;
    this.ServicePurchaseRequestForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.servicePurchaseRequestListService.SavePurchaseRequestList(this.ServicePurchaseRequestForm.value).subscribe((result) => {
      debugger
      if (result) {
        this.alert.SaveSuccess();

        debugger
        var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.ServicePurchaseRequestForm.value.voucherTypeId)?.printAfterSave || false;
        if (PrintAfterSave == true) {
          this.PrintServicePurchaseRequest(Number(result.message));
        }

        this.ClearAfterSave();
        if (this.opType == 'Edit' || this.opType == 'Copy') {
          this.router.navigate(['ServicePurchaseRequestList/ServicePurchaseRequestList']);
        }
        this.voucherId = 0;
        this.opType = 'Add';
        this.ngOnInit();
      }
      else {
        this.alert.SaveFaild();
      }
    });
  }

  onCheckboxChange() {
    let sumTotal = 0;

    for (let i = 0; i < this.pOServiceDTList.length; i++) {
      const item = this.pOServiceDTList[i];

      const qty = parseFloat(item.qty) || 0;

      let priceStr = item.price;
      let price = parseFloat(priceStr);

      const validPrice = isNaN(price) ? 0 : price;

      const total = qty * validPrice;

      if (!isNaN(price)) {
        item.price = validPrice.toFixed(this.decimalPlaces);
      }

      item.total = this.formatCurrency(total);

      const numericTotal = parseFloat(item.total.toString().replace(/[^0-9.-]+/g, ''));

      sumTotal += isNaN(numericTotal) ? 0 : numericTotal;
    }

    this.fTotal = this.formatCurrency(sumTotal);
  }

  formatCurrency(value: number): string {
    debugger
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ServicePurchaseRequestForm');
    this.title.setTitle(this.TitlePage);
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
    this.ClearAfterSave();
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.ServicePurchaseRequestForm.value.voucherTypeEnum;
    var voucherTypeId = this.ServicePurchaseRequestForm.value.voucherTypeId;
    var date = new Date(this.ServicePurchaseRequestForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      debugger
      this.servicePurchaseRequestListService.GetPOServiceVoucherNo(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.ServicePurchaseRequestForm.get("voucherNo").setValue(results);
        }
        else {
          this.ServicePurchaseRequestForm.get("voucherNo").setValue(1);
        }
      });
      if (branchId == null || branchId == undefined) {
        branchId = 0;
        this.ServicePurchaseRequestForm.get("branchId").setValue(branchId);
      }
      if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultCurrency == true) {
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
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultCurrency == true) {
      this.ServicePurchaseRequestForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.ServicePurchaseRequestForm.get("currRate").setValue(currRate);
      if (this.ServicePurchaseRequestForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.ServicePurchaseRequestForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.ServicePurchaseRequestForm.get("currRate").setValue(currRate);
      if (this.ServicePurchaseRequestForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  ClearAfterSave() {
    this.NewDate = new Date;
    this.ServicePurchaseRequestForm.get("id").setValue(0);
    this.ServicePurchaseRequestForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ServicePurchaseRequestForm.get("requestType").setValue(0);
    this.ServicePurchaseRequestForm.get("dealerId").setValue(0);
    this.ServicePurchaseRequestForm.get("branchId").setValue(0);
    this.ServicePurchaseRequestForm.get("requestedBy").setValue('');
    this.ServicePurchaseRequestForm.get("requestParty").setValue(0);
    this.ServicePurchaseRequestForm.get("pdTerm").setValue(0);
    this.ServicePurchaseRequestForm.get("deliveryPeriod").setValue(0);
    this.ServicePurchaseRequestForm.get("priority").setValue(0);
    this.ServicePurchaseRequestForm.get("note").setValue('');
    this.ServicePurchaseRequestForm.get("pOServiceDTList").setValue([]);
    this.ServicePurchaseRequestForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.pOServiceDTList = [];
    this.fTotal = 0;
  }

  AddNewLine() {
    if (this.disableAll == true) {
      return;
    }
    this.pOServiceDTList.push(
      {
        serviceId: 0,
        serviceDescr: "",
        serviceUnit: "",
        qty: "",
        price: "",
        total: 0,
        costCenterId: 0,
      });

    debugger
    this.ServicePurchaseRequestForm.get("pOServiceDTList").setValue(this.pOServiceDTList);
  }

  deleteRow(rowIndex: number) {
    if (this.disableAll == true) {
      return;
    }
    if (rowIndex !== -1) {
      this.pOServiceDTList.splice(rowIndex, 1);
      this.onCheckboxChange();
    }
    //this.ServicePurchaseRequestForm.get("pOServiceDTList").setValue(this.pOServiceDTList);
  }


  onServiceChange(event, row, index) {
    debugger
    if (this.pOServiceDTList[index].serviceId !== null || this.pOServiceDTList[index].serviceId !== 0) {
      const selectedService = this.servicesList.find(service => service.id === this.pOServiceDTList[index].serviceId);
      this.pOServiceDTList[index].serviceDescr = selectedService.text;
    }
    this.servicePurchaseRequestListService.GetServiceInfo(event.value).subscribe(res => {
      if (res) {
        debugger
        this.pOServiceDTList[index].price = res.price;
      }
    })
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.ServicePurchaseRequestForm.get("currRate").setValue(currRate);
    if (event.value == this.ServicePurchaseRequestForm) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
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

  isEmpty(input) {
    return input === '' || input === null;
  }

  DeleteServicePurchaseRequest(Id, voucherTypeId, voucherNo) {
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
        this.servicePurchaseRequestListService.DeletePurchaseRequestList(Id, voucherTypeId, voucherNo).subscribe((results) => {
          debugger
          if (results.isSuccess === true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ServicePurchaseRequestList/ServicePurchaseRequestList']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            this.alert.ShowAlert(results.message, 'error');
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  PrintServicePurchaseRequest(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptServicePurchaseRequestAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptServicePurchaseRequestEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
