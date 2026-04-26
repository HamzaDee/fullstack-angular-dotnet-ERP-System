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
import { PurchorderstatusFormComponent } from './purchorderstatus-form/purchorderstatus-form.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-purchorderstatus',
  templateUrl: './purchorderstatus.component.html',
  styleUrls: ['./purchorderstatus.component.scss']
})
export class PurchorderstatusComponent implements OnInit {
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
    private routePartsService: RoutePartsService,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetPOStatusList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PurchOrderStatusList');
    this.title.setTitle(this.TitlePage);
  }

  GetPOStatusList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    setTimeout(() => {
      this.GetPOStatusListSer().subscribe(result => {
        if(result.isSuccess === false || result.message === "msNoPermission"){
          this.alert.ShowAlert("msNoPermission","error");
          return
        }
        this.tabelData = result;

        if(currentLang == "ar"){
          this.refresPurchorderstatusArabic(this.tabelData);
         }
         else{
          this.refreshPurchorderstatusEnglish(this.tabelData);
         }   

      })
    });
  }

  GetPOStatusListSer() : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurOrderStatus/GetPOrderStatusList/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  AddNewPOStatus(id: number) {
    let title = this.translateService.instant('PurchOrderStatusForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(PurchorderstatusFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, 
        GetPOStatusListFromParent: () => { this.GetPOStatusList() }
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

  DeletePOStatus(id: any) {
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
        this.DeletePOStatusService(id).subscribe((results) => {
          if(results.isSuccess === false || results.message === "msNoPermission"){
            this.alert.ShowAlert("msNoPermission","error");
            return
          }
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.GetPOStatusList();
          }
          else {
            this.alert.ShowAlert(results.message,'error');
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

/*   DeletePOStatusService(id) : Observable<any> {
    debugger
    return this.http.delete(`${environment.apiURL_Main + '/api/PurOrderStatus/DeletePOrderStatus/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  } */

  //delete
    public DeletePOStatusService(id): Observable<any> {
      const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      var urlDelete = `${environment.apiURL_Main + '/api/PurOrderStatus/DeletePOrderStatus/' + this.jwtAuth.getLang() +'/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()+ '/' + id }`;
      return this.http.post<any>(urlDelete,'',httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  refresPurchorderstatusArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      ' الرقم': x.id,
      'الوصف بالعربية': x.descrA,
      'الوصف بالانجليزية': x.descrE,
    }));
  }

  refreshPurchorderstatusEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Number': x.id,
      'Arabic Description': x.descrA,
      'English Description': x.descrE,
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

  exportPdf()
  {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    let head: string[][];

    if(currentLang == "ar"){
       head = [[' الوصف بالانجليزية',' الوصف بالعربية','الرقم']]    }
    else{
       head = [[' English Description','Arabic Description','Number']]
    }
    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.id
     temp[1]= part.descrA 
     temp[2]= part.descrE

     if (isArabic) {
       temp.reverse();
     }
     rows.push(temp)
   },this.data)
  
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ?"قائمة حالات طلب الشراء":"Purchase Order Status List";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, {align: 'center'});
  
   autoTable(pdf as any, {
    head  :head,
    body :rows,
    headStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold' ,textColor: "black", lineWidth: 0.2 ,minCellWidth:20},
    bodyStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold'},
    theme:"grid",
  });
   pdf.output('dataurlnewwindow')
  }
}
