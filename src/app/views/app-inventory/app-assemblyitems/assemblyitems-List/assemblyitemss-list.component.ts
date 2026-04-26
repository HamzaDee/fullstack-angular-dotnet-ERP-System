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
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AssemblyitemsService } from '../assemblyitems.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-assemblyitemss-list',
  templateUrl: './assemblyitemss-list.component.html',
  styleUrl: './assemblyitemss-list.component.scss'
})
export class AssemblyitemssListComponent implements OnInit {
  // @ViewChild(InvSearchFormComponent)childSearch:InvSearchFormComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId:number = 226 ;
  custom:boolean;
  data: any[];
  Lang: string;
  isAssembley:boolean = true;

  constructor
  (
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private service: AssemblyitemsService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private appEntryvouchersService: AppEntryvouchersService,
    private readonly serv: AppCommonserviceService,
) {}

  ngOnInit(): void 
  {
    this.SetTitlePage();
    this.GetTransferStockVouchersList();
    this.getFavouriteStatus(this.screenId);
  }
  
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AssemblyitemsList');
    this.title.setTitle(this.TitlePage);
  }

  GetTransferStockVouchersList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.showLoader = true;
    setTimeout(() => {
      this.service.GetAssemblyItemsList(this.isAssembley).subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }

        this.tabelData = result;

        if(currentLang == "ar"){
          this.refreshItemsTransferVoucherArabic(this.tabelData);
         }
         else{
          this.refreshItemsTransferVoucherEnglish(this.tabelData);
         }   

        debugger
        this.showLoader = false;
        // if (this.childSearch) {
        //   const currentDate = new Date();
        //   this.childSearch.vTypeList = result[0].invSearchCriteriaModel.voucherTypeList2;
        //   this.childSearch.vStatusList = result[0].invSearchCriteriaModel.statusList;
        //   this.childSearch.vBranchList = result[0].invSearchCriteriaModel.userCompanyBranchList;
        //   this.childSearch.vfromVoucherNo = "";
        //   this.childSearch.vtoVoucherNo = "";          
        //   this.childSearch.vfromDate = currentDate;
        //   this.childSearch.vtoDate = currentDate;
        //   this.childSearch.vnote = "";                  
        //   this.childSearch.ngOnInit();
        // } else {
        //   console.error('childSearch is not defined!');
        // }        
      })
    });
  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;  
  }

  DeleteAssemblyItems(id: any) {
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
        this.service.DeleteVoucher(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetTransferStockVouchersList();
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
    this.router.navigate(['AssemblyItems/AssemblyitemsForm']);
  }

  AddAssemblyItems(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['AssemblyItems/AssemblyitemsForm']);
  }

  EditAssemblyItems(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['AssemblyItems/AssemblyitemsForm']);
  }
  
  CopyAssemblyItems(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['AssemblyItems/AssemblyitemsForm']);
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


  refreshItemsTransferVoucherArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
     return {
      'رقم السند': x.voucherNo,
      'تاريخ السند': formattedDate,
      'المادة المجمعه': x.itemName,
      'الوحده': x.unitName,
      'الكمية': x.qty,
      'المستودع': x.storeName,
    }
    });
  }

  refreshItemsTransferVoucherEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
    return {
      'Voucher Number': x.voucherNo,
      'Voucher Date': formattedDate,
      'Assembly Item': x.itemName,
      'Unit': x.unitName,
      'Quantity': x.qty,
      'Store': x.storeName,
    }
    });
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const filteredData = this.data.filter(r => r.status != 67);
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.qty), 0);
      //const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.qty), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'الكمية';
      const totalHeaderEnglish = 'Quantity';
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
       head = [[' المستودع','  الكمية',' الوحده',' المادة المجمعه',' تاريخ السند',' رقم السند']]    }
    else{
       head = [['Store','Quantity','Unit','Assembly Item',' Voucher Date','Voucher Number']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

      const filteredData = this.data.filter(part => part.status != 67);
      totalAmount = filteredData.reduce((sum, part) => sum + part.qty, 0);
  
      this.data.forEach((part) => {
  
      const date = new Date(part.voucherDate);
      const formattedDate = currentLang === 'ar'
          ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
          : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;


      let temp: (number | string)[] = [];
     temp[0]= part.voucherNo
     temp[1]= formattedDate 
     temp[2]= part.itemName
     temp[3]= part.unitName
     temp[4]= part.qty 
     temp[5]= part.storeName

     // totalAmount += part.qty; 
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); 
    });

  
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); 
    let foot;

    if (currentLang == "ar") {
      footRow[3] = "المجموع";
      footRow[4] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }
    else {
      footRow[3] = "Total";
      footRow[4] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = currentLang == "ar" ? "قائمة المواد المجمعة" : "Assembly Items List";
    let pageWidth = pdf.internal.pageSize.width;
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
      return this.formatCurrency(data.reduce((sum, item) => {item.qty
      return sum +  item.qty;
  }, 0),3);
}
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }

  PrintTransferStockVoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `rptTransferStockVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptTransferStockVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
