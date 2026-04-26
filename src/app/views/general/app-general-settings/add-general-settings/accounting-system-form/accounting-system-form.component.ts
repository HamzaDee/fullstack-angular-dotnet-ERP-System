import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GeneralSettingsService } from '../../general-settings.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-accounting-system-form',
  templateUrl: './accounting-system-form.component.html',
  styleUrls: ['./accounting-system-form.component.scss']
})
export class AccountingSystemFormComponent implements OnInit {
  accountSystemForm: FormGroup = new FormGroup({});
  @Output() fromAccountig = new EventEmitter<FormGroup>();

  /** DropDownList Options */
  defaultCurrList: any;
  transConfirmMethodList: any;
  usersList: any;
  salesCycleList:any;
  purchaseCycleList:any;
  linkingAccountsMethodsList:any;
  /** checkBox status */
  isuseCostCenter: boolean = false;
  isallowMultiCurrency: boolean = false;
  isallowMultiBranch: boolean = false;
  isuseTax: boolean = false;
  isuseProjects: boolean = false;
  isuseBudgets: boolean = false;
  isuseHis:boolean = false;
  isChecked: boolean = true;
  countryList: any;
  isTaxSystem: boolean = false;
  noCustomerOnYear: boolean = false;
  printCostCenter: boolean = false;
  useLandedCost:boolean = false;
  customerNumberingList:any;
  useCustomerNumbering: boolean = false;
  disableNumbering:boolean = false;
  constructor(
    private generalSettingsService: GeneralSettingsService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
  ) { }
  ngOnInit(): void {
    this.InitalFormControl();
    this.GetInitalFormControl()
  }
  /**sync data Form to parent  */
  ngDoCheck(): void {  
    this.accountSystemForm.get("useCostCenter")?.setValue(this.isuseCostCenter);
    this.accountSystemForm.get("allowMultiCurrency")?.setValue(this.isallowMultiCurrency);
    this.accountSystemForm.get("allowMultiBranch")?.setValue(this.isallowMultiBranch);
    this.accountSystemForm.get("useTax")?.setValue(this.isuseTax);
    this.accountSystemForm.get("useProjects")?.setValue(this.isuseProjects);
    this.accountSystemForm.get("useHIS")?.setValue(this.isuseHis);
    this.accountSystemForm.get("useBudgets")?.setValue(this.isuseBudgets);
    this.accountSystemForm.get("useTaxSystem")?.setValue(this.isTaxSystem);
    if(this.isTaxSystem == false){
      this.accountSystemForm.value.taxCountryId = 0;
    }
    if(this.useCustomerNumbering == false)
      {
        this.accountSystemForm.get("getCustMaxByYear")?.setValue(0)
      }
    this.accountSystemForm.value.PrintCostCenter = this.printCostCenter;
    this.accountSystemForm.value.useLandedCost = this.useLandedCost;

    this.fromAccountig.emit(this.accountSystemForm.value);
  }
  InitalFormControl() {
    this.accountSystemForm = this.formbulider.group({
      companyId: [0],
      useCostCenter: [0],
      allowMultiCurrency: [0],
      allowMultiBranch: [0],
      useTax: [0],
      useProjects: [0],
      useBudgets: [0],
      useHIS:[0],
      inChequeReminder: [0],
      outChequeReminder: [0],
      defaultCurrId: [0],
      transConfirmMethod: [0],
      inChequeReminderUsers: [0],
      outChequeReminderUsers: [0],
      useTaxSystem: [0],
      taxCountryId: [0],
      salesCycle:[0],
      purchaseCycle:[0],
      PrintCostCenters: [0],
      getCustMaxByYear:[0],
      useLandedCost:[0],
      accLinkType:[0],
    })
  }

  GetInitalFormControl() {
    this.generalSettingsService.GetAccountingSystemForm().subscribe(result => {
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        debugger
      this.defaultCurrList = result.defaultCurrList
      this.transConfirmMethodList = result.transConfirmMethodList
      this.usersList = result.usersList
      this.countryList = result.countryList;
      this.salesCycleList = result.salesCycleList;
      this.purchaseCycleList = result.purchaseCycleList;
      this.isuseCostCenter = result.useCostCenter;
      this.isallowMultiCurrency = result.allowMultiCurrency;
      this.isallowMultiBranch = result.allowMultiBranch;
      this.isTaxSystem = result.useTaxSystem;
      this.printCostCenter = result.printCostCenter;
      this.useLandedCost = result.useLandedCost;
      this.isuseTax = result.useTax;
      this.isuseProjects = result.useProjects;
      this.isuseHis = result.useHIS;
      this.isuseBudgets = result.useBudgets;
      this.customerNumberingList = result.customerNumberingList;
      this.useCustomerNumbering = result.useCustomerNumbering;
      this.disableNumbering = result.disableNumbering;
      this.linkingAccountsMethodsList = result.linkingAccountsMethodsList;
      this.accountSystemForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.accountSystemForm.get("defaultCurrId")?.setValue(result.defaultCurrId);
        this.accountSystemForm.get("transConfirmMethod")?.setValue(result.transConfirmMethod);
        this.accountSystemForm.get("inChequeReminderUsers")?.setValue(result.selectedinChequeReminderUsers);
        this.accountSystemForm.get("outChequeReminderUsers")?.setValue(result.selectedoutChequeReminderUsers);
        this.accountSystemForm.get("taxCountryId")?.setValue(result.taxCountryId);
        this.accountSystemForm.get("getCustMaxByYear")?.setValue(result.getCustMaxByYear);
        this.accountSystemForm.get("accLinkType")?.setValue(result.accLinkType ?? 0);
      });
    })
  }

  checkIfCanBeDefaultCurrency(event:any)
  {
    debugger
    if(event.value > 0)
      {
        this.generalSettingsService.CheckIsDefaultCurrency(event.value).subscribe(res => {
          if(res == false)
            {           
              this.alert.ShowAlert("UcantAddThisCurrencyCauseTheExchangeRateNotEqul1","error");
              this.accountSystemForm.get("defaultCurrId")?.setValue(0);
            }
            
        })
      }
  }
}
