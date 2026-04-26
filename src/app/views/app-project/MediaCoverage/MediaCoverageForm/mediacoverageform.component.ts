import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import Swal from 'sweetalert2';
import { MediaCoverageService } from '../mediacoverage.service';

@Component({
  selector: 'app-mediacoverageform',
  templateUrl: './mediacoverageform.component.html',
  styleUrl: './mediacoverageform.component.scss'
})
export class MediacoverageformComponent implements OnInit {
  MediaCoverageAddForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  voucherId: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll: boolean;
  disableSave: boolean;
  lang: string;
  NewDate: any;
  showsave: boolean;
  eventTypesList: any;
  locationsList: any;
  authoritiesList: any;
  coverageTypesList: any;
  EmployeeList: any;

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
      private Service: MediaCoverageService,
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
      this.router.navigate(['MediaCoverage/Mediacoveragelist']);
    }
    this.InitiailMediaCoverageForm();
    this.GetInitailMediaCoverage();
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Mediacoverageform');
    this.title.setTitle(this.TitlePage);
  }

  InitiailMediaCoverageForm() {
    this.MediaCoverageAddForm = this.formbulider.group({
      id: [0, [Validators.required]],
      companyId: [0],
      transDate: ["", [Validators.required]],
      projectId: [0],
      eventName: ["", [Validators.required]],
      eventDateTime: ["", [Validators.required]],
      eventType: [0],
      placeId: [0],
      authorityId: [0],
      coverageType: [[]],
      status: [0],
      userId: [0],
      eventDescr:[""],
      notes:[""],
      empId:[0],
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }
private normalizeIds(value: any): number[] {
  if (Array.isArray(value)) return value.map(Number).filter(n => !isNaN(n));
  if (value === null || value === undefined || value === '') return [];
  if (typeof value === 'string') {
    return value.split(',').map(s => +s.trim()).filter(n => !isNaN(n));
  }
  const n = Number(value);
  return isNaN(n) ? [] : [n];
}


  GetInitailMediaCoverage() {
    this.Service.GetInitailMediaCoverage(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['MediaCoverage/Mediacoveragelist']);
        return;
      }
      result.transDate = formatDate(result.transDate, "yyyy-MM-dd", "en-US");
      result.eventDateTime = formatDate(result.eventDateTime, 'yyyy-MM-dd HH:mm:ss', "en-JO");
      this.eventTypesList = result.eventTypesList;
      this.locationsList = result.locationsList;
      this.authoritiesList = result.authoritiesList;
      this.coverageTypesList = result.coverageTypesList;
      this.EmployeeList = result.employeeList;
      
      result.coverageType = this.normalizeIds(result.coverageType);
      this.MediaCoverageAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.MediaCoverageAddForm.get("id").setValue(result.id);
          this.MediaCoverageAddForm.get("transDate").setValue(result.transDate);
          this.MediaCoverageAddForm.get("projectId").setValue(result.projectId);
          this.MediaCoverageAddForm.get("eventName").setValue(result.eventName);
          this.MediaCoverageAddForm.get("eventDateTime").setValue(result.eventDateTime);
          this.MediaCoverageAddForm.get("eventType").setValue(result.eventType);
          this.MediaCoverageAddForm.get("placeId").setValue(result.placeId);
          this.MediaCoverageAddForm.get("authorityId").setValue(result.authorityId);
          this.MediaCoverageAddForm.get("coverageType")
          ?.setValue(this.normalizeIds(result.coverageType));

          this.MediaCoverageAddForm.get("empId").setValue(result.empId);

        }
        else {
          this.MediaCoverageAddForm.get("id").setValue(result.id);
          this.MediaCoverageAddForm.get("transDate").setValue(result.transDate);
          this.MediaCoverageAddForm.get("projectId").setValue(0);
          this.MediaCoverageAddForm.get("eventName").setValue('');
          this.MediaCoverageAddForm.get("eventDateTime").setValue(result.eventDateTime);
          this.MediaCoverageAddForm.get("eventType").setValue(0);
          this.MediaCoverageAddForm.get("placeId").setValue(0);
          this.MediaCoverageAddForm.get("authorityId").setValue(0);
          this.MediaCoverageAddForm.get("coverageType").setValue([]);

          this.MediaCoverageAddForm.get("empId").setValue(0);
        }
      });
    })
  }

 OnSaveForms() {
  this.disableSave = true;

  const payload = this.MediaCoverageAddForm.getRawValue(); 

  payload.companyId = this.jwtAuth.getCompanyId();
  payload.userId = this.jwtAuth.getUserId();

 
 const cov = this.normalizeIds(payload.coverageType);
payload.coverageType = cov.join(','); 


  this.Service.SaveMediaCoverage(payload).subscribe({
    next: (result) => {
      if (result) {
        this.alert.SaveSuccess();
        this.disableSave = false;
     
        if (this.opType == 'Edit') {
          this.router.navigate(['MediaCoverage/Mediacoveragelist']);
        }

        this.clearFormdata();
        this.voucherId = 0;
        this.opType = 'Add';
        this.ngOnInit();
      } else {
        this.alert.SaveFaild();
        this.disableSave = false;
      }
    },
    error: () => {
      this.disableSave = false;
    }
  });
}


  DeleteMediaCoverage(id: any) {
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
        this.Service.DeleteMediaCoverage(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['MediaCoverage/Mediacoveragelist']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
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


  clearFormdata() {
    this.MediaCoverageAddForm.get("id").setValue(0);
    this.MediaCoverageAddForm.get("projectId").setValue(0);
    this.MediaCoverageAddForm.get("eventName").setValue('');
    this.MediaCoverageAddForm.get("eventDateTime").setValue(0);
    this.MediaCoverageAddForm.get("eventType").setValue(0);
    this.MediaCoverageAddForm.get("placeId").setValue(0);
    this.MediaCoverageAddForm.get("authorityId").setValue(0);
this.MediaCoverageAddForm.get("coverageType").setValue([]);

    this.voucherId = 0;
    this.opType = 'Add';
    this.showsave = false;
    this.GetInitailMediaCoverage();
  }

   isEmpty(input) {
    return input === '' || input === null;
  }

 AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.authoritiesList) {
      this.authoritiesList = [];
    }

    // Make sure the array is large enough
    while (this.authoritiesList.length < last) {
      this.authoritiesList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.authoritiesList[i] = this.authoritiesList[i];
    }

    this.loading = false;
  }



  
  PrintMediaCoveraget(id: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    /* if (this.lang == 'ar') { */
      const reportUrl = `RptMediaCoveragetAr?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
/*     }
    else {
      const reportUrl = `RptMediaCoveragetEn?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    } */
  }

}
