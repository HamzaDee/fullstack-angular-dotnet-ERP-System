import { Component } from '@angular/core';
import { RepairsOilChangeAndFuelRefillService } from '../repairs-oil-change-and-fuel-refill.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { CheckUpService } from '../../vehiclecheckup/checkup.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { RepairsOilChangeAndFuelRefillFormComponent } from '../repairs-oil-change-and-fuel-refill-form/repairs-oil-change-and-fuel-refill-form.component';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-repairs-oil-change-and-fuel-refill-list',
  templateUrl: './repairs-oil-change-and-fuel-refill-list.component.html',
  styleUrl: './repairs-oil-change-and-fuel-refill-list.component.scss'
})
export class RepairsOilChangeAndFuelRefillListComponent {
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


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private service: CheckUpService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private RepairsOilChangeAndFuelRefillService: RepairsOilChangeAndFuelRefillService) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetRepairsOilChangeAndFuelRefillList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('RepairsOilChangeAndFuelRefillList');
    this.title.setTitle(this.TitlePage);
  }

  GetRepairsOilChangeAndFuelRefillList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.RepairsOilChangeAndFuelRefillService.getRepairsOilChangeAndFuelRefillList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

        if (currentLang == "ar") {
          this.refresRepairsOilArabic(this.tabelData);
        }
        else {
          this.refreshRepairsOilEnglish(this.tabelData);
        }

        this.showLoader = false;
      });
    });
  }

  OpenRepairsOilChangeAndFuelRefillFormPopUp(id: number, crruntrow: any, opType: any, isNew?, isShow?) {

    let title = isNew ? this.translateService.instant('AddRepairsOil') : this.translateService.instant('modifiyRepairsOil');
    let dialogRef: MatDialogRef<any> = this.dialog.open(RepairsOilChangeAndFuelRefillFormComponent, {
      width: '1000px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, row: crruntrow, isNew, isShow, opType: opType, companyid: this.jwtAuth.getCompanyId(), GetRepairsOilChangeAndFuelRefillList: () => { this.GetRepairsOilChangeAndFuelRefillList() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  DeleteVehicle(id: any) {
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
        this.RepairsOilChangeAndFuelRefillService.deleteRepairsOilChangeAndFuelRefill(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetRepairsOilChangeAndFuelRefillList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
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

  CalculateTotal() {
    if (this.tabelData) {
      return this.tabelData.reduce((sum, item) => {
        item.amount
        return sum + item.amount;
      }, 0);
    }
  }

  Attachment(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 44 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  updateFavourite(ScreenId: number) {
    this.RepairsOilChangeAndFuelRefillService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    this.RepairsOilChangeAndFuelRefillService.GetFavouriteStatus(screenId).subscribe(result => {
      if (result) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refresRepairsOilArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم الالية': x.vehicleName,
        'رقم الفاتورة': x.billNo,
        ' التاريخ': voucherDate,
        ' المحل ': x.station,
        'برفقة السائق': x.driverName,
        'رقم العداد': x.odometerNo,
        ' الصيانة': x.maintenance,
        ' نوع الصيانة': x.maintenanceTypeName,
        'المبلغ': x.amount,
      }
    });
  }

  refreshRepairsOilEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-EG');
      return {
        'Mechanism Number': x.vehicleName,
        'Invoice Number': x.billNo,
        'Date': voucherDate,
        'Shop': x.station,
        'With The Driver': x.driverName,
        'Meter Number': x.odometerNo,
        'Maintenance': x.maintenance,
        'Maintenance Type': x.maintenanceTypeName,
        'The Amount': x.amount,
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
        this.refresRepairsOilArabic(exportSource);
      } else {
        this.refreshRepairsOilEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'المبلغ';
      const totalHeaderEnglish = 'The Amount'
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
       head = [['المبلغ', 'نوع الصيانة', 'الصيانة', 'رقم العداد', 'برفقة السائق', 'المحل', 'التاريخ', 'رقم الفاتورة', 'رقم الالية']]
    }
    else {
       head = [['The Amount', 'Maintenance Type', 'Maintenance', 'Meter Number', 'With The Driver', 'Shop', 'Date', 'Invoice Number', 'Mechanism Number']]
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

      const date1 = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.vehicleName
      temp[1] = part.billNo
      temp[2] = voucherDate
      temp[3] = part.station
      temp[4] = part.driverName
      temp[5] = part.odometerNo
      temp[6] = part.maintenance
      temp[7] = part.maintenanceTypeName
      temp[8] = part.amount

      totalAmount += part.amount;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });


    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot;

    if (currentLang == "ar") {
      footRow[7] = "المجموع";
      footRow[8] = totalAmount;
      foot = [footRow.reverse()];
    }
    else {
      footRow[7] = "Total";
      footRow[8] = totalAmount;
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "بيان الاصلاحات وغيار الزيت والوقود" : "Repairs Oil Change And Fuel Refill List";
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

}
