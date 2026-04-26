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
import { ProjectPlansService } from 'app/views/app-project/projectsplans/projectplans.service';
import { ProjectplanadvancedsearchComponent } from 'app/views/general/app-searchs/app-project-plan-advance-search/projectplanadvancedsearch.component';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-projplanslist',
  templateUrl: './projplanslist.component.html',
  styleUrl: './projplanslist.component.scss'
})
export class ProjplanslistComponent implements OnInit {
  @ViewChild(ProjectplanadvancedsearchComponent) childSearch: ProjectplanadvancedsearchComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 243;
  custom: boolean;
  data: any[] = [];
  lang: string;
  isExternalSearch = false;

  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private readonly translateService: TranslateService,
      private readonly alert: sweetalert,
      private readonly dialog: MatDialog,
      private readonly service: ProjectPlansService,
      private readonly routePartsService: RoutePartsService,
      private readonly router: Router,
      private readonly appEntryvouchersService: AppEntryvouchersService,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetProjectsPlansList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProjectPlansList');
    this.title.setTitle(this.TitlePage);
  }

  GetProjectsPlansList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetProjectsPlansList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;

        if (result.length > 0) {
          if (this.childSearch) {
            this.childSearch.vAuthoritiesList = result[0].projectPlanAdvancedSearch.distSiteDirectionList;
            this.childSearch.vProjectsList = result[0].projectPlanAdvancedSearch.projectsList;
            this.childSearch.vEmployeeList = result[0].projectPlanAdvancedSearch.employeeList;
            this.childSearch.vDistSiteDirectionList = result[0].projectPlanAdvancedSearch.distSiteDirectionList;
            this.childSearch.VFromDate = formatDate(result[0].projectPlanAdvancedSearch.fromDate, "yyyy-MM-dd", "en-US");
            this.childSearch.VToDate = formatDate(result[0].projectPlanAdvancedSearch.toDate, "yyyy-MM-dd", "en-US");

            this.childSearch.ngOnInit();
          }
        }
        if (currentLang == "ar") {
          this.refresProjdeflistArabic(this.tabelData);
        }
        else {
          this.refreshProjdeflistEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });


  }

  DeleteProjectPlan(id: any) {
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
          this.service.DeleteProjectPlan(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetProjectsPlansList();
              this.router.navigate(['ProjectsPlans/ProjectPlansList']);
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
    this.router.navigate(['ProjectsPlans/ProjectPlansForm']);
  }

  AddProjectPlanForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProjectsPlans/ProjectPlansForm']);
  }

  EditProjectPlanForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProjectsPlans/ProjectPlansForm']);
  }

  ProjectPlanAttachment(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 46 }
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
      const distDate = new Date(x.distDate).toLocaleDateString('ar-EG');
      return {
        'رقم خطة المشروع': x.planNo,
        'المشروع': x.projectName,
        'نوع خطة التوزيع': x.planTypesList.join(', '),
        'جهة موقع التوزيع': x.autoritiesList.join(', '),
        'تاريخ التوزيع': distDate,
        'وقت التوزيع': x.distTime,
        'اسم المندوب': x.representative,
        'موقع التحميل': x.siteLocationList.join(', '),
        'وسيلة النقل': x.transportationList.join(', '),
      }
    });
  }

  refreshProjdeflistEnglish(data) {
    debugger
    this.exportData =data.map(x => {
      const distDate = new Date(x.distDate).toLocaleDateString('en-EG');
      return {
        'Project Plan Number': x.planNo,
        'Project': x.projectName,
        'Distribution Plan Type': x.planTypesList.join(', '),
        'Distribution Site Direction': x.autoritiesList.join(', '),
        'Distribution Date': distDate,
        'Distribution Time': x.distTime,
        'Represented Name': x.representative,
        'Place of Loading': x.siteLocationList.join(', '),
        'Means Of Transportation': x.transportationList.join(', '),
      }
    });
  }

  exportExcel(dt: any) {
    debugger
    import("xlsx").then(xlsx => {
debugger
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
       head = [['  وسيلة النقل', 'موقع التحميل ', 'اسم المندوب', 'وقت التوزيع ', 'تاريخ التوزيع ', 'جهة موقع التوزيع ', 'نوع خطة التوزيع', ' المشروع ', 'رقم خطة المشروع']]
    }
    else {
       head = [['Means Of Transportation', 'Place of Loading', 'Represented Name', 'Distribution Time', 'Distribution Date', 'Distribution Site Direction', 'Distribution Plan Type', 'Project ', 'Project Plan Number']]
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

      const date1 = new Date(part.distDate);
      const distDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.planNo
      temp[1] = part.projectName
      temp[2] = part.planTypesList
      temp[3] = part.autoritiesList
      temp[4] = distDate
      temp[5] = part.distTime
      temp[6] = part.representative
      temp[7] = part.siteLocationList
      temp[8] = part.transportationList
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

    const Title = currentLang == "ar" ?"قائمة خطط المشاريع":"Project Plans List";
    let pageWidth = pdf.internal.pageSize.width;
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

  handleSearchResult(result: any) {
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
}
