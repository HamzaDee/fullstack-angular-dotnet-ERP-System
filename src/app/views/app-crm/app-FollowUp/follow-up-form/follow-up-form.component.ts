import { HttpClient } from '@angular/common/http';
import { OnInit, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { of, delay } from 'rxjs';
import { sweetalert } from 'sweetalert';
import { FollowUpService } from '../follow-up.service';
import { FollowUpComponent } from '../follow-up/follow-up.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-follow-up-form',
  templateUrl: './follow-up-form.component.html',
  styleUrl: './follow-up-form.component.scss'
})
export class FollowUpFormComponent implements OnInit {
  FollowUpForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  Id: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll: boolean;
  disableSave: boolean;
  lang: string;
  NewDate: any;
  showsave: boolean;
  followUpTypeList: any;
  ConvertedToList: any;

  constructor
    (
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<FollowUpComponent>,
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private readonly alert: sweetalert,
      private readonly translateService: TranslateService,
      public router: Router,
      private readonly formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private readonly route: ActivatedRoute,
      private readonly FollowUpService: FollowUpService,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;
    this.SetTitlePage();
    if (this.Id == null || this.Id == undefined || this.Id === "") {
      // this.router.navigate(['FollowUp/FollowUp']);
    }

    this.FollowUpForm = this.formbulider.group({
      id: [0 || this.data.Id],
      companyId: [0],
      followUpTypeId: [0, [Validators.required, Validators.min(1)]],
      relatedTypeId: [0, [Validators.required]],
      relatedId: [0],
      description: ["", [Validators.required]],
      dueDate: [new Date],
      reminderBeforeMinutes: [0],
      assignedToUserId: [0, [Validators.required, Validators.min(1)]],
      isCompleted: [false],
      completedAt: [new Date],
      createdById: [0],
      createdAt: [new Date],
      isDeleted: [false],
      linkedActivityId: [0],
    });

    this.GetInitailFollowUp();

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
    this.TitlePage = this.translateService.instant('FollowUpList');
    this.title.setTitle(this.TitlePage);
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  GetInitailFollowUp() {
    debugger
    this.lang = this.jwtAuth.getLang();
    this.FollowUpService.GetGetInitailFollowUpForm(this.data.Id).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['FollowUp/FollowUp']);
        this.dialogRef.close(false);
        return;
      }
      debugger
      result.dueDate = formatDate(result.dueDate, "yyyy-MM-ddTHH:mm", "en-US");
      this.followUpTypeList = result.followUpTypeList;
      this.ConvertedToList = result.convertedToList;
      this.FollowUpForm.patchValue(result);

      if (this.data.isView) {
        this.FollowUpForm.disable();
        this.showsave = true;
      }

      if (this.data.leadId) {
        this.FollowUpForm.get("relatedId").setValue(this.data.leadId);
        this.FollowUpForm.get("relatedTypeId").setValue(278);
      }

      if (this.data.opportunityNo) {
        this.FollowUpForm.get("relatedId").setValue(this.data.opportunityNo);
        this.FollowUpForm.get("relatedTypeId").setValue(279);
      }

      if (this.data.activityNo) {
        this.FollowUpForm.get("relatedId").setValue(this.data.activityNo);
        this.FollowUpForm.get("relatedTypeId").setValue(288);
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        if (this.Id > 0) {
          this.FollowUpForm.get("sourceId").setValue(result.sourceId);
          this.FollowUpForm.get("assignedToUserId").setValue(result.assignedToUserId);
        }
        else {
          this.FollowUpForm.get("sourceId").setValue(0);
          this.FollowUpForm.get("assignedToUserId").setValue(0);
        }
      });
    })
  }

  OnSaveForms() {
    debugger
    this.FollowUpForm.value.companyId = this.jwtAuth.getCompanyId();
    this.FollowUpForm.value.userId = this.jwtAuth.getUserId();

    if (this.FollowUpForm.value.relatedId == null) {
      this.FollowUpForm.value.relatedId = 0;
    }

    debugger
    this.FollowUpService.saveFollowUp(this.FollowUpForm.value).subscribe((result) => {
      debugger
      if (!this.data.isNew) {
        this.data.isNew = true;
        this.data.id = 0
        this.alert.SaveSuccess();
        this.GetInitailFollowUp();
        this.data.GetAllFollowUpList();
        this.dialogRef.close(false);
      }
      else {
        this.alert.SaveSuccess();
        this.GetInitailFollowUp();
        this.data.GetAllFollowUpList();
      }
    });
  }
}
