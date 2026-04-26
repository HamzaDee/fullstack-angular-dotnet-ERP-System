import { Component, Inject, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AuthEvaluationGeneralAttachmentListComponent } from '../auth-evaluation-general-attachment-list/auth-evaluation-general-attachment-list.component';
import { AuthoritiesListComponent } from '../authorities-list/authorities-list.component';
import { AuthoritiesService } from '../authorities.service';
import { sweetalert } from 'sweetalert';
@Component({
  selector: 'app-authorities-evaluation',
  templateUrl: './authorities-evaluation.component.html',
  styleUrl: './authorities-evaluation.component.scss'
})
export class AuthoritiesEvaluationComponent {
  showLoader = false;
  loading: boolean;
  EvaluationForm: FormGroup;
  authEvaluationDTsList: any[] = [];
  @Input() disabled: boolean = false;
  @ViewChild(AuthEvaluationGeneralAttachmentListComponent) childAttachment: AuthEvaluationGeneralAttachmentListComponent;
  ratingCodeList = [
    { id: -1, text: 'اختر' },
    { id: 1, text: '1' },
    { id: 2, text: '2' },
    { id: 3, text: '3' },  
    { id: 4, text: '4' },  
    { id: 5, text: '5' }
  ];

  constructor(public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService, 
    private AuthoritiesService: AuthoritiesService,
    private alert: sweetalert ) { }

  ngOnInit(): void {
    debugger
    this.EvaluationForm = this.formbulider.group({
      id: [0],
      authorityId: [0],
      ratingCode: [0],
      ratingDateFrom: [new Date()],
      ratingDateTo: [new Date()],
      ratingReason: [""],
      authEvaluationDTModelList: [null],
      generalAttachDtModelList: [null],
    });
  }

  AddNewLine() {
    debugger
    this.authEvaluationDTsList.push(
      {
        ratingCode: 0,
        ratingDateFrom: '',
        ratingDateTo: '',
        ratingReason: '',
        generalAttachDtModelList: [null],
      });
    this.EvaluationForm.get("authEvaluationDTModelList").setValue(this.authEvaluationDTsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.authEvaluationDTsList.splice(rowIndex, 1);
    }
  }

  GetData() {
    debugger
    return this.authEvaluationDTsList;
  }

  AttachmentAuthoritie(id: any, index) {
    debugger
    this.routePartsService.GuidToEdit = id;
    const title = this.translateService.instant('VoucherAttachments');
    let attac = this.authEvaluationDTsList[index].generalAttachDtModelList;
    let data2 = [];
    if (attac !== undefined && attac !== null && attac.length > 0) {
      data2 = attac;
    }
    const dialogRef: MatDialogRef<any> = this.dialog.open(AuthEvaluationGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 40, data2: data2, index: index },
    });
    debugger

    dialogRef.afterClosed().subscribe(res => {
      debugger
      if (res !== null && res !== undefined) {
        console.log("Attachments received from child:", res);
        // 👇 Do whatever you need with the attachments list here
        this.authEvaluationDTsList[index].generalAttachDtModelList = [];
        this.authEvaluationDTsList[index].generalAttachDtModelList.push(...res);
      }
    });
    return false;
  }
}
