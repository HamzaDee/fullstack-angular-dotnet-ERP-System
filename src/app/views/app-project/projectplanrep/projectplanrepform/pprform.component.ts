import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute,  Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { PPRService } from '../projectplanrep.service';

@Component({
  selector: 'app-pprform',
  templateUrl: './pprform.component.html',
  styleUrl: './pprform.component.scss'
})
export class PprformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;  
  ProjectPlansForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string; 
  voucherId: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number = 3;
  disableAll:boolean;   
  disableSave:boolean;
  lang:string ;
  NewDate:any;
  showsave:boolean;
  pprTargetNationalitiesList: any[] = [];
  pprDonationTypesList: any[] = [];
  projectplansList:any;
  programTypesList:any;
  donationTypeList:any;
  employeeList : any;
  weekdaysList:any;
  countriesList:any;
  householdTypeList:any;
  medicalNeedsList:any;
  isPhotoSent1:number = 0;
  isPhotoNotSent:number = 0;
  isLocationSent1:number = 0;
  isLocationNotSent:number = 0;
  isLocationSuitable1:number = 0;
  isAvailableFacilities1:number = 0;
  isStaffCooperation1:number = 0;
  isOrganized1:number = 0;
  today:any;
  ProjectName:any;
  governorate:any;
  district:any;
  association:any;
  authorityDonor:any;
  dollarRate:any;
  mediaRequestedList : any;
  requiredMediaMaterialsList : any;
  nationalitiesList:any;


  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private Service: PPRService,
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
      this.router.navigate(['ProjectPlanRep/ProjectPlansRepList']);
    }
    this.InitiailProjectPlansForm();
    this.GetInitailProjectPlans();
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
      this.TitlePage = this.translateService.instant('ProjectPlansRepForm');
      this.title.setTitle(this.TitlePage);
  }

  InitiailProjectPlansForm() {
    this.ProjectPlansForm = this.formbulider.group({
      id: [0],
      projectPlanId: [0],
      representativeId:[0],
      relationId:[""],
      driverId:[0],
      reportDate:[""],
      requstedMediaId:[""],
      requiredMediaMaterialsId:[""],
      isPhotoSent:[false],
      photoSentReason:[""],
      distStartTime:[""],
      distsEndTime:[""],
      isLocationSent:[false],
      locationReason:[""],
      isLocationSuitable:[false],
      isAvailableFacilities:[false],
      isStaffCooperation:[false],
      isOrganized:[false],
      recommendations:[""],
      pPRTargetNationalitiesModels:[null],
      pPRDonationTypesModels:[null],
      generalAttachModelList: [null],
    });
  }  

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailProjectPlans() {
    this.Service.GetInitailProjectPlans(this.voucherId,this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ProjectPlanRep/ProjectPlansRepList']);
        return;
      }
      debugger
      result.reportDate = formatDate(result.reportDate, "yyyy-MM-dd", "en-US");  
      this.dollarRate = result.dollarRate;
      this.today = result.day;   
      this.projectplansList = result.projectPlansList;
      this.employeeList = result.empList;
      this.weekdaysList = result.weekDaysList;
      this.programTypesList = result.programTypesList;
      this.donationTypeList = result.donationTypeList;
      this.countriesList = result.countriesList;
      this.householdTypeList = result.householdTypeList;
      this.medicalNeedsList = result.medicalNeedsList;
      this.governorate = result.governorate;
      this.district = result.district;
      this.requiredMediaMaterialsList = result.requiredMediaMaterialsList;
      this.mediaRequestedList = result.mediaRequestedList;
      this.nationalitiesList = result.nationalitiesList;
      if(result.associationName == "" || result.associationName == undefined || result.associationName == null)
        {
          this.association = result.autoritiesList;
          this.authorityDonor = result.autoritiesList;
        }
        else
        {
           this.authorityDonor ="";
          this.association =result.associationName;
        }
      
      if(result.generalAttachModelList != null && result.generalAttachModelList != undefined)
        {
          if(result.generalAttachModelList.length > 0)
            {              
              this.childAttachment.data = result.generalAttachModelList;
              this.childAttachment.ngOnInit();
              this.ProjectPlansForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
            }
        }


      this.pprTargetNationalitiesList = result.pPRTargetNationalitiesModels;
      if(this.pprTargetNationalitiesList != null && this.pprTargetNationalitiesList != undefined)
        {
          if(this.pprTargetNationalitiesList.length > 0)
            {
              this.ProjectPlansForm.get("pPRTargetNationalitiesModels").setValue(this.pprTargetNationalitiesList);
            }
        }
      this.pprDonationTypesList = result.pPRDonationTypesModels;
      if(this.pprDonationTypesList != null && this.pprDonationTypesList != undefined)
        {
          if(this.pprDonationTypesList.length > 0)
            {
              for (let i = 0; i < this.pprDonationTypesList.length; i++) {
                    this.CalcTotal(this.pprDonationTypesList[i]);
                  }
              this.ProjectPlansForm.get("pPRDonationTypesModels").setValue(this.pprDonationTypesList);
            }
        }
      this.ProjectPlansForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.ProjectPlansForm.get("representativeId").setValue(result.representativeId);
          this.ProjectPlansForm.get("relationId").setValue(result.relationId);
          this.ProjectPlansForm.get("driverId").setValue(result.driverId);
          this.ProjectPlansForm.get("reportDate").setValue(result.reportDate);
          this.ProjectName = this.projectplansList.find(r => r.id == result.projectPlanId)?.data1 ?? "";
          this.ProjectPlansForm.get("isPhotoSent").setValue(result.isPhotoSent);
          this.ProjectPlansForm.get("photoSentReason").setValue(result.photoSentReason);
          this.ProjectPlansForm.get("distStartTime").setValue(result.distStartTime);
          this.ProjectPlansForm.get("distsEndTime").setValue(result.distsEndTime);
          this.ProjectPlansForm.get("isLocationSent").setValue(result.isLocationSent);
          this.ProjectPlansForm.get("locationReason").setValue(result.locationReason);
          this.ProjectPlansForm.get("isLocationSuitable").setValue(result.isLocationSuitable);
          this.ProjectPlansForm.get("isAvailableFacilities").setValue(result.isAvailableFacilities);
          this.ProjectPlansForm.get("isStaffCooperation").setValue(result.isStaffCooperation);
          this.ProjectPlansForm.get("isOrganized").setValue(result.isOrganized);
          this.ProjectPlansForm.get("recommendations").setValue(result.recommendations);          
          this.HandelCheckBoxes(result);   
          this.ConvertIdsToNumber(result);         
        }
        else {
          this.ProjectPlansForm.get("representativeId").setValue(0);
          this.ProjectPlansForm.get("relationId").setValue(0);
          this.ProjectPlansForm.get("driverId").setValue(0);
          this.ProjectPlansForm.get("reportDate").setValue(result.reportDate);
          // this.ProjectPlansForm.get("takenPhotos").setValue("");
          this.ProjectPlansForm.get("isPhotoSent").setValue(false);
          this.ProjectPlansForm.get("photoSentReason").setValue("");
          this.ProjectPlansForm.get("distStartTime").setValue("");
          this.ProjectPlansForm.get("distsEndTime").setValue("");
          this.ProjectPlansForm.get("isLocationSent").setValue(false);
          this.ProjectPlansForm.get("locationReason").setValue("");
          this.ProjectPlansForm.get("isLocationSuitable").setValue(false);
          this.ProjectPlansForm.get("isAvailableFacilities").setValue(false);
          this.ProjectPlansForm.get("isStaffCooperation").setValue(false);
          this.ProjectPlansForm.get("isOrganized").setValue(false);
          this.ProjectPlansForm.get("recommendations").setValue(""); 
          this.governorate = "";
          this.district = "";
          this.association = "";
          this.ProjectName = "";
          this.HandelCheckBoxes(result); 
        }               
      });
    })
  }

  OnSaveForms() {
    debugger
    this.PrepareCheckBoxesForSave();
    if (this.CheckValidationOnSave() == false) {
      return;
    }
    debugger        
    this.ProjectPlansForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ProjectPlansForm.value.userId = this.jwtAuth.getUserId();
    this.ProjectPlansForm.get("pPRTargetNationalitiesModels").setValue(this.pprTargetNationalitiesList);
    this.ProjectPlansForm.get("pPRDonationTypesModels").setValue( this.pprDonationTypesList);    
    this.ProjectPlansForm.get("generalAttachModelList").setValue(this.childAttachment.getVoucherAttachData());
    this.ConvertIdsToString();
    this.Service.SaveProjectsPlansRep(this.ProjectPlansForm.value)
      .subscribe((result) => {
        debugger
        
        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          if(this.opType == 'Edit')
            {
              this.router.navigate(['ProjectPlanRep/ProjectPlansRepList']);
            }
          this.clearFormdata();
          
            this.voucherId = 0;
            this.opType = 'Add'; 
            this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  clearFormdata()
  {   
    this.NewDate = new Date;    
    this.ProjectPlansForm.get("representativeId").setValue(0);
    this.ProjectPlansForm.get("relationId").setValue(0);
    this.ProjectPlansForm.get("driverId").setValue(0);
    this.ProjectPlansForm.get("reportDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ProjectPlansForm.get("requstedMediaId").setValue("");
    this.ProjectPlansForm.get("requiredMediaMaterialsId").setValue("");    
    this.ProjectPlansForm.get("isPhotoSent").setValue(false);
    this.ProjectPlansForm.get("photoSentReason").setValue("");
    this.ProjectPlansForm.get("distStartTime").setValue("");
    this.ProjectPlansForm.get("distsEndTime").setValue("");
    this.ProjectPlansForm.get("isLocationSent").setValue(false);
    this.ProjectPlansForm.get("locationReason").setValue("");
    this.ProjectPlansForm.get("isLocationSuitable").setValue(false);
    this.ProjectPlansForm.get("isAvailableFacilities").setValue(false);
    this.ProjectPlansForm.get("isStaffCooperation").setValue(false);
    this.ProjectPlansForm.get("isOrganized").setValue(false);
    this.ProjectPlansForm.get("recommendations").setValue("");       
    this.isPhotoSent1 = 0;
    this.isLocationSent1 = 0;
    this.isLocationSuitable1 = 0;
    this.isAvailableFacilities1 = 0;
    this.isStaffCooperation1 = 0;
    this.isOrganized1 = 0;
    this.voucherId = 0;
    this.opType = 'Add';
    this.GetInitailProjectPlans();      
  }

  CalcPercentage(Value,Row,index)
  {
    let tot = 0;
     for (let i = 0; i < this.pprTargetNationalitiesList.length; i++) {
      const element = this.pprTargetNationalitiesList[i];
      tot += Number(element.actualNo);
    }
    for (let i = 0; i < this.pprTargetNationalitiesList.length; i++) {
      const element = this.pprTargetNationalitiesList[i];
      let no = Number(element.actualNo) 
      this.pprTargetNationalitiesList[i].beneficiaryPercent = ((no/tot) * 100).toFixed(0);
    }    
  }

  GetProjecPlantData(event: any) {
    debugger
    const ProjectPlanId = event.value;
    if(ProjectPlanId > 0)
      {
        this.ProjectName = this.projectplansList.find(r => r.id == ProjectPlanId)?.data1 ?? "";
        this.Service.GetProjectData(ProjectPlanId).subscribe(result => {
        if(result != null && result != undefined)
          {
            debugger
            this.governorate = result.governorate;
            this.district = result.district;
            if(result.associationName == "" || result.associationName == undefined || result.associationName == null)
              {
                this.association = result.autoritiesList;
                this.authorityDonor = result.autoritiesList;
              }
              else
              {
                this.association =result.associationName;
                this.authorityDonor = "";
              }
              this.pprTargetNationalitiesList = result.pPRTargetNationalitiesModels;
              if(this.pprTargetNationalitiesList != null && this.pprTargetNationalitiesList != undefined)
                {
                  if(this.pprTargetNationalitiesList.length > 0)
                    {
                      this.ProjectPlansForm.get("pPRTargetNationalitiesModels").setValue(this.pprTargetNationalitiesList);
                    }
                }
              this.pprDonationTypesList = result.pPRDonationTypesModels;
              if(this.pprDonationTypesList != null && this.pprDonationTypesList != undefined)
                {
                  if(this.pprDonationTypesList.length > 0)
                    {
                      for (let i = 0; i < this.pprDonationTypesList.length; i++) {
                        this.CalcTotal(this.pprDonationTypesList[i]);
                      }
                      this.ProjectPlansForm.get("pPRDonationTypesModels").setValue(this.pprDonationTypesList);
                    }
                }
                this.ProjectPlansForm.get("representativeId").setValue(result.representativeId);
          }
        })
      }
    

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
        this.Service.DeleteProjectsPlansRep(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ProjectPlanRep/ProjectPlansRepList']);
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

  PrepareCheckBoxesForSave()
  {
    if(this.isPhotoSent1 == 1)
    {
      this.ProjectPlansForm.get("isPhotoSent").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("isPhotoSent").setValue(false);
    }
    if(this.isLocationSent1 == 1)
    {
      this.ProjectPlansForm.get("isLocationSent").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("isLocationSent").setValue(false);
    }
    if(this.isLocationSuitable1 == 1)
    {
      this.ProjectPlansForm.get("isLocationSuitable").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("isLocationSuitable").setValue(false);
    }
    if(this.isAvailableFacilities1 == 1)
    {
      this.ProjectPlansForm.get("isAvailableFacilities").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("isAvailableFacilities").setValue(false);
    }
    if(this.isStaffCooperation1 == 1)
    {
      this.ProjectPlansForm.get("isStaffCooperation").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("isStaffCooperation").setValue(false);
    }
    if(this.isOrganized1 == 1)
    {
      this.ProjectPlansForm.get("isOrganized").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("isOrganized").setValue(false);
    }
  }

  HandelCheckBoxes(data)
  {    
    if(data.isLocationSuitable == true)
      {
        this.isLocationSuitable1 = 1;
        this.ProjectPlansForm.get("isLocationSuitable").setValue(data.isLocationSuitable);
      }

    if(data.isAvailableFacilities == true)
      {
        this.isAvailableFacilities1 = 1;
        this.ProjectPlansForm.get("isAvailableFacilities").setValue(data.isAvailableFacilities);
      }

      if(data.isStaffCooperation == true)
      {
        this.isStaffCooperation1 = 1;
        this.ProjectPlansForm.get("isStaffCooperation").setValue(data.isStaffCooperation);
      }

      if(data.isOrganized == true)
      {
        this.isOrganized1 = 1;
        this.ProjectPlansForm.get("isOrganized").setValue(data.isOrganized);
      }     

      if(data.isPhotoSent == true)
      {
        this.isPhotoSent1 = 1;
        this.isPhotoNotSent = 0;
        this.ProjectPlansForm.get("isPhotoSent").setValue(data.isPhotoSent);
      }
      else
      {
        this.isPhotoNotSent = 1;
        this.isPhotoSent1 = 0;
        this.ProjectPlansForm.get("isPhotoSent").setValue(data.isPhotoSent);
      }
    
      if(data.isLocationSent == true)
      {
        this.isLocationSent1 = 1;
        this.isLocationNotSent = 0;
        this.ProjectPlansForm.get("isLocationSent").setValue(data.isLocationSent);
      }
      else
      {
        this.isLocationNotSent = 1;
        this.isLocationSent1 = 0;
        this.ProjectPlansForm.get("isLocationSent").setValue(data.isLocationSent);
      }
  }

  CheckValidationOnSave() 
  {  
    if(this.pprDonationTypesList.length > 0)
      {
        for (let i = 0; i < this.pprDonationTypesList.length; i++) {
          const element = this.pprDonationTypesList[i];
          if(element.actualNo == 0 || element.actualNo == null || element.actualNo == undefined)
            {
              this.alert.ShowAlert("PleaseInsertRequiredDataForSampleTable", 'error');
              return false;
            }
        }
      }
      if(this.pprTargetNationalitiesList.length > 0)
      {
        for (let i = 0; i < this.pprTargetNationalitiesList.length; i++) {
          const element = this.pprTargetNationalitiesList[i];
          if(element.actualNo == 0 || element.actualNo == null || element.actualNo == undefined)
            {
              this.alert.ShowAlert("PleaseInsertRequiredDataForTargetedNationalitiesTable", 'error');
              return false;
            }
        }
      }
     return true;
  }

  onisPhotoSentChange(event: any) 
  {
    debugger
    let value = event.currentTarget.checked;
    if(value == true) {
      this.isPhotoSent1 = 1;
      this.isPhotoNotSent = 0;
      this.ProjectPlansForm.get("isPhotoSent").setValue(true);
    }
    else
    {
      this.isPhotoSent1 = 0;
    }
  }

  onisPhotoNotSentChange(event: any)
  {
    debugger
    let value = event.currentTarget.checked;
    if(value == true) {
      this.isPhotoNotSent = 1;
      this.isPhotoSent1 = 0;
      this.ProjectPlansForm.get("isPhotoSent").setValue(false);
    }
    else
    {
      this.isPhotoNotSent = 0;
    }
  }

  onisLocationSentChange(event: any) 
  {
    debugger
    let value = event.currentTarget.checked;
    if(value == true) {
      this.isLocationSent1 = 1;
      this.isLocationNotSent = 0;
      this.ProjectPlansForm.get("isLocationSent").setValue(true);
    }
    else
    {
      this.isLocationSent1 = 0;
    }
  }

  onisLocationNotSentChange(event: any)
  {
    debugger
    let value = event.currentTarget.checked;
    if(value == true) {
      this.isLocationNotSent = 1;
      this.isLocationSent1 = 0;
      this.ProjectPlansForm.get("isLocationSent").setValue(false);
    }
    else
    {
      this.isLocationNotSent = 0;
    }
  }

  CalcTotal(row) {
    debugger
    if (row.couponsNo > 0 && row.couponsAmount > 0) {
      row.total = (row.couponsNo * row.couponsAmount).toFixed(this.decimalPlaces);
      row.dollarTotal = (Number(row.total) / this.dollarRate).toFixed(this.decimalPlaces);
    }
    else
    {
        row.total =0;
        row.dollarTotal = 0;
    }
  }

  onDateChange(event: Event): void {
    debugger
    const input = event.target as HTMLInputElement;
    const selectedDate = input.value;
    if (selectedDate) {
      this.today = this.getWeekDayName(selectedDate);
    } else {
      this.today = '';
    }
  }

  getWeekDayName(dateString: string): string {
    const date = new Date(dateString);
    let datdate =  date.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
     let day =  this.weekdaysList.find(r => r.data1 == datdate).text;
    return day;
  }

  calculateSum() {
    return this.formatCurrency(
      this.pprDonationTypesList.reduce((sum, item) => {
        const tot = parseFloat(item.total);
        
        const valid = isNaN(tot) ? 0 : tot;

        return sum + (valid);
      }, 0)
    );
  }

  calculateSumDollar() {
    return this.formatCurrency(
      this.pprDonationTypesList.reduce((sum, item) => {
        const dollarTotal = parseFloat(item.dollarTotal);
        const validdollarTotal = isNaN(dollarTotal) ? 0 : dollarTotal;
       

        return sum + (validdollarTotal);
      }, 0)
    );
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

   CalcTotalAct(row) {
    debugger
    if (row.actualNo > 0 && row.couponsAmount > 0) {
      row.total = (row.actualNo * row.couponsAmount).toFixed(this.decimalPlaces);
      row.dollarTotal = (row.total / this.dollarRate).toFixed(this.decimalPlaces);
    }
    else
    {
        row.total =0;
        row.dollarTotal = 0;
    }
  }

  isEmpty(input) {
    return input === '' || input === null;
  }


  ConvertIdsToString()
  {
    debugger
    let C1 = this.ProjectPlansForm.value.relationId;
    if (Array.isArray(C1)) {
      let validC1 = C1
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C1String = validC1.join(',');
      this.ProjectPlansForm.get("relationId").setValue(C1String);
      console.log('Filtered paymentMethod:', C1String);
    } else {
      console.error('relationId is not an array');
    }

    let C2 = this.ProjectPlansForm.value.requstedMediaId;
    if (Array.isArray(C2)) {
      let validC2 = C2
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C2String = validC2.join(',');
      this.ProjectPlansForm.get("requstedMediaId").setValue(C2String);
      console.log('Filtered requstedMediaId:', C2String);
    } else {
      console.error('requstedMediaId is not an array');
    }

    let C3 = this.ProjectPlansForm.value.requiredMediaMaterialsId;
    if (Array.isArray(C3)) {
      let validC3 = C3
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C3String = validC3.join(',');
      this.ProjectPlansForm.get("requiredMediaMaterialsId").setValue(C3String);
      console.log('Filtered requiredMediaMaterialsId:', C3String);
    } else {
      console.error('requiredMediaMaterialsId is not an array');
    }
    

  }

  ConvertIdsToNumber(data)
  {
    debugger
    if(data.relationId != null && data.relationId != undefined && data.relationId != "" && data.relationId != "0")
      {
        let A1 = data.relationId.split(',').map(Number)
        this.ProjectPlansForm.get("relationId").setValue(A1);
      }
      else
      {
        this.ProjectPlansForm.get("relationId").setValue("");
      }    

    if(data.requstedMediaId != null && data.requstedMediaId != undefined && data.requstedMediaId != "" && data.requstedMediaId != "0")
      {
        let A1 = data.requstedMediaId.split(',').map(Number)
        this.ProjectPlansForm.get("requstedMediaId").setValue(A1);
      }
      else
      {
        this.ProjectPlansForm.get("requstedMediaId").setValue("");
      }    

    if(data.requiredMediaMaterialsId != null && data.requiredMediaMaterialsId != undefined && data.requiredMediaMaterialsId != "" && data.requiredMediaMaterialsId != "0")
      {
        let A1 = data.requiredMediaMaterialsId.split(',').map(Number)
        this.ProjectPlansForm.get("requiredMediaMaterialsId").setValue(A1);
      }
      else
      {
        this.ProjectPlansForm.get("requiredMediaMaterialsId").setValue("");
      } 




      

  }

  SelectAllRelations(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);
    if (hasSelectAll) {
      const allIds = this.employeeList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectPlansForm.get("relationId")?.setValue(allIds);
      } else {
        this.ProjectPlansForm.get("relationId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectPlansForm.get("relationId")?.setValue(cleaned);
    }
  }

  SelectAllRequiredMediaCoverage(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);
    if (hasSelectAll) {
      const allIds = this.mediaRequestedList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectPlansForm.get("requstedMediaId")?.setValue(allIds);
      } else {
        this.ProjectPlansForm.get("requstedMediaId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectPlansForm.get("requstedMediaId")?.setValue(cleaned);
    }
  }

  SelectAllRequstedItems(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);
    if (hasSelectAll) {
      const allIds = this.requiredMediaMaterialsList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectPlansForm.get("requiredMediaMaterialsId")?.setValue(allIds);
      } else {
        this.ProjectPlansForm.get("requiredMediaMaterialsId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectPlansForm.get("requiredMediaMaterialsId")?.setValue(cleaned);
    }
  }
}
