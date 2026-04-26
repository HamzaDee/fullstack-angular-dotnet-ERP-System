import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RepairsOilChangeAndFuelRefillListComponent } from '../repairs-oil-change-and-fuel-refill-list/repairs-oil-change-and-fuel-refill-list.component';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RepairsOilChangeAndFuelRefillService } from '../repairs-oil-change-and-fuel-refill.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { formatDate } from '@angular/common';
import { delay, of } from 'rxjs';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';

@Component({
  selector: 'app-repairs-oil-change-and-fuel-refill-form',
  templateUrl: './repairs-oil-change-and-fuel-refill-form.component.html',
  styleUrl: './repairs-oil-change-and-fuel-refill-form.component.scss'
})
export class RepairsOilChangeAndFuelRefillFormComponent {
  RepairsOilForm: FormGroup;
  MaintenanceTypeList: any;
  VehicleList: any;
  disableSave: boolean;
  id: number;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  public isShow: boolean = false;
  disableAll: boolean = false;

  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<RepairsOilChangeAndFuelRefillListComponent>,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public router: Router,
    private RepairsOilChangeAndFuelRefillService: RepairsOilChangeAndFuelRefillService) { }

  ngOnInit(): void {
    this.RepairsOilForm = this.formbulider.group({
      id: [0 || this.data.id],
      comapnyId: [0],
      vehicleId: [0, Validators.pattern('^[1-9][0-9]*')],
      billNo: [0, Validators.required],
      voucherDate: [new Date(), Validators.required],
      station: [''],
      driverName: [''],
      odometerNo: [0],
      maintenance: ['', Validators.required],
      amount: [0, Validators.required],
      maintenanceTypeId: [0, Validators.pattern('^[1-9][0-9]*')],
      generalAttachModelList:[null],                        
    });

    if (this.data.id == null || this.data.id == undefined || this.data.id === "") {
      this.router.navigate(['RepairsOilChangeAndFuelRefill/RepairsOilChangeAndFuelRefillList']);
    }
    this.getRepairsOilFormInfo();

    setTimeout(() => {
      if (this.data.isShow == true) {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }


  getRepairsOilFormInfo() {
    debugger
    this.RepairsOilChangeAndFuelRefillService.getRepairsOilChangeAndFuelRefillInfo(this.data.id,this.data.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['RepairsOilChangeAndFuelRefill/RepairsOilChangeAndFuelRefillList']);
        return;
      }

      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
      this.VehicleList = result.vehicleList;
      this.MaintenanceTypeList = result.maintenanceTypeList;
      this.RepairsOilForm.patchValue(result);

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.RepairsOilForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
    });
  }

  OnSaveForms() {
    debugger
    let isValid = true;
    this.disableSave = true;

   if(this.RepairsOilForm.value.maintenanceTypeId == null || this.RepairsOilForm.value.maintenanceTypeId <= 0)
   {
    this.alert.ShowAlert("msgmaintenanceType", 'error');
    this.disableSave = false;
    isValid = false;
    return;
   }

    if (isValid) {
      this.RepairsOilForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      this.RepairsOilChangeAndFuelRefillService.saveRepairsOilChangeAndFuelRefill(this.RepairsOilForm.value).subscribe((result) => {
        debugger

        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.ClearAfterSave();
          this.getRepairsOilFormInfo();
          this.data.GetRepairsOilChangeAndFuelRefillList();
        }
        else {
          this.alert.SaveSuccess();
          this.ClearAfterSave();
          this.getRepairsOilFormInfo();
          this.data.GetRepairsOilChangeAndFuelRefillList()
        }
      });
    }
  }

  ClearAfterSave() {
    debugger
    this.RepairsOilForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    this.RepairsOilForm.get('voucherDate').setValue(currentDate);
    this.RepairsOilForm.value.vehicleId = 0;
    this.RepairsOilForm.value.billNo = 0;
    this.RepairsOilForm.value.station = '';
    this.RepairsOilForm.value.driverName = '';
    this.RepairsOilForm.value.odometerNo = 0;
    this.RepairsOilForm.value.maintenance = '';
    this.RepairsOilForm.value.amount = 0;
    this.RepairsOilForm.value.maintenanceTypeId = 0;
    this.RepairsOilForm.value.generalAttachModelList = null;
    this.childAttachment.data = [];
  }

  isEmpty(input) {
    return input === '' || input === null;
  }
}
