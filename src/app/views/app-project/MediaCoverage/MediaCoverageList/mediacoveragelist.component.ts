import { Component, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { MediaCoverageService } from '../mediacoverage.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-mediacoveragelist',
  templateUrl: './mediacoveragelist.component.html',
  styleUrl: './mediacoveragelist.component.scss'
})
export class MediacoveragelistComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 281;
  custom: boolean;
  data: any[] = [];
  lang: string;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private service: MediaCoverageService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private appEntryvouchersService: AppEntryvouchersService,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetMediaCoverageList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Mediacoveragelist');
    this.title.setTitle(this.TitlePage);
  }

  GetMediaCoverageList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetMediaCoverageList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

        if (currentLang == "ar") {
          this.refresActivitylistArabic(this.tabelData);
        }
        else {
          this.refreshActivitylistEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });


  }

  DeleteMediaCoverage(id: any) {
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
          this.service.DeleteMediaCoverage(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetMediaCoverageList();
              this.router.navigate(['MediaCoverage/Mediacoveragelist']);
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

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['MediaCoverage/Mediacoverageform']);
  }

  AddMediaCoverage(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['MediaCoverage/Mediacoverageform']);
  }

  EditMediaCoverage(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['MediaCoverage/Mediacoverageform']);
  }

  ApproveMediaCoverage(id: any) {
    debugger
    if (id != null && id != undefined && id != 0) {
      this.service.ApproveMediaCoverage(id).subscribe((result) => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.GetMediaCoverageList();
          return;
        }
        if (result.isSuccess) {
          this.alert.ShowAlert("RequestApproved", "success");
          this.GetMediaCoverageList();
        }
        else {
          this.alert.SaveFaild();
        }
      });
    }
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

  refresActivitylistArabic(data) {
    debugger
    this.exportData = data.map(x => ({
      'رقم الفعاليه': x.eventNo,
      'اسم الفعاليه': x.eventName,
      'تاريخ ووقت الفعالية ': x.eventDateTime,
      'نوع الفعالية': x.eventTypeName,
      'طالب الفعالية': x.eventRequesterName,
      'الجهه المتبرعه': x.authorityName,
      'حالة الطلب ': x.statusName,
    }));
  }

  refreshActivitylistEnglish(data) {
    debugger
    this.exportData = data.map(x => ({
      'Even Number': x.eventNo,
      'Event Namee': x.eventName,
      'Date Time Event': x.eventDateTime,
      'Event Type': x.eventTypeName,
      'Event Requester': x.eventRequesterName,
      'Authority Donor': x.authorityName,
      'Order Status': x.statusName,
    }));
  }

  exportExcel(dt: any) {
    debugger
    import("xlsx").then(xlsx => {
      debugger;
     var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresActivitylistArabic(exportSource);
      } else {
        this.refreshActivitylistEnglish(exportSource);
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
       head = [['عدد المتطوعين الفعليين', ' عدد المتطوعين المطلوبين', ' مكان النشاط', ' تاريخ وقت التطوع الى', '  تاريخ وقت التطوع من', '  اسم النشاط التطوعي']]
    }
    else {
       head = [['Actual Volunteer', 'Requested Volunteer', 'Activity Location', 'Activity To Date', 'Activity From Date', 'Activity Name']]
    }

    var rows: (number | string)[][] = [];
    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else {
      exportSource = this.data;
    }

    exportSource.forEach((part) => {
      let temp: (number | string)[] = [];
      temp[0] = part.eventNo
      temp[1] = part.eventName
      temp[2] = part.eventDateTime
      temp[3] = part.eventTypeName
      temp[4] = part.eventRequesterName
      temp[5] = part.authorityName
      temp[5] = part.statusName
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة طلبات التغطية الأعلامية" : "List of Media Coverage Requests";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      showFoot: 'lastPage',
      headStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      bodyStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold'
      },
      footStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
        textColor: 'black'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }

  PrintMediaCoveraget(id: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    /* if (this.lang == 'ar') { */
      const reportUrl = `RptMediaCoveragetAr?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
/*     }
    else {
      const reportUrl = `RptMediaCoveragetEn?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    } */
  }

}
