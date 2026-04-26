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
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { MaintOrderService } from '../maintorder.service';
import { MaintadvancedsearchComponent } from '../MaintenanceOrderAdvancedSearch/maintadvancedsearch.component';
import { ActivatedRoute } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-maintorderlist',
  templateUrl: './maintorderlist.component.html',
  styleUrl: './maintorderlist.component.scss'
})
export class MaintorderlistComponent implements OnInit {
  @ViewChild(MaintadvancedsearchComponent)childSearch:MaintadvancedsearchComponent;   
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 297;
  custom: boolean;
  lang: string;
  public pageType: number;
  data: any[] = [];
  isExternalSearch = false;

  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private readonly translateService: TranslateService,
      private readonly alert: sweetalert,
      private readonly dialog: MatDialog,
      private readonly service: MaintOrderService,
      private readonly routePartsService: RoutePartsService,
      private readonly router: Router,
      private readonly appEntryvouchersService: AppEntryvouchersService,
      private readonly route: ActivatedRoute,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    debugger
    this.route.data.subscribe(data => {
      const type = data['Type'];
      console.log('Route Type:', type);
      this.pageType = data['Type'];
    });

    this.SetTitlePage();
    this.GetProjectsList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Maintorderlist');
    this.title.setTitle(this.TitlePage);
  }


  GetProjectsList() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      this.service.GetMaintenanceOrdersList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }

        this.showLoader = false;
        this.tabelData = result;
        this.data = result;
        debugger
        if (result.length > 0) {
          if (this.childSearch) {
            const currentDate = new Date();            
            this.childSearch.vStatusList = result[0].advancedSearch.statusList;
            this.childSearch.vRequestOrdersList = result[0].advancedSearch.requestOrdersList;
            this.childSearch.vMaintTypesList = result[0].advancedSearch.maintTypesList;
            this.childSearch.vPrioritiesList = result[0].advancedSearch.prioritiesList;
            this.childSearch.ngOnInit();
          }
        }

        this.tabelData.sort((a, b) => {
          return parseInt(b.projectNo) - parseInt(a.projectNo);
        });


        if (currentLang == "ar") {
          this.refresProjdeflistArabic(this.tabelData);
        }
        else {
          this.refreshProjdeflistEnglish(this.tabelData);
        }
      });
    });
    debugger
    // if (this.childSearch) {
    //   this.childSearch.searchResultEvent.subscribe(result => {
    //     this.tabelData = result
    //   });
    // }
  }

  handleSearchResult(result: any[] | null) {
    debugger;
    this.tabelData = result;
    if (result && result.length > 0) {
      this.tabelData = result;
      this.isExternalSearch = true;
    }
    else {
      // this.tabelData = this.data;
      this.isExternalSearch = false;;
    }

    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang === 'ar') {
      this.refresProjdeflistArabic(this.tabelData);
    } else {
      this.refreshProjdeflistEnglish(this.tabelData);
    }
  }

  DeleteMaintenanceOrder(id: any) {
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
          this.service.DeletemaintenanceVoucher(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetProjectsList();
              this.router.navigate(['MaintenanceOrder/Maintorderlist']);
            }
            else if (!results.isSuccess && results.message === "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              if (results.message == "msgRecordHasLinks") {
                this.alert.ShowAlert("msgRecordHasLinks", 'error')
              }
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
    this.routePartsService.Guid4ToEdit = this.pageType;
    this.router.navigate(['MaintenanceOrder/Maintorderform']);
  }

  AddProjectForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.routePartsService.Guid4ToEdit = this.pageType;
    this.router.navigate(['MaintenanceOrder/Maintorderform']);
  }

  EditProjectForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.routePartsService.Guid4ToEdit = this.pageType;
    this.router.navigate(['MaintenanceOrder/Maintorderform']);
  }

  ProjectAttachment(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 60 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
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

  refresProjdeflistArabic(data: any[]) {
    this.exportData = data.map(x => {
      const MaintDate = new Date(x.orderDate).toLocaleDateString('ar-EG');
      return {
        'رقم امر الصيانة': x.maintOrderNo,
        'تاريخ امر الصيانة': MaintDate,
        'نوع الطلب': x.maintType,
        'رقم طلب الصيانة': x.orderNo,
        'درجة الأهمية': x.prioirty,
        'الحالة': x.statusName,        
      };
    });
  }

  refreshProjdeflistEnglish(data: any[]) {
    this.exportData = data.map(x => {
      const MaintDate = new Date(x.orderDate).toLocaleDateString('en-EG');
      return {
        'Maintenance No': x.maintOrderNo,
        'Maintenance Date': MaintDate,
        'Order Type': x.maintType,
        'Requested Maintenance Order': x.orderNo,
        'Prioraty Dgree': x.prioirty,
        'Status': x.statusName,       
      };
    });
  }

  exportExcel(dt: any) {
    debugger;
    import("xlsx").then(xlsx => {
      debugger;

      const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (this.isExternalSearch) {
        exportSource = this.tabelData;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresProjdeflistArabic(exportSource);
      } else {
        this.refreshProjdeflistEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // // مجموع "قيمة المشروع الكلية"
      // const totalAmount = exportSource.reduce((sum, item) => sum + (Number(item.totalProjectAmount) || 0), 0);
      // const totalValue = totalAmount;

      // // مجموع "القيمة بالدولار"
      // const totalDollarValue = exportSource.reduce((sum, item) => {
      //   const amount = Number(item.totalProjectAmount) || 0;
      //   const rate = Number(item.dollarRate) || 1; 
      //   return sum + (amount / rate);
      // }, 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      // التعرف على اللغة تلقائيًا
      const totalHeaderArabic = 'قيمة المشروع الكلية';
      const totalHeaderEnglish = 'Total Project Amount';

      const dollarHeaderArabic = 'قيمة المشروع الكلية بالدولار';
      const dollarHeaderEnglish = 'Total Project Value Dollar ';
      const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
      // const dollarHeader = isArabic ? dollarHeaderArabic : dollarHeaderEnglish;
      // const totalLabel = isArabic ? 'المجموع' : 'Total';

      // const totalColIndex = headers.indexOf(totalHeader);
      // const dollarColIndex = headers.indexOf(dollarHeader);

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

      // const totalColLetter = getExcelColumnLetter(totalColIndex);
      // const dollarColLetter = getExcelColumnLetter(dollarColIndex);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      // مجموع "قيمة المشروع الكلية"
      // const valueCell = totalColLetter + lastRow;
      // worksheet[valueCell] = { t: 'n', v: parseFloat(totalValue) };

      // مجموع "القيمة بالدولار"
      // const dollarValueCell = dollarColLetter + lastRow;
      // worksheet[dollarValueCell] = { t: 'n', v: parseFloat(totalDollarValue) };

      // وضع عنوان "المجموع" في العمود الذي يسبق "قيمة المشروع الكلية"
      // if (totalColIndex > 0) {
      //   const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
      //   const labelCell = labelColLetter + lastRow;
      //   worksheet[labelCell] = { t: 's', v: totalLabel };
      // }

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
      head = [['الحالة', 'درجة الأهمية', 'رقم طلب الصيانة', 'نوع الطلب', 'تاريخ امر الصيانة', 'رقم امر الصيانة']];
    } else {
      head = [['Status', 'Prioraty Dgree', 'Requested Maintenance Order', 'Order Type', 'Maintenance Date', 'Maintenance No']];
    }

    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (this.isExternalSearch) {
      exportSource = this.tabelData;
    }
    else {
      exportSource = this.data;
    }

    let totalAmount = 0;
    let totalDollarAmount = 0;

    exportSource.forEach((part) => {      
      const date1 = new Date(part.orderDate);
      const maintDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.maintOrderNo;
      temp[1] = maintDate;
      temp[2] = part.maintType;
      temp[3] = part.orderNo;
      temp[4] = part.prioirty;
      temp[5] = part.statusName;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot;

    // if (currentLang == "ar") {
    //   footRow[6] = "المجموع";
    //   footRow[7] = this.formatCurrency(totalAmount, 3);
    //   footRow[8] = this.formatCurrency(totalDollarAmount, 3);
    //   foot = [footRow.reverse()];
    // } else {
    //   footRow[6] = "Total";
    //   footRow[7] = this.formatCurrency(totalAmount, 3);
    //   footRow[8] = this.formatCurrency(totalDollarAmount, 3);
    //   foot = [footRow.reverse()];
    // }

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة أوامر الصيانة" : "Maintenance Request List";
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
        return sum + item.totalProjectAmount;
      }, 0), 3);
    }
  }

  CalculateTotalDollar() {
    if (this.tabelData) {
      return this.formatCurrency(this.tabelData.reduce((sum, item) => {
        return sum + item.totalProjectAmount / item.dollarRate;
      }, 0), 3);
    }
  }

  SendtoServiceInvoice(Id: number) {
    debugger
    this.routePartsService.GuidToEdit = Id;
    
    // Construct the URL you want to navigate to
    const url = `/ServicesSalesInv/CustServiceSalesInvoiceForm?MaintId=${Id}`;
  
    // Open the URL in a new tab
    window.open(url, '_blank');
  }


    PrintMaintenanceOrder(id: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptMaintenanceOrderAR?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptMaintenanceOrderEN?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

}
