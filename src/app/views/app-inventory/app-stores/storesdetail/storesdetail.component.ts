import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { AppStoresService } from '../app-stores.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-storesdetail',
  templateUrl: './storesdetail.component.html',
  styleUrls: ['./storesdetail.component.scss']
})
export class StoresdetailComponent implements OnInit {

  selectedMainTable: number;
  StoreForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  active: boolean;
  minusSale: boolean;
  listTest: any[]
  usersList: any[];
  StoreKeepers: any[];
  selectedUserIds: number[] = [];
  disableAll: boolean;

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
    debugger
    this.InitialStoreForm();
    this.data.GetAllStoresList()
    this.GetInitialStoreForm();
    if (this.StoreKeepers == null || this.StoreKeepers == undefined) {
      this.GetStoreLists();
    }

    setTimeout(() => {
        this.disableAll = true;
    });
  }
  InitialStoreForm() {
    this.StoreForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      storeKeeperName: [""],
      storeKeeperId: [0],
      storeNameA: [""],
      storeNameE: [""],
      address: [""],
      telephone: [""],
      mobile: [""],
      note: [""],
      allowMinusTrans: false,
      active: true,
      hasPermission: false,
      usersStores: [null],
      usersId: [""],
    });
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
      // this.listTest = result
      this.StoreKeepers = result.storeKeeper;//this.listTest[0].storeKeeper;
      this.usersList = result.usersDefinistions;
      this.hasPerm = result.hasPermission
      this.StoreForm.patchValue(result)
    });
  }
  GetStoreLists() {
    this.inventoryService.GetStoreLists().subscribe((result) => {
      this.StoreKeepers = result.storeKeepers;
      this.usersList = result.usersDefinistions;
    });
  }
  hasPermesion() {
    const perm = this.StoreForm.get('hasPermission').value;
    if (perm) { return false; }
    else { return true; }
  }

}

