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
import { ProjectDefinitionService } from '../projDef.service';
import { AppProjectDefinitionAdvancedSearchComponent } from 'app/views/general/app-searchs/app-project-definition-advanced-search/app-project-definition-advanced-search.component';
import { ActivatedRoute } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-projdeflist',
  templateUrl: './projdeflist.component.html',
  styleUrl: './projdeflist.component.scss'
})
export class ProjdeflistComponent implements OnInit {
  @ViewChild(AppProjectDefinitionAdvancedSearchComponent) childSearch: AppProjectDefinitionAdvancedSearchComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 241;
  custom: boolean;
  lang: string;
  public pageType: number;
  data: any[] = [];
  isExternalSearch = false;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private service: ProjectDefinitionService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private appEntryvouchersService: AppEntryvouchersService,
      private route: ActivatedRoute,
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
    this.TitlePage = this.translateService.instant('ProjectDefinitionList');
    this.title.setTitle(this.TitlePage);
  }


  GetProjectsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      this.service.GetProjectsList().subscribe(result => {
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
            this.childSearch.vAuthoritiesList = result[0].projectAdvancedSearchModel.authorityList;
            this.childSearch.vCountryList = result[0].projectAdvancedSearchModel.countryList;
            this.childSearch.vfinancialMethodList = result[0].projectAdvancedSearchModel.financialMethodList;
            this.childSearch.vprojectOfficerList = result[0].projectAdvancedSearchModel.projectOfficerList;
            this.childSearch.vprojectStatusList = result[0].projectAdvancedSearchModel.projectStatusList;
            this.childSearch.vprojectImpTypeList = result[0].projectAdvancedSearchModel.projectImpTypeList;
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
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        this.tabelData = result
      });
    }
  }

  handleSearchResult(result: any[] | null) {
    debugger;

    if (result && result.length > 0) {
      this.tabelData = result;
      this.isExternalSearch = true;
    }
    else {
      this.tabelData = this.data;
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

  DeleteProject(id: any) {
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
          this.service.DeleteProject(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetProjectsList();
              this.router.navigate(['ProjectDefinition/ProjectDefinitionList']);
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
    this.router.navigate(['ProjectDefinition/ProjectDefinitionForm']);
  }

  AddProjectForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.routePartsService.Guid4ToEdit = this.pageType;
    this.router.navigate(['ProjectDefinition/ProjectDefinitionForm']);
  }

  EditProjectForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.routePartsService.Guid4ToEdit = this.pageType;
    this.router.navigate(['ProjectDefinition/ProjectDefinitionForm']);
  }

  ProjectAttachment(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 45 }
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

  refresProjdeflistArabic(data: any[]) {
    this.exportData = data.map(x => {
      const projectDate = new Date(x.projectDate).toLocaleDateString('ar-EG');
      return {
        'رقم المشروع': x.projectNo,
        'تاريخ المشروع': projectDate,
        'اسم مختصر للمشروع': x.projShortName,
        ' رقم كتاب الاشعار بالمشروع': x.projectBookNo,
        'النطاق الجغرافي للمشروع': x.geograpicLocation,
        'نوع تنفيذ المشروع': x.implementationType,
        'طريقة التمويل': x.financialSource,
        'قيمة المشروع الكلية': x.totalProjectAmount,
        'قيمة المشروع الكلية بالدولار': x.totalProjectAmount / x.dollarRate,
      };
    });
  }

  refreshProjdeflistEnglish(data: any[]) {
    this.exportData = data.map(x => {
      const projectDate = new Date(x.projectDate).toLocaleDateString('en-EG');
      return {
        'Project Number': x.projectNo,
        'Project Date': projectDate,
        'Project Short Name': x.projShortName,
        'Project Book Number': x.projectBookNo,
        'Geograpic Location': x.geograpicLocation,
        'Project Implementation Type': x.implementationType,
        'Financial Method': x.financialSource,
        'Total Project Amount': x.totalProjectAmount,
        'Total Project Value Dollar': x.totalProjectAmount / x.dollarRate,
      };
    });
  }

  exportExcel(dt: any) {
    debugger;
    import("xlsx").then(xlsx => {
      debugger;

      var currentLang = this.jwtAuth.getLang();
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

      // مجموع "قيمة المشروع الكلية"
      const totalAmount = exportSource.reduce((sum, item) => sum + (Number(item.totalProjectAmount) || 0), 0);
      const totalValue = totalAmount;

      // مجموع "القيمة بالدولار"
      const totalDollarValue = exportSource.reduce((sum, item) => {
        const amount = Number(item.totalProjectAmount) || 0;
        const rate = Number(item.dollarRate) || 1; 
        return sum + (amount / rate);
      }, 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      // التعرف على اللغة تلقائيًا
      const totalHeaderArabic = 'قيمة المشروع الكلية';
      const totalHeaderEnglish = 'Total Project Amount';

      const dollarHeaderArabic = 'قيمة المشروع الكلية بالدولار';
      const dollarHeaderEnglish = 'Total Project Value Dollar ';
      const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
      const dollarHeader = isArabic ? dollarHeaderArabic : dollarHeaderEnglish;
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalColIndex = headers.indexOf(totalHeader);
      const dollarColIndex = headers.indexOf(dollarHeader);

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
      const dollarColLetter = getExcelColumnLetter(dollarColIndex);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      // مجموع "قيمة المشروع الكلية"
      const valueCell = totalColLetter + lastRow;
      worksheet[valueCell] = { t: 'n', v: parseFloat(totalValue) };

      // مجموع "القيمة بالدولار"
      const dollarValueCell = dollarColLetter + lastRow;
      worksheet[dollarValueCell] = { t: 'n', v: parseFloat(totalDollarValue) };

      // وضع عنوان "المجموع" في العمود الذي يسبق "قيمة المشروع الكلية"
      if (totalColIndex > 0) {
        const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
        const labelCell = labelColLetter + lastRow;
        worksheet[labelCell] = { t: 's', v: totalLabel };
      }

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
      head = [['قيمة المشروع الكلية بالدولار', 'قيمة المشروع الكلية', 'طريقة التمويل', 'نوع تنفيذ المشروع', 'النطاق الجغرافي للمشروع', 'رقم كتاب الاشعار بالمشروع', 'اسم مختصر للمشروع', 'تاريخ المشروع ', 'رقم المشروع']];
    } else {
      head = [['Total Project Value Dollar', 'Total Project Amount', 'Financial Method', 'Project Implementation Type', 'Geograpic Location', 'Project Book Number', 'Project Short Name', 'Project Date', 'Project Number']];
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
      const dollarValue = part.totalProjectAmount / part.dollarRate;

      const date1 = new Date(part.projectDate);
      const projectDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.projectNo;
      temp[1] = projectDate;
      temp[2] = part.projShortName;
      temp[3] = part.projectBookNo;
      temp[4] = part.geograpicLocation;
      temp[5] = part.implementationType;
      temp[6] = part.financialSource;
      temp[7] = part.totalProjectAmount;
      temp[8] = dollarValue;

      totalAmount += part.totalProjectAmount;
      totalDollarAmount += dollarValue;

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
      footRow[8] = this.formatCurrency(totalDollarAmount, 3);
      foot = [footRow.reverse()];
    } else {
      footRow[6] = "Total";
      footRow[7] = this.formatCurrency(totalAmount, 3);
      footRow[8] = this.formatCurrency(totalDollarAmount, 3);
      foot = [footRow.reverse()];
    }

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة المشاريع" : "Projects List";
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

}
