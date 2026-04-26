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
import { VehicleFuelService } from '../vehicleFuel.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-vehiclefuellist',
  templateUrl: './vehiclefuellist.component.html',
  styleUrl: './vehiclefuellist.component.scss'
})
export class VehiclefuellistComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 239;
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
      private service: VehicleFuelService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private appEntryvouchersService: AppEntryvouchersService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetVehicleFuelList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('VehiclefuelList');
    this.title.setTitle(this.TitlePage);
  }

  GetVehicleFuelList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetVehicleFuelList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

        if (currentLang == "ar") {
          this.refresVehiclefuellistArabic(this.tabelData);
        }
        else {
          this.refreshVehiclefuellistEnglish(this.tabelData);
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
          this.service.DeleteRowVehicleFuel(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetVehicleFuelList();
              this.router.navigate(['VehicleFuel/VehiclefuelList']);
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
    this.router.navigate(['VehicleFuel/VehiclefuelForm']);
  }

  AddPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['VehicleFuel/VehiclefuelForm']);
  }

  OpenPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['VehicleFuel/VehiclefuelForm']);
  }

  Attachment(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 43 }
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

  refresVehiclefuellistArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const transFromDate = new Date(x.transFromDate).toLocaleDateString('ar-EG');
      const transToDate = new Date(x.transToDate).toLocaleDateString('ar-EG');
      return {
        'رقم الحركة': x.voucherNo,
        'اسم الالية': x.vehicleName,
        'رقم اللوحة': x.plateNo,
        'نوع الوقود': x.fuelType,
        'من تاريخ': transFromDate,
        'الى تاريخ': transToDate,
        'المسافه المقطوعه ': x.millage,
        'السعر ': x.price,
        'الكمية': x.qty,
        'المجموع': x.total,
      }
    });
  }

  refreshVehiclefuellistEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const transFromDate = new Date(x.transFromDate).toLocaleDateString('en-EG');
      const transToDate = new Date(x.transToDate).toLocaleDateString('en-EG');
      return {
        'Transaction Number': x.voucherNo,
        'Mechanism Name': x.vehicleName,
        'Plate Number': x.plateNo,
        'Fuel Type': x.fuelType,
        'From Date': transFromDate,
        'To Date': transToDate,
        'Distance Traveled': x.millage,
        'Price': x.price,
        'Quantity': x.qty,
        'Total': x.total,
      }
    });
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
        this.refresVehiclefuellistArabic(exportSource);
      } else {
        this.refreshVehiclefuellistEnglish(exportSource);
      }
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.total), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'المجموع';
      const totalHeaderEnglish = 'Total';
      const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalColIndex = headers.indexOf(totalHeader);

      function getExcelColumnLetter(colIndex: number): string {
        let dividend = colIndex + 1;
        let columnName = '';
        let modulo;
        while (dividend > 0) {
          modulo = (dividend - 1) % 26;
          columnName = String.fromCharCode(65 + modulo) + columnName;
          dividend = Math.floor((dividend - modulo) / 26);
        }
        return columnName;
      }

      const totalColLetter = getExcelColumnLetter(totalColIndex);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      const valueCell = totalColLetter + lastRow;
      worksheet[valueCell] = { t: 'n', v: parseFloat(totalValue) };

      if (totalColIndex > 0) {
        const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
        const labelCell = labelColLetter + lastRow;
        worksheet[labelCell] = { t: 's', v: totalLabel };
      }

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

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
       head = [['المجموع', ' الكمية', ' السعر ', 'المسافه المقطوعه', ' الى تاريخ', ' من تاريخ', 'نوع الوقود', ' رقم اللوحة', ' اسم الالية', ' رقم الحركة']]
    }
    else {
       head = [['Total', 'Quantity', 'Price', 'Distance Traveled', 'Transaction Date', 'Fuel Type', 'Plate Number', 'Mechanism Name', 'Transaction Number']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

   let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else {
      exportSource = this.data;
    }

    exportSource.forEach((part) => {

      const date1 = new Date(part.transFromDate);
      const transFromDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.transToDate);
      const transToDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo
      temp[1] = part.vehicleName
      temp[2] = part.plateNo
      temp[3] = part.fuelType
      temp[4] = transFromDate
      temp[5] = transToDate
      temp[6] = part.millage
      temp[7] = part.price
      temp[8] = part.qty
      temp[9] = part.total

      totalAmount += part.total;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });


    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot;

    if (currentLang == "ar") {
      footRow[8] = "المجموع";
      footRow[9] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }
    else {
      footRow[8] = "Total";
      footRow[9] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة وقود المركبات" : "Vehicle Fuel List";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      foot: foot,
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


  CalculateTotal() {
    if (this.tabelData) {
      return this.formatCurrency(this.tabelData.reduce((sum, item) => {
        return sum + item.total;
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
}
