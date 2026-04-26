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
import { ActivityService } from '../activities.service'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-activityform',
  templateUrl: './activityform.component.html',
  styleUrl: './activityform.component.scss'
})
export class ActivityformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  ActivitesAddForm: FormGroup;
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
  governorateList:any;
  volunteersList:any;
  evaluationList:any;
  activitesList: any[] = [];
  districtsList:any;
  areasList:any;
  filtereddistricts: Array<any> = [];
  filterareas: Array<any> = [];

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
      private Service: ActivityService,
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
      this.router.navigate(['Activities/Activitylist']);
    }
    this.InitiailActivitesForm();
    this.GetInitailActivity();
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
      this.TitlePage = this.translateService.instant('Activityform');
      this.title.setTitle(this.TitlePage);
  }

  InitiailActivitesForm() {
    this.ActivitesAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      activityName:["",[Validators.required]],
      fromDate :["",[Validators.required]],
      toDate :["",[Validators.required]],
      activityLocation:["",[Validators.required]],
      volunteersRequested:[0,[Validators.required, Validators.min(1)]],
      actualVolunteers:[0],
      governorateId:[0,[Validators.required, Validators.min(1)]],
      districtId:[0],
      areaId:[0],
      activityVolunteersListModel:[null,[Validators.required, Validators.min(1)]],
    });
  }
  
  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailActivity() {
    this.Service.GetInitailActivity(this.voucherId,this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Activities/Activitylist']);
        return;
      }
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");                
      this.governorateList= result.governorateList
      this.volunteersList = result.volunteersList
      this.evaluationList = result.evaluationList   
      this.districtsList = result.districtsList
      this.areasList = result.areasList
      this.activitesList  = result.activityVolunteersListModel   
      if(this.activitesList.length > 0)
      {
        this.ActivitesAddForm.get("activityVolunteersListModel").setValue(this.activitesList);
      }
      this.ActivitesAddForm.patchValue(result);        
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.ActivitesAddForm.get("id").setValue(result.id);
          this.ActivitesAddForm.get("activityName").setValue(result.activityName);
          this.ActivitesAddForm.get("fromDate").setValue(result.fromDate);
          this.ActivitesAddForm.get("toDate").setValue(result.toDate);
          this.ActivitesAddForm.get("activityLocation").setValue(result.activityLocation);
          this.ActivitesAddForm.get("actualVolunteers").setValue(result.actualVolunteers);
          this.ActivitesAddForm.get("governorateId").setValue(result.governorateId);
          if(this.ActivitesAddForm.get("governorateId").value > 0)
            {
              this.FilterDistricts(this.ActivitesAddForm.get("governorateId").value);
            }
          this.ActivitesAddForm.get("volunteersRequested").setValue(result.volunteersRequested);
          this.ActivitesAddForm.get("districtId").setValue(result.districtId);
          if(this.ActivitesAddForm.get("districtId").value > 0)
            {
              this.FilterAreas(this.ActivitesAddForm.get("districtId").value);
            }
          this.ActivitesAddForm.get("areaId").setValue(result.areaId);          
        }
        else {
          this.ActivitesAddForm.get("activityName").setValue("");
          this.ActivitesAddForm.get("fromDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
          this.ActivitesAddForm.get("toDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
          this.ActivitesAddForm.get("activityLocation").setValue("");
          this.ActivitesAddForm.get("actualVolunteers").setValue("");
          this.ActivitesAddForm.get("governorateId").setValue(0);
          this.ActivitesAddForm.get("volunteersRequested").setValue("");
        }          
      });
    })
  }

  OnSaveForms() {
    debugger
    if(this.ActivitesAddForm.value.volunteersRequested == 0 )
      {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return false;
      }
      if(this.ActivitesAddForm.value.fromDate > this.ActivitesAddForm.value.toDate)
      {
        this.alert.ShowAlert("TheActivityFromDateMmustBeGreaterThanTheToDate", 'error');
        this.disableSave = false;
        return false;
      }

    this.disableSave = true;
    for (let i = 0; i < this.activitesList.length; i++) {
      const element = this.activitesList[i];
      if (element.volunteerId == 0 || element.totalVolunteerHours == 0 || element.evaluationId == 0 ) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return false;
      }
      element.i = i.toString();
    }
    debugger      
    this.ActivitesAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ActivitesAddForm.value.userId = this.jwtAuth.getUserId();
    this.ActivitesAddForm.value.activityVolunteersListModel = this.activitesList;
    debugger
    this.Service.SaveActvity(this.ActivitesAddForm.value)
      .subscribe((result) => {
        debugger
        
        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          this.clearFormdata();
          if(this.opType == 'Edit')
            {
              this.router.navigate(['Activities/Activitylist']);
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

    this.activitesList ??= [];  
    this.activitesList.push(
      {
        id: 0,
        activityId: 0,
        volunteerId: 0,
        totalVolunteerHours: 0,
        evaluationId: 0,
        notes: "",
        certificate:false,
        certificateNotes: "",
        index: ""
      });
      this.ActivitesAddForm.get("activityVolunteersListModel").setValue(this.activitesList);
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
    this.activitesList.splice(rowIndex, 1);
    this.ActivitesAddForm.get("activityVolunteersListModel").setValue(this.activitesList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  onAddRowBefore(rowIndex: number) {
    const newRow =
    {
      id: 0,
      activityId: 0,
      volunteerId: 0,
      totalVolunteerHours: 0,
      evaluationId: 0,
      notes: "",
      certificate:false,
      certificateNotes: "",
      index: ""
    };

    this.activitesList.splice(rowIndex, 0, newRow);
    this.ActivitesAddForm.get("activityVolunteersListModel").setValue(this.activitesList);
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
        this.Service.DeleteActivity(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['Activities/Activitylist']);
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
    this.ActivitesAddForm.get("activityName").setValue("");
    this.ActivitesAddForm.get("fromDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ActivitesAddForm.get("toDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ActivitesAddForm.get("activityLocation").setValue("");
    this.ActivitesAddForm.get("actualVolunteers").setValue("");
    this.ActivitesAddForm.get("governorateId").setValue(0);
    this.activitesList = [];
    this.ActivitesAddForm.get("activityVolunteersListModel").setValue([]); 
    this.calculateSum();
        
  }


FilterDistricts(governorateId: number) {
    debugger
    if (governorateId > 0) {
      this.filtereddistricts = this.districtsList.filter(x => x.data1 === governorateId.toString());
    } else {
      this.filtereddistricts = [];
    }
  }

  FilterAreas(districtId: number) {
    debugger
    if (districtId > 0) {
      this.filterareas = this.areasList.filter(x => x.data1 === districtId.toString());
    } else {
      this.filterareas = [];
    }
  }

}
