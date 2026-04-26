import { Component, ViewChild } from '@angular/core';
import { AmiriRegular } from 'assets/fonts/amiri';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { LeadsService } from '../leadsService.service';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { AppLeadedCustomerSearchComponent } from 'app/views/general/app-searchs/app-leaded-customer-search/app-leaded-customer-search.component';
import { FollowUpFormComponent } from '../../app-FollowUp/follow-up-form/follow-up-form.component';
import { th } from 'date-fns/locale';

@Component({
  selector: 'app-leads-customers-list',
  templateUrl: './leads-customers-list.component.html',
  styleUrl: './leads-customers-list.component.scss'
})
export class LeadsCustomersListComponent {
  @ViewChild(AppLeadedCustomerSearchComponent) childSearch!: AppLeadedCustomerSearchComponent;
  Data: any;
  showLoader: boolean = false;
  exportData: any[] = [];
  custom: boolean = false;
  exportColumns: any[] = [];
  tabelData: any[] = [];
  data: any[] = [];
  cols: any[] = [];
  HasPerm: boolean = true;
  public TitlePage: string = '';
  Lang: string = '';
  screenId: number = 289;

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private CrmService: LeadsService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetLeadsCustomersList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('LeadsCustomersList');
    this.title.setTitle(this.TitlePage);
  }

  GetLeadsCustomersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      this.CrmService.GetLeadsCustomerList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        debugger
        this.showLoader = false;
        this.Data = result;
        this.data = result;
        debugger
        if (result.length > 0) {
          if (this.childSearch) {
            const currentDate = new Date();
            this.childSearch.vConvertedToList = result[0].customersSearchModel.convertedToList;
            this.childSearch.vSourceList = result[0].customersSearchModel.sourceList;
            this.childSearch.vStatusList = result[0].customersSearchModel.statusList;
            this.childSearch.vBranchesList = result[0].customersSearchModel.branchesList;
            this.childSearch.vfromDate = currentDate;
            this.childSearch.vtoDate = currentDate;
            this.childSearch.ngOnInit();
          }
        }
        if (currentLang == "ar") {
          this.refresLeadCustomerArabic(this.Data);
        }
        else {
          this.refreshLeadCustomerEnglish(this.Data);
        }
      });
    });
  }

  handleSearchResult(result: any[] | null) {
    debugger;
    this.Data = result;
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang === 'ar') {
      this.refresLeadCustomerArabic(this.Data);
    } else {
      this.refreshLeadCustomerEnglish(this.Data);
    }
  }

  ShowDetailsOnly(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['LeadsCustomers/LeadsCustomersForm']);
  }

  AddNewLeadsCustomers(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['LeadsCustomers/LeadsCustomersForm']);
  }

  EditLeadsCustomers(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['LeadsCustomers/LeadsCustomersForm']);
  }

  DeleteLeadsCustomers(id: any) {
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
        this.CrmService.deleteLeadsCustomers(id).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.GetLeadsCustomersList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {

            this.alert.DeleteFaild();
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  AttachmentLeadsCustomers(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 58 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  updateFavourite(ScreenId: number) {
    this.CrmService.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
  }

  getFavouriteStatus(screenId : number) {
    debugger
    this.CrmService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result.isSuccess) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refresLeadCustomerArabic(data : any[]) {
    debugger
    this.exportData = data.map(x => {
      const createdAt = new Date(x.createdAt).toLocaleDateString('ar-EG');
      return {
        'رقم العميل المحتمل': x.leadId,
        'اسم الشركة': x.companyName,
        'اسم جهة الاتصال': x.mainContactName,
        'رقم جهة الاتصال': x.mainContactPhone,
        'الموظف المحول لة': x.employeeName,
        'القيمة المتوقعه': x.expectedValue,
        'التاريخ': createdAt,
        'المصدر': x.sourceName,
        'الحالة': x.statusName,
      }
    });
  }

  refreshLeadCustomerEnglish(data : any[]) {
    debugger
    this.exportData = data.map(x => {
      const createdAt = new Date(x.createdAt).toLocaleDateString('en-EG');
      return {
        'Lead Id': x.leadId,
        'Company Name': x.companyName,
        'Main Contact Name': x.mainContactName,
        'Main Contact Phone': x.mainContactPhone,
        'Employee Assigned To': x.employeeName,
        'Expected Value': x.expectedValue,
        'Date': x.createdAt,
        'Source': x.sourceName,
        'Status': x.statusName,
      }
    });
  }

  exportExcel(dt: any) {
    debugger
    import("xlsx").then(xlsx => {
      debugger
      var currentLang = this.jwtAuth.getLang();
      const isArabic = currentLang === 'ar';
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
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [['الحالة', 'المصدر', 'التاريخ', 'القيمة المتوقعه', 'الموظف المحول لة', 'رقم جهة الاتصال', 'اسم جهة الاتصال', 'اسم الشركة', 'رقم العميل المحتمل']]
    }
    else {
      head = [['Status', 'Source', 'Date', 'Expected Value', 'Employee Assigned To', 'Main Contact Phone', 'Main Contact Name', 'Company Name', 'Lead Id']]
    }
    var rows: (number | string)[][] = [];



    this.Data.forEach(function (part: any, index: number) {

      const date1 = new Date(part.createdAt);
      const createdAt = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.leadId
      temp[1] = part.companyName
      temp[2] = part.mainContactName
      temp[3] = part.mainContactPhone
      temp[4] = part.employeeName
      temp[5] = part.expectedValue
      temp[6] = createdAt
      temp[7] = part.sourceName
      temp[8] = part.statusName
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

    const Title = currentLang == "ar" ? "قائمة العملاء المحتملين" : "Leads Customers List";
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

  PrintLeadsCustomers(Lead: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptLeadsCustomersAR?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptLeadsCustomersEN?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  OpenCustomersForm(leadId: number) {
    debugger
    this.routePartsService.GuidToEdit = leadId;
    const url = `/Dealers/DealersForm1?leadId=${leadId}`;
    window.open(url, '_blank');
  }

  OpenCustomerActivityForm(leadId: number) {
    debugger
    this.routePartsService.GuidToEdit = leadId;
    const url = `/LeadsActivities/LeadsActivitiesForm?leadId=${leadId}`;
    window.open(url, '_blank');
  }

  OpenFollowUpForm(leadId: number,customerName: string, crruntrow: any, isNew?: boolean, isView?: boolean) {
    let title = isNew ? this.translateService.instant('AddFollowUpForm') : this.translateService.instant('modifiyFollowUpForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(FollowUpFormComponent, {
      width: '1000px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, Id: 0,leadId: leadId,customerName: customerName, row: crruntrow, isNew, isView, companyid: this.jwtAuth.getCompanyId() }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }
}
