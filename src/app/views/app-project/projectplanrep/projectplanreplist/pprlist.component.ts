import { Component, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { PPRService } from '../projectplanrep.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-pprlist',
  templateUrl: './pprlist.component.html',
  styleUrl: './pprlist.component.scss'
})
export class PprlistComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 244;
  custom: boolean;
  data: any[] = [];
  lang: string;

  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private readonly translateService: TranslateService,
      private readonly alert: sweetalert,
      private readonly dialog: MatDialog,
      private readonly service: PPRService,
      private readonly routePartsService: RoutePartsService,
      private readonly router: Router,
      private readonly appEntryvouchersService: AppEntryvouchersService,
      private readonly serv: AppCommonserviceService,

    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetProjectsPlansRepList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProjectPlansRepList');
    this.title.setTitle(this.TitlePage);
  }

  GetProjectsPlansRepList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetProjectPlanRepList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

        if (this.tabelData.length > 0) {
          this.tabelData.forEach(element => {
            if (element.organisationsList != null && element.organisationsList != undefined && element.organisationsList != "") {
              element.accName = element.organisationsList;
            }
            else {
              element.accName = element.authorityName;
            }
          });
        }

        if (currentLang == "ar") {
          this.refresProjdeflistArabic(this.tabelData);
        }
        else {
          this.refreshProjdeflistEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });
  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    if (currentLang == "ar") {
      this.refresProjdeflistArabic(this.tabelData);
    }
    else {
      this.refreshProjdeflistEnglish(this.tabelData);
    }
  }

  DeleteProjectPlanRep(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    })
      .then((result) => {
        if (result.value) {
          this.service.DeleteProjectsPlansRep(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetProjectsPlansRepList();
              this.router.navigate(['ProjectPlanRep/ProjectPlansRepList']);
            }
            else if (!results.isSuccess && results.message === "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.DeleteFaild()
            }
          });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log('Delete action was canceled.');
        }
      })
  }

  OpenProjectPlanRepForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['ProjectPlanRep/ProjectPlansRepForm']);
  }

  AddProjectPlanRepForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProjectPlanRep/ProjectPlansRepForm']);
  }

  EditProjectPlanRepForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProjectPlanRep/ProjectPlansRepForm']);
  }

  ProjectPlanRepAttachment(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 48 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  formatAmount(amount: number, decimalPlaces: number = 3): string {
    return amount.toFixed(decimalPlaces);
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

  getFavouriteStatus(screenId)
  {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if(result.isSuccess)
      {
        this.custom = true;
      }
      else
      {
        this.custom = false;
      }
      debugger             
    })        
  }
       
  refresProjdeflistArabic(data) {
    debugger
      this.exportData = data.map(x => {
      const pprDate = new Date(x.pprDate).toLocaleDateString('ar-EG');
      return {
      'المشروع': x.projectName,
      ' المندوب': x.representedName,
      'اسم السائق': x.driverName,
      ' العلاقات ': x.relationShips,
      'اسم الجمعية ': x.accName,
      'اليوم': x.weekDay,
      'التاريخ': pprDate
      };
    });
  }

  refreshProjdeflistEnglish(data) {
    this.exportData = data.map(x => {
      const pprDate = new Date(x.pprDate).toLocaleDateString('en-EG');
      return {
      'Project Number': x.projectName,
      'Man': x.representedName,
      'Driver Name': x.driverName,
      'Relationships': x.relationShips,
      'Association Name': x.accName,
      'WeekDay': x.weekDay,
      'Date': pprDate,
      };
    });
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresProjdeflistArabic(exportSource);
      } else {
        this.refreshProjdeflistEnglish(exportSource);
      }


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
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
        head = [['التاريخ','اليوم', 'اسم الجمعية ', 'العلاقات', 'اسم السائق', ' المندوب', 'المشروع']]    }
    else {
        head = [['Date','WeekDay',  'Association Name',  'Relationships', 'Driver Name','Man', 'Project Number']]    
    }
    const rows: (number | string)[][] = [];

    let exportSource: any[];

    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else {
      exportSource = this.data;
    }
    exportSource.forEach(function (part, index) {
        
      const date1 = new Date(part.pprDate);
      const pprDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.projectName
      temp[1] = part.representedName
      temp[2] = part.driverName
      temp[3] = part.relationShips
      temp[4] = part.accName
      temp[5] = part.weekDay
      temp[6] = pprDate

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

    const Title = currentLang == "ar" ?"قائمة تقرير مندوب التوزيع":"Project Plans Report List";
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

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }
}
