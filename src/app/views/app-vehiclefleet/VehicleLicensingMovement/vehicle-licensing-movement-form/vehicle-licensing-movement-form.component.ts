import { formatDate } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { CheckUpService } from '../../vehiclecheckup/checkup.service';
import { VehicleLicensingMovementService } from '../vehicle-licensing-movement.service';
import { VehicleLicensingMovementListComponent } from '../vehicle-licensing-movement-list/vehicle-licensing-movement-list.component';

@Component({
  selector: 'app-vehicle-licensing-movement-form',
  templateUrl: './vehicle-licensing-movement-form.component.html',
  styleUrl: './vehicle-licensing-movement-form.component.scss'
})
export class VehicleLicensingMovementFormComponent {
  public TitlePage: string;
  showLoader = false;
  loading: boolean;
  VehicleLicensingMovementForm: FormGroup;
  MechanismList: any;
  InsuranceList: any;
    public isShow: boolean = false;
 disableAll: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private service: CheckUpService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private vehicleLicensingMovementService: VehicleLicensingMovementService,
    private formbulider: FormBuilder,
   public dialogRef: MatDialogRef<VehicleLicensingMovementListComponent>) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.VehicleLicensingMovementForm = this.formbulider.group({
      id: [0  || this.data.id],
      companyId: [0],
      vehicleId: [0, [Validators.required,Validators.min(1)]],
      licenseExpDate: [new Date(), [Validators.required]],
      insuranceId: [0, [Validators.required,Validators.min(1)]],
      insuranceExpDate: [new Date(), [Validators.required]],
      insuranceType:[""],
    });

        if (this.data.id == null || this.data.id == undefined || this.data.id === "") {
      this.router.navigate(['VehicleLicensingMovement/VehicleLicensingMovementList']);
    }

    this.GetVehicleLicensingMovementInfo();

        setTimeout(() => {
      if (this.data.isShow == true) {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('VehicleLicensingMovementForm');
    this.title.setTitle(this.TitlePage);
  }

  GetVehicleLicensingMovementInfo() {
    debugger
    this.vehicleLicensingMovementService.getVehicleLicensingMovementInfo(this.VehicleLicensingMovementForm.value.id,this.data.isShow).subscribe(result => {
      debugger

      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['VehicleLicensingMovement/VehicleLicensingMovementList']);
        this.dialogRef.close();
        return;
      }

      result.licenseExpDate = formatDate(result.licenseExpDate, "yyyy-MM-dd", "en-US");
      result.insuranceExpDate = formatDate(result.insuranceExpDate, "yyyy-MM-dd", "en-US");
      this.MechanismList = result.mechanismList;
      this.InsuranceList = result.insuranceList;
      this.VehicleLicensingMovementForm.patchValue(result);
    });
  }

    OnSaveForms(){
    debugger
    this.vehicleLicensingMovementService.saveVehicleLicensingMovement(this.VehicleLicensingMovementForm.value).subscribe(() => {
      debugger
      if (!this.data.isNew) {
        this.data.isNew = true
        this.data.id = 0
        this.alert.SaveSuccess();
        this.ClearAfterSave();
        this.GetVehicleLicensingMovementInfo();
        this.data.GetVehicleLicensingMovementList();
      }
      else {
        this.alert.SaveSuccess();
       // this.ClearAfterSave();
        this.GetVehicleLicensingMovementInfo();
        this.data.GetVehicleLicensingMovementList()
      }
    })
  }


  ClearAfterSave() {
    debugger
    this.VehicleLicensingMovementForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    this.VehicleLicensingMovementForm.get('licenseExpDate').setValue(currentDate);
    this.VehicleLicensingMovementForm.get('insuranceExpDate').setValue(currentDate);
    this.VehicleLicensingMovementForm.value.vehicleId = 0;
    this.VehicleLicensingMovementForm.value.insuranceId = 0;
  }
}
