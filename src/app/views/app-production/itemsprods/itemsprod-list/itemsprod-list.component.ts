import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';


@Component({
  selector: 'app-itemsprod-list',
  templateUrl: './itemsprod-list.component.html',
  styleUrls: ['./itemsprod-list.component.scss']
})
export class ItemsprodListComponent implements OnInit {
  tabelData: any[];
  public TitlePage: string;
  data: any[];
  exportData: any[];


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private egretLoader: AppLoaderService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetItemsList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsprodList');
    this.title.setTitle(this.TitlePage);
  }

  GetItemsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      this.GetItemsListSer().subscribe(result => {
        if (result.isSuccess === false || result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", "error");
          return
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresItemsprodListArabic(this.tabelData);
        }
        else {
          this.refreshItemsprodListEnglish(this.tabelData);
        }

      })
    });
  }

  GetItemsListSer(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsProd/GetProdItemsList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  OnSaveQty(itemId, Qty) {
    setTimeout(() => {
      this.SaveQty(itemId, Qty).subscribe(result => {
        if (result) {
          if (result.isSuccess === false || result.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", "error");
            return
          }
          this.alert.SaveSuccess();
        };
      })
    });
  }

  SaveQty(itemId, Qty): Observable<any> {
    debugger
    itemId = itemId.replaceAll('/', '%2F');
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsProd/SaveProdItemQty/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + itemId + '/' + Qty} `, null)
      .pipe(
        catchError(this.handleError)
      )
  }

  OnSaveAll() {
    setTimeout(() => {
      this.egretLoader.open(this.translateService.instant('PleaseWait'));
      this.SaveAll().subscribe(result => {
        if (result) {
          if (result.isSuccess === false || result.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", "error");
            return
          }
          this.alert.SaveSuccess();
        };
        this.egretLoader.close()
      })
    });
  }

  SaveAll(): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ItemsProd/SaveAllProdItemQty/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, this.tabelData, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  refresItemsprodListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم المادة': x.item_No,
      'اسم المادة': x.item_Name,
      'كمية الحد الادنى للتصنيع ': x.minProdQty,
    }));
  }

  refreshItemsprodListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Item Number': x.item_No,
      'Item Name': x.item_Name,
      'Minimum Manufacturing Qty': x.minProdQty,
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
        this.refresItemsprodListArabic(exportSource);
      } else {
        this.refreshItemsprodListEnglish(exportSource);
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
       head = [['كمية الحد الادنى للتصنيع ', ' اسم المادة', ' رقم المادة']]
    }
    else {
       head = [['Minimum Manufacturing Qty', 'Item Name', 'Item Number']]
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
      temp[0] = part.item_No
      temp[1] = part.item_Name
      temp[2] = part.minProdQty

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

    const Title = currentLang == "ar" ? "تعديل كمية الحد الأدنى للتصنيع للمواد" : "Adjustment of minimum manufacturing quantity for materials";  
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
