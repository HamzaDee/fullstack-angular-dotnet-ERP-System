import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ShippingService } from '../shipping.service';
import { formatDate } from '@angular/common';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { delay, of } from 'rxjs';
import Swal from 'sweetalert2';
import { ShippingAdvancedSearchComponent } from '../shipping-advanced-search/shipping-advanced-search.component';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';

@Component({
  selector: 'app-shipping-form',
  templateUrl: './shipping-form.component.html',
  styleUrl: './shipping-form.component.scss'
})
export class ShippingFormComponent {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  showLoader = false;
  loading: boolean;
  public opType: string;
  public TitlePage: string;
  public ShippingForm: FormGroup;
  isdisabled: boolean = false;
  ShippDTList: any[] = [];
  //LISTS
  countriesList: any;
  agentsList: any;
  allagentsList: any;
  salesOrderList: any;
  allItemsList: any;
  isDisabledRow = false;
  disableSave: boolean;
  showsave: boolean;
  Id: any;
  disableAll: boolean;
  public voucherTypeEnum: number = 175;


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    private shippingService: ShippingService,
    public routePartsService: RoutePartsService,) { }

  ngOnInit(): void {
    this.disableSave = false;
    this.Id = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;

    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.Id = queryParams.get('GuidToEdit');
      this.opType = 'Show';
    }
    else {
      this.Id = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
    }

    if (this.Id == null || this.Id == undefined || this.Id === "") {
      this.router.navigate(['Shipping/ShippingList']);
    }

    this.SetTitlePage();
    this.ShippingForm = this.formbulider.group({
      id: [0],
      shipNo: [0, [Validators.required]],
      shipDate: ["", [Validators.required]],
      countryId: [0, [Validators.required, Validators.min(1)]],
      agentId: [0, [Validators.required, Validators.min(1)]],
      salesOrderId: [0, [Validators.required, Validators.min(1)]],
      transDate: ["", [Validators.required]],
      shippingDTModel: [null, [Validators.required, Validators.minLength(1)]],
      generalAttachModelList: [null],
      voucherTypeEnum: [175],
    });

    this.GetInitailShipping();
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }

  GetInitailShipping() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.shippingService.GetShippingForm(this.Id, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Shipping/ShippingList']);
        return;
      }

      result.shipDate = formatDate(result.shipDate, "yyyy-MM-dd", "en-US");
      result.transDate = formatDate(result.transDate, "yyyy-MM-dd", "en-US");
      this.salesOrderList = result.salesRequestsList;
      this.countriesList = result.countryList;
      this.agentsList = result.agentsList;
      this.allagentsList = result.agentsList;      
      this.allItemsList = result.allItemsList;
      this.ShippDTList = result.shippingdtModel;
      this.ShippingForm.get("shippingDTModel").setValue(result.shippingdtModel);
      this.ShippingForm.patchValue(result);

      if (result.shippingdtModel != null) {
        debugger
        this.ShippDTList = result.shippingdtModel;
        this.ShippDTList.forEach(element => {
          debugger
          if (element.prodDate) {
            element.prodDate = this.formatDate(element.prodDate);
          }
          if (element.expiryDate) {
            element.expiryDate = this.formatDate(element.expiryDate);
          }
          this.claculateAllAmount();
        });
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.ShippingForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if(result.id > 0)
          {
            this.isDisabledRow = true;
          }
        this.isdisabled = false;
        this.ShippingForm.get("agentId").setValue((result.agentId + 7).toFixed(3).toString());
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ShippingList');
    this.title.setTitle(this.TitlePage);
  }

  AddNewLine() {
    debugger
    if (this.ShippDTList == null) {
      this.ShippDTList = [];
    }
    this.ShippDTList.push(
      {
        id: 0,
        hId: 0,
        itemNo: "",
        batchNo: 0,
        shipQty: 0,
        prodDate: "",
        expiryDate: "",
        qty: 0,
        remainingQty: 0,
      });
    this.ShippingForm.get("shippingDTModel").setValue(this.ShippDTList);
  }

  getCustomers(event: any){
    debugger
    const countryId = event.value === undefined ? event : event.value;
    if(countryId == 0)
      this.agentsList = this.allagentsList;
    else
      this.agentsList = this.allagentsList.filter(c => c.id == countryId || c.id == -1);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.ShippDTList.splice(rowIndex, 1);
    }
  }

  getSalesorder(event) {
    debugger
    if (event.value > 0) {
      this.shippingService.GetSalesOrder(event.value).subscribe(res => {
        debugger
        if (res) {
          if (res.agentId != null && res.agentId != undefined && res.agentId != null) {
            this.ShippingForm.get("agentId").setValue(res.agentId.toFixed(3));
          }
          if (res.countryId != null && res.countryId != undefined && res.countryId != null) {
            this.ShippingForm.get("countryId").setValue(res.countryId);
          }
          if (res.shippingdtModel && res.shippingdtModel.length > 0) {
            this.ShippingForm.get("shippingDTModel").setValue(res.shippingdtModel);
            this.ShippDTList = res.shippingdtModel;
            this.ShippDTList.forEach(element => {
              debugger
              if (element.prodDate) {
                element.prodDate = this.formatDate(element.prodDate);
              }
              if (element.expiryDate) {
                element.expiryDate = this.formatDate(element.expiryDate);
              }
            });
            this.isDisabledRow = true;
          }
          else {
            this.ShippDTList = [];
          }
        }
      });
    }
    else {
      this.ShippingForm.get("countryId").setValue(0);
      this.ShippingForm.get("agentId").setValue(0);
      this.ShippDTList = [];
      this.isDisabledRow = false;
    }
  }

  formatDate(date: string): string {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are 0-based
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  OnSaveForms() {
    
    this.disableSave = true;
    let stopExecution = false;
    for (const element of this.ShippDTList) {
      if (element.itemNo == 0 || element.itemNo == null || element.itemNo == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return;
      }
      if (element.shipQty == 0 || element.shipQty == null || element.shipQty == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return false;
      }
      if (stopExecution) {
        return;
      }
      this.ShippingForm.value.companyId = this.jwtAuth.getCompanyId();
      this.ShippingForm.value.userId = this.jwtAuth.getUserId();
      this.ShippingForm.value.marketInvoicesDTModel = this.ShippDTList;
      const agentIdValue = parseInt(this.ShippingForm.value.agentId, 10);
      if (isNaN(agentIdValue)) {
        this.alert.ShowAlert("Invalid Agent ID", 'error');
        this.disableSave = false;
        return;
      }
      this.ShippingForm.get("agentId").setValue(agentIdValue);
      this.ShippingForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      this.ShippingForm.value.voucherTypeEnum = this.voucherTypeEnum;
   


      debugger
      this.shippingService.SaveShipping(this.ShippingForm.value)
        .subscribe((result) => {
          if (result) {
            this.alert.SaveSuccess();
            this.router.navigate(['Shipping/ShippingList']);
          }
          else {
            this.alert.SaveFaild();
          }
        })
      this.disableSave = false;

    }

  }

  DeleteShipping(id: any) {
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
        this.shippingService.DeleteShipping(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['Shipping/ShippingList']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
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

  claculateAllAmount()
  {
    debugger
    for (let i = 0; i < this.ShippDTList.length; i++)
    {
      this.ShippDTList[i].remainingQty = this.ShippDTList[i].qty - this.ShippDTList[i].shipQty
    }
  }
}
