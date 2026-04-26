import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import * as FileSaver from 'file-saver';
import { UsersGroupsFormComponent } from './users-groups-form/users-groups-form.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UsersGroupsService } from '../users-groups.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-users-groups-list',
  templateUrl: './users-groups-list.component.html',
  styleUrls: ['./users-groups-list.component.scss']
})
export class UsersGroupsListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 9;
  custom: boolean;
  exportData: any[];
  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private alert: sweetalert,
    private usersGroupsService: UsersGroupsService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private readonly serv: AppCommonserviceService,
  ) {
  }
  ngOnInit(): void {
    this.SetTitlePage();
    this.GetUesrGrouptList();
    this.getFavouriteStatus(this.screenId);
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('UsersGroupsList');
    this.title.setTitle(this.TitlePage);
  }
  GetUesrGrouptList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';


    this.showLoader = true;
    setTimeout(() => {
      this.usersGroupsService.GetUesrGrouptList().subscribe(result => {
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.showLoader = false;
          return;
        }
        this.tabelData = result;
        if (currentLang == "ar") {
          this.refreshInventoryReportTableArabic(this.tabelData);
        }
        else {
          this.refreshInventoryReportTableEnglish(this.tabelData);
        } this.showLoader = false;
      })
    });
  }
  //shoud add permission
  DeleteUserGroup(id: any) {
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
        debugger
        this.usersGroupsService.DeleteUesrGroup(id).subscribe((result) => {
          debugger
          if (result.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetUesrGrouptList();
          }
          else {
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.ShowAlert("msgRecordHasLinks", 'error')
            }

          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenUserGroupFormPopUp(id: number, isNew?) {
    let title = isNew ? this.translateService.instant('addUserGroup') : this.translateService.instant('modifyUserGroup');
    let dialogRef: MatDialogRef<any> = this.dialog.open(UsersGroupsFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew, companyid: this.jwtAuth.getCompanyId(),
        GetAllUesrGroupsList: () => { this.GetUesrGrouptList() }
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

  OpenImportCompaniesFormPopUp(id: number) {
    let title = this.translateService.instant('ImportCompanies');
    let dialogRef: MatDialogRef<any> = this.dialog.open(UsersGroupsFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, companyid: this.jwtAuth.getCompanyId(),
        GetAllUesrGroupsList: () => { this.GetUesrGrouptList() }
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

  NavigateGiveGroupPermissionForm(id) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.router.navigate(['UsersGroups/GetUesrGrouptList/GetUserPermissionForm']);
  }

  refreshInventoryReportTableArabic(data) {
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      ' الرقم ': x.number,
      ' الاسم': x.name,
      ' ملاحظه': x.note,
      ' نشط': x.status,
    }));
  }

  refreshInventoryReportTableEnglish(data) {
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      ' Number ': x.number,
      ' Name': x.name,
      ' Note': x.note,
      ' Active': x.status,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Inventory Report List", ".xlsx");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string, extension: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = extension;
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
       head = [['نشط', 'ملاحظه ', 'الاسم', 'الرقم']]
    }
    else {
       head = [['Active', 'note ', ' Name', 'Number']]
    }
    const rows: (number | string)[][] = [];
    this.tabelData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.number;
      temp[1] = part.name;
      temp[2] = part.note;
      temp[3] = part.status;

        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp)
    }, this.tabelData)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);


    let Title = "";
    if (currentLang == "ar") {
      Title = "  كشف مجموعات المستخدمين";
    }
    else {
      Title = "Users Groups List";
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
}
