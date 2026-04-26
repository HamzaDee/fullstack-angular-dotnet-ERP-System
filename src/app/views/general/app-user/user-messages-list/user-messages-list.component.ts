import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../user.service';
import { UserMessagesFormComponent } from './user-messages-form/user-messages-form.component';
import { UserMessagesDetialsFormComponent } from './user-messages-detials-form/user-messages-detials-form.component';
import * as FileSaver from 'file-saver';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-user-messages-list',
  templateUrl: './user-messages-list.component.html',
  styleUrls: ['./user-messages-list.component.scss']
})
export class UserMessagesListComponent implements OnInit {
  public TitlePage: string;
  tabelData: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  loading: boolean;
  screenId: number = 56;
  custom: boolean;
  data: any[];
  exportData: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private userService: UserService,
    private dialog: MatDialog,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetUserMessagesList();
    this.getFavouriteStatus(this.screenId);

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('UserMessagesList');
    this.title.setTitle(this.TitlePage);
  }

  GetUserMessagesList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.loading = true;
    this.userService.GetUserMessagesList().subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.tabelData = result;

      if (currentLang == "ar") {
        this.refresUserMessagesListArabic(this.tabelData);
      }
      else {
        this.refreshUserMessagesListEnglish(this.tabelData);
      }

      this.loading = false;
    })
  }

  DeleteUserMessage(id: any) {
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
        this.userService.DeleteUserMessage(id).subscribe((result) => {
          if (result) {
            this.alert.DeleteSuccess();
            this.GetUserMessagesList();
          }
          else {
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.DeleteFaild()
            }

          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenUserMessageFormPopUp(id: number, isNew?, Hidesave?: boolean) {
    let title = isNew ? this.translateService.instant('NEWMESSAGE') : this.translateService.instant('MODIFYESSAGE');
    let dialogRef: MatDialogRef<any> = this.dialog.open(UserMessagesFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew, Hidesave,
        GetUserMessagesListFromParent: () => { this.GetUserMessagesList() }
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  OpenUserMessageDetailsFormPopUp(id: number) {
    let title = this.translateService.instant('NEWMESSAGEDETAILS');
    let dialogRef: MatDialogRef<any> = this.dialog.open(UserMessagesDetialsFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id,
        GetUserMessagesListFromParent: () => { this.GetUserMessagesList() }
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  UpdateStatus(id, event) {
    debugger

    this.userService.UpdateStatus(id, event.currentTarget.checked).subscribe((result) => {
      if (result) {
        this.alert.SaveSuccess();
        this.GetUserMessagesList();
      }
    })

  }

  updateFavourite(ScreenId: number) {
    this.serv.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
        this.serv.triggerFavouriteRefresh(); // 🔥 THIS is key
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
  }

  getFavouriteStatus(screenId) {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result.isSuccess) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refresUserMessagesListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      ' الرقم': x.number,
      'نوع الرسالة': x.messageType,
      'من مستخدم': x.fromUserName,
      'الى مستخدم': x.toUserName,
      'الرساله': x.msg,
      'التاريخ و الوقت': x.msgDate,
      ' درجة الاهمية': x.priortityName,
      'مقروءة': x.isRead,
      'تمت': x.done,
    }));
  }

  refreshUserMessagesListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Number': x.number,
      'Message Type': x.messageType,
      'From User': x.fromUserName,
      'To User': x.toUserName,
      'Message': x.msg,
      'Date Time': x.msgDate,
      'PRIORATYDGREE"': x.priortityName,
      'Seen': x.isRead,
      'Done': x.done,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "products");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [[' تمت', 'مقروءة', ' درجة الاهمية', ' التاريخ و الوقت', 'الرساله', ' الى مستخدم', ' من مستخدم', ' نوع الرسالة', 'الرقم']]
    }
    else {
       head = [['Done', 'Seen', 'PRIORATYDGREE', 'Date Time', 'Message', 'To User', 'From User', 'Message Type', 'Number']]
    }

    const rows: (number | string)[][] = [];

    this.data.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.number
      temp[1] = part.messageType
      temp[2] = part.fromUserName
      temp[3] = part.toUserName
      temp[4] = part.msg
      temp[5] = part.msgDate
      temp[6] = part.priortityName
      temp[7] = part.isRead
      temp[8] = part.done

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.data)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = " رسائل المستخدمين  ";
    }
    else {
      Title = "User Messages List";
    }

    let pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
  }
}

