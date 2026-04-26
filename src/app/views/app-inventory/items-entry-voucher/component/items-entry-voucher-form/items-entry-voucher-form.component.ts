import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemsEntryVoucherService } from '../../service/items-entry-voucher.service';
import { DropDownModel } from 'app/shared/models/DropDownModel';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'; 
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { PrintService } from '../../service/print.service';
import Swal from 'sweetalert2';
import { sweetalert } from 'sweetalert';
import { GeneralSettingsService } from 'app/views/general/app-general-settings/general-settings.service';
import { ItemEntryVoucerSettings } from '../../model/item-entry-voucer-settings.model';
import { VoucherTermsComponent } from './voucher-terms/voucher-terms.component';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { InvVoucherService } from 'app/views/app-inventory/app-inventoryService.service';

@Component({
  selector: 'app-items-entry-voucher-form',
  templateUrl: './items-entry-voucher-form.component.html',
  styleUrls: ['./items-entry-voucher-form.component.scss']
})
export class ItemsEntryVoucherFormComponent implements OnInit {
  @ViewChild('voucherTerms') voucherTerms: VoucherTermsComponent
  @ViewChild('voucherAttachments') voucherAttachments: AppGeneralAttachmentComponent
  public TitlePage: string;
  itemsEntryVoucherForm: FormGroup;
  requstId: any = null;
  isViewMode = false;
  isCopied = false;
  isEntryVoucherFormloaded: boolean = false;
  itemEntryVoucerSettings: ItemEntryVoucerSettings;
  invlaidVoucherTermsFormsCount: number = 0;
  voucherTypeList: any;
  branchsList: DropDownModel[] = [];
  storesList: DropDownModel[] = [];
  itemsList:any;
  isTabDisabled = false;
//VoucherTypeSetting
allowEditDate:boolean= false;
allowEditVoucherSerial:boolean= false;
allowEditBranch:boolean= false;
//End

  constructor(
    private jwtAuth: JwtAuthService,
    private formbulider: FormBuilder,
    private itemsEntryVoucherService: ItemsEntryVoucherService,
    private routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private printService: PrintService,
    private alert: sweetalert,
    private generalSettingsService: GeneralSettingsService,
    private invVoucherService:InvVoucherService
  ) { }

  ngOnInit(): void {
    this.setTitlePage();
    this.initializePrams();
    this.getGeneralSettings();
    this.initializeForm();
  }

  setTitlePage() {
    this.TitlePage = this.translateService.instant('EntryVoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  initializePrams() {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null){
      this.requstId = queryParams.get('GuidToEdit');
      this.isViewMode = true;
      this.isCopied = false;
    }
    else{
      debugger
      this.requstId = this.routePartsService?.GuidToEdit;
      this.isViewMode = this.routePartsService?.Guid2ToEdit;
      this.isCopied = this.routePartsService?.Guid3ToEdit;

      if(this.isViewMode == true)
        {
          this.isTabDisabled = true;
        }
        else
        {
          this.isTabDisabled = false;
        }
    }

    if (this.requstId >= 0) {
      return;
    } else {
      this.navigateToListPage()
    }

  }

  initializeForm() {
    this.itemsEntryVoucherForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      branchId: [0],
      storeId: [0],
      voucherNo: [null, [Validators.required]],
      voucherDate: [null, [Validators.required]],
      isOpeningBalance: [false],
      reserved: [false],
      note: [null],
      amount: [0],
      invVouchersDt: [[]],
      invVouchersDoc: [[]]

    });
    this.getInitializeForm();
    this.checkViewMode();
  }

  checkViewMode() {
    if (this.isViewMode) {
      this.itemsEntryVoucherForm.disable();
    }
  }

  getInitializeForm() {
    var lang = this.jwtAuth.getLang();
    this.itemsEntryVoucherService.GetItemEntryVoucher(this.requstId).subscribe(result => {
      this.itemsEntryVoucherForm.patchValue(result);
      debugger
     
      this.itemsList = result.invVouchersDt.itemsList;
      //converting date ex{10-5-2023T 00:00:00} to {10-5-2023}
      let voucherDate;
      if (this.requstId && this.requstId != 0) {
        voucherDate = new Date(result.voucherDate + "Z").toISOString().split('T')[0];
        this.itemsEntryVoucherForm.get('voucherDate').setValue(voucherDate);
      }
      else {
        const dateString = result.voucherDate;
        const dateObject = new Date(dateString);
        const formattedDate = dateObject.toLocaleDateString();
        voucherDate = new Date(formattedDate + "Z").toISOString().split('T')[0];
      }
      this.itemsEntryVoucherForm.get('voucherDate').setValue(voucherDate);

      this.itemsEntryVoucherForm.get('storeId').setValue(this.itemEntryVoucerSettings?.defaultStoreId);

      this.voucherTypeList = result.voucherTypeList.map((item) => ({
        value: item.id,
        label: lang == 'ar' ? item.voucherNameA : item.voucherNameE,
        isDefault: item.isDefault,
        branchId: item.branchId,
        preventChangeSerial: item.preventChangeSerial,
        preventChangeDate: item.preventChangeDate,
        preventChangeBranch:item.preventChangeBranch,
        serialType: item.serialType,
        currencyId: item.currencyId,
        serialByMonth: item.serialByMonth,
      }));
      this.GetVoucherTypeSetting(this.itemsEntryVoucherForm.value.voucherTypeId)
      this.branchsList = result?.branchsList;
      this.storesList = result?.invVouchersDt?.storesList;
      this.isEntryVoucherFormloaded = true;
    });
   
  }

  switchTab(tabId: string) {
    const tabElement = document.getElementById(tabId);
    tabElement.click()
  }

  validateAndSetVoucherTermsForms() {
    debugger
    this.invlaidVoucherTermsFormsCount = 0;
    this.voucherTerms.invVouchersDtFormArray.controls.forEach(voucherTermForm => {

      if (voucherTermForm.invalid) {
        voucherTermForm.markAllAsTouched();
        this.invlaidVoucherTermsFormsCount++;
      }
    });

    if (this.invlaidVoucherTermsFormsCount > 0) {
      this.switchTab('tabVoucherTerms');
    }
    else {
      const voucherTermsFormsValue = this.voucherTerms.invVouchersDtFormArray.controls.map((formGroup: FormGroup) => formGroup.value);
      this.itemsEntryVoucherForm.get('invVouchersDt').setValue(voucherTermsFormsValue);
    }

  }
  validateVoucherTermsForms() {

  }

  // validateAndSetVoucherAttachmentsFroms() {
  //   const voucherAttachmentsFromsValue = this.voucherAttachments.attachmentsFormsGroups.controls.map((formGroup: FormGroup) => formGroup.value);
  //   this.itemsEntryVoucherForm.get('invVouchersDoc').setValue(voucherAttachmentsFromsValue);
  // }

  setAmount() {
    const grandTotal = this.voucherTerms.calculateAllTotal();
    this.itemsEntryVoucherForm.get('amount').setValue(grandTotal);
  }

  detectSubFormsChanges() {
    this.validateAndSetVoucherTermsForms();
    //this.validateAndSetVoucherAttachmentsFroms();
    this.setAmount();
  }

  OnSaveForm() {    
    this.detectSubFormsChanges();
    let stopExecution = false;
    if (!this.itemsEntryVoucherForm.invalid && this.invlaidVoucherTermsFormsCount == 0) {


      debugger
      for (let index = 0; index < this.voucherTerms.invVouchersDtFormArray.length; index++) {
        const element = this.voucherTerms.invVouchersDtFormArray.value[index];
        const itemId = element.itemId;
        const item = this.itemsList.find(item => item.id === itemId);
  
        if (!item) {
          continue;
        }
  
        if (item.hasExpiry) {
          if (element.expiryDate == "") {
            this.alert.RemainimgQty("msgPleaseEnterExpiryDate", item.text, 'error');
            stopExecution = true;
            return false;
          }
  
          if (element.batchNo == "" || element.batchNo == null) {
            this.alert.RemainimgQty("msgPleaseEnterBatch", item.text, 'error');
            stopExecution = true;
            return false;
          }
        }
  
  
  
        if (item.hasSerial) {
          if (this.itemsEntryVoucherForm.value.invVouchersDt[index].invItemSerialsFormModel == null || this.itemsEntryVoucherForm.value.invVouchersDt[index].invItemSerialsFormModel == undefined ) {
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            stopExecution = true;
            return false;
          }
  
  
          const checkedItemCount = this.itemsEntryVoucherForm.value.invVouchersDt[index].invItemSerialsFormModel.length;                   
           
  
          if (checkedItemCount !== parseInt(element.qty ) * parseInt( element.unitRate)) {
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            stopExecution = true;
            return false;
          }
  
  
  
  
          // const item1 = this.OutputVoucherAddForm.value.itemsSerialList.find(item => item.itemId === itemId && item.isChecked === true && item.rowIndex === index);
          // if (!item1) {
          //   this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
          //   stopExecution = true;
          //   return false;
          // }
         }
        element.index = index.toString();
      }
      debugger;
      this.itemsEntryVoucherService.PostItemEntryVoucher(this.itemsEntryVoucherForm.value).subscribe(result => {
        if (result) {
          this.navigateToListPage();
          this.alert.SaveSuccess();
        }
        else {
          this.alert.SaveFaildFieldRequired()
        }
      }, err => {
        this.alert.SaveFaildFieldRequired()
      });
    }
    else {
      this.alert.SaveFaildFieldRequired();
    }
  }

  onCancel() {
    this.navigateToListPage();
  }
  
  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.value === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.value === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.value === selectedValue).branchId;
    var voucherCategory = 33;//this.itemsEntryVoucherForm.value.voucherTypeEnum;
    var voucherTypeId = this.itemsEntryVoucherForm.value.voucherTypeId;
    var date = new Date(this.itemsEntryVoucherForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.invVoucherService.GetSerialVoucher(serialType,voucherTypeId,voucherCategory,year,month).subscribe((results) => {
        if (results) {
          this.itemsEntryVoucherForm.get("voucherNo").setValue(results);
        }
        else {
          this.itemsEntryVoucherForm.get("voucherNo").setValue(1);
        }
        this.itemsEntryVoucherForm.get("branchId").setValue(branchId);
      });
    }
    debugger
    if(voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined)
      {
        this.GetVoucherTypeSetting(voucherTypeId);
      }
  }

  deleteItemEntryVoucher() {
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
        this.itemsEntryVoucherService.DeleteItemEntryVoucher(this.requstId).subscribe((results) => {
          if (results) {
            this.alert.DeleteSuccess();
            this.navigateToListPage();
          }
          else {
            this.alert.ShowAlert('DeleteFalid','error')
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  navigateToListPage() {
    this.router.navigate(['ItemsEntryVoucherList/ItemsEntryVoucherList']);
  }

  openItemsEntryVoucherTemplate() {
    this.detectSubFormsChanges();
    this.printService.openItemsEntryVoucherTemplate(this.itemsEntryVoucherForm.value);
  }

  getGeneralSettings() {
    this.generalSettingsService.GetItemEntryVoucerSettings().subscribe(result => {
      this.itemEntryVoucerSettings = result;
    });
  }
  GetVoucherTypeSetting(voucherTypeId:number)
    {
      debugger
      this.allowEditDate = this.voucherTypeList.find(option => option.value === voucherTypeId).preventChangeDate;
      this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.value === voucherTypeId).preventChangeSerial; 
      this.allowEditBranch =this.voucherTypeList.find(option => option.value === voucherTypeId).preventChangeBranch;
    }
}