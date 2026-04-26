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
import { ProjectArchiveService } from '../projectarchive.service';
import { ProjectArchiveSearchComponent } from '../../app-projectArchiveSearch/project-archive-search/project-archive-search.component';
import { Location } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-projarchivelist',
  templateUrl: './projarchivelist.component.html',
  styleUrl: './projarchivelist.component.scss'
})
export class ProjarchivelistComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 250;
  custom: boolean;
  data: any[] = [];
  lang: string;
  importanceDegreeList: any;
  @ViewChild(ProjectArchiveSearchComponent) childSearch: ProjectArchiveSearchComponent;
  isExternalSearch = false;
  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private service: ProjectArchiveService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private appEntryvouchersService: AppEntryvouchersService,
      private location: Location,
      private readonly serv: AppCommonserviceService,

    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetProjectsArchiveList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProjectArchiveList');
    this.title.setTitle(this.TitlePage);
  }

  GetProjectsArchiveList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;

    debugger
    this.service.GetProjectArchiveList().subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.tabelData = result;
      this.data = result;

      if (currentLang == "ar") {
        this.refresProjdeflistArabic(this.tabelData);
      }
      else {
        this.refreshProjdeflistEnglish(this.tabelData);
      }

      this.showLoader = false;


      debugger
      if (result.length > 0) {
        if (this.childSearch) {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const firstDayOfYear = new Date(currentYear, 0, 1);
          this.childSearch.VauthoritiesList = result[0].searchProjectArchiveCriteria.authoritiesList;
          this.childSearch.VemployeesList = result[0].searchProjectArchiveCriteria.employeesList;
          this.childSearch.VimportanceDegreeList = result[0].searchProjectArchiveCriteria.importanceDegreeList;
          this.childSearch.VdocumentClassificationList = result[0].searchProjectArchiveCriteria.documentClassificationList;
          this.childSearch.VdepartmentsList = result[0].searchProjectArchiveCriteria.departmentsList;
          this.childSearch.VvoucherType = 1;
          this.childSearch.VvoucherNo = "";
          this.childSearch.VdocName = "";
          this.childSearch.ngOnInit();

        }
      }
    });

    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        debugger
        this.tabelData = result;
      });
    }
  }

  handleSearchResult(result: any[] | null) {
    debugger;

    // if (result && result.length > 0) {
      this.tabelData = result;
      this.isExternalSearch = true;
    // }
    // else {
    //   this.tabelData = this.data;
    //   this.isExternalSearch = false;;
    // }

    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang === 'ar') {
      this.refresProjdeflistArabic(this.tabelData);
    } else {
      this.refreshProjdeflistEnglish(this.tabelData);
    }
  }

  DeleteProjectsArchive(id: any) {
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
          this.service.DeleteProjectsArchive(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetProjectsArchiveList();
              this.router.navigate(['ProjectArchive/ProjectArchiveList']);
            }
            else if (!results.isSuccess && results.message === "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.DeleteFaild()
            }
          });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log('Delete action was canceled.');
        }
      })
  }

  OpenDetailsForm(id: any) {
    const base = window.location.origin + (document.querySelector('base')?.getAttribute('href') ?? '/');
    const url = `${base}ProjectArchive/ProjectArchiveForm?GuidToEdit=${encodeURIComponent(id)}`;
    window.open(url, '_blank');
  }

  AddProjectArchiveForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProjectArchive/ProjectArchiveForm']);
  }

  EditProjectArchiveForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProjectArchive/ProjectArchiveForm']);
  }

  ProjectArchiveAttachment(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 50 }
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

  refresProjdeflistArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'نوع الوثيقة': x.voucherType,
        'الرقم المتسلسل': x.voucherNo,
        'تاريخ الوثيقة': voucherDate,
        'تصنيف الوثيقة': x.vouCalassfication,
        'رقم الوثيقة': x.docNo,
        'اسم الوثيقة': x.voucherName,
        'درجة الاهمية': x.improtanceDegree,
        'الادارات': x.senRecCode,
      }
    });
  }

  refreshProjdeflistEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'Document Type': x.voucherType,
        'Serial No': x.voucherNo,
        'Document Date': voucherDate,
        'Document Classification': x.vouCalassfication,
        'Document Number': x.docNo,
        'Document Name': x.voucherName,
        'priority Level': x.improtanceDegree,
        'Managements': x.senRecCode,
      }
    });
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {
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
       head = [['الادارات', 'درجة الاهمية', 'اسم الوثيقة ', 'رقم الوثيقة ', ' تصنيف الوثيقة ', ' تاريخ الوثيقة', ' رقم التسلسل ', 'نوع الوثيقة ']]
    }
    else {
       head = [['Managements', 'priority Level', 'Document Name', 'Document Numbe', 'Document Classification', 'Document Date', 'Serial No ', 'Document Type']]
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

    exportSource.forEach(function (part, index) {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherType
      temp[1] = part.voucherNo
      temp[2] = voucherDate
      temp[3] = part.vouCalassfication
      temp[4] = part.docNo
      temp[5] = part.voucherName
      temp[6] = part.improtanceDegree
      temp[7] = part.senRecCode
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.data)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ?"قائمة الديوان ":"Project Archive List";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
  }
}
