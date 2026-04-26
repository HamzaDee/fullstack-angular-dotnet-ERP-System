import { Component, DoCheck, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralSettingsService } from '../../general-settings.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-stores-form',
  templateUrl: './stores-form.component.html',
  styleUrls: ['./stores-form.component.scss']
})
export class StoresFormComponent implements OnInit, DoCheck {
  @Output() fromStores = new EventEmitter<FormGroup>();
  bookTitle: string = "khalid";
  storeForm: FormGroup;
  /**DropDown Options */
  inventoryTypeList: any;
  defaultStoreList: any;
  costingMethodList: any;
  entryVoucherTypeList: any;
  usersList: any;
  inventoryAccTypeList: any;
  accountsList: any;
  /**checkBox status */
  isUseStoreInGrid: boolean;
  isUseExpiryDate: boolean;
  isUseBatch: boolean;
  isUseSerial: boolean;
  isUseAccountInGrid: boolean;
  isCanSaleExpiredItems: boolean;
  isUseDisburseEntity: boolean;
  isUseProductDate: boolean;
  isAutomaticExpirydate: boolean;
  isOrderLimitReminder: boolean;
  disableInventoryType:boolean =false;
  disableCostingMethod:boolean = false;
  disableinventoryAccType:boolean  = false;
  constructor(
    private formbulider: FormBuilder,
    private generalSettingsService: GeneralSettingsService,
    private alert: sweetalert,
  ) { }
  ngOnInit(): void {
    this.InitalFormControl();
    this.GetInitalFormControl();
  }
  /**sync data Form to parent  */
  ngDoCheck(): void {
    this.storeForm.value.useStoreInGrid = this.isUseStoreInGrid;
    this.storeForm.value.useExpiryDate = this.isUseExpiryDate;
    this.storeForm.value.useBatch = this.isUseBatch;
    this.storeForm.value.useSerial = this.isUseSerial;
    this.storeForm.value.useAccountInGrid = this.isUseAccountInGrid;
    this.storeForm.value.canSaleExpiredItems = this.isCanSaleExpiredItems;        
    this.storeForm.value.useDisburseEntity = this.isUseDisburseEntity;
    this.storeForm.value.useProductDate = this.isUseProductDate;
    this.storeForm.value.automaticExpirydate = this.isAutomaticExpirydate;
    this.storeForm.value.orderLimitReminder = this.isOrderLimitReminder;
    this.fromStores.emit(this.storeForm.value);
  }
  InitalFormControl() {
    this.storeForm = this.formbulider.group({
      costCenterPolicy: [0],
      inventoryType: [0],
      defaultStoreId: [0],
      useStoreInGrid: [0],
      useExpiryDate: [0],
      costingMethod: [0],
      useBatch: [0],
      useSerial: [0],
      entryVoucherType: [0],
      useAccountInGrid: [0],
      canSaleExpiredItems: [0],
      expDateReminder: [0],
      expDateReminderUsers: [0],
      orderLimitReminder: [0],
      orderLimitReminderUsers: [0],
      useProductDate: [0],
      automaticExpirydate: [0],
      inventoryAccType:[0],
      inventoryAccNo:[0],
      costGoodsAccNo:[0],
      costDecimalPlaces : ['',[Validators.pattern(new RegExp(`^\\d+(\\.\\d{0,3})?$`))]],
      useDisburseEntity:[0]
    })
  }
  GetInitalFormControl() {
    this.generalSettingsService.GetStoresForm().subscribe(result => {
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      this.inventoryTypeList = result.inventoryTypeList;
      this.defaultStoreList = result.defaultStoreList;
      this.costingMethodList = result.costingMethodList;
      this.entryVoucherTypeList = result.entryVoucherTypeList;
      this.usersList = result.usersList;
      this.inventoryAccTypeList = result.inventoryAccTypeList;
      this.isUseStoreInGrid = result.useStoreInGrid;
      this.isUseExpiryDate = result.useExpiryDate;
      this.isUseBatch = result.useBatch;
      this.isUseSerial = result.useSerial;
      this.isUseAccountInGrid = result.useAccountInGrid;
      this.isCanSaleExpiredItems = result.canSaleExpiredItems;
      
      this.isUseDisburseEntity = result.useDisburseEntity;
      this.isUseProductDate = result.useProductDate;
      this.isAutomaticExpirydate = result.useProductDate;
      this.isOrderLimitReminder = result.orderLimitReminder;
      this.accountsList = result.accountsList;
      debugger
      this.storeForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.storeForm.get("inventoryType").setValue(result.inventoryType);
        this.storeForm.get("defaultStoreId").setValue(result.defaultStoreId);
        this.storeForm.get("costingMethod").setValue(result.costingMethod);
        this.storeForm.get("entryVoucherType").setValue(result.entryVoucherType);
        this.storeForm.get("orderLimitReminderUsers").setValue(result.selectedOrderLimitReminderUsers);
        this.storeForm.get("expDateReminderUsers").setValue(result.selectedExpDateReminderUsers);
        this.storeForm.get("inventoryAccType").setValue(result.inventoryAccType);
        this.storeForm.get("inventoryAccNo").setValue(result.inventoryAccNo);
        this.storeForm.get("costGoodsAccNo").setValue(result.costGoodsAccNo);
        debugger
        if(result.disableAcc)
          {
            this.disableInventoryType = true;
            this.disableCostingMethod = true;
            this.disableinventoryAccType = true;
          }
        else
          {
            this.disableInventoryType = false;
            this.disableCostingMethod = false;
            this.disableinventoryAccType = false;
          }                        
      });
    })
  }
}
