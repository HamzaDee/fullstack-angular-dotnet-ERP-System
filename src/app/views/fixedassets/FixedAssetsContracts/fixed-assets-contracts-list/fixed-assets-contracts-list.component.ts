import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { FixedAssetsContractsService } from '../fixed-assets-contracts.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportServiceService } from '../../fa-reports/report-service.service';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { FixedAssetsContractsSheetComponent } from '../fixed-assets-contracts-sheet/fixed-assets-contracts-sheet.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { Title } from '@angular/platform-browser';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  providers: [DatePipe, FixedAssetsContractsSheetComponent],
  selector: 'app-fixed-assets-contracts-list',
  templateUrl: './fixed-assets-contracts-list.component.html',
  styleUrls: ['./fixed-assets-contracts-list.component.scss']
})
export class FixedAssetsContractsListComponent implements OnInit {
  public ContractsList: any;
  public showLoader: boolean;
  screenId: number;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  BillList: any;
  tabelData: any[];
  data: any[];
  cols: any[];
  HasPerm: boolean;
  public TitlePage: string;
  Lang: string;

  constructor(private routePartsService: RoutePartsService,
    private router: Router,
    private FixedAssetsContractsService: FixedAssetsContractsService,
    private reportServiceService: ReportServiceService,
    private alert: sweetalert,
    private translateService: TranslateService,
    private FixedAssetsContractsSheetComponent: FixedAssetsContractsSheetComponent,
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
    private title: Title,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetFixedAssetsContractsList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AssetsContractsList');
    this.title.setTitle(this.TitlePage);
  }

  GetFixedAssetsContractsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    debugger
    this.showLoader = true;
    setTimeout(() => {
      this.FixedAssetsContractsService.GetAssetsContractsHDList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.ContractsList = result;

        if (currentLang == "ar") {
          this.refreshYearlyDepreciationReportArabic(this.ContractsList);
        }
        else {
          this.refreshYearlyDepreciationReportEnglish(this.ContractsList);
        }

        this.showLoader = false;
      })
    }, 500);
  }

  ShowDetailsOnly(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['FixedAssetsContracts/FixedAssetsContractsForm']);
  }

  AddNewAssetsContracts(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['FixedAssetsContracts/FixedAssetsContractsForm']);
  }

  EditAssetsContracts(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['FixedAssetsContracts/FixedAssetsContractsForm']);
  }

  CopyContract(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['FixedAssetsContracts/FixedAssetsContractsForm']);
  }

  PostContract(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('msgConfirmPost'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.FixedAssetsContractsService.PostContract(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.ShowAlert('PostSuccess', 'success');
            this.GetFixedAssetsContractsList();
          }
          else if (result.isSuccess == false && result.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            this.alert.SaveFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  DeleteContract(id: any) {
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
        this.FixedAssetsContractsService.DeleteContract(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetFixedAssetsContractsList();
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

  Print(id) {
    debugger
    this.FixedAssetsContractsSheetComponent.Print(id);
  }

  Attachmentcontract(id: any) {
    this.routePartsService.GuidToEdit = id;

    debugger
    let title = this.translateService.instant('ContactAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      //height: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 3 }
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
    debugger
    this.FixedAssetsContractsService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.FixedAssetsContractsService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refreshYearlyDepreciationReportArabic(data) {
    this.ContractsList = data;
    this.exportData = this.ContractsList.map(x => {
      const formattedDate = new Date(x.contractDate).toLocaleDateString('ar-EG');
      return {
        'رقم العقد': x.contractNo,
        'تاريخ العقد ': formattedDate,
        'شركة الصيانة': x.dealerName,
        'الفرع': x.branchName,
        'العملة': x.currencyName,
        'سعر التحويل': x.currRate,
        'القيمة': x.amount,
        'ملاحظات': x.note,
        'الحالة': x.statusName,
      }
    });
  }

  refreshYearlyDepreciationReportEnglish(data) {
    this.ContractsList = data;
    this.exportData = this.ContractsList.map(x => {
      const formattedDate = new Date(x.contractDate).toLocaleDateString('en-GB');
      return {
        'Contracts Number': x.contractNo,
        'Contracts Date ': formattedDate,
        'Maintenance Company': x.dealerName,
        'Branch': x.branchName,
        'Currency': x.currencyName,
        'Conversion Price': x.currRate,
        'Amount': x.amount,
        'Notes': x.note,
        'Status': x.statusName,
      }
    });
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const filteredData = this.ContractsList.filter(r => r.status != 67);
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      //const totalAmount = this.ContractsList.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'القيمة';
      const totalHeaderEnglish = 'Amount';
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
      worksheet[valueCell] = { t: 'n', v: totalValue, z: '0.000' };

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
       head = [['الحالة', 'ملاحظات ', 'قيمة العقد', 'سعر التحويل ', 'العملة ', 'الفرع', 'شركة الصيانة', 'تاريخ العقد', 'رقم العقد']]
    }
    else {
       head = [['Status', 'Notes', 'Amount', 'Conversion Price', 'Currency', 'Branch', ' Maintenance Company', 'Contracts Date', 'Contracts Number']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

    const filteredData = this.ContractsList.filter(part => part.status != 67);
    totalAmount = filteredData.reduce((sum, part) => sum + part.amount * part.currRate, 0);

    this.ContractsList.forEach((part) => {

      const date = new Date(part.contractDate);
      const formattedDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[1] = part.contractNo;
      temp[2] = formattedDate;
      temp[3] = part.dealerName;
      temp[4] = part.branchName;
      temp[5] = part.currencyName;
      temp[6] = part.currRate;
      temp[7] = part.amount;
      temp[8] = part.note;
      temp[9] = part.statusName;

        //totalAmount += part.amount * part.currRate; // Accumulate total (make sure amount is a number)
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // reverse to match header order
    });

    // Prepare footer row (reverse the order like rows)
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); // assuming 10 columns
    let foot;

    if (currentLang == "ar") {
      footRow[5] = "المجموع";
      footRow[6] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }
    else {
      footRow[5] = "Total";
      footRow[6] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة عقد صيانة أصل  " : "Assets Maintenance Contracts";
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
    if (this.ContractsList) {
      let data = this.ContractsList.filter(r => r.status != 67)
      return this.formatCurrency(data.reduce((sum, item) => {
        item.amount * item.currRate
        return sum + item.amount * item.currRate;
      }, 0), 3);
    }
  }


  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appCommonserviceService.formatCurrency(value, decimalPlaces);
  }

  PrintAssetsContracts(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptAssetsContractsAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptAssetsContractsEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
