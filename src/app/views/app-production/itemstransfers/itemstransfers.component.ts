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
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-itemstransfers',
  templateUrl: './itemstransfers.component.html',
  styleUrls: ['./itemstransfers.component.scss']
})
export class ItemstransfersComponent implements OnInit {
  tabelData: any[];
  public TitlePage: string;
  exportData: any[];
  data: any[];

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
    this.TitlePage = this.translateService.instant('ItemsTransfers');
    this.title.setTitle(this.TitlePage);
  }

  GetItemsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      this.GetItemsListSer().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresSalesInvoiceArabic(this.tabelData);
        }
        else {
          this.refreshSalesInvoiceEnglish(this.tabelData);
        }

      })
    });
  }

  GetItemsListSer(): Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/ItemsTranfers/GeItemsTranfers/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  OnSaveQty(itemId, Qty) {
    setTimeout(() => {
      this.SaveQty(itemId, Qty).subscribe(result => {
        if (result) {
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

  refresSalesInvoiceArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const prodDate = new Date(x.prodDate).toLocaleDateString('ar-EG');
      const expiryDate = new Date(x.expiryDate).toLocaleDateString('ar-EG');
      const transferDate = new Date(x.transferDate).toLocaleDateString('ar-EG');
      return {
        'رقم المادة': x.itemNo,
        'اسم المادة': x.itemName,
        ' الوحدة': x.unitName,
        'الكمية': x.qty,
        'رقم التشغيلة': x.runNo,
        'تاريخ الانتاج': prodDate,
        'تاريخ الانتهاء': expiryDate,
        'الدول القديمة': x.oldCountryName,
        'الدول الجديدة': x.newCountryName,
        'تاريخ التحويل': transferDate,
      }
    });
  }

  refreshSalesInvoiceEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const prodDate = new Date(x.prodDate).toLocaleDateString('ar-EG');
      const expiryDate = new Date(x.expiryDate).toLocaleDateString('ar-EG');
      const transferDate = new Date(x.transferDate).toLocaleDateString('ar-EG');
      return {
        'Item Number': x.itemNo,
        'Item Name': x.itemName,
        'Unit': x.unitName,
        'Quantity': x.qty,
        'Run Number': x.runNo,
        'Prodction Date': prodDate,
        'Expiry Date': expiryDate,
        'Old Country': x.oldCountryName,
        'New Country': x.newCountryName,
        'Transfer Date': transferDate,
      }
    });
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
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['تاريخ التحويل', ' الدول الجديدة', 'الدول الدول', ' تاريخ الانتهاء', ' تاريخ الانتاج', 'رقم التشغيلة', ' الكمية', 'الوحدة', 'اسم المادة', 'رقم المادة']]
    }
    else {
       head = [['Transfer Date', 'New Country', 'Old Country', 'Expiry Date', 'Prodction Date', 'Run Number', 'Quantity', ' Unit', 'Item Name', 'Item Number']]
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

      const date1 = new Date(part.prodDate);
      const prodDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.expiryDate);
      const expiryDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;


      const date3 = new Date(part.transferDate);
      const transferDate = currentLang === 'ar'
        ? `${date3.getDate().toString().padStart(2, '0')}/${(date3.getMonth() + 1).toString().padStart(2, '0')}/${date3.getFullYear()}`
        : `${date3.getDate().toString().padStart(2, '0')}/${(date3.getMonth() + 1).toString().padStart(2, '0')}/${date3.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.itemNo
      temp[1] = part.itemName
      temp[2] = part.unitName
      temp[3] = part.qty
      temp[4] = part.runNo
      temp[5] = prodDate
      temp[6] = expiryDate
      temp[7] = part.oldCountryName
      temp[8] = part.newCountryName
      temp[9] = transferDate


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

    const Title = currentLang == "ar" ? "قائمة تحويلات المواد"  : "List of Items Transfers";    
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


  SaveItemstransfersRow(row) {
    debugger
    if (row.receivedValue == null || row.receivedValue == undefined) {
      row.receivedValue = 0;
    }
    if (row.note == '' || row.note == undefined) {
      row.note = null;
    }

    this.saveItemstransfersRow(row.itemNo, row.note, row.receivedValue, row.received).subscribe(res => {
      if (res) {
        debugger
        this.alert.SaveSuccess();
      }
      else {
        this.alert.SaveFaild();
      }
    }, err => {
      this.alert.SaveFaild();
    })
  }


  public saveItemstransfersRow(itemNo: string, note: string, receivedValue: number, received: boolean): Observable<any> {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(
      `${environment.apiURL_Main}/api/ItemsTranfers/SaveItemstransfersRow/${itemNo}/${note}/${receivedValue}/${received}`,
      null,
      httpOptions
    )
      .pipe(
        catchError(this.handleError)
      );
  }


  CheckreceivedValue(row) {
    if (row.receivedValue > row.qty) {
      row.receivedValue = 0;
      this.alert.ShowAlert("CanotreceivedValue", 'error');
      return;
    }
  }
}

