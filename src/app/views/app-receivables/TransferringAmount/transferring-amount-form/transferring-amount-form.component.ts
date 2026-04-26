import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { sweetalert } from 'sweetalert';
import { TransferringAmountService } from '../transferring-amount.service';
import { delay, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transferring-amount-form',
  templateUrl: './transferring-amount-form.component.html',
  styleUrl: './transferring-amount-form.component.scss'
})
export class TransferringAmountFormComponent {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  TransferringAmountForm: FormGroup;
  public TitlePage: string;
  showLoader = false;
  loading: boolean;
  public voucherId: any;
  public opType: string;
  disableSave: boolean;
  showsave: boolean;
  disableAll: boolean = false;
  public StudentList: any;
  Lang: String;


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private dialog: MatDialog,
    private appCommonserviceService: AppCommonserviceService,
    private route: ActivatedRoute,
    private TransferringAmountService: TransferringAmountService,
  ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.route.queryParams.subscribe((params: Params) => {
      debugger
      this.voucherId = +params['voucherId'];
      this.opType = params.opType;

      if (params.showsave == "true") {
        this.showsave = true;
      }
      else {
        this.showsave = false;
      }
    });

    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === 0 || isNaN(this.voucherId)) {
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
    }

    this.TransferringAmountForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: [new Date()],
      amount: [0, [Validators.required, (control) => control.value > 0 ? null : { greaterThanZero: true }]],
      note: [""],
      fromTheStudent: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      toTheStudent: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      generalAttachModelList: [null],
    });

    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['TransferringAmount/TransferringAmountList']);
    }

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    this.GetTransferringAmountInfo();
  }

  AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.StudentList) {
      this.StudentList = [];
    }

    // Make sure the array is large enough
    while (this.StudentList.length < last) {
      this.StudentList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.StudentList[i] = this.StudentList[i];
    }

    this.loading = false;
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  GetTransferringAmountInfo() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.TransferringAmountService.GetTransferringAmountInfo(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['TransferringAmount/TransferringAmountList']);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
      this.StudentList = result.studentList;
      this.TransferringAmountForm.patchValue(result);

      if (result.transferAmountDetails && result.transferAmountDetails.length > 0) {
        const detail = result.transferAmountDetails[0];
        this.TransferringAmountForm.get('fromTheStudent').setValue(detail.fromStudentId);
        this.TransferringAmountForm.get('toTheStudent').setValue(detail.toStudentId);
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.TransferringAmountForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {

        if (this.voucherId < 0) {
          this.TransferringAmountForm.get("fromTheStudent").setValue(0);
          this.TransferringAmountForm.get("toTheStudent").setValue(0);
        }
      });
    });
  }


  SetTitlePage() {
    this.TitlePage = this.translateService.instant('TransferringAmountForm');
    this.title.setTitle(this.TitlePage);
  }

  onSubmit() {
    debugger
    let isValid = true;
    this.disableSave = true;

    if (this.TransferringAmountForm.value.fromTheStudent == this.TransferringAmountForm.value.toTheStudent) {
      this.alert.ShowAlert('msgThesamecustomercannotbeselected', 'error')
      isValid = false;
      this.disableSave = false;
      return;
    }
    if (isValid) {
      debugger
      this.TransferringAmountForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      this.TransferringAmountService.saveTransferringAmount(this.TransferringAmountForm.value).subscribe((result) => {
        debugger;
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();
          this.router.navigate(['TransferringAmount/TransferringAmountList']);
        } else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      });
    }
  }

  DeleteTransferringAmount(id: any) {
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
        this.TransferringAmountService.deleteTransferringAmount(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
        this.router.navigate(['TransferringAmount/TransferringAmountList']);
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

  PrintTransferringAmount(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptTransferringAmountAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptTransferringAmountEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

}
