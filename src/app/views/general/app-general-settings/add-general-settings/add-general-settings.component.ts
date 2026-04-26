import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralSettingsService } from '../general-settings.service';
import { sweetalert } from 'sweetalert';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-general-settings',
  templateUrl: './add-general-settings.component.html',
  styleUrls: ['./add-general-settings.component.scss']
})
export class AddGeneralSettingsComponent implements OnInit {
  generalSettingForm: FormGroup = new FormGroup({});
  public TitlePage: string = "";

  systemEmail1:any;
  emailPasswod1:any;
  emailPort1:any;
  smtpHost1:any;
  constructor(
    private generalSettingsService: GeneralSettingsService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private router: Router,
    private title: Title,
    private translateService: TranslateService,

  ) {
  }
  ngOnInit() {
    this.SetTitlePage();
    this.PostFormControl();
    this.getEmailInfoForm();
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AddGeneralSettings');
    this.title.setTitle(this.TitlePage);
  }
  PostFormControl() {
    this.generalSettingForm = this.formbulider.group({
      useStoreInGrid: [],
      useExpiryDate: [],
      useBatch: [],
      useSerial: [],
      useAccountInGrid: [],
      canSaleExpiredItems: [],
      useProductDate: [],
      automaticExpirydate: [],
      orderLimitReminder: [],
      costCenterPolicy: [],
      inventoryType: [null,[Validators.required, Validators.min(1)]],
      defaultStoreId: [],
      costingMethod: [null,[Validators.required, Validators.min(1)]],
      entryVoucherType: [null,[Validators.required, Validators.min(1)]],
      expDateReminder: [],
      useCostCenter: [],
      allowMultiCurrency: [],
      allowMultiBranch: [],
      useTax: [],
      useProjects: [],
      useBudgets: [],
      useHIS:[],
      inChequeReminder: [],
      outChequeReminder: [],
      defaultCurrId: [null,[Validators.required, Validators.min(1)]],
      transConfirmMethod: [null,[Validators.required, Validators.min(1)]],
      inChequeReminderUsers: [],
      outChequeReminderUsers: [],
      expDateReminderUsers: [],
      orderLimitReminderUsers: [],
      inventoryAccType : [null,[Validators.required, Validators.min(1)]],
      inventoryAccNo : [],
      costGoodsAccNo : [],
      costDecimalPlaces:[null,[Validators.required, Validators.min(3)]],
      systemEmail:[''],
      emailPasswod:[''],
      emailPort:[0],
      smtpHost:[''],
      useTaxSystem: [],
      taxCountryId: [],
      salesCycle:0,
      purchaseCycle:0,
      PrintCostCenter: [],
      getCustMaxByYear: [0],
      useDisburseEntity:[],
      useLandedCost:[],
      accLinkType:[0],
      taxType:[0],
    })
  }
  SaveForms() {
    debugger
    if (!this.areFormsValid) {
      return;
    }    
    if(this.generalSettingForm.value.useTaxSystem == true)
      { 
        if(this.generalSettingForm.value.taxCountryId <= 0)
        {
          this.alert.ShowAlert("PlaseSelectCountry",'error');
          return;
        }        
        if(this.generalSettingForm.value.taxType <= 0)
        {
          this.alert.ShowAlert("PlaseSelectTaxType",'error');
          return;
        } 
      }
      else
      {
        this.generalSettingForm.get("taxCountryId")?.setValue(0);
        this.generalSettingForm.get("taxType")?.setValue(0);
      }

    this.generalSettingForm.value.PrintCostCenter
    this.generalSettingForm.get("systemEmail")?.setValue(this.systemEmail1);
    this.generalSettingForm.get("emailPasswod")?.setValue(this.emailPasswod1);
    this.generalSettingForm.get("emailPort")?.setValue(this.emailPort1);
    this.generalSettingForm.get("smtpHost")?.setValue(this.smtpHost1);   
    debugger
    this.generalSettingsService.AddGeneralSettings(this.generalSettingForm.value).subscribe(response => {
      debugger
      if (response) {
        this.alert.SaveSuccess();
        this.router.navigate(['GeneralSettings/AddGeneralSettings']);
      }
      else {
        this.alert.SaveFaildFieldRequired()
      }
    })
  }
  FormGroupFromStores(form: FormGroup) {
    const formGroup = form;
    this.generalSettingForm.patchValue(formGroup);
  }
  FormGroupFromAccountig(form: FormGroup) {        
    const formGroup = form;
    this.generalSettingForm.patchValue(formGroup);
  }

  get areFormsValid(): boolean {
    if(this.generalSettingForm.get("inventoryAccType")?.value === 180 && (this.generalSettingForm.get("inventoryAccNo")?.value <= 0 || this.generalSettingForm.get("costGoodsAccNo")?.value <= 0)){
      return false;
    }
    return this.generalSettingForm?.valid;
  }

  getEmailInfoForm()
  {
    this.generalSettingsService.GetEmailInfoForm().subscribe(res => 
      {
        if(res)
          {
            debugger
            this.systemEmail1 = res.systemEmail;
            this.emailPasswod1 = res.emailPasswod;
            this.emailPort1 = res.emailPort;
            this.smtpHost1 = res.smtpHost;
          }
      })

  }
}
