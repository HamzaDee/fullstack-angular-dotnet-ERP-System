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
import { VolunteerService } from '../volunteers.service'; 
import Swal from 'sweetalert2';
import { tr } from 'date-fns/locale';

@Component({
  selector: 'app-volnteerform',
  templateUrl: './volnteerform.component.html',
  styleUrl: './volnteerform.component.scss'
})
export class VolnteerformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  VolunteersAddForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  showsave: boolean;
  volunteerSideList:any;
  nationalityList:[];
  governorateList:[];
  districtList: Array<{ data1: string, [key: string]: any }> = [];
  availableDaysList:[];
  identityProofList:[];
  validDate = true;
  showLoader = false;  
  isdisabled: boolean = false;
  decimalPlaces: number;
  disableAll:boolean;   
  disableSave:boolean;
  lang:string ;
  Id:any;
  disableName: boolean = true;
  avaDays: any;
  filteredDistrectList: Array<{ data1: string, [key: string]: any }> = [];
  nationalitiesList:any;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private service: VolunteerService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
      debugger
      this.disableSave = false;
  
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.Id = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
      }
      else {
        this.Id = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
      }   
      if (this.route.snapshot.queryParamMap.has('opType')) {
        this.opType = this.route.snapshot.queryParamMap.get('opType');
        this.Id = 0;
      }
      this.SetTitlePage();
      if (this.Id == null || this.Id == undefined || this.Id === "") {
        this.router.navigate(['Volunteers/Volnteerlist']);
      }
      this.GetInitailVolunteer();
      this.VolunteerAddForm();
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
      this.TitlePage = this.translateService.instant('Volnteerform');
      this.title.setTitle(this.TitlePage);
    }

    VolunteerAddForm() {
      this.VolunteersAddForm = this.formbulider.group({
        id: [0],
        companyId: [0],
        volunteerName:["",[Validators.required]],
        volunteerSide:[0,[Validators.required, Validators.min(1)]],
        firstName:["",[Validators.required]],
        secondName:["",[Validators.required]],
        thirdName:["",[Validators.required]],
        lastName:["",[Validators.required]],
        mobileNo:["",[Validators.required]],
        emergencyNo:["",[Validators.required]],
        nationalityId:[0,[Validators.required, Validators.min(1)]],
        workplace:[""],
        experienceYears:[0,[Validators.required]],
        totalVolunteerHours:[0],
        governorateId:[0,[Validators.required, Validators.min(1)]],
        districtId:[0],
        residentialAddress:[""],
        email:[""],
        nationalID:['',[Validators.required]],
        iDNumber:[""],
        birthPlace:[""],
        birthDate:[""],
        educationalQualification:[""],
        skills:[""],
        availableDays:[""],
        identityProofId:[0,[Validators.required, Validators.min(1)]],
        generalAttachModelList: [null]
      });
    }

    GetInitailVolunteer() {
      this.lang = this.jwtAuth.getLang();
      this.service.GetVolunteerForm(this.Id, this.opType).subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['Volunteers/Volnteerlist']);
          return;
        }
        debugger
        result.birthDate = formatDate(result.birthDate, "yyyy-MM-dd", "en-US")
        this.volunteerSideList = result.volunteerSideList;        
        this.nationalityList = result.nationalityList;
        this.governorateList = result.governorateList;
        this.districtList = result.districtList;
        this.identityProofList = result.identityProofList;  
        this.availableDaysList = result.availableDaysList;  
        this.nationalitiesList = result.nationalitiesList;      
        this.VolunteersAddForm.patchValue(result);
        this.disableName = true;
        if (result.generalAttachModelList !== null && result.generalAttachModelList !== 0 && result.generalAttachModelList !== undefined) {
          this.VolunteersAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
          this.childAttachment.data = result.generalAttachModelList;
          this.childAttachment.ngOnInit();
        }
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
          this.isdisabled = false;
          if (this.Id > 0) {
            debugger
            const availableDaysArray = (result.availableDays || '')
            .split(',')
            .map(x => +x.trim())
            .filter(x => !isNaN(x)); // remove any junk          
            this.VolunteersAddForm.get("availableDays").setValue(availableDaysArray);
            this.VolunteersAddForm.get("volunteerName").setValue(result.volunteerName);
            this.VolunteersAddForm.get("volunteerSide").setValue(result.volunteerSide);
            this.VolunteersAddForm.get("firstName").setValue(result.firstName);
            this.VolunteersAddForm.get("firstName").setValue(result.firstName);
            this.VolunteersAddForm.get("secondName").setValue(result.secondName);
            this.VolunteersAddForm.get("secondName").setValue(result.secondName);
            this.VolunteersAddForm.get("thirdName").setValue(result.thirdName);
            this.VolunteersAddForm.get("lastName").setValue(result.lastName);
            this.VolunteersAddForm.get("mobileNo").setValue(result.mobileNo);
            this.VolunteersAddForm.get("emergencyNo").setValue(result.emergencyNo);
            this.VolunteersAddForm.get("nationalityId").setValue(result.nationalityId);
            this.VolunteersAddForm.get("workplace").setValue(result.workplace);
            this.VolunteersAddForm.get("experienceYears").setValue(result.experienceYears);
            this.VolunteersAddForm.get("totalVolunteerHours").setValue(result.totalVolunteerHours);
            this.VolunteersAddForm.get("governorateId").setValue(result.governorateId);
            this.VolunteersAddForm.get("districtId").setValue(result.districtId);
            this.VolunteersAddForm.get("residentialAddress").setValue(result.residentialAddress);
            this.VolunteersAddForm.get("email").setValue(result.email);
            this.VolunteersAddForm.get("nationalID").setValue(result.nationalID);
            this.VolunteersAddForm.get("iDNumber").setValue(result.idNumber);
            this.VolunteersAddForm.get("birthPlace").setValue(result.birthPlace);
            this.VolunteersAddForm.get("birthDate").setValue(result.birthDate);
            this.VolunteersAddForm.get("birthDate").setValue(result.birthDate);            
            this.VolunteersAddForm.get("educationalQualification").setValue(result.educationalQualification);
            this.VolunteersAddForm.get("skills").setValue(result.skills);
            this.VolunteersAddForm.get("identityProofId").setValue(result.identityProofId);
            if(this.VolunteersAddForm.get("governorateId").value > 0)
              {
                  this.filteredDistrectList = this.districtList.filter(x => x.data1 ===  this.VolunteersAddForm.get("governorateId").value.toString());
              }
          }
          else {
            this.VolunteersAddForm.get("volunteerName").setValue('');
            this.VolunteersAddForm.get("volunteerSide").setValue(0);
            this.VolunteersAddForm.get("firstName").setValue('');
            this.VolunteersAddForm.get("secondName").setValue('');
            this.VolunteersAddForm.get("thirdName").setValue('');
            this.VolunteersAddForm.get("lastName").setValue('');
            this.VolunteersAddForm.get("mobileNo").setValue('');
            this.VolunteersAddForm.get("emergencyNo").setValue('');
            this.VolunteersAddForm.get("nationalityId").setValue(0);
            this.VolunteersAddForm.get("workplace").setValue('');
            this.VolunteersAddForm.get("experienceYears").setValue('');
            this.VolunteersAddForm.get("totalVolunteerHours").setValue('');
            this.VolunteersAddForm.get("governorateId").setValue(0);
            this.VolunteersAddForm.get("districtId").setValue(0);
            this.VolunteersAddForm.get("residentialAddress").setValue('');
            this.VolunteersAddForm.get("email").setValue('');
            this.VolunteersAddForm.get("nationalID").setValue('');
            this.VolunteersAddForm.get("iDNumber").setValue('');
            this.VolunteersAddForm.get("birthPlace").setValue('');
            this.VolunteersAddForm.get("birthDate").setValue(formatDate(new Date(), 'yyyy-MM-dd', "en-US"));
            this.VolunteersAddForm.get("educationalQualification").setValue('');
            this.VolunteersAddForm.get("skills").setValue('');
            this.VolunteersAddForm.get("availableDays").setValue(0);
            this.VolunteersAddForm.get("identityProofId").setValue(0);
          }
        });
      })
    }

    OnSaveForms() {
      debugger
      const formValue = { ...this.VolunteersAddForm.value };
      formValue.availableDays = JSON.stringify(formValue.availableDays || []);
      this.VolunteersAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.VolunteersAddForm.value.userId = this.jwtAuth.getUserId();
      this.VolunteersAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      debugger
      this.service.SaveVolunteer(formValue)
        .subscribe((result) => {
          debugger
          if (result) {
            this.alert.SaveSuccess();
            this.ClearAfterSave();
            if(this.opType == 'Edit' || this.opType == 'Copy')
              {
                this.router.navigate(['Volunteers/Volnteerlist']);
              }
              this.Id = 0;
              this.opType = 'Add'; 
              this.ngOnInit();
          }
          else {
            this.alert.SaveFaild();
          }
        })
    }

    ClearAfterSave()
    {
      this.VolunteersAddForm.get("volunteerName").setValue('');
      this.VolunteersAddForm.get("volunteerSide").setValue(0);
      this.VolunteersAddForm.get("firstName").setValue('');
      this.VolunteersAddForm.get("secondName").setValue('');
      this.VolunteersAddForm.get("thirdName").setValue('');
      this.VolunteersAddForm.get("lastName").setValue('');
      this.VolunteersAddForm.get("mobileNo").setValue('');
      this.VolunteersAddForm.get("emergencyNo").setValue('');
      this.VolunteersAddForm.get("nationalityId").setValue(0);
      this.VolunteersAddForm.get("workplace").setValue('');
      this.VolunteersAddForm.get("experienceYears").setValue('');
      this.VolunteersAddForm.get("totalVolunteerHours").setValue('');
      this.VolunteersAddForm.get("governorateId").setValue(0);
      this.VolunteersAddForm.get("districtId").setValue(0);
      this.VolunteersAddForm.get("residentialAddress").setValue('');
      this.VolunteersAddForm.get("email").setValue('');
      this.VolunteersAddForm.get("nationalID").setValue('');
      this.VolunteersAddForm.get("iDNumber").setValue('');
      this.VolunteersAddForm.get("birthPlace").setValue('');
      this.VolunteersAddForm.get("birthDate").setValue(formatDate(new Date(), 'yyyy-MM-dd', "en-US"));
      this.VolunteersAddForm.get("educationalQualification").setValue('');
      this.VolunteersAddForm.get("skills").setValue('');
      this.VolunteersAddForm.get("availableDays").setValue('-1');
      this.VolunteersAddForm.get("identityProofId").setValue(0);
      this.VolunteersAddForm.get("generalAttachModelList").setValue([]);     
      this.childAttachment.data =[];
    }

    DeleteVolunteer(id: any) {
        Swal.fire({
          title: this.translateService.instant('AreYouSure?'),
          text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
          icon: 'warning',
          confirmButtonColor: '#dc3741',
          showCancelButton: true,
          confirmButtonText: this.translateService.instant('Yes,deleteit!'),
          cancelButtonText: this.translateService.instant('Close'),
        })
        .then((result) => {
          if (result.value) {
            this.service.DeleteVoulnteer(id).subscribe((results) => {
              if (results.isSuccess) {
                this.alert.DeleteSuccess();
                this.router.navigate(['Volunteers/Volnteerlist']);
              }
              else if(!results.isSuccess && results.message === "msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission",'error');
                return;
              } 
              else 
              {
                this.alert.DeleteFaild()
              }
            });
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('Delete action was canceled.');
          }
        })      
    }

    isEmpty(input) {
      return input === '' || input === null;
    }
    
    UpdateFullName()
    {
      debugger
      let fullName ='';
      this.VolunteersAddForm.get("volunteerName").setValue(fullName);
      if(this.VolunteersAddForm.get("firstName").value != null && this.VolunteersAddForm.get("firstName").value != undefined && this.VolunteersAddForm.get("firstName").value != '')
      {
        fullName += this.VolunteersAddForm.get("firstName").value + ' ';
      }
      if(this.VolunteersAddForm.get("secondName").value != null && this.VolunteersAddForm.get("secondName").value != undefined && this.VolunteersAddForm.get("secondName").value != '')
      {
        fullName += this.VolunteersAddForm.get("secondName").value + ' ';
      }
      if(this.VolunteersAddForm.get("thirdName").value != null && this.VolunteersAddForm.get("thirdName").value != undefined && this.VolunteersAddForm.get("thirdName").value != '')
      {
        fullName += this.VolunteersAddForm.get("thirdName").value + ' ';
      }
      if(this.VolunteersAddForm.get("lastName").value != null && this.VolunteersAddForm.get("lastName").value != undefined && this.VolunteersAddForm.get("lastName").value != '')
      {
        fullName += this.VolunteersAddForm.get("lastName").value + ' ';
      }
      this.VolunteersAddForm.get("volunteerName").setValue(fullName);
    }

     loadLazyOptions(event: any) {
      const { first, last } = event;

      // Don't replace the full list; copy and fill only the needed range
      if (!this.volunteerSideList) {
          this.volunteerSideList = [];
      }

      // Make sure the array is large enough
      while (this.volunteerSideList.length < last) {
          this.volunteerSideList.push(null);
      }

      for (let i = first; i < last; i++) {
          this.volunteerSideList[i] = this.volunteerSideList[i];
      }

      this.loading = false;
    }


    FilterGover(gover: number) {
    debugger
    if (gover > 0) {
      this.filteredDistrectList = this.districtList.filter(x => x.data1 === gover.toString());
    } else {
      this.filteredDistrectList= [];
    }
  }

}
