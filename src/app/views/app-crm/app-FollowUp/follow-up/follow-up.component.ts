import { Component, ViewChild,OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { FollowUpService } from '../follow-up.service';
import { FollowUpFormComponent } from '../follow-up-form/follow-up-form.component';
import { AmiriRegular } from 'assets/fonts/amiri';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { FollowUpSearchComponent } from 'app/views/general/app-searchs/follow-up-search/follow-up-search.component';

@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrl: './follow-up.component.scss'
})
  
export class FollowUpComponent implements OnInit {
  @ViewChild(FollowUpSearchComponent) childSearch: FollowUpSearchComponent;
  Data: any;
  showLoader: boolean;
  exportData: any[];
  custom: boolean;
  exportColumns: any[];
  tabelData: any[];
  data: any[] = [];
  cols: any[];
  HasPerm: boolean;
  public TitlePage: string;
  Lang: string;
  screenId: number = 298;

  constructor(
    private readonly title: Title,
    private readonly translateService: TranslateService,
    private readonly routePartsService: RoutePartsService,
    private readonly router: Router,
    private readonly jwtAuth: JwtAuthService,
    private readonly dialog: MatDialog,
    private readonly alert: sweetalert,
    private readonly FollowUpService: FollowUpService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetFollowUpList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('FollowUpList');
    this.title.setTitle(this.TitlePage);
  }

  GetFollowUpList() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      this.FollowUpService.GetFollowUpList().subscribe(result => {
        if (!result.isSuccess && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        debugger
        this.showLoader = false;
        this.Data = result;
        this.data = result;
        debugger
        if (result.length > 0) {
           if (this.childSearch) {
            const currentDate = new Date();
            this.childSearch.vfromDate = currentDate;
            this.childSearch.vtoDate = currentDate;
            this.childSearch.vfollowUpTypeList = result[0].followUpSearchModel.followUpTypeList;
            this.childSearch.vConvertedToList = result[0].followUpSearchModel.convertedToList;
            this.childSearch.vStatusList = result[0].followUpSearchModel.statusList;
            this.childSearch.ngOnInit();
          } 
        }
        if (currentLang == "ar") {
          this.refresFollowUpArabic(this.Data);
        }
        else {
          this.refreshFollowUpEnglish(this.Data);
        }
      });
    });
  }

  handleSearchResult(result: any[] | null) {
    debugger;
    this.Data = result;
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang === 'ar') {
      this.refresFollowUpArabic(this.Data);
    } else {
      this.refreshFollowUpEnglish(this.Data);
    }
  }

  OpenFollowUpFormPopUp(id: number, crruntrow: any, isNew?, isView?) {
    let title = isNew ? this.translateService.instant('AddFollowUpForm') : this.translateService.instant('modifiyFollowUpForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(FollowUpFormComponent, {
      width: '1000px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, Id: id, row: crruntrow, isNew, isView, companyid: this.jwtAuth.getCompanyId(), GetAllFollowUpList: () => { this.GetFollowUpList() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  Cancel(id: any) {
    debugger
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('AreYouSureYouWillCancelThisActivityForTheClient'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.FollowUpService.CancelFollowUp(id).subscribe(res => {
          if (res) {
            this.alert.SaveSuccess();
            this.GetFollowUpList();
          }
          else {
            // this.alert.ShowAlert("CloseNotImplementedYet", "info");
          }
        })

      }
    })
  }

  Close(id: any) {
    debugger
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('AreYouSureYouWillCancelThisActivityForTheClient'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.FollowUpService.CloseFollowUp(id).subscribe(res => {
          if (res) {
            this.alert.SaveSuccess();
            this.GetFollowUpList();
          }
          else {
            //  this.alert.ShowAlert("CloseNotImplementedYet", "info");
          }
        })

      }
    })
  }

  updateFavourite(ScreenId: number) {
    this.FollowUpService.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
  }

  getFavouriteStatus(screenId) {
    debugger
    this.FollowUpService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refresFollowUpArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const dueDate = new Date(x.dueDate).toLocaleDateString('ar-EG');
      return {
        'نوع المتابعة': x.followUpTypeName,
        'االعميل  / رقم الفرصة': x.relatedId,
        'الموضوع': x.description,
        'تاريخ و وقت التنفيذ': dueDate,
        'الموظف': x.convertedtoName,
        'الحالة': x.statusName,
      }
    });
  }

  refreshFollowUpEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const dueDate = new Date(x.dueDate).toLocaleDateString('en-EG');
      return {
        'Follow UpT ype': x.followUpTypeName,
        'Client / Opportunity Number': x.relatedId,
        'Subject': x.description,
        'Date And Time Of Implementation': dueDate,
        'Employeer': x.convertedtoName,
        'Status': x.statusName,
      }
    });
  }

  exportExcel(dt: any) {
    debugger
    import("xlsx").then(xlsx => {
      debugger
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
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

  exportPdf(dt: any) {
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [['الحالة', 'الموظف', 'تاريخ و وقت التنفيذ', 'الموضوع', 'االعميل  / رقم الفرصة', 'نوع المتابعة']]
    }
    else {
      head = [['Status', 'Employeer', 'Date And Time Of Implementation', 'Subject', 'Client / Opportunity Number', 'Follow Up Type']]
    }
    const rows: (number | string)[][] = [];



    this.Data.forEach(function (part, index) {

      const date1 = new Date(part.dueDate);
      const dueDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.followUpTypeName
      temp[1] = part.relatedId
      temp[2] = part.description
      temp[3] = dueDate
      temp[4] = part.convertedtoName
      temp[5] = part.statusName
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

    const Title = currentLang == "ar" ? "قائمه المتابعات" : "Follow-Up List";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url);
  }
}
