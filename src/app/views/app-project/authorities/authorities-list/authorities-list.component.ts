import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { SuppPaymentvoucherService } from 'app/views/app-payables/supplierpaymentvoucher/supplierpaymentvoucher.service';
import { sweetalert } from 'sweetalert';
import { AuthoritiesService } from '../authorities.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { EvaluationDialogFormComponent } from '../evaluation-dialog-form/evaluation-dialog-form.component';
import { ProjauthadvancedsearchComponent } from 'app/views/general/app-searchs/app-projectsAuthAdvancedSearch/projauthadvancedsearch.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-authorities-list',
  templateUrl: './authorities-list.component.html',
  styleUrl: './authorities-list.component.scss'
})
export class AuthoritiesListComponent {
  @ViewChild(ProjauthadvancedsearchComponent) childSearch: ProjauthadvancedsearchComponent;
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
  screenId: number = 233;
  AuthoritiesList: any;
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
    private AuthoritiesService: AuthoritiesService,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAuthoritiesList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AuthoritiesList');
    this.title.setTitle(this.TitlePage);
  }

  GetAuthoritiesList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.AuthoritiesService.getAuthoritiesList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }

        this.showLoader = false;
        this.AuthoritiesList = result;
        this.data = result;
        debugger
        if (result.length > 0) {
          if (this.childSearch) {
            const currentDate = new Date();
            this.childSearch.vDevelopmentDirectList = result[0].authoritiesAdvancedSearchModel.developmentDirectList;
            this.childSearch.vAuthorityClassificationList = result[0].authoritiesAdvancedSearchModel.authorityClassificationList;
            this.childSearch.vAuthorityAttributeList = result[0].authoritiesAdvancedSearchModel.authorityAttributeList;
            this.childSearch.vEntityCategoryList = result[0].authoritiesAdvancedSearchModel.entityCategoryList;
            this.childSearch.vCountryList = result[0].authoritiesAdvancedSearchModel.countryList;
            this.childSearch.vGovernorateList = result[0].authoritiesAdvancedSearchModel.governorateList;
            this.childSearch.vDistrictList = result[0].authoritiesAdvancedSearchModel.districtList;
            this.childSearch.ngOnInit();
          }
        }
        if (currentLang == "ar") {
          this.refresAuthoritieArabic(this.AuthoritiesList);
        }
        else {
          this.refreshAuthoritieEnglish(this.AuthoritiesList);
        }
      });
    });
    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        this.AuthoritiesList = result;
      });
    }
  }

  /*   handleSearchResult(result: any) {
      debugger
      this.AuthoritiesList = result;
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
  
      if (currentLang == "ar") {
        this.refresAuthoritieArabic(this.AuthoritiesList);
      }
      else {
        this.refreshAuthoritieEnglish(this.AuthoritiesList);
      }
    } */

  handleSearchResult(result: any[] | null) {
    debugger;

    if (result && result.length > 0) {
      this.AuthoritiesList = result;
      this.isExternalSearch = true;
    }
    else {
      this.AuthoritiesList = this.data;
      this.isExternalSearch = false;;
    }

    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang === 'ar') {
      this.refresAuthoritieArabic(this.AuthoritiesList);
    } else {
      this.refreshAuthoritieEnglish(this.AuthoritiesList);
    }
  }

  ShowDetailsOnly(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['Authorities/AuthoritiesForm']);
  }

  AddNewAuthoritie(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Authorities/AuthoritiesForm']);
  }

  EditAuthoritie(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Authorities/AuthoritiesForm']);
  }

  DeleteAuthoritie(id: any) {
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
        this.AuthoritiesService.deleteAuthorities(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetAuthoritiesList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            if (results.message == "msgRecordHasLinks") {
              this.alert.ShowAlert("msgRecordHasLinks", 'error')
            }
          }

        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  PrintAgreement(Id: number) {
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
  }

  AttachmentAuthoritie(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 39 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  OpenAuthoritiesEvaluationForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('Ratings');
    let dialogRef: MatDialogRef<any> = this.dialog.open(EvaluationDialogFormComponent, {
      width: '1350px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id }
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

  refresAuthoritieArabic(data) {
    debugger
    this.exportData = data.map(x => ({
      ' اسم الجهة عربي': x.entityName,
      ' اسم الجهة انجليزي': x.entityEName,
      'تصنيف الجهة': x.authorityClassificationName,
      ' الدولة': x.countryName,
      'فئة الجهة ': x.authorityAttributeName,
      ' الهاتف': x.phone,
      'اسم الشخص المفوض  ': x.authorizedPersonName,
    }));
  }

  refreshAuthoritieEnglish(data) {
    debugger
    this.exportData = data.map(x => ({
      'Authoritie Name Arabic': x.entityName,
      'Authoritie Name English': x.entityEName,
      'Authoritie Classification': x.authorityClassificationName,
      'Country ': x.countryName,
      'Authoritie Category': x.authorityAttributeName,
      'Telephone': x.phone,
      'Name Of Authorized Person': x.authorizedPersonName,
    }));
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];


      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (this.isExternalSearch) {
        exportSource = this.AuthoritiesList;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresAuthoritieArabic(exportSource);
      } else {
        this.refreshAuthoritieEnglish(exportSource);
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
       head = [['  اسم الشخص المفوض', 'الهاتف', ' فئة الجهة', ' الدولة', ' تصنيف الجهة', ' اسم الجهة انجليزي', ' اسم الجهة عربي']]
    }
    else {
       head = [['Name Of Authorized Person', 'Telephone', 'Authoritie Category', ' Country', 'Authoritie Classification', 'Authoritie Name English', 'Authoritie Name Arabic']]
    }

    const rows: (number | string)[][] = [];
    let exportSource: any[];
     if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (this.isExternalSearch) {
        exportSource = this.AuthoritiesList;
      }
      else {
        exportSource = this.data;
      }

    exportSource.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.entityName
      temp[1] = part.entityEName
      temp[2] = part.authorityClassificationName
      temp[3] = part.countryName
      temp[4] = part.authorityAttributeName
      temp[5] = part.phone
      temp[6] = part.authorizedPersonName

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

    const Title = currentLang == "ar" ?"قائمة الجهات":"Authorities List";
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
