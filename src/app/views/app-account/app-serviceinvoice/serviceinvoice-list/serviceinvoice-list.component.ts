import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AppServiceInvoiceService } from '../serviceinvoice.service';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import { AppSearchFormComponent } from 'app/views/general/app-searchs/app-search-form/app-search-form.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';

@Component({
  selector: 'app-serviceinvoice-list',
  templateUrl: './serviceinvoice-list.component.html',
  styleUrls: ['./serviceinvoice-list.component.scss']
})
export class ServiceInvoiceListComponent implements OnInit {
  @ViewChild(AppSearchFormComponent) childSearch: AppSearchFormComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 60;
  custom: boolean;
  Lang: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private AppServiceInvoiceService: AppServiceInvoiceService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetServiceInvoiceList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ServiceInvoiceList');
    this.title.setTitle(this.TitlePage);
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.AppServiceInvoiceService.formatCurrency(value, decimalPlaces);
  }

  GetServiceInvoiceList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.AppServiceInvoiceService.GetServiceInvoiceList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.showLoader = false;

        if (currentLang == "ar") {
          this.refreshServiceInvoiceListReportTableArabic(this.tabelData);
        }
        else {
          this.refreshServiceInvoiceListReportTableEnglish(this.tabelData);
        }
        if (this.childSearch) {
          const currentDate = new Date();
          this.childSearch.vTypeList = result[0].searchCriteriaModel.voucherTypeList2;
          this.childSearch.vStatusList = result[0].searchCriteriaModel.statusList;
          this.childSearch.vBranchList = result[0].searchCriteriaModel.userCompanyBranchList;
          this.childSearch.vcurrencyList = result[0].searchCriteriaModel.currencyModels;
          this.childSearch.vemployeeList = result[0].searchCriteriaModel.employeeModelList;
          this.childSearch.vfromVoucherNo = "";
          this.childSearch.vtoVoucherNo = "";
          this.childSearch.vfromDate = currentDate;
          this.childSearch.vtoDate = currentDate;
          this.childSearch.vnote = "";
          this.childSearch.ngOnInit();
        } else {
          console.error('childSearch is not defined!');
        }
      })

      if (this.childSearch) {
        this.childSearch.searchResultEvent.subscribe(result => {
          this.tabelData = result;
        });
      } else {
        console.error('childSearch is not defined!');
      }

    });
  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
  }

  PostServiceInvoice(id: any) {
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
        this.AppServiceInvoiceService.PostServiceInvoice(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.ShowAlert('PostSuccess', 'success');
            this.GetServiceInvoiceList();
          }
          else {
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            this.alert.SaveFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  DeleteServiceInvoice(id: any) {
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
        this.AppServiceInvoiceService.DeleteServiceInvoice(id).subscribe((results) => {
          debugger
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else if (results.isSuccess == false && results.message == "CantDeleteThisVoucherRealtedToAnother") {
              this.alert.ShowAlert("CantDeleteThisVoucherRealtedToAnother", 'error');
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.GetServiceInvoiceList();
            }

          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenServiceInvoiceForm(id: any) {

    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.router.navigate(['ServicesInv/ServiceInvoiceForm']);
  }

  EditServiceInvoiceForm(id: any) {

    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['ServicesInv/ServiceInvoiceForm']);
  }

  CopyServiceInvoice(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['ServicesInv/ServiceInvoiceForm']);
  }

  ReverseServiceInvoice(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Reverse';
    this.router.navigate(['ServicesInv/ServiceInvoiceForm']);
  }

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['ServicesInv/ServiceInvoiceForm']);

  }

  AttachmentServiceInvoice(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      //height: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 1 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  refreshServiceInvoiceListReportTableArabic(data) {
    this.exportData = data;
    this.exportData = this.tabelData.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'نوع السند ': x.voucherTypeName,
        'رقم السند': x.voucherNo,
        'تاريخ السند': formattedDate,
        'العميل': x.custName,
        'المندوب': x.employeeName,
        'الفرع': x.branchName,
        'العملة': x.currencyName,
        'سعر الصرف': x.currRate,
        'المجموع': x.amount,
        ' ملاحظات': x.note,
        'الحالة': x.statusName,
      }
    });
  }

  refreshServiceInvoiceListReportTableEnglish(data) {
    this.exportData = data;
    this.exportData = this.tabelData.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Voucher Type': x.voucherTypeName,
        'Voucher No': x.voucherNo,
        'Voucher Date': formattedDate,
        'Customer': x.custName,
        'Representative': x.employeeName,
        'Branch': x.branchName,
        'Currency': x.currencyName,
        'Exchange Rate': x.currRate,
        'Total': x.amount,
        'Notes': x.note,
        'Status': x.statusName,
      }
    });
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const filteredData = this.tabelData.filter(r => r.status != 67);
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      //const totalAmount = this.tabelData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

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
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang == "ar") {
      var head = [['الحالة', 'ملاحظات', 'المجموع', 'سعر الصرف', 'العملة', 'الفرع ', 'المندوب', 'العميل', 'تاريخ السند', 'رقم السند', 'نوع السند']]
    }
    else {
      var head = [['Status', 'Notes', 'Total', 'Exchange Rate', 'Currency', 'Branch', 'Representative', 'Customer', 'Voucher Date', 'Voucher No', 'Voucher Type']]
    }

    var rows: (number | string)[][] = [];
    let totalAmount = 0;

    const filteredData = this.tabelData.filter(part => part.status != 67);
    totalAmount = filteredData.reduce((sum, part) => sum + part.amount * part.currRate, 0);

    this.tabelData.forEach(function (part, index) {

      const date = new Date(part.voucherDate);
      const formattedDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.voucherTypeName
      temp[1] = part.voucherNo
      temp[2] = formattedDate
      temp[3] = part.custName
      temp[4] = part.employeeName
      temp[5] = part.branchName
      temp[6] = part.currencyName
      temp[7] = part.currRate
      temp[8] = part.amount
      temp[9] = part.note
      temp[10] = part.statusName


      // totalAmount += part.amount * part.currRate;
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
      footRow[8] = totalAmount.toFixed(3); foot = [footRow.reverse()];
    }
    else {
      footRow[7] = "Total";
      footRow[8] = totalAmount.toFixed(3); foot = [footRow.reverse()];
    }

    const pdf = new jsPDF('l', null, 'a4', true);
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    pdf.setFont("Amiri");
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ? "  كشف   قائمة فواتير الخدمات  "
      : "Service Invoice List";

    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

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

  CalculateTotal() {
    if (this.tabelData) {
      let data = this.tabelData.filter(r => r.status != 67)
      return this.formatCurrency(data.reduce((sum, item) => {
        item.amount * item.currRate
        return sum + item.amount * item.currRate;
      }, 0), 3);
    }
  }

  PrintServiceInvoice(voucherId: number , Balance : number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptServiceInvoiceAR?VId=${voucherId}&Lang=${this.Lang}&Balance=${Balance}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');     
    }
    else {
      const reportUrl = `rptServiceInvoiceEN?VId=${voucherId}&Lang=${this.Lang}&Balance=${Balance}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
