import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { CheckUpService } from '../checkup.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkupform',
  templateUrl: './checkupform.component.html',
  styleUrl: './checkupform.component.scss'
})
export class CheckupformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  CheckUpsAddForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string; 
  voucherId: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll:boolean;   
  disableSave:boolean;
  lang:string ;
  NewDate:any;
  showsave:boolean;
  vehiclesList:any;
  employeesList:any;
  checkupsList: any[] = [];
  vehicleType:any;
  vehicleDriver:any;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private Service: CheckUpService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;


    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.voucherId = 0;
    }
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['CheckUp/Checkuplist']);
    }
    this.InitiailCheckUpForm();
    this.GetInitailCheckUp();
    setTimeout(() => {
      if (this.opType == "Show") 
        {
          this.disableAll = true;         
        }
      else 
        {
          this.disableAll = false;
        }
    });
  }

  SetTitlePage() {
        this.TitlePage = this.translateService.instant('Checkupform');
        this.title.setTitle(this.TitlePage);
  }
    
  InitiailCheckUpForm() {
    this.CheckUpsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      vehicleId:[0,[Validators.required, Validators.min(1)]],
      checkDate :["",[Validators.required]],
      weeklyMaintenance :["",[Validators.required]],
      notes:[""],
      gmNotes:[""],
      maintOfficer:[0],
      headDepartmentId:[0],
      checkUpDtlModels:[null],                  
    });
  }
      
  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailCheckUp() {
    this.Service.GetInitailCheckUp(this.voucherId,this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['CheckUp/Checkuplist']);
        return;
      }
      debugger
      result.checkDate = formatDate(result.checkDate, "yyyy-MM-dd", "en-US");                
      this.employeesList = result.employeesList;
      this.vehiclesList = result.vehiclesList;
      if(result.checkUpDtlModels != null && result.checkUpDtlModels.length > 0)
        {
          this.checkupsList = result.checkUpDtlModels;
          this.CheckUpsAddForm.get("checkUpDtlModels").setValue(this.checkupsList);
        }
      this.CheckUpsAddForm.patchValue(result);        
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {          
          this.CheckUpsAddForm.get("id").setValue(result.id);
          this.CheckUpsAddForm.get("vehicleId").setValue(result.vehicleId);
          this.CheckUpsAddForm.get("checkDate").setValue(result.checkDate);
          this.CheckUpsAddForm.get("weeklyMaintenance").setValue(result.weeklyMaintenance);
          this.CheckUpsAddForm.get("notes").setValue(result.notes);
          this.CheckUpsAddForm.get("gmNotes").setValue(result.gmNotes);
          this.CheckUpsAddForm.get("maintOfficer").setValue(result.maintOfficer);
          this.CheckUpsAddForm.get("headDepartmentId").setValue(result.headDepartmentId);  
          this.getVehicleDetails(result.vehicleId);                  
        }
        else {
          this.CheckUpsAddForm.get("id").setValue(result.id);
          this.CheckUpsAddForm.get("vehicleId").setValue(0);
          this.CheckUpsAddForm.get("checkDate").setValue(result.checkDate);
          this.CheckUpsAddForm.get("weeklyMaintenance").setValue("");
          this.CheckUpsAddForm.get("notes").setValue("");          
          this.CheckUpsAddForm.get("gmNotes").setValue("");
          this.CheckUpsAddForm.get("maintOfficer").setValue(0);
          this.CheckUpsAddForm.get("headDepartmentId").setValue(0);
        }          
      });
    })
  }

  OnSaveForms() {
    debugger
    if(this.CheckUpsAddForm.value.weeklyMaintenance == "" || this.CheckUpsAddForm.value.weeklyMaintenance == null || this.CheckUpsAddForm.value.weeklyMaintenance == undefined) 
      {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return false;
      }
    this.disableSave = true;
    if(this.checkupsList.length > 0)
    {
      for (let i = 0; i < this.checkupsList.length; i++) {
        const element = this.checkupsList[i];
        if (element.vehicleClean == "" && element.engineCheck == "" && element.oilCheck == "" ) {
          this.alert.ShowAlert("PleaseEnterAtleastOneCheckOrRemoveTheRows", 'error');
          this.disableSave = false;
          return false;
        }
        element.i = i.toString();
      }
    }
    
    debugger      
    this.CheckUpsAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.CheckUpsAddForm.value.userId = this.jwtAuth.getUserId();
    this.CheckUpsAddForm.value.checkUpDtlModels = this.checkupsList;
    if(this.opType =='Add')
      {
        this.CheckUpsAddForm.get("id").setValue(0);
      }
    debugger
    this.Service.SaveCheckUps(this.CheckUpsAddForm.value)
      .subscribe((result) => {
        debugger
        
        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          this.clearFormdata();
          if(this.opType == 'Edit')
            {
              this.router.navigate(['CheckUp/Checkuplist']);
            }
            this.voucherId = 0;
            this.opType = 'Add'; 
            this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }

    this.checkupsList ??= [];  
    this.checkupsList.push(
      {
        id: 0,
        hdId: 0,
        vehicleClean:"",
        engineCheck:"",
        oilCheck: "",      
        index: ""
      });
      this.CheckUpsAddForm.get("checkUpDtlModels").setValue(this.checkupsList);
  }

  calculateSum() {
    // return this.formatCurrency(
    //   this.accVouchersDTsList.reduce((sum, item) => {
    //     const qty = parseFloat(item.qty);
    //     const price = parseFloat(item.price);

    //     // Check for invalid qty or price and treat them as 0 if invalid
    //     const validQty = isNaN(qty) ? 0 : qty;
    //     const validPrice = isNaN(price) ? 0 : price;

    //     return sum + (validQty * validPrice);
    //   }, 0)
    // );
  }

  deleteRow(rowIndex: number) {  
    this.checkupsList.splice(rowIndex, 1);
    this.CheckUpsAddForm.get("checkUpDtlModels").setValue(this.checkupsList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }
 
  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  DeleteVoucher(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.Service.DeleteCheckUps(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['CheckUp/Checkuplist']);
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        // No action needed if the user cancels
      }
    })      
  }

  PrintPurchaseRequest(id: number) {
    this.lang = this.jwtAuth.getLang();  
    if(this.lang == 'ar')
      {
        const reportUrl = `RptPurchaseRequestAr?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else
      {
        const reportUrl = `RptPurchaseRequestEn?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
  }   

  clearFormdata()
  {   
    this.NewDate = new Date;    
    this.CheckUpsAddForm.get("id").setValue(0);
    this.CheckUpsAddForm.get("vehicleId").setValue(0);
    this.CheckUpsAddForm.get("checkDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.CheckUpsAddForm.get("weeklyMaintenance").setValue("");
    this.CheckUpsAddForm.get("notes").setValue("");          
    this.CheckUpsAddForm.get("gmNotes").setValue("");
    this.CheckUpsAddForm.get("maintOfficer").setValue(0);
    this.CheckUpsAddForm.get("headDepartmentId").setValue(0);
    this.vehicleType = null;
    this.vehicleDriver = null;
    this.checkupsList = [];
    this.CheckUpsAddForm.get("checkUpDtlModels").setValue([]);    
  }

  getVehicleDetails(event: any) 
  {
    debugger
    if(event != null && event != undefined && event != 0)
      {
        let vehicleId= this.vehiclesList.filter(x => x.id == event);
          this.vehicleType = vehicleId[0].data1;
          this.vehicleDriver = vehicleId[0].data3;      
      }
    else
      {
        this.vehicleType = null;
        this.vehicleDriver = null;
      }

  }
}
