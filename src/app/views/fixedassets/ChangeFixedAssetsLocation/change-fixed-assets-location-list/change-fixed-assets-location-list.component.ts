import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ChangeFixedAssetsLocationService } from '../change-fixed-assets-location.service';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { ChangeFixedAssetsLocationSheetComponent } from '../change-fixed-assets-location-sheet/change-fixed-assets-location-sheet.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  providers: [DatePipe, ChangeFixedAssetsLocationSheetComponent],
  selector: 'app-change-fixed-assets-location-list',
  templateUrl: './change-fixed-assets-location-list.component.html',
  styleUrls: ['./change-fixed-assets-location-list.component.scss']
})
export class ChangeFixedAssetsLocationListComponent implements OnInit {
  showLoader: boolean;
  ChangeFixedAssets: any;
  screenId: number = 84;
  custom: boolean;
  exportData: any[];
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  public TitlePage: string;
  Lang: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private ChangeFixedAssetsLocationService: ChangeFixedAssetsLocationService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private ChangeFixedAssetsLocationSheetComponent: ChangeFixedAssetsLocationSheetComponent,
    private datepipe: DatePipe) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetFixedassetsLocationChange();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ChangeFixedAssetsLocationList');
    this.title.setTitle(this.TitlePage);
  }

  GetFixedassetsLocationChange() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      this.ChangeFixedAssetsLocationService.getChangeFixedAssetsLocationList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.ChangeFixedAssets = result;
        if (currentLang == "ar") {
          this.refreshChangeFixedAssetsLocationArabic(this.ChangeFixedAssets);
        }
        else {
          this.refreshChangeFixedAssetsLocationEnglish(this.ChangeFixedAssets);
        }
        this.showLoader = false;
      })
    }, 500);
  }

  ShowDetailsOnly(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['ChangeFixedAssetsLocation/ChangeFixedAssetsLocationForm']);
  }

  AddNewChangeFixedAssetsLocation(id, Flag: number = 0) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ChangeFixedAssetsLocation/ChangeFixedAssetsLocationForm']);
  }

  EditChangeFixedAssetsLocation(id, Flag: number = 1) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ChangeFixedAssetsLocation/ChangeFixedAssetsLocationForm']);
  }

  DeleteChangeFixedAssetsLocationForm(id: any) {
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
        this.ChangeFixedAssetsLocationService.deleteFixedAssetsLocationChange(id).subscribe((results) => {

          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetFixedassetsLocationChange();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }
  /*    
      Print(id){
        debugger
        this.ChangeFixedAssetsLocationSheetComponent.Print(id);
        } */

  refreshChangeFixedAssetsLocationArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
        'رقم الحركة': x.transNo,
        'تاريخ الحركة': formattedDate,
        ' الاصل': x.assetName,
        'من موقع': x.fromLocationDesc,
        'الى موقع': x.toLocationDesc,
        ' البيان"': x.transNote,
      }
    });
  }

  refreshChangeFixedAssetsLocationEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.transDate).toLocaleDateString('en-GB');
      return {
        'Transaction Number': x.transNo,
        'Transaction Date': formattedDate,
        'Asset': x.assetName,
        'From Location': x.fromLocationDesc,
        'To Location': x.toLocationDesc,
        'Note': x.transNote,
      }
    });
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
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
       head = [[' البيان"', ' الى موقع', ' من موقع', ' الاصل', ' تاريخ الحركة', ' رقم الحركة']]
    }
    else {
       head = [['Note', 'To Location', 'From Location ', 'Asset', ' Transaction Date', 'Transaction Number']]
    }

    const rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date1 = new Date(part.transDate);
      const formattedDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.transNo
      temp[1] = formattedDate
      temp[2] = part.assetName
      temp[3] = part.fromLocationDesc
      temp[4] = part.toLocationDesc
      temp[5] = part.transNote
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

    const Title = currentLang == "ar" ? "قائمة  تغيير موقع أصل" : " Change Fixed Assets Location List" ;
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
    debugger
    this.ChangeFixedAssetsLocationService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.ChangeFixedAssetsLocationService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  PrintChangeFixedAssetsLocation(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptChangeFixedAssetsLocationAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptChangeFixedAssetsLocationEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
