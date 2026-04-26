import { Component, Inject } from '@angular/core';
import { AppStoresService } from '../app-stores.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-store-manager-history',
  templateUrl: './store-manager-history.component.html',
  styleUrl: './store-manager-history.component.scss'
})
export class StoreManagerHistoryComponent {
  dataList: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private inventoryService: AppStoresService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.GetAllStoreManagerHistoryList();
  }

  GetAllStoreManagerHistoryList() {
    debugger
    this.inventoryService.GetAllStoreManagerHistoryList(this.data.id).subscribe((result) => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }

      this.dataList = result;
    });
  }

}
