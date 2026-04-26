import { Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { AppStoresService } from '../app-stores.service';
import { InventoryTypeEnum } from 'app/shared/Enum/enum';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-storesform',
  templateUrl: './storesform.component.html',
  styleUrls: ['./storesform.component.scss']
})
export class StoresformComponent implements OnInit {
  selectedMainTable: number;
  StoreForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  active: boolean;
  minusSale: boolean;
  listTest: any[];
  usersList: any[];
  StoreKeepers: any[];
  selectedUserIds: number[] = [];
  selectedUsersStores: any[];
  periodic = InventoryTypeEnum.Periodic;
  continuous = InventoryTypeEnum.Continuous;
  inventoryType: number;
  inventoryAccType: number;
  costGoodsSoldList: any;
  storesList: any;
  accountsList: any;
  disableSave:boolean;
  optype:any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private inventoryService: AppStoresService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.InitialStoreForm();
    this.data.GetAllStoresList()
    this.GetInitialStoreForm();   
    debugger
    if(this.inventoryType == this.continuous && this.inventoryAccType === 178){
      this.StoreForm.controls.costGoodsSoldAccNo.setValidators(Validators.required);
      this.StoreForm.controls.costGoodsSoldAccNo.updateValueAndValidity()
      this.StoreForm.controls.storeAccNo.setValidators(Validators.required);
      this.StoreForm.controls.storeAccNo.updateValueAndValidity()
    }
  }

  onUsersSelected(event: any) {
    this.selectedUserIds = event.value.map((user: any) => user.id);
  }

  InitialStoreForm() {
    this.StoreForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      storeKeeperName: [""],
      storeKeeperId: [0 , [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      storeNameA: ["", [Validators.required]],
      storeNameE: ["", [Validators.required]],
      address: [""],
      telephone: ["",Validators.pattern('^[0-9]+$')],
      mobile: ["",Validators.pattern('^[0-9]+$')],
      note: [""],
      usersId: [""],
      allowMinusTrans: false,
      active: true,
      hasPermission: false,
      usersStores: [null],
      storeAccNo: [null],
      costGoodsSoldAccNo: [null],
    });       
  }

  // Method to check if the telephone input is invalid (contains non-numeric characters)
  isInvalidPhoneNumber(): boolean {
    const telephoneControl =  this.StoreForm.get('telephone');
    return telephoneControl.invalid && telephoneControl.dirty;
  }

  // Method to check if the telephone input is invalid (contains non-numeric characters)
  isInvalidMobileNumber(): boolean {
    const telephoneControl =  this.StoreForm.get('mobile');
    return telephoneControl.invalid && telephoneControl.dirty;
  }

  GetInitialStoreForm() {
    this.inventoryService.InitailStore(this.data.id,this.data.optype).subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['Store/StoresList']);
          this.dialogRef.close(false);
          return;
        }
      
      this.StoreForm.patchValue(result)
      this.accountsList = result.accountsList;
      this.StoreKeepers = result.storeKeepers;
      this.usersList = result.usersDefinistions;
      this.selectedUsersStores = result.usersStores;
      this.hasPerm = result.hasPermission
      this.inventoryType = result.inventoryType;    
      this.inventoryAccType = result.inventoryAccType;    
      if(this.inventoryType == this.continuous && this.inventoryAccType === 178){
        this.StoreForm.controls.costGoodsSoldAccNo.setValidators(Validators.required);
        this.StoreForm.controls.costGoodsSoldAccNo.updateValueAndValidity()
        this.StoreForm.controls.storeAccNo.setValidators(Validators.required);
        this.StoreForm.controls.storeAccNo.updateValueAndValidity()
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        if(result.id > 0){
          if(result.storeKeeperId == null ||result.storeKeeperId ==undefined)
            {
              result.storeKeeperId =0;
            }
          if(result.storeAccNo == null || result.storeAccNo == undefined)            
            {
              result.storeAccNo = 0;
            }
          if(result.costGoodsSoldAccNo == null || result.costGoodsSoldAccNo == undefined)
            {
              result.costGoodsSoldAccNo= 0;
            }
          this.StoreForm.get('usersStores').setValue(result.usersStores);
          this.StoreForm.get('storeKeeperId').setValue(result.storeKeeperId);
          this.StoreForm.get("storeAccNo").setValue(result.storeAccNo);          
          this.StoreForm.get("costGoodsSoldAccNo").setValue(result.costGoodsSoldAccNo);  
        }
        else
        {
          this.StoreForm.get('storeKeeperId').setValue(0);
          this.StoreForm.get("storeAccNo").setValue(0);          
          this.StoreForm.get("costGoodsSoldAccNo").setValue(0);
          this.StoreForm.get("active").setValue(true);
        }
      });   
    });
  }

  // onStoreKeeperSelection(event: any) {
  //   debugger
  //   this.StoreForm.get('storeKeeperId')?.setValue(event.value);
  //   this.inventoryService.GetIfStoreKeeperUsed(event.value).subscribe(res => 
  //     {
  //       debugger
  //       if(res)
  //         {
  //           this.alert.ShowAlert("ThisStoreKeeperAlreadyUsedByAnotherStore","error")
  //         }
  //     })
  // }

  isSelected(user: any): boolean {
    return this.selectedUsersStores.some((selectedUser) => selectedUser.id === user.id);
  }

  hasPermesion() {
    debugger
    const perm = this.StoreForm.get('hasPermission').value;
    if (perm) { return false; }
    else { return true; }
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    const perm = this.StoreForm.get('hasPermission').value;
    if(this.inventoryType !== this.periodic && this.inventoryAccType === 178 &&  (this.StoreForm.value.storeAccNo <= 0 || this.StoreForm.value.costGoodsSoldAccNo <= 0) ){
      this.alert.ShowAlert("EnterAccounts","error");
      this.disableSave = false;
      return;
    }
    const formData = new FormData();
    debugger
    formData.append('id', this.StoreForm.value.id)
    formData.append("companyId", this.jwtAuth.getCompanyId())
    formData.append("storeNameA", this.StoreForm.value.storeNameA)
    formData.append("storeNameE", this.StoreForm.value.storeNameE)
    formData.append("storeKeeperId", this.StoreForm.value.storeKeeperId)
    formData.append("address", this.StoreForm.value.address)
    formData.append("telephone", this.StoreForm.value.telephone)
    formData.append("mobile", this.StoreForm.value.mobile)
    formData.append("allowMinusTrans", this.StoreForm.value.allowMinusTrans == null ? false : this.StoreForm.value.allowMinusTrans)
    formData.append("active", this.StoreForm.value.active == null ? false : this.StoreForm.value.active)
    formData.append("usersId", this.StoreForm.value.usersId)
    formData.append("note", this.StoreForm.value.note)
    formData.append("storeAccNo", this.StoreForm.value.storeAccNo)
    formData.append("costGoodsSoldAccNo", this.StoreForm.value.costGoodsSoldAccNo)
    formData.append("hasPermission", this.StoreForm.value.hasPermission)

    if(this.StoreForm.value.hasPermission == true)
    {
        if(this.StoreForm.value.usersId == null || this.StoreForm.value.usersId == 0)
        {
          this.alert.ShowAlert("UsersMustBeSelected","error");
          this.disableSave = false;
          return;
        }
    }


    try {
      this.inventoryService.AddStore(formData)
        .subscribe(() => {
          this.alert.SaveSuccess();
          // this.GetInitialStoreForm();
          // this.ClearStoresForm();
          this.dialogRef.close(false);
          this.data.GetAllStoresList()
        });
        this.disableSave = false;
    }
    catch {
      this.alert.SaveFaild();
    }
    //this.dialogRef.close();
    }

    ClearStoresForm()
    {
      this.StoreForm.get("storeKeeperName").setValue("");
      this.StoreForm.get("storeKeeperId").setValue(0);
      this.StoreForm.get("storeNameA").setValue("");
      this.StoreForm.get("storeNameE").setValue("");
      this.StoreForm.get("address").setValue("");
      this.StoreForm.get("telephone").setValue("");
      this.StoreForm.get("mobile").setValue("");
      this.StoreForm.get("note").setValue("");
      this.StoreForm.get("storeAccNo").setValue(0);
      this.StoreForm.get("costGoodsSoldAccNo").setValue(0);   
      this.StoreForm.get("usersId").setValue([""]);   
         
    }
}
