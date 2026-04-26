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
import { InvSearchFormComponent } from 'app/views/general/app-invSearch/inv-search-form.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { EntryService } from '../entryvoucher.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-entrvoucher-list',
  templateUrl: './entrvoucher-list.component.html',
  styleUrls: ['./entrvoucher-list.component.scss']
})
export class EntrvoucherListComponent implements OnInit {
  @ViewChild(InvSearchFormComponent)childSearch:InvSearchFormComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId:number = 135 ;
  voucherTypeEnum :number= 33;
  custom:boolean;
  data: any[];
  hidden:boolean=true;
  Lang: string;
  useStoreInGrid: boolean = false;

  constructor ( 
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private serv: EntryService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private AppEntryvouchersService: AppEntryvouchersService,
    private readonly serv1: AppCommonserviceService,
) {}

    ngOnInit(): void 
    {
      this.SetTitlePage();
      this.GetEntryVouchersList();
      this.getFavouriteStatus(this.screenId);
    }
  
    SetTitlePage() {
      this.TitlePage = this.translateService.instant('ItemsEntryVoucherList');
      this.title.setTitle(this.TitlePage);
    }
  
    GetEntryVouchersList() {
      debugger
      var currentLang = this.jwtAuth.getLang();
      const isArabic = currentLang === 'ar';      
  
      this.showLoader = true;
/*       setTimeout(() => {
 */
        this.serv.GetEntryVoucherList(this.voucherTypeEnum).subscribe(result => {
          debugger
          if(result.isSuccess == false && result.message ==="msNoPermission")
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }

          this.tabelData = result;
  
          if(currentLang == "ar"){
            this.refreshEntryvoucherlistArabic(this.tabelData);
            }
            else{
            this.refreshEntryvoucherlistEnglish(this.tabelData);
            }   
  
          debugger
          this.showLoader = false;
          if (this.childSearch) {
            const currentDate = new Date();
            const criteria = result[0]?.invSearchCriteriaModel;
            if (criteria) {
              this.useStoreInGrid = criteria.useStoreInGrid;
              this.childSearch.vTypeList = criteria.voucherTypeList2;
              this.childSearch.vStatusList = criteria.statusList;
              this.childSearch.vBranchList = criteria.userCompanyBranchList;
              this.childSearch.vfromVoucherNo = "";
              this.childSearch.vtoVoucherNo = "";
              this.childSearch.vfromDate = currentDate;
              this.childSearch.vtoDate = currentDate;
              this.childSearch.vnote = "";
              this.childSearch.ngOnInit();
            } 
          }        
        })
/*       }); */
    }
  
    handleSearchResult(result: any) {
      debugger
      this.tabelData = result;  
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
          this.serv.PostInvVoucher(id).subscribe((result) => {
            if (result.isSuccess) {
              this.alert.ShowAlert('PostSuccess','success');
              this.GetEntryVouchersList();
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
  
    DeleteInvVoucher(id: any) {
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
          this.serv.DeleteInvVoucher(id).subscribe((results) => {
            debugger
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetEntryVouchersList();
            }
            else if(results.isSuccess == false && results.message ==="msNoPermission"){
              {
                this.alert.ShowAlert("msNoPermission",'error');
                return;
              }}
            else {
              this.alert.ShowAlert(results.message,"Error")
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
      this.router.navigate(['EntryyVoucher/EntryyVoucherForm']);
    }
  
    AddEntryVoucherForm(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Add';
      this.routePartsService.Guid3ToEdit = false;
      this.router.navigate(['EntryyVoucher/EntryyVoucherForm']);
    }
  
    EditEntryVoucherForm(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Edit';
      this.routePartsService.Guid3ToEdit = false;
      this.router.navigate(['EntryyVoucher/EntryyVoucherForm']);
    }
    
    CopyEntryvoucher(id: any) {
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Copy';
      this.routePartsService.Guid3ToEdit = false;
      this.router.navigate(['EntryyVoucher/EntryyVoucherForm']);
    }
  
    AttachmentEntryvoucher(id: any) {
      this.routePartsService.GuidToEdit = id;
      debugger      
      let title = this.translateService.instant('VoucherAttachments');
      let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
        width: '720px',
        disableClose: false,
        direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
        data: { voucherId : id, typeId : 28}
      });
      dialogRef.afterClosed()
        .subscribe(res => {
          if (res !== null) {
            debugger
            // var newList = this.EntryVoucherAddForm.value.costCenterTranModelList.filter(item => item.index !== rowIndex);
            // newList = [...newList , ...res];
            // this.EntryVoucherAddForm.get("costCenterTranModelList").setValue(newList);
            // If user press cancel
            return;
          }
        })
    }
  
    updateFavourite(ScreenId: number) {
    this.serv1.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
        this.serv1.triggerFavouriteRefresh(); // 🔥 THIS is key
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
    }

    getFavouriteStatus(screenId)
    {
      debugger
      this.serv1.GetFavouriteStatus(screenId).subscribe(result => {
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

    PostInvVoucher(id: any) {
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
          this.serv.PostInvVoucher(id).subscribe((result) => {
            if (result.isSuccess) {
              this.alert.ShowAlert('PostSuccess','success');
              this.GetEntryVouchersList();
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

    refreshEntryvoucherlistArabic(data) {
      debugger
      this.data = data;
      this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
        return {
        'رقم السند': x.voucherNo,
        'نوع السند': x.voucherTypeName,
        'تاريخ السند': formattedDate,
        'الفرع': x.branchName,
        'المستودع': x.storeName,
        ' ملاحظات': x.note,
        'القيمة': x.amount,
        'الحالة': x.statusName,
        }
      });
    }
  
    refreshEntryvoucherlistEnglish(data) {
      debugger
      this.data = data;
      this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
        return {
        'Voucher Number': x.voucherNo,
        'Voucher Type': x.voucherTypeName,
        'Voucher Date': formattedDate,
        'Branch': x.branchName,
        'Store': x.storeName,
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
      const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let head: string[][];
      if (currentLang == "ar") {
         head = [['الحالة', ' القيمة', '  ملاحظات', 'المستودع', ' الفرع', ' تاريخ السند', ' نوع السند', ' رقم السند']]
      }
      else {
         head = [['Status', 'Value', 'Notes', 'Store', 'Branch', ' Voucher Date', 'Voucher Type', 'Voucher Number']]
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
        temp[0] = part.voucherNo
        temp[1] = part.voucherTypeName
        temp[2] = formattedDate
        temp[3] = part.branchName
        temp[4] = part.storeName
        temp[5] = part.note
        temp[6] = part.amount
        temp[7] = part.statusName
  
        //totalAmount += part.amount; 
        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp); 
      });
  
      const columnCount = head[0].length;
      let footRow: (string | number)[] = new Array(columnCount).fill('');
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
  
      let Title = currentLang == "ar" ? " قائمة سندات الأدخال" : "Entry Voucher List";
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
        return this.formatCurrency(data.reduce((sum, item) => {item.amount
        return sum +  item.amount;
    }, 0),3);
  }
    }
    
    formatCurrency(value: number, decimalPlaces: number): string {
      return this.AppEntryvouchersService.formatCurrency(value, decimalPlaces);
    }

    PrintEntryVoucher(voucherId: number) {
      debugger
      this.Lang = this.jwtAuth.getLang();
      if(this.Lang == "ar")
      { 
        const reportUrl = `rptEntryVoucherAR?VId=${voucherId}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else{ 
        const reportUrl = `RptEntryyVoucherEN?VId=${voucherId}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
    }
}
