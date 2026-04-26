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
import { ProjectCustomsService } from '../projectcustoms.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-projcustomslist',
  templateUrl: './projcustomslist.component.html',
  styleUrl: './projcustomslist.component.scss'
})
export class ProjcustomslistComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 248;
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
      private service: ProjectCustomsService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private appEntryvouchersService: AppEntryvouchersService,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetProjectsCustomsList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProjectCustomsList');
    this.title.setTitle(this.TitlePage);
  }

  GetProjectsCustomsList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetProjectsCustomsList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

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

  DeleteProjectsCustoms(id: any) {
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
          this.service.DeleteProjectsCustoms(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetProjectsCustomsList();
              this.router.navigate(['ProjectCustoms/ProjectCustomsList']);
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
    this.router.navigate(['ProjectCustoms/ProjectCustomsForm']);
  }

  AddProjectCustomsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProjectCustoms/ProjectCustomsForm']);
  }

  EditProjectCustomsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProjectCustoms/ProjectCustomsForm']);
  }

  ProjectCustomsAttachment(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 49 }
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
      const receiptDate = new Date(x.receiptDate).toLocaleDateString('ar-EG');
      const arrivalDate = new Date(x.arrivalDate).toLocaleDateString('ar-EG');
      return {
        'المشروع': x.projectName,
        'الجهة المتبرعه': x.donorList,
        'رقم السند': x.voucherNo,
        'تاريخ الورود': receiptDate,
        'وارد من': x.incomingFrom,
        'نوع التلخيص ': x.clearanceType,
        'وسيلة الحمولة': x.transportType,
        'تاريخ الوصول': arrivalDate,
        'العدد': x.qty,
        'القيمة بالدينار': x.valueJOD,
        'القيمة بالدولار': x.valueUSD,
        'حالة التسديد': (x.paid === true || x.paid === 'true') ? 'مسددة' : 'غير مسددة',


      }
    });
  }

  refreshProjdeflistEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const receiptDate = new Date(x.receiptDate).toLocaleDateString('en-EG');
      const arrivalDate = new Date(x.arrivalDate).toLocaleDateString('en-EG');
      return {
        'Project Name': x.projectName,
        'Authority Donor': x.donorList,
        'Voucher Number': x.voucherNo,
        'Receipte Date': receiptDate,
        'Incoming From': x.incomingFrom,
        'Clearance Type': x.clearanceType,
        'Transport Type': x.transportType,
        'Arrival Date': arrivalDate,
        'Count': x.qty,
        'Cash Amount Dinar': x.valueJOD,
        'Cash Amount Dollar': x.valueUSD,
        'Payment Status': (x.paid === true || x.paid === 'true') ? 'Paid' : 'Unpaid',
      }
    });
  }

  exportExcel(dt: any) {
    debugger;
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
        this.refresProjdeflistArabic(exportSource);
      } else {
        this.refreshProjdeflistEnglish(exportSource);
      }


      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.valueJOD), 0);
      const totalValue = totalAmount.toFixed(2);

      const totalDollarValue = this.data.reduce((sum, item) =>
        sum + (parseFloat(item.valueUSD)), 0).toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      // التعرف على اللغة تلقائيًا
      const totalHeaderArabic = 'القيمة بالدينار';
      const totalHeaderEnglish = 'Cash Amount Dinar';

      const dollarHeaderArabic = 'القيمة بالدولار';
      const dollarHeaderEnglish = 'Cash Amount Dollar';
      const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
      const dollarHeader = isArabic ? dollarHeaderArabic : dollarHeaderEnglish;
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalColIndex = headers.indexOf(totalHeader);
      const dollarColIndex = headers.indexOf(dollarHeader);

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
      const dollarColLetter = getExcelColumnLetter(dollarColIndex);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      // مجموع "قيمة المشروع الكلية"
      const valueCell = totalColLetter + lastRow;
      worksheet[valueCell] = { t: 'n', v: parseFloat(totalValue) };

      // مجموع "القيمة بالدولار"
      const dollarValueCell = dollarColLetter + lastRow;
      worksheet[dollarValueCell] = { t: 'n', v: parseFloat(totalDollarValue) };

      // وضع عنوان "المجموع" في العمود الذي يسبق "قيمة المشروع الكلية"
      if (totalColIndex > 0) {
        const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
        const labelCell = labelColLetter + lastRow;
        worksheet[labelCell] = { t: 's', v: totalLabel };
      }

      // تحديث نطاق الورقة ليشمل الصف الجديد
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
      head = [['القيمة بالدولار', 'القيمة بالدينار', 'العدد', 'تاريخ الوصول ', 'وسيلة الحمولة', 'نوع التلخيص ', 'وارد من ', 'تاريخ الورود ', 'رقم السند', 'الجهة المتبرعه', 'المشروع']];
    } else {
      head = [['Cash Amount Dollar', 'Cash Amount Dinar', 'Count', 'Arrival Date', 'Transport Type', 'Clearance Type', 'Incoming From', 'Receipte Date', 'Voucher Number', 'Authority Donor', 'Project Name']];
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;
    let totalDollarAmount = 0;

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else {
      exportSource = this.data;
    }


    exportSource.forEach((part) => {
      const date1 = new Date(part.receiptDate);
      const receiptDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      const date2 = new Date(part.arrivalDate);
      const arrivalDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.projectName;
      temp[1] = part.donorList;
      temp[2] = part.voucherNo;
      temp[3] = receiptDate;
      temp[4] = part.incomingFrom;
      temp[5] = part.clearanceType;
      temp[6] = part.transportType;
      temp[7] = arrivalDate;
      temp[8] = part.qty;
      temp[9] = part.valueJOD;
      temp[10] = part.valueUSD;
      temp[11] = (part.paid === true || part.paid === 'true') ? 'Paid' : 'Unpaid';
      totalAmount += part.valueJOD;
      totalDollarAmount += part.valueUSD;

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
      footRow[10] = this.formatCurrency(totalDollarAmount, 3);
      foot = [footRow.reverse()];
    } else {
      footRow[8] = "Total";
      footRow[9] = this.formatCurrency(totalAmount, 3);
      footRow[10] = this.formatCurrency(totalDollarAmount, 3);
      foot = [footRow.reverse()];
    }

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? " قائمة التخليص الجمركي" : "Project Customs List";
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

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }

  CalculateTotal() {
    if (this.tabelData) {
      return this.formatCurrency(this.tabelData.reduce((sum, item) => {
        return sum + item.valueJOD;
      }, 0), 3);
    }
  }

  CalculateTotalDollar() {
    if (this.tabelData) {
      return this.formatCurrency(this.tabelData.reduce((sum, item) => {
        return sum + item.valueUSD;
      }, 0), 3);
    }
  }
}
