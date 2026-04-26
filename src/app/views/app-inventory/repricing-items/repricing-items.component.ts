import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatMenu } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RepricingItemsDetailsComponent } from './repricing-items-details/repricing-items-details.component';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RepricingitemsService } from './repricingitems.service'; 
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { sweetalert } from 'sweetalert';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-repricing-items',
  templateUrl: './repricing-items.component.html',
  styleUrls: ['./repricing-items.component.scss'],
})
export class RepricingItemsComponent implements OnInit {
  @ViewChild('group') group: MatButtonToggleGroup;
  @ViewChild('menu') menu: MatMenu;
  public TitlePage: string;
  dataTable: any[]
  exportData: any[];
  data: any[];


  constructor(public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
    private repricingitemsService: RepricingitemsService,
    private alert: sweetalert,

  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAllLists();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('RepricingItems');
    this.title.setTitle(this.TitlePage);
  }

  GetAllLists() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.repricingitemsService.GetAllRepricingItems().subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }

      this.dataTable = result;

      if(currentLang == "ar"){
        this.refreshRepricingItemsArabic(this.dataTable);
       }
       else{
        this.refreshRepricingItemsEnglish(this.dataTable);
       }   

    });
  }

  OpenRepricingItemFormPopUp() {
    debugger
    this.router.navigate(['RepricingItem/RepricingItemsForm', { GetAllLists: () => this.GetAllLists() }]);
  }

  OpenRepricingDetailsFormPopUp(id) {
    let title = this.translateService.instant('DetailRepricingItems')
    let dialogRef: MatDialogRef<any> = this.dialog.open(RepricingItemsDetailsComponent, {
      width: '920px',
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  refreshRepricingItemsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
      ' الرقم': x.id,
      'تاريخ الحركة': formattedDate,
      'اسم المستخدم': x.userName,
      'نوع التعديل': x.changeType,
      'القيمة': x.amount,
      'زيادة او نقصان': x.increase,
      'ملاحظات': x.note,
    }
    });
  }

  refreshRepricingItemsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.transDate).toLocaleDateString('en-GB');
      return {
      'Number': x.id,
      'Transaction Date': formattedDate,
      'User Name': x.userName,
      'Edit Type': x.changeType,
      'Value': x.amount,
      'Increase Or Decrease': x.increase,
      'Notes': x.note,
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

  exportPdf()
  {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    let head: string[][];

    if(currentLang == "ar"){
       head = [[' ملاحظات',' زيادة او نقصان','القيمة',' نوع التعديل',' اسم المستخدم',' تاريخ الحركة','  الرقم']]    }
    else{
       head = [['Notes','Increase Or Decrease','Value','Edit Type',' User Name','Transaction Date','Number']]
    }

    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {

    const date = new Date(part.transDate);
    const formattedDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

    let temp: (number|string)[] =[];
     temp[0]= part.id
     temp[1]= formattedDate 
     temp[2]= part.userName
     temp[3]= part.changeType
     temp[4]= part.amount 
     temp[5]= part.increase
     temp[6]= part.note
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

   let Title = "";
   if(currentLang == "ar"){
     Title = "قائمة اعادة تسعير المواد ";
  }
   else{
     Title = "Repricing Items ";
   }
  
   let pageWidth = pdf.internal.pageSize.width;
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
