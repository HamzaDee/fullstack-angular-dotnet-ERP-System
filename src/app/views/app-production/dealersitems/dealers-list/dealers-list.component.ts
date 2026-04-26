import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';
import { DealeritemsService } from '../dealeritems.service'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { DealersFormComponent } from '../dealers-form/dealers-form.component'; 
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-dealers-list',
  templateUrl: './dealers-list.component.html',
  styleUrls: ['./dealers-list.component.scss']
})
export class DealersListComponent implements OnInit {
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
    private dealeritemsService: DealeritemsService,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetDealersList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('DealersItemsList');
    this.title.setTitle(this.TitlePage);
  }

  GetDealersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    setTimeout(() => {
      this.dealeritemsService.GetDealersList().subscribe(result => {
        if(result.isSuccess === false || result.message === "msNoPermission"){
          this.alert.ShowAlert("msNoPermission","error");
          return
        }
        this.tabelData = result;

        
        if(currentLang == "ar"){
          this.refresDealersListArabic(this.tabelData);
         }
         else{
          this.refreshDealersListEnglish(this.tabelData);
         } 

      })
    });
  }

  AddNewItems(dealerId,dealerName){
    debugger
      let dialogRef: MatDialogRef<any> = this.dialog.open(DealersFormComponent, {
        width: '1000px',
        height: '90%',
        //maxHeight: '700px',
        direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
        data: { title: this.translateService.instant('DealerItemForm'), dealerName: dealerName, id: dealerId, GetDealersList: () => { this.GetDealersList() } }
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
        this.dealeritemsService.DeleteProdLine(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.GetDealersList();
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

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  refresDealersListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم المورد': x.no,
      ' المورد': x.dealerName,
    }));
  }

  refreshDealersListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Dealer Number': x.no,
      'Dealer ': x.dealerName,
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
       head = [['المورد',' رقم المورد']]    }
     else{
       head = [['Dealer','Dealer Number']]
    }
    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.no
     temp[1]= part.dealerName 

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

   const Title = currentLang == "ar" ? "قائمة مواد الموردين" : "Dealers Items List"  ;
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

