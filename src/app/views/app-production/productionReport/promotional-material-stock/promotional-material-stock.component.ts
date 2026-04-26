import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ProductionReportService } from '../production-report.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-promotional-material-stock',
  templateUrl: './promotional-material-stock.component.html',
  styleUrl: './promotional-material-stock.component.scss'
})
export class PromotionalMaterialStockComponent {
  showLoader = false;
  Data: any;
  public TitlePage: string;
  exportData: any[];


  constructor(
    private title: Title,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private ProductionReportService: ProductionReportService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetPromotionalMaterialStockList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PromotionalMaterialStock');
    this.title.setTitle(this.TitlePage);
  }

  GetPromotionalMaterialStockList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.ProductionReportService.GetPromotionalMaterialStock().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") 
      {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.Data = result;

      this.Data = result.map(item => {
        return {
          ...item,  
          notAvlQty: false 
        };
      });
      
      this.Data.forEach(e => {
        debugger;
        if (e.avlQuantities <= e.ol) {
            e.notAvlQty = true;
        } else {
            e.notAvlQty = false; 
        }
    });

    if(currentLang == "ar"){
      this.refresPromotionalMaterialStockArabic(this.Data);
     }
     else{
      this.refreshPromotionalMaterialStockEnglish(this.Data);
     } 

    });
  }

  refresPromotionalMaterialStockArabic(data) {
    debugger
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'اسم المنتج': x.prodName,
      ' اسم المادة الدعائيه': x.promName,
      ' الكميات المتوفرة': x.avlQuantities,
    }));
  }

  refreshPromotionalMaterialStockEnglish(data) {
    debugger
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Product Name': x.prodName,
      'Name Of The Promotional Material': x.promName,
      'Available Quantities': x.avlQuantities,
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
       head = [[' الكمية','المنتج','رقم المنتج']]    }
    else{
       head = [['Available Quantities',' Name Of The Promotional Material','Product Name']]
    }
    const rows :(number|string)[][]=[];
    this.Data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.prodName
     temp[1]= part.promName 
     temp[2]= part.avlQuantities

     if (isArabic) {
       temp.reverse();
     }
     rows.push(temp)
   },this.Data)
  
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

   const Title = currentLang == "ar" ?"تقرير مخزون المواد الدعائية" :"Promotional Material Stock";
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
