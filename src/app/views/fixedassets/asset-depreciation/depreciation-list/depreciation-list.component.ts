import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AppSearchFormComponent } from 'app/views/general/app-searchs/app-search-form/app-search-form.component';
import { DeprecationServiceService } from '../deprecation-service.service';
import { SuppPaymentvoucherService } from 'app/views/app-payables/supplierpaymentvoucher/supplierpaymentvoucher.service';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import Swal from 'sweetalert2';
import { sweetalert } from 'sweetalert';
import { DatePipe } from '@angular/common';
import { DepreciationSheetComponent } from '../depreciation-sheet/depreciation-sheet.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  providers: [DatePipe ,DepreciationSheetComponent],
  selector: 'app-depreciation-list',
  templateUrl: './depreciation-list.component.html',
  styleUrls: ['./depreciation-list.component.scss']
})
export class DepreciationListComponent implements OnInit {
  public TitlePage: string;
  @ViewChild(AppSearchFormComponent)childSearch:AppSearchFormComponent;
  showLoader: boolean;
  exportData: any[];
  screenId:number = 32 ;
  custom:boolean;
  exportColumns: any[];
  DepreciationList: any;
  tabelData: any[];
  data: any[];
  Lang: string;
  constructor(private title: Title,
    private translateService: TranslateService,
    private router: Router,
    private DeprecationServiceService: DeprecationServiceService,
    private supPaymentvoucherService: SuppPaymentvoucherService,
    private routePartsService: RoutePartsService,
    private alert: sweetalert,
    private  DepreciationSheetComponent:DepreciationSheetComponent,
    private appCommonserviceService : AppCommonserviceService,
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAccVouchersHDList();
    // this.GetDeprecationList();
  }

  formatCurrency(value: number, decimalPlaces : number): string {
    return this.appCommonserviceService.formatCurrency(value, decimalPlaces);
  }

  GetAccVouchersHDList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    debugger
    this.showLoader = true;
    setTimeout(() => {
      this.DeprecationServiceService.GetSuppPaymentVoucherList().subscribe(result => {
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
          
          this.DepreciationList = result;

        if(currentLang == "ar"){
          this.refresDepreciationListArabic(this.DepreciationList);
         }
         else{
          this.refreshDepreciationListEnglish(this.DepreciationList);
         }   

        this.showLoader = false;
        if (this.childSearch) {
          const currentDate = new Date();
          if(result.length>0){
            this.childSearch.vTypeList = result[0].searchCriteriaModel.voucherTypeList2;
            this.childSearch.vStatusList = result[0].searchCriteriaModel.statusList;
            this.childSearch.vBranchList = result[0].searchCriteriaModel.userCompanyBranchList;
            this.childSearch.vcurrencyList = result[0].searchCriteriaModel.currencyModels;
            this.childSearch.vemployeeList = result[0].searchCriteriaModel.employeeModelList;           
          }
          this.childSearch.vfromVoucherNo = "";
          this.childSearch.vtoVoucherNo = "";          
          this.childSearch.vfromDate = currentDate;
          this.childSearch.vtoDate = currentDate;
          this.childSearch.vnote = "";                  
          this.childSearch.ngOnInit();
        } 
      })

        debugger
       if (this.childSearch) {
         this.childSearch.searchResultEvent.subscribe(result => {
           this.tabelData =result;
         });
       } 
 
    }, 500);
  }

  GetPaymentVoucherList() {
    debugger
    this.showLoader = true;
    setTimeout(() => {
      this.DeprecationServiceService.GetSuppPaymentVoucherList().subscribe(result => {
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
          
          this.DepreciationList = result; 

        debugger
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
      });
    });
    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        this.tabelData =result;
      });
    } else {
      console.error('childSearch is not defined!');
    }
  }

  AttachmentEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger      
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId : id, typeId : 14}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  AddNew(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Add';
    this.router.navigate(['/FixedAssetDepreciation/DepreciationForm']);
  }

  EditDescriptionFormPage(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['/FixedAssetDepreciation/DepreciationForm']);
  }

  openAssetDepreciationDetails(id){
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['FixedAssetDepreciation/DepreciationForm']);
  }

  CopyAssetDepreciation(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['FixedAssetDepreciation/DepreciationForm']);
  }

  PostEntryVoucher(id: any) {
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
         this.DeprecationServiceService.PostAssetDepreciation(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.ShowAlert('PostSuccess','success');
            this.GetAccVouchersHDList();
          }
          else if(result.isSuccess == false && result.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
            this.alert.SaveFaild()
          }
        }); 
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })            
  }

  DeleteAssetDepreciation(id: any) {
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
         this.DeprecationServiceService.deleteFixedAssetDepreciation(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetAccVouchersHDList();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
           
            this.alert.DeleteFaild();
            }
        }); 
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

   Print(id){
    debugger
    this.DepreciationSheetComponent.Print(id);
    } 

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ListOfAssetDepreciationNotes');
    this.title.setTitle(this.TitlePage);
  }
  
  handleSearchResult(result: any) {
    debugger
    this.DepreciationList = result;  
  }

  updateFavourite(ScreenId:number)
  {
    debugger
    this.supPaymentvoucherService.UpdateFavourite(ScreenId).subscribe(result => {
        this.getFavouriteStatus(this.screenId);               
    })        
  }

  getFavouriteStatus(screenId)
  {
    debugger
    this.supPaymentvoucherService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if(result)
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

  refresDepreciationListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
      'نوع السند': x.transTypeName,
      'رقم السند': x.voucherNo,
      'تاريخ السند': formattedDate,
      'احتساب الاهتلاك الشهري ': x.depreciationMonthName,
      ' الفرع ': x.branchName,
      'العمله': x.currencyName,
      'سعر الصرف': x.currRate,
      'المجموع': x.amount,
      'ملاحظات': x.note,
      'الحالة': x.statusName,
    }
    });
  }

  refreshDepreciationListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
      'Transaction Type': x.transTypeName,
      'Transaction Number': x.voucherNo,
      'Transaction Date': formattedDate,
      'Calculating Monthly Depreciation': x.depreciationMonthName,
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
      const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let head: string[][];

      if(currentLang == "ar"){
         head = [['الحالة',' ملاحظات','المجموع',' سعر الصرف','العمله',' الفرع',' احتساب الاهتلاك الشهري',' تاريخ السند',' رقم السند',' نوع السند']]    }
      else{
         head = [['Status','Notes','Total','Exchange Rate','Currency','Branch','Calculating Monthly Depreciation',' Transaction Date','Transaction Number','Transaction Type']]
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
     temp[0]= part.transTypeName
     temp[1]= part.voucherNo 
     temp[2]= formattedDate
     temp[3]= part.depreciationMonthName
     temp[4]= part.branchName 
     temp[5]= part.currencyName
     temp[6]= part.currRate
     temp[7]= part.amount
     temp[8]= part.note 
     temp[9]= part.statusName
  
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
  
      const Title = currentLang == "ar" ?  "مذكرة اهلاك أصول" : "Depreciation List"
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
    if(this.DepreciationList){
      let data = this.DepreciationList.filter(r => r.status != 67)
      return this.formatCurrency(data.reduce((sum, item) => {item.amount * item.currRate
      return sum +  item.amount * item.currRate;
  }, 0),3);
}
  }


  PrintFixedAssetDepreciation(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptFixedAssetDepreciationAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptFixedAssetDepreciationEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
