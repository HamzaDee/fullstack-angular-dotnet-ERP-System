import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import * as FileSaver from 'file-saver';
import { VoucherTypeFormComponent } from './voucher-type-form/voucher-type-form.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { VoucherTypeService } from '../voucher-type.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-voucher-type-list',
  templateUrl: './voucher-type-list.component.html',
  styleUrls: ['./voucher-type-list.component.scss']
})
export class VoucherTypeListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 30;
  custom: boolean;
  exportData: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private alert: sweetalert,
    private voucherTypeService: VoucherTypeService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private readonly serv: AppCommonserviceService,
  ) {
  }
  ngOnInit(): void {
    this.SetTitlePage();
    this.GetVoucherTypeList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('VoucherTypesList');
    this.title.setTitle(this.TitlePage);
  }

  GetVoucherTypeList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.voucherTypeService.GetVoucherTypeList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refreshVocherListTableArabic(this.tabelData);
        }
        else {
          this.refreshVocherListTableEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });
  }
  //shoud add permission
  DeleteVoucherType(id: any) {
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
        this.voucherTypeService.DeleteVoucherType(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetVoucherTypeList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            this.alert.ShowAlert("msgRecordHasLinks", 'error')
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenImportCompaniesFormPopUp(id: InputNumber) {
    let title = this.translateService.instant('ImportCompanies');
    let dialogRef: MatDialogRef<any> = this.dialog.open(VoucherTypeFormComponent, {
      width: '75%',
      height: '75%',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, companyid: this.jwtAuth.getCompanyId(),
        GetAllVoucherTypeList: () => { this.GetVoucherTypeList() }
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  NavigateVoucherTypeForm(id) {
    this.routePartsService.GuidToEdit = id
    this.router.navigate(['VoucherType/VoucherTypesList/VoucherTypeForm']);
  }

  refreshVocherListTableArabic(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      'الرقم': x.id,
      'الاسم': x.voucherName,
      'فئه السند': x.categoryName,
      'نوع التسلسل': x.serialTypeName,
      'نوع السند الافتراضي': x.isDefault,

    }));
  }

  refreshVocherListTableEnglish(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      'Number': x.id,
      'Name': x.voucherName,
      'Voucher Category': x.categoryName,
      'Serial Type': x.serialTypeName,
      'Is Default Voucher Type': x.isDefault,
    }));
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
       head = [['نوع السند الافتراضي', 'نوع التسلسل ', ' فئه السند', '  الاسم', ' الرقم']]
    }
    else {
       head = [['Is Default Voucher Type', ' Serial Type  ', 'Voucher Category ', ' Name', 'Number']]
    }

    const rows: (number | string)[][] = [];

    this.tabelData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.id
      temp[1] = part.voucherName
      temp[2] = part.categoryName
      temp[3] = part.serialTypeName
      temp[4] = part.isDefault

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.tabelData)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "كشف   قائمة أنواع السندات ";
    }
    else {
      Title = "Voucher Types List";
    }

    // let Title = "    كشف   قائمة أنواع السندات        ";
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

  getFavouriteStatus(screenId) {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
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
}
