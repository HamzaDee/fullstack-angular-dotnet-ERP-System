import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import Swal from 'sweetalert2';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { QaproductionService } from '../qaproduction.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-qaproduction-list',
  templateUrl: './qaproduction-list.component.html',
  styleUrls: ['./qaproduction-list.component.scss']
})
export class QaproductionListComponent implements OnInit {
  tabelData: any[];
  ProdOrderstatusList: any[];
  public TitlePage: string;
  data: any[];
  exportData: any[];
  Lang: any;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private egretLoader: AppLoaderService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private http: HttpClient,
    private qaproductionService: QaproductionService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetQAList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('QAList');
    this.title.setTitle(this.TitlePage);
  }

  GetQAList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      debugger
      this.qaproductionService.GetQAList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresQaproductionListArabic(this.tabelData);
        }
        else {
          this.refreshQaproductionListEnglish(this.tabelData);
        }
      })
    });
  }

  AddNew(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'New';
    this.router.navigate(['QAProduction/QaproductionForm']);
  }

  EditProdOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['QAProduction/QaproductionForm']);
  }

  ShowQA(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['QAProduction/QaproductionForm']);
  }

  CopyProdOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['QAProduction/ManOrderForm']);
  }

  ApproveProdOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Approval';
    this.router.navigate(['QAProduction/ManOrderForm']);
  }

  DeleteQA(id: any) {
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
        this.qaproductionService.DeleteQA(id).subscribe((results) => {
          if (results.isSuccess == false && results.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          if (results) {
            this.alert.DeleteSuccess();
            this.GetQAList();
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
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
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProdOrders/SaveAllProdItemQty/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, this.tabelData, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  refresQaproductionListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
        'رقم الحركة': x.qaNo,
        'اسم المادة': x.itemName,
        'رقم امر التصنيع': x.manfOrderNo,
        'رقم الباتش': x.batchNo,
        'اسم المستخدم': x.userName,
        'تاريخ الحركة': transDate,
        ' ملاحظات': x.notes,
      }
    });
  }


  refreshQaproductionListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('en-GB');
      return {
        'Transaction Number': x.qaNo,
        'Material Name': x.itemName,
        'Manufacturing Order No': x.manfOrderNo,
        'Batch Number': x.batchNo,
        'User Name': x.userName,
        'Transaction Date': transDate,
        ' Note': x.notes,
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
        this.refresQaproductionListArabic(exportSource);
      } else {
        this.refreshQaproductionListEnglish(exportSource);
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
       head = [['ملاحظات', 'تاريخ الحركة', ' اسم المستخدم', 'رقم الباتش', ' رقم امر التصنيع', 'اسم المادة', ' رقم الحركة']]
    }
    else {
       head = [[' Note', 'Transaction Date', 'User Name', 'Batch Number', ' Manufacturing Order No', 'Material Name', 'Transaction Number']]
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


      const date1 = new Date(part.transDate);
      const transDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.qaNo
      temp[1] = part.itemName
      temp[2] = part.manfOrderNo
      temp[3] = part.batchNo
      temp[4] = part.userName
      temp[5] = transDate
      temp[6] = part.notes


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

    const Title = currentLang == "ar" ?"قائمة الجودة":"Quality Assurance List";
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

  PrintQaproduction(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptQaproductionAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptQaproductionEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}


