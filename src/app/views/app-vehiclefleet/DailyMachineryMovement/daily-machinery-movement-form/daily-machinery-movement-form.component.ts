import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DailyMachineryMovementService } from '../daily-machinery-movement.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';
import { TreeNode } from 'primeng/api';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-daily-machinery-movement-form',
  templateUrl: './daily-machinery-movement-form.component.html',
  styleUrl: './daily-machinery-movement-form.component.scss'
})
export class DailyMachineryMovementFormComponent {
  showLoader = false;
  loading: boolean;
  DailyMachineryMovementForm: FormGroup;
  showsave: boolean;
  disableSave: boolean;
  public TitlePage: string;
  public id: any;
  public opType: string;
  disableAll: boolean = false;
  // List
  public DayList: any;
  public DriverNameList: any;
  public MechanismList: any;
  movementTypeList: any;
  public projectsList: any;
  vehiclesMovementDTsList: any[] = [];
  treeData: TreeNode[];


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
    private DailyMachineryMovementService: DailyMachineryMovementService) { }


  ngOnInit(): void {
    debugger
    this.id = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;

    this.SetTitlePage();
    this.DailyMachineryMovementForm = this.formbulider.group({
      id: [0 || this.id],
      transNo: [0],
      companyId: [0],
      dayId: [0, Validators.pattern('^[1-9][0-9]*')],
      transDate: [new Date(), [Validators.required]],
      //projectId :[0],
      vehiclesMovementDTsList: [null]
    });

    if (this.id == null || this.id == undefined || this.id === "") {
      this.router.navigate(['DailyMachineryMovement/DailyMachineryMovement']);
    }

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
    this.GetVehicleDefinitionInfo();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('DailyMachineryMovementForm');
    this.title.setTitle(this.TitlePage);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  GetVehicleDefinitionInfo() {
    debugger
    this.DailyMachineryMovementService.getDailyMachineryMovementInfo(this.id,this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['DailyMachineryMovement/DailyMachineryMovement']);
        return;
      }

      result.transDate = formatDate(result.transDate, "yyyy-MM-dd", "en-US");
      this.DayList = result.dayList;
      this.DriverNameList = result.driverNameList;
      this.MechanismList = result.mechanismList;
      this.vehiclesMovementDTsList = result.vehiclesMovementDTsList;
      this.movementTypeList = result.movementTypesList;
      this.projectsList = result.projectsList;
      this.DailyMachineryMovementForm.patchValue(result);
    });
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }

    if (!this.vehiclesMovementDTsList) {
      this.vehiclesMovementDTsList = [];
    }

    this.vehiclesMovementDTsList.push(
      {
        movementTypeId: 0,
        projectId:0,
        driverId: 0,
        goingTime: 0,
        returnTime: 0,
        fromLocation: "",
        toLocation: "",
        plateNo: 0,
        companion: "",
      });
    this.DailyMachineryMovementForm.get("vehiclesMovementDTsList").setValue(this.vehiclesMovementDTsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.vehiclesMovementDTsList.splice(rowIndex, 1);
    }
  }

  OnSaveForms() {
    debugger
    let isValid = true;
    this.disableSave = true;

    if (!this.vehiclesMovementDTsList || this.vehiclesMovementDTsList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      isValid = false;
      this.disableSave = false;
      return;
    }

    this.vehiclesMovementDTsList.forEach(element => {
  /*     if (element.driverId <= 0 || element.driverId == null) {
        isValid = false;
        this.disableSave = false;
        this.alert.ShowAlert("msgPleaseChoseeDriverName", 'error');
        return;
      } */


      if ((element.goingTime <= 0 || element.goingTime == null) || ((element.returnTime <= 0 || element.returnTime == null))
        || (element.fromLocation == undefined || element.fromLocation == null || element.fromLocation == '') || (element.toLocation == undefined || element.toLocation == null || element.toLocation == '')
        || (element.plateNo <= 0 || element.plateNo == null)) {
        isValid = false;
        this.disableSave = false;
        this.alert.ShowAlert("msgEnterAllData", 'error');
        return;
      }

    });

    if (isValid) {
      this.DailyMachineryMovementForm.value.vehiclesMovementDTsList = this.vehiclesMovementDTsList;
      this.DailyMachineryMovementService.saveDailyMachineryMovement(this.DailyMachineryMovementForm.value).subscribe((result) => {
        debugger;
        if (result == true) {
          this.alert.SaveSuccess();
          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['DailyMachineryMovement/DailyMachineryMovement']);
          }
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
    this.DailyMachineryMovementForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    this.DailyMachineryMovementForm.get('transDate').setValue(currentDate);
    this.DailyMachineryMovementForm.value.dayId = 0;
    this.DailyMachineryMovementForm.value.vehiclesMovementDTsList = [];
  }

  DeleteDailyMachineryMovement(transNo: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.DailyMachineryMovementService.deleteDailyMachineryMovementDT(transNo).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['DailyMachineryMovement/DailyMachineryMovement']);
          }
          else {

            this.alert.DeleteFaild();
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  ImportFromExcel(event: any): void {
    debugger    
    // this.skipModelChange = true;    
    const target: DataTransfer = <DataTransfer>event.target;
    const fileInput = event.target as HTMLInputElement;
    if (target.files.length !== 1) {
      console.error('Cannot use multiple files');
      return;
    }

    const file: File = target.files[0];
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });
      const firstSheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

      const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Send to backend
      this.DailyMachineryMovementService.ImportFromExcel(excelData).subscribe(
        (response) => {
          debugger
          if(response.length > 0){                  
            this.vehiclesMovementDTsList = response;           
            this.DailyMachineryMovementForm.get("vehiclesMovementDTsList").setValue(this.vehiclesMovementDTsList);
            // window.location.reload(); 
          }
          else{
            this.alert.ShowAlert('Import failed','error')
            fileInput.value = "";
          }
          
        },
        (error) => {this.alert.ShowAlert('Import failed','error');fileInput.value = "";}
      );
    };

    reader.readAsBinaryString(file);                            
}

    onImportClick(fileInput: HTMLInputElement) {
      Swal.fire({
        title: this.translateService.instant('AreYouSure?'),
        text: this.translateService.instant('PleaseMakeSureDriverNoAndMechanismNumberUenteredInTheExcelAlreadyExistsInTheSystem'),
        icon: 'warning',
        confirmButtonColor: '#dc3741',
        showCancelButton: true,
        confirmButtonText: this.translateService.instant('Yes,deleteit!'),
        cancelButtonText: this.translateService.instant('Close'),
      }).then((result) => {
        if (result.value) {
          fileInput.click();
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          return false;
        }
      })                 
    }
  
}
