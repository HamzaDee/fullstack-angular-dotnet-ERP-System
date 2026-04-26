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
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { LeadsActivitiesService } from '../LeadsActivities.Service';


@Component({
  selector: 'app-app-leads-activities-form',
  templateUrl: './app-leads-activities-form.component.html',
  styleUrl: './app-leads-activities-form.component.scss'
})
export class AppLeadsActivitiesFormComponent implements OnInit {

  ActivityLeadAddForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  voucherId: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll: boolean;
  disableSave: boolean;
  showsave: boolean;
  lang: string;
  NewDate: any;
  leadList: any;
  activityTypeList: any;
  leadId: number;
  statusList:any;
  showStatus:boolean;

  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private readonly alert: sweetalert,
      private readonly translateService: TranslateService,
      public readonly router: Router,
      private readonly formbulider: FormBuilder,
      public readonly routePartsService: RoutePartsService,
      private readonly http: HttpClient,
      private readonly appCommonserviceService: AppCommonserviceService,
      private readonly dialog: MatDialog,
      private readonly route: ActivatedRoute,
      private readonly serv: LeadsActivitiesService,
      private readonly cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;

    this.route.queryParams.subscribe((params: Params) => {
      if (params['leadId']) {
        this.leadId = +params['leadId'];
        this.voucherId = 0;
        this.opType = 'Add';
      } else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
      }
    });
    if(this.opType == 'Add')
      {
        this.showStatus = false;
      }
    else if( this.opType == 'Edit')
      {
        this.showStatus = true;
      }



    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['LeadsActivities/LeadsActivitiesList']);
    }
    this.InitiailActivityLeadForm();
    this.GetLeadsActivities();
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
    this.TitlePage = this.translateService.instant('InteractiveActivities');
    this.title.setTitle(this.TitlePage);
  }

  InitiailActivityLeadForm() {
    this.ActivityLeadAddForm = this.formbulider.group({
      activityId: [0, [Validators.required, Validators.min(1)]],
      companyId: [0],
      leadId: [0, [Validators.required, Validators.min(1)]],
      activityTypeId: [0, [Validators.required, Validators.min(1)]],
      startAt: [""],
      endAt: [""],
      description: [""],
      note: [""],
      status:[0]
    });
  }
  GetLeadsActivities() {
    debugger
    this.serv.GetLeadsActivitiesForm(this.voucherId).subscribe(result => {
      if (!result.isSuccess && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['LeadsActivities/LeadsActivitiesList']);
        return;
      }
      debugger
      this.activityTypeList = result.activityTypeList;
      this.leadList = result.leadList;
      this.statusList = result.statusList;

      of(1, 2).pipe(delay(0)).subscribe(() => {
        if (this.voucherId > 0) {
          this.PopulateFormForEdit(result);
        }
        else {
          this.PopulateFormForAdd(result);
        }
      });
    });
  }

  private PopulateFormForEdit(result: any): void {
    debugger
    this.ActivityLeadAddForm.get("activityId").setValue(result.activityId);
    this.ActivityLeadAddForm.get("activityTypeId").setValue(result.activityTypeId);
    this.ActivityLeadAddForm.get("leadId").setValue(result.leadId);
    const startAt = result.startAt ? formatDate(result.startAt, "yyyy-MM-dd'T'HH:mm", "en-US") : "";
    const endAt = result.startAt ? formatDate(result.endAt, "yyyy-MM-dd'T'HH:mm", "en-US") : "";
    this.ActivityLeadAddForm.get("startAt").setValue(startAt);
    this.ActivityLeadAddForm.get("endAt").setValue(endAt);
    this.ActivityLeadAddForm.get("description").setValue(result.description);
    this.ActivityLeadAddForm.get("note").setValue(result.note);
    this.ActivityLeadAddForm.get("status").setValue(result.status);
  }

  private PopulateFormForAdd(result: any): void {
    debugger
    const startAt = result.startAt ? formatDate(result.startAt, "yyyy-MM-dd'T'HH:mm", "en-US") : "";
    const endAt = result.startAt ? formatDate(result.endAt, "yyyy-MM-dd'T'HH:mm", "en-US") : "";
    this.ActivityLeadAddForm.get("startAt").setValue(startAt);
    this.ActivityLeadAddForm.get("endAt").setValue(endAt);
    this.ActivityLeadAddForm.get("activityId").setValue(result.leadActiveMax);
    this.ActivityLeadAddForm.get("activityTypeId").setValue(0);
    this.ActivityLeadAddForm.get("leadId").setValue(0);
    this.ActivityLeadAddForm.get("description").setValue("");
    this.ActivityLeadAddForm.get("status").setValue(0);
    this.ActivityLeadAddForm.get("note").setValue("");

    if (this.leadId > 0 && this.leadList?.length) {
      const selectedLead = this.leadList.find(
        x => Number(x.id) === Number(this.leadId)
      );

      if (selectedLead) {
        this.ActivityLeadAddForm.patchValue({
          leadId: Number(selectedLead.id)
        });
      }
    }
  }




  OnSaveForms() {
    debugger
    //     if (this.ActivityLeadAddForm.get('lost')?.value === true) {
    //   const reason = (this.ActivityLeadAddForm.get('lostReason')?.value || '').trim();
    //   if (!reason) {
    //     this.alert.ShowAlert('LostReasonRequired', 'error'); // أو أي رسالة عندك
    //     this.ActivityLeadAddForm.get('lostReason')?.markAsTouched();
    //     return;
    //   }
    // }

    this.ActivityLeadAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ActivityLeadAddForm.value.userId = this.jwtAuth.getUserId();
    this.serv.PostLeadsActivities(this.ActivityLeadAddForm.value)
      .subscribe((result) => {
        debugger

        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          if (this.opType == 'Edit') {
            this.router.navigate(['LeadsActivities/LeadsActivitiesList']);
          }
          else {
            this.opType = 'Add';
            this.router.navigate(['LeadsActivities/LeadsActivitiesList']);
            this.ngOnInit();
          }
        }
        else {
          this.alert.SaveFaild();
          this.router.navigate(['LeadsActivities/LeadsActivitiesList']);
        }
      })
  }

  Cancel(activityId: number): void {

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
        this.serv.CancelLeadsActivities(activityId).subscribe(_ => {
          this.alert.DeleteSuccess();
          this.router.navigate(['LeadsActivities/LeadsActivitiesList']);
        }, _err => {
          this.alert.DeleteFaild();
        });
      }
    });
  }

  Close(activityId: number): void {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('msgConfirmPost'),
      icon: 'warning',
      confirmButtonColor: '#198754',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.serv.CloseLeadsActivities(activityId).subscribe(_ => {
          this.alert.ShowAlert('msgClosedSuccessfully', 'success');
          this.router.navigate(['LeadsActivities/LeadsActivitiesList']);
        }, _err => {
          this.alert.ShowAlert('msgCloseFailed', 'error');
        });
      }
    });
  }

   PrintLeadsActivities(Lead: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptLeadsActivitiesAR?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptLeadsActivitiesEN?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

}