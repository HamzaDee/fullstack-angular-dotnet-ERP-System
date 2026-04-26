import { Component, OnInit, ViewChild } from '@angular/core';
import { AppSearchFormComponent } from 'app/views/general/app-searchs/app-search-form/app-search-form.component';
import { SalesRequestService } from '../sales-request.service'; 
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { SalessRequstSheetComponent } from '../saless-requst-sheet/saless-requst-sheet.component';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  providers: [DatePipe ,SalessRequstSheetComponent],
  selector: 'app-saless-reques-list',
  templateUrl: './saless-reques-list.component.html',
  styleUrls: ['./saless-reques-list.component.scss']
})
export class SalessRequesListComponent implements OnInit {
public showLoader: boolean;
@ViewChild(AppSearchFormComponent) childSearch:AppSearchFormComponent;
public Data: any[];
screenId:number = 43;
custom:boolean;
exportData: any[];
hidden:boolean = false;
public SalesList: any;
public TitlePage: string;
lang :string ;
  constructor( 
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private SalesRequestService: SalesRequestService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private SalessRequstSheetComponent: SalessRequstSheetComponent,
    private appEntryvouchersService: AppEntryvouchersService,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetSalesRequstList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SalesOrderList');
    this.title.setTitle(this.TitlePage);
  }

  formatCurrency(value: number, decimalPlaces : number): string {
    if(value == null)
       value = 0;
    return this.SalesRequestService.formatCurrency(value, decimalPlaces);
  }

  GetSalesRequstList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      


    this.showLoader = true;
    setTimeout(() => {
      this.SalesRequestService.getSalesRequstList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
  
        this.SalesList = result;
        if(currentLang == "ar"){
          this.refreshSalessRequesListArabic(this.SalesList);
         }
         else{
          this.refreshSalessRequesListEnglih(this.SalesList);
         } 


        this.showLoader = false;
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
          this.SalesList =result;
        });
      } else {
        console.error('childSearch is not defined!');
      }
    });
  }

  OpenDetailsForm(id){
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['SalesRequest/SalesRequestForm']);
  }

  AddSalesRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['SalesRequest/SalesRequestForm']);
  }

  EditSalesRequestForm(id: any){
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['SalesRequest/SalesRequestForm']);
  }

  CopySalesRequest(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['SalesRequest/SalesRequestForm']);
  }

  DeleteSalesRequest(id: any) {
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
         this.SalesRequestService.deleteSalesRequest(id).subscribe((result) => {
          debugger
          if (result.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetSalesRequstList();
          }
          else {
            if(result.isSuccess == false && result.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                return;
              }
              else
              {
                this.alert.DeleteFaild();
              }
            
            }
        }); 
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  AttachmentEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger      
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId : id, typeId : 31}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }


  handleSearchResult(result: any) {
    this.Data = result;
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

  refreshSalessRequesListArabic(data) {
    this.SalesList = data;
     this.exportData = this.SalesList.map((x) => {
     const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
     return {
      'نوع الفاتورة': x.transTypeName,
      'رقم الفاتورة ': x.voucherNo,
      'تاريخ الفاتورة': formattedDate,
      'العميل': x.dealerName,
      'المندوب': x.employeeName,
      'الفرع': x.branchName,
      'العملة': x.currencyName,
      'سعر الصرف': x.currRate,
      'المجموع': x.amount,
      'ملاحظات': x.note,
      'الحالة': x.statusName, 
     }
    }); 
  }

  refreshSalessRequesListEnglih(data) {
    this.SalesList = data;
    this.exportData = this.SalesList.map((x) => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
    return {
      'Bill Type': x.transTypeName,
      'Bill Number ': x.voucherNo,
      'Bill Date': formattedDate,
      'Client': x.dealerName,
      'Man': x.employeeName,
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
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const filteredData = this.SalesList.filter(r => r.status != 67);
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      //const totalAmount = this.SalesList.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      const totalValue = totalAmount;

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
       head = [['الحالة', 'ملاحظات ','المجموع' ,'سعر الصرف','العملة ', 'الفرع  ', 'المندوب ', 'العميل', 'تاريخ الفاتورة', 'رقم الفاتورة', 'نوع الفاتورة']]
    }
     else{
       head = [['Status','Notes','Total','Exchange Rate','Currency','Branch','Man','Client',' Bill Date','Bill Number','Bill Type']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

    const filteredData = this.SalesList.filter(part => part.status != 67);
    totalAmount = filteredData.reduce((sum, part) => sum + part.amount * part.currRate, 0);

    this.SalesList.forEach((part) => {
   
      const date = new Date(part.voucherDate);
      const formattedDate = currentLang === 'ar'
          ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
          : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.transTypeName;
      temp[1] = part.voucherNo;
      temp[2] = formattedDate;
      temp[3] = part.dealerName;
      temp[4] = part.employeeName;
      temp[5] = part.branchName;
      temp[6] = part.currencyName;
      temp[7] = part.currRate;
      temp[8] = part.amount;
      temp[9] = part.note;
      temp[10] = part.statusName;

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
      footRow[7] = "المجموع";
      footRow[8] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }
    else {
      footRow[7] = "Total";
      footRow[8] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ?"قائمة طلبات البيع " : "Asset Sales Invoice";
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

  Print(id){
  debugger
  this.SalessRequstSheetComponent.Print(id);
  }

  ConverToSalesInvoice(Id:any)
  {
    debugger
    var url='';
    this.routePartsService.GuidToEdit = Id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    url = `/SalesInvoices/SalesInvoicesForm?voucher=${Id}&Guid2ToEdit=Add&Guid3ToEdit=true`; 
    window.open(url,'_blank')
  }

  CalculateTotal()
  {
    if(this.SalesList){
      let data = this.SalesList.filter(r => r.status != 67)
      return this.formatCurrency(data.reduce((sum, item) => {item.amount * item.currRate
      return sum +  item.amount * item.currRate;
  }, 0),3);
}
  }

  PrintSalesRequest(id: number) {
    this.lang = this.jwtAuth.getLang();    
  if(this.lang == 'ar')
    {
      const reportUrl = `rptSalesRequestAR?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else      
    {
      const reportUrl = `rptSalesRequestEn?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
  
}
