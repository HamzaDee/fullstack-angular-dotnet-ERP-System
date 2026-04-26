import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';
import { ProductionlinesService } from './productionlines.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ProductionlinesFormComponent } from './productionlines-form/productionlines-form.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-productionlines',
  templateUrl: './productionlines.component.html',
  styleUrls: ['./productionlines.component.scss']
})
export class ProductionlinesComponent implements OnInit {
  tabelData: any[];
  public TitlePage: string;
  exportData: any[];
  exportColumns: any[];
  data: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private egretLoader: AppLoaderService,
    private productionlinesService: ProductionlinesService,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetProdLinesList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProductionLinesList');
    this.title.setTitle(this.TitlePage);
  }

  GetProdLinesList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.productionlinesService.GetProdLinesListSer().subscribe(result => {
        if (result.isSuccess === false || result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", "error");
          return
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresProductionlinesArabic(this.tabelData);
        }
        else {
          this.refreshProductionlinesEnglish(this.tabelData);
        }
      })
    });
  }

  AddNewProdLine(id) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ProductionlinesFormComponent, {
      width: '1000px',
      height: '90%',
      //maxHeight: '700px',
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: this.translateService.instant('ProductionLinesForm'), id: id, GetProdLinesList: () => { this.GetProdLinesList() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  DeleteProdLine(id: any) {
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
        this.productionlinesService.DeleteProdLine(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.GetProdLinesList();
          }
          else {
            this.alert.ShowAlert(results.message, 'error');
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  refresProductionlinesArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم الخط': x.prodLineNo,
      'وصف الخط': x.lineNameA,
      'مدة التشغيل': x.runtime,
      'عدد المنتجات': x.itemsCount,
    }));
  }

  refreshProductionlinesEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Line Number': x.prodLineNo,
      'Item Descrption': x.lineNameA,
      'Run Time': x.runtime,
      'Number of Products': x.itemsCount,
    }));
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {

      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresProductionlinesArabic(exportSource);
      } else {
        this.refreshProductionlinesEnglish(exportSource);
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
       head = [['عدد المنتجات ', 'مدة التشغيل ', ' وصف الخط', ' رقم الخط']]
    }
    else {
       head = [['Number of Products', 'Run Time', 'Item Descrption', 'Line Number']]
    }
    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    }
    else {
      exportSource = this.data;
    }

    exportSource.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.prodLineNo
      temp[1] = part.lineNameA
      temp[2] = part.runtime
      temp[3] = part.itemsCount


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

    const Title = currentLang == "ar" ?  "قائمة خطوط الانتاج " : "Production Lines List";
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
