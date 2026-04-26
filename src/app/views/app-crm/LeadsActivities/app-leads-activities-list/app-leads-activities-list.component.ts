import { Component,OnInit, ViewChild } from '@angular/core';
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
import { LeadsActivitiesService } from '../LeadsActivities.Service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ActivityadvancedsearchComponent } from '../app-activityAdvancedSearch/activityadvancedsearch.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { formatDate } from '@angular/common';
import { FollowUpFormComponent } from '../../app-FollowUp/follow-up-form/follow-up-form.component';

@Component({
  selector: 'app-app-leads-activities-list',
  templateUrl: './app-leads-activities-list.component.html',
  styleUrl: './app-leads-activities-list.component.scss'
})
export class AppLeadsActivitiesListComponent implements  OnInit {
  @ViewChild(ActivityadvancedsearchComponent) childSearch: ActivityadvancedsearchComponent;
    public TitlePage: string;
    companyId: number;
    tabelData: any[];
    data: any[];
    showLoader: boolean;
    exportData: any[];
    exportColumns: any[];
    screenId: number = 288;
    custom: boolean;
    Lang: string;
    Data: any;
    leadList: any[] = [];
    activityTypeList: any[] = [];
    leadId: 0;
    activityTypeId: 0;
    fromStartAt: null;
    toEndAt: null;
    lang: string;
    
    constructor(
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private readonly translateService: TranslateService,
      private readonly alert: sweetalert,
      private readonly dialog: MatDialog,
      private readonly LeadsActivitiesService: LeadsActivitiesService,
      private readonly routePartsService: RoutePartsService,
      private readonly router: Router,
      private readonly egretLoader: AppLoaderService,
      private readonly serv: LeadsActivitiesService,
      private readonly servcie : AppCommonserviceService ,
    ) { }
  
    ngOnInit(): void {
      this.SetTitlePage();
      this.GetLeadsActivitiesList();
      this.getFavouriteStatus(this.screenId);
    }
  
    SetTitlePage() {
      this.TitlePage = this.translateService.instant('ListOfInteractiveActivities');
      this.title.setTitle(this.TitlePage);
    }
  
    // formatCurrency(value: number, decimalPlaces: number): string {
    //   return this.LeadsActivitiesService.formatCurrency(value, decimalPlaces);
    // }
  
    GetLeadsActivitiesList() {
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
  
      this.showLoader = true;
      setTimeout(() => {
        debugger
        this.LeadsActivitiesService.GetLeadsActivitiesList().subscribe(result => {
          debugger
          if (result.isSuccess == false && result.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          this.tabelData = result;
          this.data = result;
          if (currentLang == "ar") {
            this.refreshArabic(this.tabelData);
          }
          else {
            this.refreshEnglish(this.tabelData);
          }
          this.showLoader = false;
          debugger
  
          if (this.childSearch) {
            const currentDate = new Date();
            this.childSearch.vLeadList = result[0].leadsActivityAdvanceSearch.leadList;
            this.childSearch.vStatusList = result[0].leadsActivityAdvanceSearch.statusList;
            this.childSearch.vUserList = result[0].leadsActivityAdvanceSearch.userList;
            this.childSearch.vActivityTypeList = result[0].leadsActivityAdvanceSearch.activityTypeList;            
            this.childSearch.vfromDate  = formatDate(currentDate, "yyyy-MM-dd'T'HH:mm", "en-US");
            this.childSearch.vtoDate = formatDate(currentDate, "yyyy-MM-dd'T'HH:mm", "en-US");
            this.childSearch.ngOnInit();
          }
  
          debugger
        })
      });
      debugger
      if (this.childSearch) {
        this.childSearch.searchResultEvent.subscribe(result => {
          this.tabelData = result;
        });
      }
    }
  
    handleSearchResult(result: any) {
      debugger
      this.tabelData = result;
    }     
  
    // DeleteVoucher(id: any) {
    //   Swal.fire({
    //     title: this.translateService.instant('AreYouSure?'),
    //     text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
    //     icon: 'warning',
    //     confirmButtonColor: '#dc3741',
    //     showCancelButton: true,
    //     confirmButtonText: this.translateService.instant('Yes,deleteit!'),
    //     cancelButtonText: this.translateService.instant('Close'),
    //   }).then((result) => {
    //     if (result.value) {
    //       this.serv.de(id).subscribe((results) => {
    //         if (results) {
    //           debugger
    //           if (results.isSuccess == false && results.message == "msNoPermission") {
    //             this.alert.ShowAlert("msNoPermission", 'error');
    //             this.GetEntryVouchersList();
    //             return;
    //           }
    //           this.alert.DeleteSuccess();
    //           this.GetEntryVouchersList();
    //         }
    //         else {
    //           this.alert.DeleteFaild()
    //         }
    //       });
    //     }
    //     else if (result.dismiss === Swal.DismissReason.cancel) {
    //     }
    //   })
    // }
  
    OpenDetailsForm(id) {
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.router.navigate(['LeadsActivities/LeadsActivitiesForm']);
    }
  
    AddActivityForm(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Add';
      this.router.navigate(['LeadsActivities/LeadsActivitiesForm']);
    }
  
    OpenEntryVoucherForm(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Edit';
      this.router.navigate(['LeadsActivities/LeadsActivitiesForm']);
    }
    
   Cancel(id: any) {
    debugger
      Swal.fire({
        title: this.translateService.instant('AreYouSure?'),
        text: this.translateService.instant('AreYouSureYouWillCancelThisActivityForTheClient'),
        icon: 'warning',
        confirmButtonColor: '#dc3741',
        showCancelButton: true,
        confirmButtonText: this.translateService.instant('Yes'),
        cancelButtonText: this.translateService.instant('Close'),
      }).then((result) => {
        if (result.value) {
          this.serv.CancelLeadsActivities(id).subscribe(res => {
            if(res)
              {
                this.alert.SaveSuccess();
                this.GetLeadsActivitiesList();
              }
            else
              {
                this.alert.ShowAlert("CloseNotImplementedYet", "info");
              }
          })
          
        }
      })
    }

    Close(id: any) {
      Swal.fire({
        title: this.translateService.instant('AreYouSure?'),
        text: this.translateService.instant('AreYouSureYouWantToCloseThisActivityForTheClient'),
        icon: 'warning',
        confirmButtonColor: '#dc3741',
        showCancelButton: true,
        confirmButtonText: this.translateService.instant('Yes'),
        cancelButtonText: this.translateService.instant('Close'),
      }).then((result) => {
        if (result.value) {
          this.serv.CloseLeadsActivities(id).subscribe(res => {
            if(res)
              {
                this.alert.SaveSuccess();
                this.GetLeadsActivitiesList();
              }
            else
              {
                this.alert.ShowAlert("CloseNotImplementedYet", "info");
              }
          })
          
        }
      })
    }

    Print(id: any) {
      this.alert.ShowAlert("PrintNotImplementedYet", "info");
    }

    refreshArabic(data: any[]) {
    this.exportData = (data || []).map(x => {
      const start = x.fromDate ? new Date(x.fromDate).toLocaleDateString('ar-EG') : '';
      const end = x.toDate ? new Date(x.toDate).toLocaleDateString('ar-EG') : '';
      return {
        'رقم النشاط': x.activityNo,
        'العميل المحتمل': x.leadName,
        'نوع النشاط': x.avtivityType,
        'من تاريخ': start,
        'إلى تاريخ': end,
        'الحالة': x.statusName
      }
    });
    }

    refreshEnglish(data: any[]) {
      this.exportData = (data || []).map(x => {
        const start = x.startAt ? new Date(x.startAt).toLocaleDateString('en-EG') : '';
        const end = x.endAt ? new Date(x.endAt).toLocaleDateString('en-EG') : '';
        return {
          'Activity No': x.activityNo,
          'Lead': x.leadName,
          'Activity Type': x.avtivityType,
          'Start At': start,
          'End At': end,
          'Status': x.statusName
        }
      });
    }

  
    exportExcel(dt: any) {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
    });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }

    exportPdf(dt: any) {
      debugger
      const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let head: string[][];

      if (currentLang == "ar") {
        head = [['الحالة', 'إلى تاريخ', 'من تاريخ',  'نوع النشاط', 'العميل المحتمل', 'رقم النشاط']]
      } else {
        head = [['Status', 'End At', 'Start At', 'Activity Type', 'Lead', 'Activity No']]
      }

      const rows: (number | string)[][] = [];

      (this.data || []).forEach((part) => {
        const start = part.fromDate ? new Date(part.fromDate).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-EG') : '';
        const end = part.toDate ? new Date(part.toDate).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-EG') : '';

        let temp: (number | string)[] = [];
        temp[0] = part.activityNo;
        temp[1] = part.leadName;
        temp[2] = part.avtivityType;
        temp[3] = start;
        temp[4] = end;
        temp[5] = part.statusName;
        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp);
      });

      const pdf = new jsPDF('l', 'pt', 'a4');
      pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
      pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      pdf.setFont('Amiri');
      pdf.setFontSize(14);

      const Title = currentLang == "ar" ? "قائمة الأنشطة" : "Leads Activities List";
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
    
    updateFavourite(ScreenId: number) {
      this.servcie.UpdateFavourite(ScreenId).subscribe(result => {
        if (result.isSuccess) {
          this.getFavouriteStatus(this.screenId);
          this.servcie.triggerFavouriteRefresh(); // 🔥 THIS is key
        } else {
          this.alert.ShowAlert(result.message, 'error');
        }
      });
    }
  
    getFavouriteStatus(screenId) {
      debugger
      this.servcie.GetFavouriteStatus(screenId).subscribe(result => {
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
    

    PrintLeadsActivities(Lead: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptLeadsActivitiesAR?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptLeadsActivitiesEN?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }


    OpenFollowUpForm(activityNo: number, crruntrow: any, isNew?, isView?) {
      let title = isNew ? this.translateService.instant('AddFollowUpForm') : this.translateService.instant('modifiyFollowUpForm');
      let dialogRef: MatDialogRef<any> = this.dialog.open(FollowUpFormComponent, {
        width: '1000px',
        disableClose: true,
        direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
        data: { title: title, Id: 0,activityNo: activityNo, row: crruntrow, isNew, isView, companyid: this.jwtAuth.getCompanyId() }
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