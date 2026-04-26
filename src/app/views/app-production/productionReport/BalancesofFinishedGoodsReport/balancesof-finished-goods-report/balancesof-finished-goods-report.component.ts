import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ProductionReportService } from '../../production-report.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-balancesof-finished-goods-report',
  templateUrl: './balancesof-finished-goods-report.component.html',
  styleUrls: ['./balancesof-finished-goods-report.component.scss']
})
export class BalancesofFinishedGoodsReportComponent implements OnInit {
public Data: any;
screenId:number = 186;
exportData: any[];
custom:boolean;
public TitlePage: string;
data: any[];


constructor(private title: Title,
  private translateService: TranslateService,
  private alert: sweetalert,
  private jwtAuth: JwtAuthService,
  public routePartsService: RoutePartsService,
  private productionReportService: ProductionReportService,
  private readonly serv: AppCommonserviceService,
) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetReport();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('BalancesofFinishedGoodsReport');
    this.title.setTitle(this.TitlePage);
  }


  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.productionReportService.GetFinishItemsBalance().subscribe(result => {
      debugger
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        return
      }
      this.Data = result;
      
      if(currentLang == "ar"){
        this.refresBalancesofFinishedGoodsReportArabic(this.Data);
       }
       else{
        this.refreshBalancesofFinishedGoodsReportEnglish(this.Data);
       }        
    })
  }

  calculateSum(name) {
    let total = 0;

    if (this.Data) {
        for (let item of this.Data) {
            if (item.itemName === name) {
                total+=item.countryQty;
            }
        }
    }

    return total;
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

  getFavouriteStatus(screenId)
  {
  debugger
  this.serv.GetFavouriteStatus(screenId).subscribe(result => {
    debugger
    if(result.isSuccess)
    {
      this.custom = true;
    }
    else
    {
      this.custom = false;
    }
    debugger             
  })        
  }

  refresBalancesofFinishedGoodsReportArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'اسم المنتج': x.itemName,
      'رقم التشغيلة': x.batchNo,
      ' الكمية': x.countryQty,
      'الدولة': x.countryName,
    }));
  }

  refreshBalancesofFinishedGoodsReportEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Product Name': x.itemName,
      'Run Number': x.batchNo,
      'Quantity': x.countryQty,
      'COUNTRY': x.countryName,
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
       head = [[' الدولة',' الكمية ',' رقم التشغيلة',' اسم المنتج']]    }
    else{
       head = [['COUNTRY','Quantity','Run Number','Product Name']]
    }
    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.itemName
     temp[1]= part.batchNo 
     temp[2]= part.countryQty
     temp[3]= part.countryName

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

   const Title = currentLang == "ar" ? "ارصدة البضاعة الجاهزة" :"Balances of Finished Goods";
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
