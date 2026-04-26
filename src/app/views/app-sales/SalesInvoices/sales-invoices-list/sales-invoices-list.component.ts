import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { SalesInvoicesService } from '../sales-invoices.service';
import { SalesSarchFormComponent } from '../../app-SalesSearch/sales-sarch-form/sales-sarch-form.component';
import Swal from 'sweetalert2';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import * as FileSaver from 'file-saver';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-sales-invoices-list',
  templateUrl: './sales-invoices-list.component.html',
  styleUrls: ['./sales-invoices-list.component.scss']
})
export class SalesInvoicesListComponent implements OnInit {
  @ViewChild(SalesSarchFormComponent)childSearch:SalesSarchFormComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  public Data: any[];
  public showLoader: boolean;
  public screenId:number = 172 ;
  voucherTypeEnum :number = 44
  exportData: any[];
  exportColumns: any[];
  custom:boolean;
  data: any[];
  lang:string;
  // Invoice Cycle Setting 
  salesCycle: number;
  sCycle1: number;
  sCycle2: number;
  sCycle3: number;
  sCycle4: number;
  sCycle5: number;
  sCycle6: number;
  HideStatus : boolean = true;
  //End
constructor(
  private title: Title,
  private jwtAuth: JwtAuthService,
  private translateService: TranslateService,
  private alert: sweetalert,
  private dialog: MatDialog,
  private salesInvoicesService: SalesInvoicesService,
  private routePartsService: RoutePartsService,
  private router: Router,
  private appEntryvouchersService: AppEntryvouchersService,
  private readonly serv: AppCommonserviceService,
) {}

  ngOnInit(): void 
  {
    this.SetTitlePage();
    this.GetSalesInvoiceList();
    this.getFavouriteStatus(this.screenId);
  }


  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SalesInvoicesList');
    this.title.setTitle(this.TitlePage); 
  }

  GetSalesInvoiceList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.showLoader = true;
    setTimeout(() => {
      this.salesInvoicesService.GetSalesInvoiceList(this.voucherTypeEnum).subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
  
        this.tabelData = result;
        if(result.length > 0)
          {
            debugger
            this.salesCycle = result[0].invoiceCycleSetting.salesWorkCycle;
            this.sCycle1 = result[0].invoiceCycleSetting.salesCycle1;
            this.sCycle2 = result[0].invoiceCycleSetting.salesCycle2;
            this.sCycle3 = result[0].invoiceCycleSetting.salesCycle3;
            this.sCycle4 = result[0].invoiceCycleSetting.salesCycle4;
            this.sCycle5 = result[0].invoiceCycleSetting.salesCycle5;
            this.sCycle6 = result[0].invoiceCycleSetting.salesCycle6;    
            if(this.salesCycle == this.sCycle5 ||this.salesCycle ==  this.sCycle6 )
              {
                this.HideStatus = false;
              } 
            else
              {
                this.HideStatus = true;
              }       
          }
        if(currentLang == "ar"){
          this.refresSalesInvoiceArabic(this.tabelData);
         }
         else{
          this.refreshSalesInvoiceEnglish(this.tabelData);
         }   

        this.tabelData.forEach(element => {
          if(element.amount == null)
          {
            element.amount =0;
          }
          
        });
        this.showLoader = false;
debugger
if(result.length > 0 )
{
  if (this.childSearch) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const firstDayOfYear = new Date(currentYear, 0, 1);
    this.childSearch.vTypeList = result[0].searchCriteriaModel.voucherTypeList2;
    this.childSearch.vStatusList = result[0].searchCriteriaModel.statusList;
    this.childSearch.vBranchList = result[0].searchCriteriaModel.userCompanyBranchList;
     this.childSearch.vcustomersList = result[0].searchCriteriaModel.customersList;
    // this.childSearch.vemployeeList = result[0].searchCriteriaModel.employeeModelList;
    this.childSearch.vfromVoucherNo = "";
    this.childSearch.vtoVoucherNo = "";          
    this.childSearch.vfromDate = firstDayOfYear;
    this.childSearch.vtoDate = currentDate;
    this.childSearch.vnote = "";                  
    this.childSearch.ngOnInit();
  } 
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

  PostSalesInvoice(Id,voucherTypeId,voucherNo) {
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
        this.salesInvoicesService.PostSalesInvoice(Id,voucherTypeId,voucherNo).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.ShowAlert('PostSuccess','success');
            this.GetSalesInvoiceList();
          }
          else {
            if(result.isSuccess == false && result.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                return;
              }
              else
              {
                this.alert.SaveFaild()
              }
            
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })            
  }

  DeleteSalesInvoice(Id,voucherTypeId,voucherNo) {
    debugger
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
        this.salesInvoicesService.DeleteSalesInvoice(Id,voucherTypeId,voucherNo,this.voucherTypeEnum).subscribe((result) => {
          debugger
          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.GetSalesInvoiceList();
          }
          else {
            if(result.isSuccess == false && result.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                return;
              }
              else
              {
                this.alert.ShowAlert(result.message,'error');
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
    this.router.navigate(['SalesInvoices/SalesInvoicesForm']);
  }

  AddNewSalesInvoice(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['SalesInvoices/SalesInvoicesForm']);
  }

  EditSalesInvoice(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['SalesInvoices/SalesInvoicesForm']);
  }
  
  CopySalesInvoice(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['SalesInvoices/SalesInvoicesForm']);
  }

  AttachmentSalesInvoice(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger      
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId : id, typeId : 10}
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

  refresSalesInvoiceArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
     return {
      'نوع السند': x.voucherName,
      'رقم السند': x.voucherNo,
      'تاريخ السند': formattedDate,
      'الفرع': x.branchName,
      'العميل': x.dealerName,
      'المستودع': x.storeName,
      'ملاحظات': x.note,
      'القيمة': x.amount,
      'الحالة': x.statusName,
    }
    });
  }

  refreshSalesInvoiceEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
    return {
      'Voucher Type': x.voucherName,
      'Voucher Number': x.voucherNo,
      'Voucher Date': formattedDate,
      'Branch': x.branchName,
      'Client': x.dealerName,
      'Store ': x.storeName,
      'Notes': x.note,
      'Value': x.amount,
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
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      //const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'القيمة';
      const totalHeaderEnglish = 'Value';
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
       head = [['الحالة','القيمة',' ملاحظات','المستودع','العميل',' الفرع',' تاريخ السند',' رقم السند',' نوع السند']]    }
    else{
       head = [['Status','Value','Store','Store','Client','Branch',' Voucher Date','Voucher Number','Voucher Type']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;


    const filteredData = this.data.filter(part => part.status != 67);
    totalAmount = filteredData.reduce((sum, part) => sum + part.amount, 0);

    this.data.forEach((part) => {
   
      const date = new Date(part.voucherDate);
      const formattedDate = currentLang === 'ar'
          ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
          : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;


      let temp: (number | string)[] = [];
     temp[0]= part.voucherName
     temp[1]= part.voucherNo 
     temp[2]= formattedDate
     temp[3]= part.branchName
     temp[4]= part.dealerName 
     temp[5]= part.storeName
     temp[6]= part.note
     temp[7]= part.amount
     temp[8]= part.statusName 

     // totalAmount += part.amount; 
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

    const Title = currentLang == "ar" ?"قائمة فواتير البيع" : "Sales Invoices List";
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

  PrintSalesInvoice(id: number) {
    this.lang = this.jwtAuth.getLang();  
    if(this.lang == 'ar')
      {
        const reportUrl = `rptSalesInvoiceAR?Id=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else
      {
        const reportUrl = `rptSalesInvoiceEn?Id=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
  }
}
