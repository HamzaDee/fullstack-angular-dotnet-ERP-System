import { Component, OnInit,ViewChild } from '@angular/core';
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
import { AppSearchFormComponent } from 'app/views/general/app-searchs/app-search-form/app-search-form.component';
import { PurchaseRequestService } from '../purchaserequest.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-purchaserequest-list',
  templateUrl: './purchaserequest-list.component.html',
  styleUrls: ['./purchaserequest-list.component.scss']
})
export class PurchaserequestListComponent implements OnInit {
  @ViewChild(AppSearchFormComponent) childSearch:AppSearchFormComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId:number = 156 ;
  custom:boolean;
  data: any[];
  hideGet:boolean= true;
  hideGet2:boolean=true;
  hideRecieptVoucher:boolean=true;
 // Invoice Cycle Setting 
 salesCycle: number;
 sCycle1: number;
 sCycle2: number;
 sCycle3: number;
 sCycle4: number;
 sCycle5: number;
 sCycle6: number;
 purchaseCucleCycle: number;
 pCycle1: number;
 pCycle2: number;
 pCycle3: number;
 pCycle4: number;
 hideGetFromPurchaseOrder: boolean;
 hideGetFromRecieptVoucher: boolean;
 //End
 lang:string;
 CostingDecimalPlaces:number;

  constructor
            (
              private title: Title,
              private jwtAuth: JwtAuthService,
              private translateService: TranslateService,
              private alert: sweetalert,
              private dialog: MatDialog,
              private PRService: PurchaseRequestService,
              private routePartsService: RoutePartsService,
              private router: Router,
              private appEntryvouchersService: AppEntryvouchersService,
              private readonly serv: AppCommonserviceService,
            ) { }

  ngOnInit(): void 
  {
    this.SetTitlePage();
    this.GetEntryVouchersList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PurchaseRequestList');
    this.title.setTitle(this.TitlePage); 
  }

  GetEntryVouchersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.PRService.GetPurchaseRequestList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
        this.tabelData = result;
        if(this.tabelData.length > 0)
          {
            this.CostingDecimalPlaces = this.tabelData[0].costingDecimalPlaces;
          }
        if(currentLang == "ar"){
          this.refresPurchaserequestArabic(this.tabelData);
         }
         else{
          this.refreshPurchaserequestEnglish(this.tabelData);
         } 

        this.showLoader = false;
      debugger
      if(result.length>0){
        this.salesCycle =result[0].invoiceCycleSetting.salesWorkCycle;
        this.sCycle1 = result[0].invoiceCycleSetting.salesCycle1;
        this.sCycle2 = result[0].invoiceCycleSetting.salesCycle2;
        this.sCycle3 = result[0].invoiceCycleSetting.salesCycle3;
        this.sCycle4 = result[0].invoiceCycleSetting.salesCycle4;
        this.sCycle5 = result[0].invoiceCycleSetting.salesCycle5;
        this.sCycle6 = result[0].invoiceCycleSetting.salesCycle6;
        this.purchaseCucleCycle = result[0].invoiceCycleSetting.purchaseWorkCycle;
        this.pCycle1 = result[0].invoiceCycleSetting.purchasseCycle1;
        this.pCycle2 = result[0].invoiceCycleSetting.purchasseCycle2;
        this.pCycle3 = result[0].invoiceCycleSetting.purchasseCycle3;
        this.pCycle4 = result[0].invoiceCycleSetting.purchasseCycle4;     
      }

      if(this.purchaseCucleCycle != this.pCycle1)
      {
        this.hideGet2=true;
      }
      else{
        this.hideGet2=false;
      }
      if(this.purchaseCucleCycle == this.pCycle2)
      {
        this.hideGet=false;
      }

      // if(this.purchaseCucleCycle == this.pCycle1 || this.purchaseCucleCycle == this.pCycle3)
      // {
      //   this.hideGet2=false;
      // }
        
      if (this.childSearch && result.length>0) {
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
      }

        debugger
      })
    });
    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        this.tabelData =result;
      });
    }
  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
  }

  DeleteVoucher(id: any) {
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
        this.PRService.DeleteVoucher(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetEntryVouchersList();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })      
  }

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['PurchaseRequest/PurchaseRequestForm']);
  }

  AddPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['PurchaseRequest/PurchaseRequestForm']);
  }

  OpenPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['PurchaseRequest/PurchaseRequestForm']);
  }
  
  CopyPurRequest(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['PurchaseRequest/PurchaseRequestForm']);
  }

  AttachmentEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger      
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      //height: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId : id, typeId : 5}
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
    return amount.toFixed(this.CostingDecimalPlaces);
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

  OpenReceiptVoucherForm(voucher) {
    this.routePartsService.GuidToEdit = voucher;
    debugger
    // Construct the URL you want to navigate to
    const url = `/ReceiptItemsVoucher/AddInvVoucher?voucher=${voucher}`;
  
    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  OpenPurchaseInvoiceForm(voucher: number) {
    this.routePartsService.GuidToEdit = voucher;
  debugger
    // Construct the URL you want to navigate to
    const url = `/PurchaseInvoice/PurchaseInvoiceForm?voucher=${voucher}`;
  
    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  refresPurchaserequestArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
    return {
      'نوع السند': x.voucherName,
      'رقم السند': x.voucherNo,
      'تاريخ السند': formattedDate,
      'المورد': x.dealerName,
      'الفرع': x.branchName,
      'العمله': x.currencyName,
      'سعر الصرف': x.currRate,
      'المجموع': x.amount,
      'ملاحظات': x.note,
      'حالة الاستلام': x.receiptStatus,
      'الحالة': x.statusName,
    }
    });
  }

  refreshPurchaserequestEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
    return {
      'Voucher Type': x.transTypeName,
      'Voucher Number': x.voucherNo,
      'Voucher Date': formattedDate,
      'Supplier': x.dealerName,
      'Branch': x.branchName,
      'Currency': x.currencyName,
      'Exchange Rate': x.currRate,
      'Total': x.amount,
      'Notes': x.note,
      'Recipt Status': x.receiptStatus,
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

    if(currentLang == "ar"){
       head = [['الحالة',' حالة الاستلام','ملاحظات',' المجموع',' سعر الصرف','العمله',' الفرع',' المورد',' تاريخ السند',' رقم السند',' نوع السند']]    }
    else{
       head = [['Status','Recipt Status','Notes','Total','Exchange Rate','Currency','Branch','Supplier',' Voucher Date','Voucher Number','Voucher Type']]
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
     temp[0]= part.voucherName
     temp[1]= part.voucherNo 
     temp[2]= formattedDate
     temp[3]= part.dealerName
     temp[4]= part.branchName 
     temp[5]= part.currencyName
     temp[6]= part.currRate
     temp[7]= part.amount
     temp[8]= part.note 
     temp[9]= part.receiptStatus
     temp[10]= part.statusName

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

    const Title = currentLang == "ar" ?"قائمة طلبات الشراء" : "Purchase Request List";
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
  }, 0),this.CostingDecimalPlaces);
}
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }

  PrintPurchaseRequest(id: number) {
    this.lang = this.jwtAuth.getLang();  
    if(this.lang == 'ar')
      {
        const reportUrl = `RptPurchaseRequestAr?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else
      {
        const reportUrl = `RptPurchaseRequestEn?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
  }
}
