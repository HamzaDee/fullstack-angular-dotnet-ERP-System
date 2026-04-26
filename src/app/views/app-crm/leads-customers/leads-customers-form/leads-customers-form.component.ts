import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { ActivityService } from 'app/views/app-project/Activities/activities.service';
import { sweetalert } from 'sweetalert';
import { LeadsService } from '../leadsService.service';
import { delay, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-leads-customers-form',
  templateUrl: './leads-customers-form.component.html',
  styleUrl: './leads-customers-form.component.scss'
})
export class LeadsCustomersFormComponent {
  LeadsCustomerForm: FormGroup;
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
  SourceList: any;
  StatusList: any;
  BranchList: any;
  ConvertedToList: any;
  LostReasonList: any;

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
      private CrmService: LeadsService,
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
      // this.Id = 0;
    }
    this.SetTitlePage();
    if (this.Id == null || this.Id == undefined || this.Id === "") {
      this.router.navigate(['LeadsCustomers/LeadsCustomersList']);
    }

    this.LeadsCustomerForm = this.formbulider.group({
      leadId: [0],
      companyId: [0],
      branchId: [0],
      customerName: ["", [Validators.required]],
      mainContactName: [""],
      mainContactEmail: ['', [Validators.email, this.customEmailValidator]],
      mainContactPhone: [""],
      sourceId: [0, [Validators.required, Validators.min(1)]],
      status: [0, [Validators.required, Validators.min(1)]],
      expectedValue: [0],
      createdById: [0, [Validators.required]],
      createdAt: [new Date],
      convertedToCustomerId: [0],
      convertedAt: [new Date],
      assignedTo: [0],
      note: [""],
      lostReasonId: [0],
    });

    this.GetInitailLeadsCustomers();

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
    this.TitlePage = this.translateService.instant('LeadsCustomersForm');
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

  GetInitailLeadsCustomers() {
    this.lang = this.jwtAuth.getLang();
    this.CrmService.GetGetInitailLeadsCustomersForm(this.Id, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['LeadsCustomers/LeadsCustomersList']);
        return;
      }
      debugger
      this.SourceList = result.sourceList;
      this.StatusList = result.statusList;
      this.BranchList = result.branchList;
      this.ConvertedToList = result.convertedToList;
      this.LostReasonList = result.lostReasonList;
      this.LeadsCustomerForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        if (this.Id > 0) {
          this.LeadsCustomerForm.get("lostReasonId").setValue(result.lostReasonId);

        }
        else {
          this.LeadsCustomerForm.get("branchId").setValue(0);
          this.LeadsCustomerForm.get("assignedTo").setValue(0);
          this.LeadsCustomerForm.get("lostReasonId").setValue(0);

          if (this.opType === "Add") {
            this.LeadsCustomerForm.get('status')?.disable();
          } else {
            this.LeadsCustomerForm.get('status')?.enable();
          }
        }
      });
    })
  }

  OnSaveForms() {
    debugger
    this.LeadsCustomerForm.value.companyId = this.jwtAuth.getCompanyId();
    this.LeadsCustomerForm.value.userId = this.jwtAuth.getUserId();
    if (this.opType === "Add") {
      this.LeadsCustomerForm.get('leadId').setValue(0);
    }
    debugger
    this.CrmService.saveLeadsCustomer(this.LeadsCustomerForm.value).subscribe((result) => {
      debugger
      if (result) {
        this.alert.SaveSuccess();
        //this.ClearAfterSave();
        if (this.opType == 'Edit' || this.opType == 'Copy') {
          this.router.navigate(['LeadsCustomers/LeadsCustomersList']);
        }
        this.Id = 0;
        this.opType = 'Add';
        this.ngOnInit();
      }
      else {
        this.alert.SaveFaild();
      }
    });
  }

  DeleteLeadsCustomers(id: any) {
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
        this.CrmService.deleteLeadsCustomers(id).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['LeadsCustomers/LeadsCustomersList']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
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

  PrintLeadsCustomers(Lead: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptLeadsCustomersAR?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptLeadsCustomersEN?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  private customEmailValidator(control) {
  if (!control.value) return null;

  const emailError = Validators.email(control);

  if (emailError) {
    return { invalidEmailFormat: true };
  }

  return null;
}

}
