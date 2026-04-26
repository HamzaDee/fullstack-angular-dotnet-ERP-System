import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { SuppPaymentvoucherService } from 'app/views/app-payables/supplierpaymentvoucher/supplierpaymentvoucher.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { AgreementsService } from './agreements.service';
import { ArgumentadvancedsearchComponent } from 'app/views/general/app-searchs/app-projectsArgumentAdvancedSearch/argumentadvancedsearch-component/argumentadvancedsearch.component';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-agreements',
  templateUrl: './agreements.component.html',
  styleUrl: './agreements.component.scss'
})
export class AgreementsComponent {
  @ViewChild(ArgumentadvancedsearchComponent) childSearch: ArgumentadvancedsearchComponent;
  Data: any;
  showLoader: boolean;
  exportData: any[];
  custom: boolean;
  exportColumns: any[];
  tabelData: any[];
  data: any[] = [];
  cols: any[];
  HasPerm: boolean;
  public TitlePage: string;
  Lang: string;
  screenId: number = 231;
  AgreementList: any;
  isExternalSearch = false;
  constructor(
    private title: Title,
    private translateService: TranslateService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private supPaymentvoucherService: SuppPaymentvoucherService,
    private AgreementsService: AgreementsService,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAgreementsList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AgreementsList');
    this.title.setTitle(this.TitlePage);
  }

  GetAgreementsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      this.AgreementsService.GetAgreementsList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        debugger
        this.showLoader = false;
        this.AgreementList = result;
        this.data = result;
        debugger
        if (result.length > 0) {
          if (this.childSearch) {
            const currentDate = new Date();
            this.childSearch.vAuthoritiesList = result[0].argumentAdvancedSearchModel.authorityList;
            this.childSearch.vCountryList = result[0].argumentAdvancedSearchModel.countryList;
            this.childSearch.vUserList = result[0].argumentAdvancedSearchModel.userList;
            this.childSearch.vfromDate = currentDate;
            this.childSearch.vtoDate = currentDate;
            this.childSearch.vstampFromDate = currentDate;
            this.childSearch.vstampToDate = currentDate;
            this.childSearch.ngOnInit();
          }
        }
        if (currentLang == "ar") {
          this.refresSalesInvoiceArabic(this.AgreementList);
        }
        else {
          this.refreshSalesInvoiceEnglish(this.AgreementList);
        }
      });
    });
    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        debugger
        this.AgreementList = result;
      });
    }
  }

handleSearchResult(result: any[] | null) {
  debugger;

  if (result && result.length > 0) {
    this.AgreementList = result;
    this.isExternalSearch = true;
  } else {
    this.AgreementList = [];
    this.isExternalSearch = false;
  }

  const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
  if (currentLang === 'ar') {
    this.refresSalesInvoiceArabic(this.AgreementList);
  } else {
    this.refreshSalesInvoiceEnglish(this.AgreementList);
  }
}



  ShowDetailsOnly(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['Agreements/AgreementsForm']);
  }

  AddNewAgreements(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Agreements/AgreementsForm']);
  }

  EditAgreement(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Agreements/AgreementsForm']);
  }

  DeleteAgreement(id: any) {
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
        this.AgreementsService.deleteAgrements(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetAgreementsList();
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

  /*   PrintAgreement(Id: number) {
      debugger
      this.Lang = this.jwtAuth.getLang();
      if (this.Lang == "ar") {
        const reportUrl = `RptAssetSalesInvoiceAR?Id=${Id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else {
        const reportUrl = `RptAssetSalesInvoiceEN?Id=${Id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
    } */

  AttachmentAgreement(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 38 }
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

  refresSalesInvoiceArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const dealSignDate = new Date(x.dealSignDate).toLocaleDateString('ar-EG');
      const dealFromDate = new Date(x.dealFromDate).toLocaleDateString('ar-EG');
      const dealToDate = new Date(x.dealToDate).toLocaleDateString('ar-EG');
      return {
        'رقم التسلسل': x.id,
        'اسم الاتفاقية': x.dealName,
        'رقم الاتفاقية': x.dealNo,
        'نوع الاتفاقية': x.dealarTypeName,
        'تاريخ توقيع الاتفاقية': dealSignDate,
        'من تاريخ': dealFromDate,
        'الى  تاريخ': dealToDate,
        'قيمة الاتفاقية': x.dealAmount,
      }
    });
  }

  refreshSalesInvoiceEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const dealSignDate = new Date(x.dealSignDate).toLocaleDateString('en-EG');
      const dealFromDate = new Date(x.dealFromDate).toLocaleDateString('en-EG');
      const dealToDate = new Date(x.dealToDate).toLocaleDateString('en-EG');
      return {
        'Serail Number': x.id,
        'Agreement Name': x.dealName,
        'Agreement Number': x.dealNo,
        'Agreement Type': x.dealarTypeName,
        'Agreement Signature Date': x.dealSignDate,
        'From Date': x.dealFromDate,
        'To Date': x.dealToDate,
        'Agreements Value': x.dealAmount,
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
        exportSource = this.AgreementList;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresSalesInvoiceArabic(exportSource);
      } else {
        this.refreshSalesInvoiceEnglish(exportSource);
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
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [[' قيمة الاتفاقية', ' الى  تاريخ', 'من تاريخ', ' تاريخ توقيع الاتفاقية ', ' نوع الاتفاقية', ' رقم الاتفاقية', ' اسم الاتفاقية', 'رقم التسلسل']]
    }
    else {
       head = [['Agreements Value', 'To Date', 'From Date', 'Agreement Signature Date', ' Agreement Type', 'Agreement Number', 'Agreement Name', 'Serail Number']]
    }
    var rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (this.isExternalSearch) {
      exportSource = this.AgreementList;
    }
    else {
      exportSource = this.data;
    }


    exportSource.forEach(function (part, index) {

      const date1 = new Date(part.dealSignDate);
      const dealSignDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.dealFromDate);
      const dealFromDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;


      const date3 = new Date(part.dealToDate);
      const dealToDate = currentLang === 'ar'
        ? `${date3.getDate().toString().padStart(2, '0')}/${(date3.getMonth() + 1).toString().padStart(2, '0')}/${date3.getFullYear()}`
        : `${date3.getDate().toString().padStart(2, '0')}/${(date3.getMonth() + 1).toString().padStart(2, '0')}/${date3.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.id
      temp[1] = part.dealName
      temp[2] = part.dealNo
      temp[3] = part.dealarTypeName
      temp[4] = dealSignDate
      temp[5] = dealFromDate
      temp[6] = dealToDate
      temp[7] = part.dealAmount
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

    const Title = currentLang == "ar" ?"قائمة الاتفاقيات":"Agreements List";
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
