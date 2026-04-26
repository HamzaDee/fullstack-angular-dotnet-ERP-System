import { Component, Inject, Input, OnInit } from '@angular/core';
import { UplodeFileService } from 'app/shared/services/upload-file.service';
import { UplodeFileModel } from 'app/shared/models/UplodeFileModel'
import * as FileSaver from 'file-saver';
import { Title } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { catchError, delay } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-general-attachment-list',
  templateUrl: './app-general-attachment-list.component.html',
  styleUrls: ['./app-general-attachment-list.component.scss'],
})
export class AppGeneralAttachmentListComponent implements OnInit {
  public TitlePage: string;
  public data: Array<UplodeFileModel> = new Array<UplodeFileModel>();
  exportData: any[];
  voucherId: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public impdata: any,
    public dialogRef: MatDialogRef<any>,
    private title: Title,
    private uplodeFileService: UplodeFileService,
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    public router: Router,
  ) { }

  public GetVoucherAttachements(id): any {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/GeneralAttachment/GetVoucherAttachements/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  /*  public DeleteVoucherAttachement(id): any {
     debugger
     return this.http.delete(`${environment.apiURL_Main + '/api/GeneralAttachment/DeleteGenaralAttachmentById/'
     + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id } `)
     .pipe(
       catchError(this.handleError)
     )
   } 
     */

  //delete
  public DeleteVoucherAttachement(id): Observable<any> {
    debugger
    if (this.impdata.typeId == 1) {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/GeneralAttachment/DeleteAccVouchersDocById/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`;
      return this.http.post<any>(urlDelete, '', httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }
    else {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/GeneralAttachment/DeleteGenaralAttachmentById/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`;
      return this.http.post<any>(urlDelete, '', httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }
  }

  public UploadVoucherAttachement(post): Observable<any> {
    debugger
    if (this.impdata.typeId == 1) {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/GeneralAttachment/UploadVouchersDoc/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }
    else {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      return this.http.post<any>(`${environment.apiURL_Main + '/api/GeneralAttachment/UploadAccVoucherDoc/'
        + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, JSON.stringify(post), httpOptions)
        .pipe(
          catchError(this.handleError)
        )
    }

  }

  ngOnInit(): void {
    debugger
    if (this.impdata.typeId == 1) {
      this.GetVoucherAttachements(this.impdata.voucherId).subscribe(result => {
        debugger
        this.data = result;
        this.data.forEach(item => item.url = this.uplodeFileService.convertBase64ToFile(item.base64, item.docType));
      });
    }
    else {
      this.GetGeneralAttachements(this.impdata.voucherId, this.impdata.typeId).subscribe(result => {
        debugger
        this.data = result;
        this.data.forEach(item => item.url = this.uplodeFileService.convertBase64ToFile(item.base64, item.docType));
      });
    }



    debugger
    this.voucherId = this.impdata.voucherId;
    this.TitlePage = this.translateService.instant('VoucherAttachments');
    this.title.setTitle(this.TitlePage);
    this.data.forEach(item => item.url = this.uplodeFileService.convertBase64ToFile(item.base64, item.docType))
    this.refreshVoucherAttachTable(this.data);

  }

  public GetGeneralAttachements(id, typeId): any {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/GeneralAttachment/GetGeneralAttachements/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id + '/' + typeId} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  refreshVoucherAttachTable(data) {
    this.exportData = this.data.map(x => ({
      'اسم الملف': x.docName,
      'نوع الملف': x.docExt,
    }));
  }

  onFileSelected(event, voucherHDId) {
    const file: File = event.target.files[0];
    debugger
    const Object = new UplodeFileModel();
    if (file) {
      Object.fullName = file.name;
      Object.docName = file.name.split('.').slice(0, -1).join('.');
      Object.docExt = file.name.split('.').pop();
      Object.url = this.uplodeFileService.convertFileToSafeUrl(event.target.files, event.target.files[0].type)
      Object.docType = file.type //need this to display the file after save
      Object.voucherHDId = this.voucherId;
      Object.docId = this.voucherId;
      Object.typeId = this.impdata.typeId;
      this.uplodeFileService.convertFileToBase64(event.target.files[0]).subscribe(base64 => {
        debugger
        Object.base64 = base64;
        this.UploadVoucherAttachement(Object).subscribe((result) => {
          if (result.isSuccess) {
            this.GetGeneralAttachements(this.impdata.voucherId, this.impdata.typeId).subscribe(result => {
              this.data = result;
              this.data.forEach(item => item.url = this.uplodeFileService.convertBase64ToFile(item.base64, item.docType))
            });
            this.alert.SaveSuccess();
            this.dialogRef.close();
          }
          else {
            this.alert.SaveFaild();
          }
        })
      });
    }
  }

  deleteItem(row: any) {
    debugger
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
        this.DeleteVoucherAttachement(row.id).subscribe(result => {
          debugger
          if (result.isSuccess) {
            const index = this.data.indexOf(row);
            this.data.splice(index, 1);
            this.refreshVoucherAttachTable(this.data)
            this.alert.ShowAlert("DeleteSuccess", 'success');
          }
          else {
            this.alert.ShowAlert("DeleteFalid", 'error');
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  getVoucherAttachData() {
    if (this.data.length > 0) {
      this.data.forEach(item => { item.docId = this.voucherId });
    }
    return this.data
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.log(error.error.message)
    } else {
      console.log(error.status)
    }
    return throwError(
      console.log('Something is wrong!'));
  }
}


