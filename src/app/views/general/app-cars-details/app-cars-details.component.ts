import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-cars-details',
  templateUrl: './app-cars-details.component.html',
  styleUrls: ['./app-cars-details.component.scss'] 
})
export class AppCarsDetailsComponent implements OnInit {
  itemCarDetailsForm: FormGroup;
  public TitlePage: string;
  itemName: string;
  qty: number;
  itemId: number;
  storeId: number;
  itemCarDetailsList: any[] = [];
  loading: boolean;
  index: number;
  optype:any;
  disableAll:boolean;
  isdisabled:boolean;

  constructor
    (
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<any>,
      public routePartsService: RoutePartsService,
      public router: Router,
      private title: Title,
      private translateService: TranslateService,
      private formbulider: FormBuilder,
      private alert: sweetalert,

    ) { }


  ngOnInit(): void {
    this.itemCarDetailsGetForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CarsDetails');
    this.title.setTitle(this.TitlePage);
  }

  itemCarDetailsGetForm(): void {
    this.itemCarDetailsForm = this.formbulider.group({
      id: [0],
      invVoucherDTID: [0],
      itemDTId: [0],
    });
    debugger
    // الداتا القادمة من الشاشة الرئيسية
    this.optype = this.data.kind;
    this.index = this.data.rowIndex;
    this.disableAll = !!this.data.disableAll;
    this.isdisabled = !!this.data.isdisabled;
    this.itemName = this.data.itemName;
    this.itemId = this.data.itemId;
    
    this.itemCarDetailsList = this.data.itemCarDetailsList;
    if(this.itemCarDetailsList.length > 0) {
       this.itemCarDetailsList.forEach(element => {
          element.itemDTId =  this.itemId;
          element.driverName = element.driverName;
          element.phoneNo = element.phoneNo;
          element.qty = element.qty;
          element.pallets = element.pallets;
          element.tractorNo = element.tractorNo;
          element.donorName = element.donorName;
          element.rowIndex = this.index ;
        })
    }
  }

  AddNewLine() {
    this.itemCarDetailsList ??= [];     
     this.itemCarDetailsList.push(
       {
        id: 0,
        invVoucherDTID: 0,
        itemDTId: this.itemId,
        driverName: "",
        phoneNo: "",
        qty: 0,
        pallets: 0,
        tractorNo: "",
        donorName: "",
        rowIndex:this.index,
        index: this.index,
       });
    
  }

  deleteRow(rowIndex: number) {
    debugger
    if (rowIndex !== -1) {
      this.itemCarDetailsList.splice(rowIndex, 1);
    }
  }

  cleardata() {
    if (!this.itemCarDetailsList?.length) return;
    this.itemCarDetailsList = [];
  }

  private validate(): boolean {
    let stopExt = false;

    this.itemCarDetailsList.forEach((row, i) => {  
      if (!row.driverName || row.driverName.trim() === '') stopExt = true;
      if (!row.phoneNo || row.phoneNo.trim() === '') stopExt = true;
      if (row.qty === null || row.qty === undefined || row.qty === '' || Number(row.qty) <= 0) stopExt = true;      
      if (!row.tractorNo || row.tractorNo.trim() === '') stopExt = true;
      row.index = i.toString();
    });

    if (stopExt) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      return false;
    }
    return true;
  }

  onConfirm(): void {
    debugger
    if (!this.validate()) return;
    this.dialogRef.close(this.itemCarDetailsList);
  }


  onCancel(): void {
      debugger
      if(this.optype == 'Edit') 
        {
           this.dialogRef.close(this.itemCarDetailsList);
           return;
        }
        Swal.fire({
            title: this.translateService.instant('AreYouSure?'),
            text: this.translateService.instant('DoYouWannaSave'),
            icon: 'warning',
            confirmButtonColor: '#dc3741',
            showCancelButton: true,
            confirmButtonText: this.translateService.instant('Yes,deleteit!'),
            cancelButtonText: this.translateService.instant('No'),
          }).then((result) => {
            if (result.value) {
              debugger
          if (!this.validate()) return;
              this.dialogRef.close(this.itemCarDetailsList);
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.itemCarDetailsList = [];
              this.dialogRef.close(this.itemCarDetailsList);
            }
          })
      
  }
}
