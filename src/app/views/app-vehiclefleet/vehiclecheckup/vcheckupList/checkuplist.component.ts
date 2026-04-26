import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import { CheckUpService } from 'app/views/app-vehiclefleet/vehiclecheckup/checkup.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-checkuplist',
  templateUrl: './checkuplist.component.html',
  styleUrl: './checkuplist.component.scss'
})
export class CheckuplistComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 237;
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
      private service: CheckUpService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private appEntryvouchersService: AppEntryvouchersService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetCheckUpList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Checkuplist');
    this.title.setTitle(this.TitlePage);
  }

  GetCheckUpList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetCheckUpList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

        if (currentLang == "ar") {
          this.refresCheckuplistArabic(this.tabelData);
        }
        else {
          this.refreshCheckuplistEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });
  }

  DeleteVolunteer(id: any) {
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
          this.service.DeleteCheckUps(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetCheckUpList();
              this.router.navigate(['CheckUp/Checkuplist']);
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
    this.router.navigate(['CheckUp/Checkupform']);
  }

  AddPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['CheckUp/Checkupform']);
  }

  OpenPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['CheckUp/Checkupform']);
  }

  formatAmount(amount: number, decimalPlaces: number = 3): string {
    return amount.toFixed(decimalPlaces);
  }

  updateFavourite(ScreenId: number) {
    debugger
    this.service.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.service.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refresCheckuplistArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const date = new Date(x.date).toLocaleDateString('ar-EG');
      return {
        'رقم الحركة': x.id,
        'رقم الالية': x.vehicleNo,
        'نوع الالية': x.vehicleType,
        'مصروفه على': x.vehicleDriver,
        'التاريخ': date,
        'مسؤول الصيانه': x.manitResponsible,
        'رئيس قسم الحركة': x.movementChief,
      }
    });
  }

  refreshCheckuplistEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const date = new Date(x.date).toLocaleDateString('en-EG');
      return {
        'Transaction Number': x.id,
        'Mechanism Number': x.vehicleNo,
        'Mechanism Type': x.vehicleType,
        'Expenses On': x.vehicleDriver,
        'Date': date,
        'Maintenance Resbonsible': x.manitResponsible,
        'Movement Chife': x.movementChief,
      }
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
        this.refresCheckuplistArabic(exportSource);
      } else {
        this.refreshCheckuplistEnglish(exportSource);
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
       head = [[' رئيس قسم الحركة ', 'مسؤول الصيانة', ' التاريخ', ' مصروفه على', ' نوع الالية', ' رقم الالية', ' نوع الحركة']]
    }
    else {
       head = [['Movement Chife', 'Maintenance Resbonsible', 'Date', 'Expenses On', 'Mechanism Type', 'Transaction Number', 'Transaction Number']]
    }

    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else {
      exportSource = this.data;
    }


    exportSource.forEach(function (part, index) {

      const date1 = new Date(part.date);
      const date = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.id
      temp[1] = part.vehicleNo
      temp[2] = part.vehicleType
      temp[3] = part.vehicleDriver
      temp[4] = date
      temp[5] = part.manitResponsible
      temp[6] = part.movementChief
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

    const Title = currentLang == "ar" ? "قائمة التفقد الأسبوعي" : "Checkup List" ;
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

  CalculateTotal() {
    if (this.tabelData) {
      return this.formatCurrency(this.tabelData.reduce((sum, item) => {
        return sum + item.totalVolunteerHours;
      }, 0), 3);
    }
  }


  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }

  // PrintIntpurchasereq(id: number) {
  //   this.lang = this.jwtAuth.getLang();  
  //   if(this.lang == 'ar')
  //     {
  //       const reportUrl = `RptIntpurchasereqAr?VId=${id}`;
  //       const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
  //       window.open(url, '_blank');
  //     }
  //     else
  //     {
  //       const reportUrl = `RptIntpurchasereqEn?VId=${id}`;
  //       const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
  //       window.open(url, '_blank');
  //     }
  // }


  PrintVolunteer(Id: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptVolunteerAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptVolunteerEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

}
