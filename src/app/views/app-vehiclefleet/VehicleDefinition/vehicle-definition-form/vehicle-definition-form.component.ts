import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { VehicleDefinitionService } from '../vehicle-definition.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-vehicle-definition-form',
  templateUrl: './vehicle-definition-form.component.html',
  styleUrl: './vehicle-definition-form.component.scss'
})
export class VehicleDefinitionFormComponent {
  showLoader = false;
  loading: boolean;
  VehicleDefinitionForm: FormGroup;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  showsave: boolean;
  disableSave: boolean;
  public TitlePage: string;
  public id: any;
  public opType: string;
  disableAll: boolean = false;
    // List
    public TypeModelList: any;
    public EngineTypeList: any;
    public TransmissionTypeList: any;
    public FuelTypeList: any;
    public DriverNameList: any;
    carLocationList: any;
    carModelList: any;
    formattedPlateNo = '';
    isMilitary:number = 0 ;
    isTracking:number = 0 ;


  constructor(private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private VehicleDefinitionService: VehicleDefinitionService) { }


  ngOnInit(): void {
    debugger
    this.id = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;

    this.SetTitlePage();
    this.VehicleDefinitionForm = this.formbulider.group({
      id: [0 || this.id],
      companyId: [0],
      carTypeId: [0, [Validators.required,Validators.min(1)]],
      model: [0, [Validators.required,Validators.min(1)]],
      manufactureYear: [0, [Validators.required,Validators.min(4)]],
      color: [""],
      engineNo: [""],
      transmissionTypeId: [0, [Validators.required,Validators.min(1)]],
      fuelTypeId: [0, [Validators.required,Validators.min(1)]],      
      seatingCapacity: [0],
      fuelTankCapacity: [0],
      plateNo: ["", [Validators.required]],
      loadCapacity: [''],
      licenseExpDate: [new Date(), [Validators.required]],
      driverName: [0],
      chassisNo: [""],
      registrationNo: [""],
      notes: [""],
      military: [false],
      militaryPlateNo: [""],
      driverMobile: [""],
      engineCapacity: [""],
      locationId: [0],
      belongTo: [""],
      tracking: [false],
      generalAttachModelList: [null],
    });

    if (this.id == null || this.id == undefined || this.id === "") {
      this.router.navigate(['VehicleDefinition/VehicleDefinition']);
    }
 
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    }); 

    this. GetVehicleDefinitionInfo();

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('VehicleDefinitionForm');
    this.title.setTitle(this.TitlePage);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  GetVehicleDefinitionInfo() {
    debugger
    this.VehicleDefinitionService.getVehicleDefinitionInfo(this.id , this.opType).subscribe(result => {
      debugger

      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Authorities/AuthoritiesList']);
        return;
      }
      result.licenseExpDate = formatDate(result.licenseExpDate, "yyyy-MM-dd", "en-US");
      this.TypeModelList = result.typeModelList;
      this.EngineTypeList = result.engineTypeList;
      this.TransmissionTypeList = result.transmissionTypeList;
      this.FuelTypeList = result.fuelTypeList;
      this.DriverNameList = result.driverNameList;
      this.carModelList = result.carModelList;
      this.formattedPlateNo = result.plateNo;
      this.carLocationList = result.carLocationList;
      this.VehicleDefinitionForm.patchValue(result);
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.VehicleDefinitionForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      if(this.id == 0)
        {
          this.VehicleDefinitionForm.get('locationId').setValue(0);
          this.VehicleDefinitionForm.get('driverName').setValue(0);
        }
        else
        {
            if(result.military == true)
              {
                this.isMilitary = 1;
                this.VehicleDefinitionForm.get("military").setValue(result.military);
              }
        }
    });
  }

  OnSaveForms(){
    debugger
    let isValid = true;
    this.disableSave = true;
    this.VehicleDefinitionForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    if (isValid) {
      this.VehicleDefinitionService.saveVehicleDefinition(this.VehicleDefinitionForm.value).subscribe((result) => {
        debugger
        if (result.isSuccess == true) {
          debugger
          this.alert.SaveSuccess();
          this.ClearAfterSave();
          this.router.navigate(['VehicleDefinition/VehicleDefinition']);
          this.id = 0;
          this.opType = 'Add';
          this.ngOnInit();
        } else {
          this.alert.SaveFaild();
  
        }
        this.disableSave = false;
      });
    }
  }

  ClearAfterSave() {
    debugger
    this.VehicleDefinitionForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    this.VehicleDefinitionForm.get('licenseExpDate').setValue(currentDate);
    this.VehicleDefinitionForm.value.carTypeId = 0;
    this.VehicleDefinitionForm.value.model = '';
    this.VehicleDefinitionForm.value.manufactureYear = 0;
    this.VehicleDefinitionForm.value.color = '';
    this.VehicleDefinitionForm.value.engineNo ='';
    this.VehicleDefinitionForm.value.transmissionTypeId = 0;
    this.VehicleDefinitionForm.value.fuelTypeId = 0;    
    this.VehicleDefinitionForm.value.seatingCapacity = '';
    this.VehicleDefinitionForm.value.fuelTankCapacity = '';
    this.VehicleDefinitionForm.value.plateNo = '';
    this.VehicleDefinitionForm.value.driverName = 0;
    this.VehicleDefinitionForm.value.loadCapacity = 0;
    this.VehicleDefinitionForm.value.licenseExpDate = '';
    this.VehicleDefinitionForm.value.notes = '';
    this.VehicleDefinitionForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
  }


  onPlateNoInput(event: Event): void {
    debugger
  const input = event.target as HTMLInputElement;
  const raw = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  const formatted = this.formatPlateNo(raw);

  this.formattedPlateNo = formatted;
  this.VehicleDefinitionForm.get('plateNo')?.setValue(this.formattedPlateNo); // store raw digits (no dash)
}

formatPlateNo(value: string): string {
  debugger
  if (!value) return '';
  const firstTwo = value.slice(0, 2);
  const rest = value.slice(2);
  return rest ? `${firstTwo}-${rest}` : firstTwo;
}

onisMilitaryChange(event: any) {
  debugger
  if (event.currentTarget.checked) {
    this.isMilitary = 1;
    this.VehicleDefinitionForm.get('militaryPlateNo')?.setValidators([Validators.required]);
    this.VehicleDefinitionForm.get('military')?.setValue(true);
  } else {
    this.isMilitary = 0;
    this.VehicleDefinitionForm.get('militaryPlateNo')?.clearValidators();
    this.VehicleDefinitionForm.get('military')?.setValue(false);
  }
}
}