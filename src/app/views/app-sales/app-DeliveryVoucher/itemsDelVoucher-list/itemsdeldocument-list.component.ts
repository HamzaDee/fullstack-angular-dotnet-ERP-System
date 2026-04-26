import { Component, OnInit, ViewChild } from '@angular/core';
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
import { DeliveryStockVoucherService } from '../itemsDel.service';
import { InvSearchFormComponent } from 'app/views/general/app-invSearch/inv-search-form.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-itemsdeldocument-list',
  templateUrl: './itemsdeldocument-list.component.html',
  styleUrls: ['./itemsdeldocument-list.component.scss']
})
export class ItemsdeldocumentListComponent implements OnInit {
@ViewChild(InvSearchFormComponent)child:InvSearchFormComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 197;
  voucherTypeEnum = 175;
  custom: boolean;
  data: any[];
  Lang: string;


  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private DelivService: DeliveryStockVoucherService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private appEntryvouchersService: AppEntryvouchersService,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetDeliveryItemsList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsDeliveryList');
    this.title.setTitle(this.TitlePage);
  }

  GetDeliveryItemsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.DelivService.GetDeliveryItemsVoucherList().subscribe(result => {
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        debugger
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresItemsdeldocumentListArabic(this.tabelData);
        }
        else {
          this.refreshItemsdeldocumentListEnglish(this.tabelData);
        }

        this.tabelData.forEach(element => {
          if (element.amount == null) {
            element.amount = 0;
          }

        });
        this.showLoader = false;


        debugger
        if (this.child) {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const firstDayOfYear = new Date(currentYear, 0, 1);
          this.child.vTypeList = result[0].invSearchCriteriaModel.voucherTypeList2;
          this.child.vStatusList = result[0].invSearchCriteriaModel.statusList;
          this.child.vBranchList = result[0].invSearchCriteriaModel.userCompanyBranchList;
          // this.childSearch.vcurrencyList = result[0].invSearchCriteriaModel.currencyModels;
          // this.childSearch.vemployeeList = result[0].invSearchCriteriaModel.employeeModelList;
          this.child.vfromVoucherNo = "";
          this.child.vtoVoucherNo = "";
          this.child.vfromDate = firstDayOfYear;
          this.child.vtoDate = currentDate;
          this.child.vnote = "";
          this.child.ngOnInit();
        } 
      })
    });
    
       if (this.child) {
        this.child.searchResultEvent.subscribe(result => {
          debugger
          this.tabelData =result;
        });
      } 
  }

  handleSearchResult(result: any) {

    this.tabelData = result;
  }

  DeleteDeliveryItems(Id) {

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
        this.DelivService.DeleteDeleviryItemsVoucher(Id).subscribe((result) => {

          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.GetDeliveryItemsList();
          }
          else {
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.ShowAlert(result.message, 'error');
            }

          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  ShowDetailsOnly(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['ItemsDeliveryVoucher/ItemsDeliveryForm']);
  }

  AddNewDeliveryItems(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ItemsDeliveryVoucher/ItemsDeliveryForm']);
  }

  EditDeliveryItems(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ItemsDeliveryVoucher/ItemsDeliveryForm']);
  }

  CopyDeliveryItems(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ItemsDeliveryVoucher/ItemsDeliveryForm']);
  }

  AttachmentDeliveryItems(id: any) {
    this.routePartsService.GuidToEdit = id;

    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 9 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {

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

  refresItemsdeldocumentListArabic(data) {

    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
     return {
      'نوع السند': x.voucherTypeName,
      'رقم التسليم': x.voucherNo,
      'تاريخ التسليم': formattedDate,
      'العميل': x.dealerName,
      'الفرع': x.branchName,
      'العملة': x.currencyName,
      'معامل التحويل': x.currRate,
      'المجموع': x.amount,
      'ملاحظات': x.note,
      'الحالة': x.statusName,
     }
    });
  }

  refreshItemsdeldocumentListEnglish(data) {
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
    return {
      'Voucher Type': x.voucherTypeName,
      'Delivery Number': x.voucherNo,
      'Delivery Date': formattedDate,
      'Client': x.dealerName,
      'Branch': x.branchName,
      'Currency ': x.currencyName,
      'Converion Factor': x.currRate,
      'Total': x.amount,
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
      const filteredData = this.data.filter(r => r.status != 67);
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      //const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
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
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['الحالة', 'ملاحظات', 'المجموع', ' معامل التحويل', 'العملة', 'الفرع', ' العميل', ' تاريخ التسليم', ' رقم التسليم', ' نوع السند']]
    }
    else {
       head = [['Status', 'Notes', 'Total', 'Converion Factor', 'Currency', 'Branch', 'Client', ' Delivery Date', 'Delivery Number', 'Voucher Type']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

    const filteredData = this.data.filter(part => part.status != 67);
    totalAmount = filteredData.reduce((sum, part) => sum + part.amount * part.currRate, 0);

    this.data.forEach((part) => {
   
      const date = new Date(part.voucherDate);
      const formattedDate = currentLang === 'ar'
          ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
          : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherTypeName
      temp[1] = part.voucherNo
      temp[2] = formattedDate
      temp[3] = part.dealerName
      temp[4] = part.branchName
      temp[5] = part.currencyName
      temp[6] = part.currRate
      temp[7] = part.amount
      temp[8] = part.note
      temp[9] = part.statusName

      //totalAmount += part.amount * part.currRate; 
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); 
    });

    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); 
    let foot;

    if (currentLang == "ar") {
      footRow[6] = "المجموع";
      footRow[7] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }
    else {
      footRow[6] = "Total";
      footRow[7] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ?"قائمة سندات التسليم  " : "Delivery Vouchers List";
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

  CalculateTotal()
  {
    if(this.tabelData){
      let data = this.tabelData.filter(r => r.status != 67)
      return this.formatCurrency(data.reduce((sum, item) => {item.amount * item.currRate
      return sum +  item.amount * item.currRate;
  }, 0),3);
}
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }

  PrintDeliveryItems(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptDeliveryItemsAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptDeliveryItemsEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
  
}