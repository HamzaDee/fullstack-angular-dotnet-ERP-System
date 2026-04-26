import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import { VolunteerService } from '../volunteers.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VolunteersadvancedsearchComponent } from 'app/views/general/app-searchs/app-VolunteersAdvancedSearch/volunteersadvancedsearch.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-volnteerlist',
  templateUrl: './volnteerlist.component.html',
  styleUrl: './volnteerlist.component.scss'
})
export class VolnteerlistComponent implements OnInit {
  @ViewChild(VolunteersadvancedsearchComponent) childSearch: VolunteersadvancedsearchComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 233;
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
      private readonly service: VolunteerService,
      private readonly routePartsService: RoutePartsService,
      private readonly router: Router,
      private readonly appEntryvouchersService: AppEntryvouchersService,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetVolunteersList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Volnteerlist');
    this.title.setTitle(this.TitlePage);
  }

  GetVolunteersList() {
    debugger
    let currentLang = this.jwtAuth.getLang();

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetVolunteersList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;
        this.data = result;
        if (result.length > 0) {
          if (this.childSearch) {
            this.childSearch.vAuthoritiesList = result[0].advancedSearch.authoritiesList;
            this.childSearch.vNationalitiesList = result[0].advancedSearch.nationalitiesList;
            this.childSearch.vGovernorateList = result[0].advancedSearch.governorateList;
            this.childSearch.ngOnInit();
          }
        }
        if (currentLang == "ar") {
          this.refresVolnteerArabic(this.tabelData);
        }
        else {
          this.refreshVolnteerEnglish(this.tabelData);
        }

        this.showLoader = false;
      });
    });


    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        debugger;
        this.tabelData = result;
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
      this.refresVolnteerArabic(this.tabelData);
    } else {
      this.refreshVolnteerEnglish(this.tabelData);
    }
  }

  DeleteVolunteer(id: any) {
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
          this.service.DeleteVoulnteer(id).subscribe((results) => {
            if (results.isSuccess) {
              this.alert.DeleteSuccess();
              this.GetVolunteersList();
              this.router.navigate(['Volunteers/Volnteerlist']);
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
    this.router.navigate(['Volunteers/Volnteerform']);
  }

  AddPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Volunteers/Volnteerform']);
  }

  OpenPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Volunteers/Volnteerform']);
  }

  AttachmentEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 41 }
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

  refresVolnteerArabic(data) {
    debugger
    this.exportData = data.map(x => ({
      'اسم المتطوع': x.volunteerName,
      'جهه المتطوع': x.voulnteerSide,
      ' الجنسية': x.nationality,
      'عدد ساعات التطوع الكلي': x.totalVolunteerHours,
      'المحافظه': x.governorate,
      'الموبايل': x.mobileNo,
    }));
  }

  refreshVolnteerEnglish(data) {
    debugger
    this.exportData = data.map(x => ({
      'Volunteer Name': x.volunteerName,
      'Volunteer Side': x.voulnteerSide,
      'Nationality': x.nationality,
      'Total Voulnteer Hours': x.totalVolunteerHours,
      'Governorate': x.governorate,
      'Mobile': x.mobileNo,
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
        exportSource = this.tabelData;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresVolnteerArabic(exportSource);
      } else {
        this.refreshVolnteerEnglish(exportSource);
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
       head = [['الموبايل', ' المحافظه', ' عدد ساعات التطوع الكلي', '  الجنسية', ' جهه المتطوع', ' اسم المتطوع']]
    }
    else {
       head = [['Mobile', 'Governorate', 'Total Voulnteer Hours', ' Nationality', 'Volunteer Side', 'Volunteer Name']]
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
      let temp: (number | string)[] = [];
      temp[0] = part.volunteerName
      temp[1] = part.voulnteerSide
      temp[2] = part.nationality
      temp[3] = part.totalVolunteerHours
      temp[4] = part.governorate
      temp[5] = part.mobileNo
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

    const Title = currentLang == "ar" ?"قائمة المتطوعين":"Volnteer List";
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

  CalculateTotal() {
    if (this.tabelData) {
      return this.formatCurrency(this.tabelData.reduce((sum, item) => {
        return sum + item.totalVolunteerHours;
      }, 0), 3);
    }
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }

}
