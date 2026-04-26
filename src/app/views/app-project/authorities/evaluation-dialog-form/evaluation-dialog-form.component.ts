import { ChangeDetectorRef, Component, Inject, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthEvaluationGeneralAttachmentListComponent } from '../auth-evaluation-general-attachment-list/auth-evaluation-general-attachment-list.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { AuthoritiesListComponent } from '../authorities-list/authorities-list.component';
import { AuthoritiesService } from '../authorities.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import Swal from 'sweetalert2';
import { formatDate } from '@angular/common';
import { id } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-evaluation-dialog-form',
  templateUrl: './evaluation-dialog-form.component.html',
  styleUrl: './evaluation-dialog-form.component.scss'
})
export class EvaluationDialogFormComponent {
  showLoader = false;
  loading: boolean;
  EvaluationDialogForm: FormGroup;
  authEvaluationDTsList: any;
  @Input() disabled: boolean = false;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  ratingCodeList = [
    { id: -1, text: 'اختر' },
    { id: 1, text: '1' },
    { id: 2, text: '2' },
    { id: 3, text: '3' },
    { id: 4, text: '4' },
    { id: 5, text: '5' }
  ];

  disableSave: boolean;
 
  constructor(public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
    private AuthoritiesService: AuthoritiesService,
    private alert: sweetalert,
    public dialogRef: MatDialogRef<AuthoritiesListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdRef: ChangeDetectorRef) { }
    

  ngOnInit(): void {
    debugger
    this.EvaluationDialogForm = this.formbulider.group({
      id: [0],
      authorityId: [0],
      ratingCode: [0],
      ratingDateFrom: [new Date()],
      ratingDateTo: [new Date()],
      ratingReason: [""],
      //generalAttachDtModelList: [null],
    });
    this.GetAuthEvaluationInfo();
  }

  GetAuthEvaluationInfo() {
    this.AuthoritiesService.getAuthEvaluationDTModelInfo(this.data.id).subscribe(result => {
      if (result.isSuccess === false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Authorities/AuthoritiesList']);
        return;
      }
      this.EvaluationDialogForm.get('ratingDateFrom')?.setValue(formatDate(new Date(), 'yyyy-MM-dd', 'en-US'));
      this.EvaluationDialogForm.get('ratingDateTo')?.setValue(formatDate(new Date(), 'yyyy-MM-dd', 'en-US'));
      // assuming result is actually the array
      this.authEvaluationDTsList = result;
  
      this.authEvaluationDTsList.forEach(element => {
        element.ratingDateFrom = element.ratingDateFrom === null ? null : formatDate(element.ratingDateFrom, "yyyy-MM-dd", "en-US");
        element.ratingDateTo = element.ratingDateTo === null ? null : formatDate(element.ratingDateTo, "yyyy-MM-dd", "en-US");
      });
    });
  }
  
  OnSaveForms() {
    debugger
    let isValid = true;
    this.disableSave = true;
    if (this.EvaluationDialogForm.value.ratingCode == 0 || this.EvaluationDialogForm.value.ratingCode == null) {
      isValid = false;
      this.alert.ShowAlert("msgEnterratingCode", 'error');
      this.disableSave = false;
      return;
    }
    if (this.EvaluationDialogForm.value.ratingDateFrom == null || this.EvaluationDialogForm.value.ratingDateFrom == '') {
      isValid = false;
      this.alert.ShowAlert("msgEnterratingDateFrom", 'error');
      this.disableSave = false;
      return;
    }
    if (this.EvaluationDialogForm.value.ratingDateTo == null || this.EvaluationDialogForm.value.ratingDateTo == '') {
      isValid = false;
      this.alert.ShowAlert("msgEnterratingDateTo", 'error');
      this.disableSave = false;
      return;
    }
    if (this.EvaluationDialogForm.value.ratingReason == null || this.EvaluationDialogForm.value.ratingReason == undefined || this.EvaluationDialogForm.value.ratingReason == '') {
      isValid = false;
      this.alert.ShowAlert("msgEnterratingReason", 'error');
      this.disableSave = false;
      return;
    }
    debugger
    this.EvaluationDialogForm.get('authorityId')?.setValue(this.data.id);
    if(this.EvaluationDialogForm.value.id == null)
      {
        this.EvaluationDialogForm.value.id = 0;
      }
    //this.EvaluationDialogForm.value.authEvaluationDTModelList = this.authEvaluationDTsList;
    // this.EvaluationDialogForm.value.generalAttachDtModelList = this.childAttachment.ngOnInit();
    this.AuthoritiesService.saveAuthoritiesEvaluation(this.EvaluationDialogForm.value).subscribe((result) => {
      debugger
      if (result == true) {
        this.alert.SaveSuccess();
        this. ClearAfterSave();
        this.GetAuthEvaluationInfo();
        // this.dialogRef.close();
      } else {
        this.alert.SaveFaild();
      }
    });
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  
  ClearAfterSave() {
    this.EvaluationDialogForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    this.EvaluationDialogForm.get('ratingDateFrom').setValue(currentDate);
    this.EvaluationDialogForm.get('ratingDateTo').setValue(currentDate);
    this.EvaluationDialogForm.value.ratingCode = 0;
    this.EvaluationDialogForm.value.ratingReason = '';
  }

  deleteRow(rowIndex: number) {
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
        this.AuthoritiesService.deleteAuthoEvaluation(rowIndex).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.GetAuthEvaluationInfo();
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

  updateRow(row, rowIndex: number) {
    debugger
    this.EvaluationDialogForm.patchValue({
      id: row.id,
      ratingCode: row.ratingCode,
      ratingDateFrom: row.ratingDateFrom,
      ratingDateTo: row.ratingDateTo,
      ratingReason: row.ratingReason,
      index: rowIndex
    });
    this.disableSave = false;
  }
}
