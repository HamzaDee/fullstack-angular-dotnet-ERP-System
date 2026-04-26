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
import{ProjectPlansService} from 'app/views/app-project/projectsplans/projectplans.service';
import * as XLSX from 'xlsx';
import { E } from '@angular/cdk/keycodes';



@Component({
  selector: 'app-projplansform',
  templateUrl: './projplansform.component.html',
  styleUrl: './projplansform.component.scss'
})
export class ProjplansformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;  
  ProjectPlansForm: FormGroup;
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
  planCashTypesList: any[] = [];
  plansTargetNationalitiesList: any[] = [];
  planDonationTypesList: any[] = [];
  projectsList: any;
  distPlanTypesList: any;
  distSiteDirectionList: any;
  governorateList: any;
  districtList: any;
  employeeList: any;
  downloadSiteList: any;
  transportationList: any;
  donateToList: any;
  cashDonateTypeList: any;
  programTypesList: any;
  donationTypeList: any;
  countriesList: any;
  householdTypeList: any;
  medicalNeedsList: any;
  dollarRate : number = 0;
  isDonorExist: number = 0;
  isDonorNotExist: number = 0;
  isSample: number = 0;
  isOtherMaterials: number = 0;
  isSustDevelop: number = 0;
  isCash: number = 0;
  materialAmtDollar:any;
  CashDinarTotal:any;
  CashDollarTotal: any;
  exchangePlaceList:any;
  nationalitiesList:any;
  filteredGovernorate: Array<any> = [];
  filteredCashDonateTypes: Array<any> = [];
  filtereddonationTypeList: Array<any> = [];
  beneficiariesNamesList: any[] = [];
  filtereddonationIdList: Array<any> = [];
  helpTypeList:any;
  OfficerName:string;
  ShowOfficer:boolean;
   GenderList: { id: number; text: string }[] = [
    { id: 0, text: this.jwtAuth.getLang() === 'ar' ? 'اختر' : 'Choose' },
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'انثى' : 'Female' },
    { id: 2, text: this.jwtAuth.getLang() === 'ar' ? ' ذكر' : 'Male' },
  ];

  headers = [
    { field: 'Name', label: this.translateService.instant('Name') },
    { field: 'NationalORDocNumber', label: this.translateService.instant('NationalORDocNumber') },
    { field: 'Nationality', label: this.translateService.instant('Nationality') },
    { field: 'PhoneNumber', label: this.translateService.instant('PhoneNumber') },
    { field: 'Gender', label: this.translateService.instant('Gender') },
    { field: 'Quantity', label: this.translateService.instant('Quantity') },
    { field: 'ExitVoucherNo', label: this.translateService.instant('ExitVoucherNo') },        
  ];

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
      private Service: ProjectPlansService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    
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
      this.router.navigate(['ProjectsPlans/ProjectPlansList']);
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
      this.TitlePage = this.translateService.instant('ProjectPlansForm');
      this.title.setTitle(this.TitlePage);
  }

  InitiailProjectPlansForm() {
    this.ProjectPlansForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      planNo:[0,[Validators.required, Validators.min(1)]],
      projectId :[0,[Validators.required, Validators.min(1)]],
      planDesc:[""],
      distPlanTypeIds :["",[Validators.required, Validators.min(1)]],
      distAuthoritiesIds:[0,[Validators.required, Validators.min(1)]],
      governorateId:[0],
      districtId:[0],
      address:[0],
      distDate:["",[Validators.required]],
      distTime:[""],
      representativeId:[0,[Validators.required, Validators.min(1)]],
      ispresent:[false, [Validators.required]],
      receiveLocationIds:["", [Validators.required, Validators.min(1)]],
      transportation:[""],
      isSample:[false],
      isCash:[false],
      isOtherMaterials:[false],
      isEmpSust:[false],
      materialType:[""],
      materialQty:[0],
      materialUnit:[""],
      materialValue:[0],
      needMedia:[false],
      needCar:[false],
      mainAddress:[""],
      projectPlansCashTypesModels:[null],
      plansTargetNationalitiesModels:[null],
      planDonationTypesModels:[null],
      generalAttachModelList: [null],
      projectPlanBenModels:[null]
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
        this.router.navigate(['ProjectsPlans/ProjectPlansList']);
        return;
      }
      
      result.distDate = formatDate(result.distDate, "yyyy-MM-dd", "en-US");     
      result.distTime = formatDate(result.distTime, 'yyyy-MM-dd HH:mm:ss', 'en-US');    
      this.projectsList = result.projectsList;
      this.distPlanTypesList = result.distPlanTypesList;
      this.distSiteDirectionList = result.distSiteDirectionList;  
      
      this.governorateList = result.governorateList.filter(r => r.data1 == "67");
      this.districtList = result.distrectList;
      this.employeeList = result.employeeList;
      this.downloadSiteList = result.downloadSiteList;
      this.transportationList = result.transportationList;
      this.donateToList = result.donateToList;
      this.cashDonateTypeList = result.cashDonateTypeList;
      this.programTypesList = result.programTypesList;
      this.donationTypeList = result.donationTypeList;
      this.countriesList = result.countriesList;
      this.householdTypeList = result.householdTypeList;
      this.medicalNeedsList = result.medicalNeedsList;
      this.dollarRate = result.dollarRate;
      this.decimalPlaces = result.decimalPlaces;
      this.exchangePlaceList = result.exchangePlaceList;
      this.planCashTypesList = result.projectPlansCashTypesModels;
      this.nationalitiesList = result.nationalitiesList;
      this.helpTypeList = result.helpTypeList;
      if(result.generalAttachModelList != null && result.generalAttachModelList != undefined)
        {
          if(result.generalAttachModelList.length > 0)
            {              
              this.childAttachment.data = result.generalAttachModelList;
              this.childAttachment.ngOnInit();
              this.ProjectPlansForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
            }
        }
      if(this.planCashTypesList != null && this.planCashTypesList != undefined)
        {
          if(this.planCashTypesList.length > 0)
            {
               let index = 0;
                this.planCashTypesList.forEach(element => {
                this.cashDonateTypeList.forEach(item => {
                  
                  if (item.id === element.cashShapeId) {
                    this.filteredCashDonateTypes[index] = this.cashDonateTypeList.filter(c => c.data1 == element.cashTypeId.toString());
                    index++;
                  }
                });
              })
              this.ProjectPlansForm.get("projectPlansCashTypesModels").setValue(this.planCashTypesList);
            }
        }
      this.plansTargetNationalitiesList = result.plansTargetNationalitiesModels;
      if(this.plansTargetNationalitiesList != null && this.plansTargetNationalitiesList != undefined)
        {
          if(this.plansTargetNationalitiesList.length > 0)
            {
              this.ProjectPlansForm.get("plansTargetNationalitiesModels").setValue(this.plansTargetNationalitiesList);
            }
        }
      this.planDonationTypesList = result.planDonationTypesModels;
      if(this.planDonationTypesList != null && this.planDonationTypesList != undefined)
        {
          if(this.planDonationTypesList.length > 0)
            {
                let index = 0;
                this.planDonationTypesList.forEach(element => {
                this.donationTypeList.forEach(item => {
                  
                  if (item.id === element.donationId) {
                    this.filtereddonationTypeList[index] = this.donationTypeList.filter(c => c.data1 == element.programTypeId.toString());
                    index++;
                  }
                });
              })
              
              this.planDonationTypesList.forEach(element => {
                 element.couponLoc = Number(element.couponLoc);
              });


              let index1 = 0;
              this.planDonationTypesList.forEach(element => {
                this.helpTypeList.forEach(item => {
                  
                  if (item.id === element.donationId2) {
                    this.filtereddonationIdList[index1] = this.helpTypeList.filter(c => c.data1 == element.donationId.toString());
                    index1++;
                  }
                });
              })

              this.ProjectPlansForm.get("planDonationTypesModels").setValue(this.planDonationTypesList);
            }
        }
        debugger
      if(result.projectPlanBenModels.length > 0 && result.projectPlanBenModels != null)
        {
          this.beneficiariesNamesList = result.projectPlanBenModels;
        }
      this.ProjectPlansForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.ProjectPlansForm.get("planNo").setValue(result.planNo);
          this.ProjectPlansForm.get("projectId").setValue(result.projectId);
          this.ProjectPlansForm.get("distPlanTypeIds").setValue(result.distPlanTypeIds);
          this.ProjectPlansForm.get("distAuthoritiesIds").setValue(Number(result.distAuthoritiesIds));
          this.ProjectPlansForm.get("governorateId").setValue(result.governorateId);
          this.ProjectPlansForm.get("districtId").setValue(result.districtId);
          this.ProjectPlansForm.get("address").setValue(result.address);
          this.ProjectPlansForm.get("distDate").setValue(result.distDate);
          this.ProjectPlansForm.get("distTime").setValue(result.distTime);
          this.ProjectPlansForm.get("representativeId").setValue(result.representativeId);
          this.ProjectPlansForm.get("ispresent").setValue(result.ispresent);
          this.ProjectPlansForm.get("receiveLocationIds").setValue(result.receiveLocationIds);
          this.ProjectPlansForm.get("transportation").setValue(result.transportation);
          this.ProjectPlansForm.get("isSample").setValue(result.isSample);
          this.ProjectPlansForm.get("isCash").setValue(result.isCash);
          this.ProjectPlansForm.get("isOtherMaterials").setValue(result.isOtherMaterials);
          this.ProjectPlansForm.get("isEmpSust").setValue(result.isEmpSust); 
          this.ProjectPlansForm.get("mainAddress").setValue(result.mainAddress);
          this.ProjectPlansForm.get("projectPlanBenModels").setValue(result.projectPlanBenModels);
          
            this.HandelCheckBoxes(result);
            for(let i = 0; i < this.planCashTypesList.length; i++) 
              {
                const element = this.planCashTypesList[i];
                this.CalcCashTypesTotal(element);
              }

              for(let i = 0; i < this.planDonationTypesList.length; i++)
                {
                  const element = this.planDonationTypesList[i];
                  this.CalcTotal(element);
                }
              this.MaterialAmountDollar(result.materialValue);
              if ( this.ProjectPlansForm.get("governorateId").value > 0) {
                  this.filteredGovernorate = this.districtList.filter(x => x.data1 === this.ProjectPlansForm.get("governorateId").value.toString());
              } else {
                  this.filteredGovernorate = [];
              }
            this.Getoff();
        }
        else {
          this.ProjectPlansForm.get("planNo").setValue(result.planNo);
          this.ProjectPlansForm.get("projectId").setValue(0);
          this.ProjectPlansForm.get("distPlanTypeIds").setValue("");
          this.ProjectPlansForm.get("distAuthoritiesIds").setValue(0);
          this.ProjectPlansForm.get("governorateId").setValue(0);
          this.ProjectPlansForm.get("districtId").setValue(0);
          this.ProjectPlansForm.get("address").setValue("");
          this.ProjectPlansForm.get("distDate").setValue(result.distDate);
          this.ProjectPlansForm.get("distTime").setValue(result.distTime);
          this.ProjectPlansForm.get("representativeId").setValue(0);
          this.ProjectPlansForm.get("ispresent").setValue(false);
          this.ProjectPlansForm.get("receiveLocationIds").setValue("");
          this.ProjectPlansForm.get("transportation").setValue("");
          this.ProjectPlansForm.get("isSample").setValue(false);
          this.ProjectPlansForm.get("isCash").setValue(false);
          this.ProjectPlansForm.get("isOtherMaterials").setValue(false);
          this.ProjectPlansForm.get("isEmpSust").setValue(false); 
          this.ProjectPlansForm.get("mainAddress").setValue("");
          this.ProjectPlansForm.get("projectPlanBenModels").setValue([]);
        }        
        this.ConvertIdsToNumber(result); 
        this.HandelCheckBoxes(result); 
      });
    })
  }

  OnSaveForms() {
    
    let isValid = true;
    this.disableSave = true;

    this.PrepareCheckBoxesForSave();
    if (this.CheckValidationOnSave() == false) {
      return;
    }
    
    this.ProjectPlansForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ProjectPlansForm.value.userId = this.jwtAuth.getUserId();
    this.ProjectPlansForm.get("projectPlansCashTypesModels").setValue(this.planCashTypesList);
    this.ProjectPlansForm.get("plansTargetNationalitiesModels").setValue(this.plansTargetNationalitiesList);
    this.ProjectPlansForm.get("planDonationTypesModels").setValue(this.planDonationTypesList);    
    this.ProjectPlansForm.get("projectPlanBenModels").setValue(this.beneficiariesNamesList);
    this.ProjectPlansForm.get("generalAttachModelList").setValue(this.childAttachment.getVoucherAttachData());
    this.ConvertIdsToString();

     if (isValid) {
    this.Service.SaveProjectPlan(this.ProjectPlansForm.value)
      .subscribe((result) => {
        
        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          if(this.opType == 'Edit')
            {
              this.router.navigate(['ProjectsPlans/ProjectPlansList']);
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
        this.Service.DeleteProjectPlan(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ProjectsPlans/ProjectPlansList']);
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

  clearFormdata()
  {   
    this.NewDate = new Date;    
    this.ProjectPlansForm.get("id").setValue(0);
    this.ProjectPlansForm.get("planNo").setValue(0);
    this.ProjectPlansForm.get("projectId").setValue(0);
    this.ProjectPlansForm.get("distPlanTypeIds").setValue("");
    this.ProjectPlansForm.get("distAuthoritiesIds").setValue(0);
    this.ProjectPlansForm.get("governorateId").setValue(0);
    this.ProjectPlansForm.get("districtId").setValue(0);
    this.ProjectPlansForm.get("address").setValue("");
    this.ProjectPlansForm.get("distDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ProjectPlansForm.get("distTime").setValue("");
    this.ProjectPlansForm.get("representativeId").setValue(0);
    this.ProjectPlansForm.get("ispresent").setValue(false);
    this.ProjectPlansForm.get("receiveLocationIds").setValue("");
    this.ProjectPlansForm.get("transportation").setValue("");
    this.ProjectPlansForm.get("isSample").setValue(false);
    this.ProjectPlansForm.get("isCash").setValue(false);
    this.ProjectPlansForm.get("mainAddress").setValue("");
    this.ProjectPlansForm.get("isOtherMaterials").setValue(false);
    this.ProjectPlansForm.get("isEmpSust").setValue(false); 
    this.ProjectPlansForm.get("generalAttachModelList").setValue([]);     
    this.childAttachment.data =[];  
    this.CashDinarTotal = 0;
    this.CashDollarTotal = 0;
    this.isSample = 0;
    this.isOtherMaterials = 0;
    this.isSustDevelop = 0;
    this.materialAmtDollar = 0;
    this.isCash = 0;
    this.voucherId = 0;
    this.opType = 'Add';
    this.GetInitailProjectPlans();      
  }

  onisDonorExistChange(event: any) 
  {
    
    let value = event.currentTarget.checked;
    if(value == true) {
      this.isDonorExist = 1;
      this.isDonorNotExist = 0;
      this.ProjectPlansForm.get("ispresent").setValue(true);
    }
  }

  onisDonorNotExistChange(event: any)
  {
    let value = event.currentTarget.checked;
    if(value == true) {
      this.isDonorNotExist = 1;
      this.isDonorExist = 0;
      this.ProjectPlansForm.get("ispresent").setValue(false);
    }
  }

  onOtherMaterialsChange(): void {
      this.isOtherMaterials = this.isOtherMaterials === 0 ? 1 : 0;
      this.ProjectPlansForm.get("materialType").setValue("");
      this.ProjectPlansForm.get("materialQty").setValue(0);
      this.ProjectPlansForm.get("materialUnit").setValue("");
      this.ProjectPlansForm.get("materialValue").setValue(0);
  }

  onisSampleChange(): void {
  
  this.isSample = this.isSample === 0 ? 1 : 0;
   if(this.isSample == 1)
    {
      this.isOtherMaterials =1; 
    }
    if(this.isSample ==  0 && this.planDonationTypesList.length > 0)
      {
        Swal.fire({
        title: this.translateService.instant('AreYouSure?'),
        text: this.translateService.instant('IfYouUnSelectIsSampleOPtionWeWillClearDataTableWantToContinue?'),
        icon: 'warning',
        confirmButtonColor: '#dc3741',
        showCancelButton: true,
        confirmButtonText: this.translateService.instant('Yes,deleteit!'),
        cancelButtonText: this.translateService.instant('Close'),
      }).then((result) => {
        if (result.value) {
          if(this.isSample == 0) 
          {
            this.ProjectPlansForm.get("planDonationTypesModels").setValue([]);
            this.planDonationTypesList = [];
            this.ProjectPlansForm.get("materialType").setValue("");
            this.ProjectPlansForm.get("materialQty").setValue(0);
            this.ProjectPlansForm.get("materialUnit").setValue("");
            this.ProjectPlansForm.get("materialValue").setValue(0);
            this.materialAmtDollar = 0;
            if(this.isOtherMaterials == 1 && this.isSample == 0)
              {
                this.isOtherMaterials =0;          
              }
          }                   
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          this.isSample = 1;
        }
      }) 
    }  
    else
    {
       if(this.isOtherMaterials == 1 && this.isSample == 0)
        {
          this.isOtherMaterials =0;          
        }
    }
  }

  onisCashChange(): void {
    
    this.isCash = this.isCash === 0 ? 1 : 0;
  if(this.isCash == 0 && this.planCashTypesList.length > 0) 
    {
        Swal.fire({
        title: this.translateService.instant('AreYouSure?'),
        text: this.translateService.instant('IfYouUnSelectIsCashOPtionWeWillClearDataTableWantToContinue?'),
        icon: 'warning',
        confirmButtonColor: '#dc3741',
        showCancelButton: true,
        confirmButtonText: this.translateService.instant('Yes,deleteit!'),
        cancelButtonText: this.translateService.instant('Close'),
      }).then((result) => {
        
        if (result.value) {
          if(this.isCash == 0) {
          this.ProjectPlansForm.get("projectPlansCashTypesModels").setValue([]);
          this.planCashTypesList = [];
          this.CashDinarTotal = 0;
          this.CashDollarTotal = 0;
        }
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          this.isCash = 1;
        }
      }) 
    }               
  }

  AddNewLineNationality() {
    
    if (this.disableAll == true) {
      return;
    }

    this.plansTargetNationalitiesList ??= [];
    this.plansTargetNationalitiesList.push(
      {
        id: 0,
        projectId: 0,
        nationalityId: 0,
        familyNo: 0,
        personNo: 0,
        personTypeId: 0,
        beneficiaryPercent: 0,
        houseRolerId: 0,
        healthConditionsId: 0,
        index: ""
      });
    this.ProjectPlansForm.get("plansTargetNationalitiesModels").setValue(this.plansTargetNationalitiesList);
  }

  deleteRowNationality(rowIndex: number) {
    this.plansTargetNationalitiesList.splice(rowIndex, 1);
    this.ProjectPlansForm.get("plansTargetNationalitiesModels").setValue(this.plansTargetNationalitiesList);
  }

  AddNewLineBeneficiariesNames() {
    
    if (this.disableAll == true) {
      return;
    }

    this.beneficiariesNamesList ??= [];
    this.beneficiariesNamesList.push(
      {
        id: 0,
        benName: '',
        documentNo: '',
        nationalityId: 0,
        phoneNo1: ''
      });
    this.ProjectPlansForm.get("beneficiariesNamesList").setValue(this.beneficiariesNamesList);
  }

  deleteRowBeneficiariesNames(rowIndex: number) {
    this.beneficiariesNamesList.splice(rowIndex, 1);
    this.ProjectPlansForm.get("beneficiariesNamesList").setValue(this.beneficiariesNamesList);
  }

  onFamilyChange(value,row,index)
  {
    
     row.personNo = (value * 5.2).toFixed(this.decimalPlaces)
    this.CalcPercentage(value,row,index);   
  }

  onPersonChange(value,row,index)
  {
    
    row.familyNo = (value / 5.2).toFixed(this.decimalPlaces)
    this.CalcPercentage(value, row, index);
  }

  CalcPercentage(Value,Row,index)
  {
    let tot = 0;
     for (let i = 0; i < this.plansTargetNationalitiesList.length; i++) {
      const element = this.plansTargetNationalitiesList[i];
      tot += Number(element.familyNo) + Number(element.personNo);
    }
    for (let i = 0; i < this.plansTargetNationalitiesList.length; i++) {
      const element = this.plansTargetNationalitiesList[i];
      let no = Number(element.familyNo) + Number(element.personNo)
      this.plansTargetNationalitiesList[i].beneficiaryPercent = ((no/tot) * 100).toFixed(0);
    }    
  }

  AddNewLineCashTypes() {
    
    if (this.disableAll == true) {
      return;
    }

    this.planCashTypesList ??= [];
    this.planCashTypesList.push(
      {
        id: 0,
        projectId: 0,
        cashTypeId: 0,
        cashShapeId:0,
        amount: 0,
        dollarAmount: 0,    
        index: ""
      });
    this.ProjectPlansForm.get("projectPlansCashTypesModels").setValue(this.planCashTypesList);
  }

  deleteRowCashTypes(row:any,rowIndex: number) {
    this.planCashTypesList.splice(rowIndex, 1);
    this.ProjectPlansForm.get("projectPlansCashTypesModels").setValue(this.planCashTypesList);
    this.CalcCashTypesTotal(row);
  }

  CalcCashTypesTotal(row) {
    
    if (this.planCashTypesList.length > 0 ) {
      this.CashDinarTotal = 0;
      this.CashDollarTotal = 0;
        const element = row;
        element.dollarAmount = (element.amount / this.dollarRate).toFixed(this.decimalPlaces);        
      for (let i = 0; i < this.planCashTypesList.length; i++) {
        let element = this.planCashTypesList[i];
        let totDinar = Number(element.amount);
        let totDollar = Number(element.dollarAmount);
        this.CashDinarTotal += totDinar;
        this.CashDollarTotal += totDollar;
      }
       this.CashDinarTotal = this.CashDinarTotal.toFixed(this.decimalPlaces);
       this.CashDollarTotal = this.CashDollarTotal.toFixed(this.decimalPlaces);
    }
    else
    {
        row.total =0;
        row.dollarTotal = 0;
        this.CashDinarTotal = 0;
        this.CashDollarTotal = 0;
    } 
  }

  AddNewLineDonation() {
    
    if (this.disableAll) {
      return;
    }

    this.planDonationTypesList ??= [];
    this.planDonationTypesList.push(
      {
        id: 0,
        projectId: 0,
        programTypeId: 0,
        donationId: 0,
        couponsNo: 0,
        couponsAmount: 0,
        total: 0,
        dollarTotal: 0,
        couponLoc: 0,
        index: ""
      });
    this.ProjectPlansForm.get("planDonationTypesModels").setValue(this.planDonationTypesList);
  }

  deleteRowDonation(rowIndex: number) {
    this.planDonationTypesList.splice(rowIndex, 1);
    this.ProjectPlansForm.get("planDonationTypesModels").setValue(this.planDonationTypesList);    
  }

  calculateSum() {
    return this.formatCurrency(
      this.planDonationTypesList.reduce((sum, item) => {
        // const qty = parseFloat(item.couponsNo);
        const price = parseFloat(item.couponsAmount);

        // Check for invalid qty or price and treat them as 0 if invalid
        // const validQty = isNaN(qty) ? 0 : qty;
        const validPrice = isNaN(price) ? 0 : price;

        return sum + (validPrice);
      }, 0)
    );
  }

  calculateSumDollar() {
    return this.formatCurrency(
      this.planDonationTypesList.reduce((sum, item) => {
        // const qty = parseFloat(item.couponsNo);
        const price = parseFloat(item.couponsAmount);

        // Check for invalid qty or price and treat them as 0 if invalid
        // const validQty = isNaN(qty) ? 0 : qty;
        const validPrice = isNaN(price) ? 0 : price;

        return sum + (validPrice / this.dollarRate) ;
      }, 0)
    );
  }

  CalcTotal(row) {
    
    if (row.couponsAmount > 0) {
      row.total = (row.couponsAmount).toFixed(this.decimalPlaces);
      row.dollarTotal = (row.total / this.dollarRate).toFixed(this.decimalPlaces);
    }
    else
    {
        row.total =0;
        row.dollarTotal = 0;
    }
  }

  MaterialAmountDollar(amount)
  {
    
    this.materialAmtDollar = (amount / this.dollarRate).toFixed(this.decimalPlaces);
  }

  GetProjectData(event: any) {
    const ProjectId = event.value;
    
    if(ProjectId > 0)
      {
        this.Service.GetProjectData(ProjectId).subscribe(result => {
        if(result != null && result != undefined)
          {
            
            this.ProjectPlansForm.get("distAuthoritiesIds").setValue(Number(result.distAuthoritiesIds));
            this.planCashTypesList = result.projectPlansCashTypesModels;
            if(this.planCashTypesList != null && this.planCashTypesList != undefined)
              {
                if(this.planCashTypesList.length > 0)
                  {
                    let index = 0;
                      this.planCashTypesList.forEach(element => {
                      this.cashDonateTypeList.forEach(item => {
                        
                        if (item.id === element.cashShapeId) {
                          this.filteredCashDonateTypes[index] = this.cashDonateTypeList.filter(c => c.data1 == element.cashTypeId.toString());
                          index++;
                        }
                      });
                    })
                    this.ProjectPlansForm.get("projectPlansCashTypesModels").setValue(this.planCashTypesList);
                  }
              }
              this.plansTargetNationalitiesList = result.plansTargetNationalitiesModels;
              if(this.plansTargetNationalitiesList != null && this.plansTargetNationalitiesList != undefined)
                {
                  if(this.plansTargetNationalitiesList.length > 0)
                    {
                      this.ProjectPlansForm.get("plansTargetNationalitiesModels").setValue(this.plansTargetNationalitiesList);
                    }
                }
              this.planDonationTypesList = result.planDonationTypesModels;
              if(this.planDonationTypesList != null && this.planDonationTypesList != undefined)
                {
                  if(this.planDonationTypesList.length > 0)
                    {
                       let index = 0;
                        this.planDonationTypesList.forEach(element => {
                        this.donationTypeList.forEach(item => {
                          
                          if (item.id === element.donationId) {
                            this.filtereddonationTypeList[index] = this.donationTypeList.filter(c => c.data1 == element.programTypeId.toString());
                            this.filtereddonationIdList[index] = this.helpTypeList.filter(x => x.id == 0 || x.data1 === element.donationId.toString());
                            index++;
                          }
                        });
                      })
                      this.ProjectPlansForm.get("planDonationTypesModels").setValue(this.planDonationTypesList);
                    }
                }
            this.HandelCheckBoxes(result);
            for(let i = 0; i < this.planCashTypesList.length; i++) 
              {
                const element = this.planCashTypesList[i];
                this.CalcCashTypesTotal(element);
              }

              for(let i = 0; i < this.planDonationTypesList.length; i++)
                {
                  const element = this.planDonationTypesList[i];
                  this.CalcTotal(element);
                  this.CalcDollar(element,element.couponsAmount,i)
                }
                this.ProjectPlansForm.get("materialType").setValue(result.materialType);
                this.ProjectPlansForm.get("materialQty").setValue(result.materialQty);
                this.ProjectPlansForm.get("materialUnit").setValue(result.materialUnit);
                this.ProjectPlansForm.get("materialValue").setValue(result.materialValue);
                this.ProjectPlansForm.get("address").setValue(result.address);
                
                this.MaterialAmountDollar(result.materialValue);                
          }
        })
      }
    

  }

  HandelCheckBoxes(data)
  {
    if(data.isCash == true)
      {
        this.isCash = 1;
        this.ProjectPlansForm.get("isCash").setValue(data.isCash);
      }


    if(data.isSample == true)
      {
        this.isSample = 1;
        this.ProjectPlansForm.get("isSample").setValue(data.isSample);
      }

    if(data.isOtherMaterials == true)
      {
        this.isOtherMaterials = 1;
        this.ProjectPlansForm.get("isOtherMaterials").setValue(data.isOtherMaterials);
      }

    if(data.isEmpSust == true)
      {
        this.isSustDevelop = 1;
        this.ProjectPlansForm.get("isEmpSust").setValue(data.isEmpSust);
      }
      if(data.ispresent == true)
      {
        this.isDonorExist = 1;
        this.isDonorNotExist = 0;
        this.ProjectPlansForm.get("ispresent").setValue(data.ispresent);
      }
      else
      {
        this.isDonorNotExist = 1;
        this.isDonorExist = 0;
        this.ProjectPlansForm.get("ispresent").setValue(data.ispresent);
      }
  }

  CheckValidationOnSave() 
  {
    if(this.isDonorExist == 0 && this.isDonorNotExist == 0)
      {
        this.alert.ShowAlert("msgSelectDonorPresence", 'error');
        return false;
      }
    if(this.isCash ==1 )
      {
        if(this.planCashTypesList.length == 0)
          {
            this.alert.ShowAlert("msgSelectCashTypes", 'error');
            return false;
          }
          for (let i = 0; i < this.planCashTypesList.length; i++) {
            const element = this.planCashTypesList[i];
            if(element.cashTypeId == 0 || element.cashShapeId == 0 || element.amount == 0)
              {
                this.alert.ShowAlert("PleaseInsertRequiredDataForProjectCashTypesTable", 'error');
                return false;
              }
          }
      }
    if(this.isSample == 1)
      {
        if(this.planDonationTypesList.length == 0)
          {
            this.alert.ShowAlert("msgSelectSampleTypes", 'error');
            return false;
          }
          for (let i = 0; i < this.planDonationTypesList.length; i++) {
            const element = this.planDonationTypesList[i];
            element.couponsNo = Number(element.couponsNo);
            if(element.programTypeId == 0 || element.donationId == 0  || element.couponsAmount == 0)
              {
                this.alert.ShowAlert("PleaseInsertRequiredDataForSampleTable", 'error');
                return false;
              }
          }
      }

    if(this.plansTargetNationalitiesList.length > 0)
      {
        for (let i = 0; i < this.plansTargetNationalitiesList.length; i++) {
          const element = this.plansTargetNationalitiesList[i];
          if(element.nationalityId == 0)
            {
              this.alert.ShowAlert("PleaseInsertRequiredDataForTargetedNationalitiesTable", 'error');
              return false;
            }
        }
      }
    // if(this.ProjectPlansForm.value.planDesc == "" || this.ProjectPlansForm.value.planDesc == undefined || this.ProjectPlansForm.value.planDesc == null )
    //   {
    //     this.alert.ShowAlert("PleaseInsertPlanDescreption","error");
    //     return false;
    //   }
  }

  PrepareCheckBoxesForSave()
  {
    if(this.isDonorExist == 1)
    {
      this.ProjectPlansForm.get("ispresent").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("ispresent").setValue(false);
    }
    if(this.isSample == 1)
    {
      this.ProjectPlansForm.get("isSample").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("isSample").setValue(false);
    }
    if(this.isCash == 1)
    {
      this.ProjectPlansForm.get("isCash").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("isCash").setValue(false);
    }
    if(this.isOtherMaterials == 1)
    {
      this.ProjectPlansForm.get("isOtherMaterials").setValue(true);
    }
    else
    {
      this.ProjectPlansForm.get("isOtherMaterials").setValue(false);
    }
    if(this.isSustDevelop == 1)
      {
        this.ProjectPlansForm.get("isEmpSust").setValue(true);
      }
    else
    {
      this.ProjectPlansForm.get("isEmpSust").setValue(false);
    }
  }

  ConvertIdsToString()
  {
    
    let C1 = this.ProjectPlansForm.value.distPlanTypeIds;
    if (Array.isArray(C1)) {
      let validC1 = C1
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C1String = validC1.join(',');
      this.ProjectPlansForm.get("distPlanTypeIds").setValue(C1String);
      console.log('Filtered paymentMethod:', C1String);
    } else {
      console.error('distPlanTypeIds is not an array');
    }

    // let C2 = this.ProjectPlansForm.value.distAuthoritiesIds;
    // if (Array.isArray(C2)) {
    //   let validC2 = C2
    //     .filter((method: any) => method !== null && method !== undefined)
    //     .map((method: any) => method.toString().trim());
    //   let C2String = validC2.join(',');
    //   this.ProjectPlansForm.get("distAuthoritiesIds").setValue(C2String);
    //   console.log('Filtered paymentMethod:', C2String);
    // } else {
    //   console.error('distAuthoritiesIds is not an array');
    // }

    let C3 = this.ProjectPlansForm.value.receiveLocationIds;
    if (Array.isArray(C3)) {
      let validC3 = C3
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C3String = validC3.join(',');
      this.ProjectPlansForm.get("receiveLocationIds").setValue(C3String);
      console.log('Filtered paymentMethod:', C3String);
    } else {
      console.error('receiveLocationIds is not an array');
    }
 
    let C4 = this.ProjectPlansForm.value.transportation;
    if (Array.isArray(C4)) {
      let validC4 = C4
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C4String = validC4.join(',');
      this.ProjectPlansForm.get("transportation").setValue(C4String);
      console.log('Filtered paymentMethod:', C4String);
    } else {
      console.error('transportation is not an array');
    }

  }

  ConvertIdsToNumber(data)
  {
    
    if(data.distPlanTypeIds != null && data.distPlanTypeIds != undefined && data.distPlanTypeIds != "" && data.distPlanTypeIds != "0")
      {
        let A1 = data.distPlanTypeIds.split(',').map(Number)
        this.ProjectPlansForm.get("distPlanTypeIds").setValue(A1);
      }
      else
      {
        this.ProjectPlansForm.get("distPlanTypeIds").setValue("");
      }
    // if(data.distAuthoritiesIds != null && data.distAuthoritiesIds != undefined && data.distAuthoritiesIds != "" && data.distAuthoritiesIds != "0")
    //   {
    //     let A2 = data.distAuthoritiesIds.split(',').map(Number)
    //     this.ProjectPlansForm.get("distAuthoritiesIds").setValue(A2);
    //   }
    //   else
    //   {
    //     this.ProjectPlansForm.get("distAuthoritiesIds").setValue("");
    //   }
    if(data.receiveLocationIds != null && data.receiveLocationIds != undefined && data.receiveLocationIds != "" && data.receiveLocationIds != "0")
      {
        let A3 = data.receiveLocationIds.split(',').map(Number)
        this.ProjectPlansForm.get("receiveLocationIds").setValue(A3);
      }
      else
      {
        this.ProjectPlansForm.get("receiveLocationIds").setValue("");
      }
      if(data.transportation != null && data.transportation != undefined && data.transportation != "" && data.transportation != "0")
      {
        let A4 = data.transportation.split(',').map(Number)
        this.ProjectPlansForm.get("transportation").setValue(A4);
      }
      else
      {
        this.ProjectPlansForm.get("transportation").setValue("");
      }

  }

  loadLazyOptions(event: any) {
      const { first, last } = event;

      // Don't replace the full list; copy and fill only the needed range
      this.distSiteDirectionList ??= [];

      // Make sure the array is large enough
      while (this.distSiteDirectionList.length < last) {
          this.distSiteDirectionList.push(null);
      }

      for (let i = first; i < last; i++) {
          this.distSiteDirectionList[i] = this.distSiteDirectionList[i];
      }

      this.loading = false;
  }

  projectloadLazyOptions(event: any) {
      const { first, last } = event;

      // Don't replace the full list; copy and fill only the needed range
      this.projectsList ??= [];

      // Make sure the array is large enough
      while (this.projectsList.length < last) {
          this.projectsList.push(null);
      }

      for (let i = first; i < last; i++) {
          this.projectsList[i] = this.projectsList[i];
      }

      this.loading = false;
  }

  FilterBrigadierGeneral(governorateId: number) {
    
    if (governorateId > 0) {
      this.filteredGovernorate = this.districtList.filter(x => x.data1 === governorateId.toString());
    } else {
      this.filteredGovernorate = [];
    }
  }

  FilterCashDonateType(cashTypeId: number,index: number) {
    
    if (cashTypeId > 0) {
      this.filteredCashDonateTypes[index] = this.cashDonateTypeList.filter(x => x.data1 === cashTypeId.toString());
    } else {
      this.filteredCashDonateTypes[index] = [];
    }
  }

  FilterDonationtypes(programTypeId: number,index: number) {
    
    if (programTypeId > 0) {
      this.filtereddonationTypeList[index] = this.donationTypeList.filter(x => x.data1 === programTypeId.toString());
    } else {
      this.filtereddonationTypeList[index] = [];
    }
  }

  SelectAlldistPlan(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.distPlanTypesList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectPlansForm.get("distPlanTypeIds")?.setValue(allIds);
      } else {
        this.ProjectPlansForm.get("distPlanTypeIds")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectPlansForm.get("distPlanTypeIds")?.setValue(cleaned);
    }
  }

  // SelectAlldistAuthorities(event: any) {
  //   let selectedValues = event.value || [];
  //   const hasSelectAll = selectedValues.includes(0);

  //   if (hasSelectAll) {
  //     const allIds = this.distSiteDirectionList
  //       .filter(el => el.id !== 0)
  //       .map(el => el.id);

  //     if (selectedValues.length - 1 !== allIds.length) {
  //       this.ProjectPlansForm.get("distAuthoritiesIds")?.setValue(allIds);
  //     } else {
  //       this.ProjectPlansForm.get("distAuthoritiesIds")?.setValue([]);
  //     }
  //   } else {
  //     const cleaned = selectedValues.filter(id => id !== 0);
  //     this.ProjectPlansForm.get("distAuthoritiesIds")?.setValue(cleaned);
  //   }
  // }

  SelectAllreceiveLocation(event: any) {
    ;
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.downloadSiteList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectPlansForm.get("receiveLocationIds")?.setValue(allIds);
      } else {
        this.ProjectPlansForm.get("receiveLocationIds")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectPlansForm.get("receiveLocationIds")?.setValue(cleaned);
    }
    const selectedIds: number[] = this.ProjectPlansForm.get('receiveLocationIds')?.value ?? [];
    const hasSite166 = selectedIds.includes(166);
    if (hasSite166) 
    {
      const ProjectId = this.ProjectPlansForm.value.projectId;
      const OffName = this.projectsList.find(r => r.id === ProjectId)?.data3 ?? "";
      if (OffName) {
        this.OfficerName = OffName;
        this.ShowOfficer = true;
      }
    } 
    else
    {
      this.OfficerName = "";
      this.ShowOfficer = false;
    }    
  }

  SelectAlltransportation(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.transportationList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectPlansForm.get("transportation")?.setValue(allIds);
      } else {
        this.ProjectPlansForm.get("transportation")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectPlansForm.get("transportation")?.setValue(cleaned);
    }
  }

  ImportFromExcel(event: any): void {
    
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

    const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
    
      this.Service.ImportFromExcel(excelData).subscribe(
        (response) => {
          
          if (response.length > 0) {
            this.beneficiariesNamesList = response;

  /*             this.vehiclesFuelList.forEach(element => {
              element.vehicleId = element.vehicleId;
              const vehicle = this.vehiclesList.find(x => x.id == element.vehicleId);
              if (vehicle) {
                element.plateNo = vehicle.plateNo;
                element.fuelTypeId = vehicle.fuelTypeId;
              }
            }); */

            this.ProjectPlansForm.get("beneficiariesNamesList").setValue(this.beneficiariesNamesList);
          }
          else {
            this.alert.ShowAlert('Import failed', 'error')
            fileInput.value = "";
          }

        },
        (error) => { this.alert.ShowAlert('Import failed', 'error'); fileInput.value = ""; }
      );
    };

    reader.readAsBinaryString(file);
  }

  onImportClick(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  exportHeadersToExcel() {
      const headerNames = this.headers.map(h => h.label);
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headerNames]);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Headers');
      XLSX.writeFile(wb, 'ProjectsPlanExcel.xlsx');
    }

  CalcDollar(Row:any,amount:number,index:number)
  {
    
    if(amount > 0)
      {
        Row.dollarTotal = (Number(amount) / this.dollarRate).toFixed(this.decimalPlaces);
      }
    else
      {
        Row.dollarTotal = 0;
      }
  }

  CalcDinar(Row:any,amount:number,index:number)
  {
    
    if(amount > 0)
      {
        Row.couponsAmount = (Number(amount) * this.dollarRate).toFixed(this.decimalPlaces);
      }
    else
      {
        Row.couponsAmount = 0;
      }
  }

  FilterDonationId(donationId: number,index: number) {
    
    if (donationId > 0) {
      this.filtereddonationIdList[index] = this.helpTypeList.filter(x => x.id == 0 || x.data1 === donationId.toString());
    } else {
      this.filtereddonationIdList[index] = [];
    }
  }

  Getoff()
  {
    const selectedIds: number[] = this.ProjectPlansForm.get('receiveLocationIds')?.value ?? [];
    const hasSite166 = selectedIds.includes(166);
    if (hasSite166) 
    {
      const ProjectId = this.ProjectPlansForm.value.projectId;
      const OffName = this.projectsList.find(r => r.id === ProjectId)?.data3 ?? "";
      if (OffName) {
        this.OfficerName = OffName;
        this.ShowOfficer = true;
      }
    } 
    else
    {
      this.OfficerName = "";
      this.ShowOfficer = false;
    }

  }


  ClearDataTable()
  {
    this.beneficiariesNamesList = []
  }

}
