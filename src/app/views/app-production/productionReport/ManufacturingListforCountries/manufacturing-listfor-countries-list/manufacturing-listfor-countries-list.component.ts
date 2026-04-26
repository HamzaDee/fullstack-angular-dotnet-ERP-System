import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ProductionReportService } from '../../production-report.service';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-manufacturing-listfor-countries-list',
  templateUrl: './manufacturing-listfor-countries-list.component.html',
  styleUrls: ['./manufacturing-listfor-countries-list.component.scss']
})
export class ManufacturingListforCountriesListComponent implements OnInit {
  public Data: any;
  screenId:number = 188;
  exportData: any[];
  custom:boolean;
  public TitlePage: string;

  constructor(
    private title: Title,
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
    this.TitlePage = this.translateService.instant('ManufacturingListforCountriesList');
    this.title.setTitle(this.TitlePage);
    }

    GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.productionReportService.GetProdByCountriesList().subscribe(result => {
    debugger
    if(result.isSuccess === false || result.message === "msNoPermission"){
    this.alert.ShowAlert("msNoPermission","error");
    return
    } 
    this.Data = result;        
    if(currentLang == "ar"){
    this.refreshManufacturingListforCountriesArabic(this.Data);
    }
    else{
    this.refreshManufacturingListforCountriesEnglish(this.Data);
    }

    this.Data.forEach(e => {
    e.prodDate = formatDate( e.prodDate , "yyyy-MM-dd" ,"en-US");
    e.expiryDate = formatDate( e.expiryDate , "yyyy-MM-dd" ,"en-US");
    })
    })
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

    refreshManufacturingListforCountriesArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
    'الدولة': x.countryName,
    'رقم امر التصنيع': x.manfOrderNo,
    'اسم المنتتج': x.itemName,
    'رقم التشغيل': x.batchNo,
    'تاريخ الانتاج': x.prodDate,
    'تاريخ الانتهاء': x.expiryDate,
    'الكمية': x.countryQty,
    }));
    }


    refreshManufacturingListforCountriesEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
    'COUNTRY': x.countryName,
    'Manufacturing Order Number': x.manfOrderNo,
    'Product Name': x.itemName,
    'Code Number': x.batchNo,
    'product Date': x.prodDate,
    'Expiry Date': x.expiryDate,
    'Quantity': x.countryQty,
    }));
    }

    exportExcel() {
    import("xlsx").then(xlsx => {
    const worksheet = xlsx.utils.json_to_sheet(this.exportData);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "Produced Quantities Report", ".xlsx");
    });
    }

    saveAsExcelFile(buffer: any, fileName: string, extension: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = extension;
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
        head = [['الكمية','تاريخ الانتهاء','تاريخ الانتاج','رقم التشغيل',' اسم المنتج','  رقم امر التصنيع' ,' الدولة']]
      }
      else{
        head = [['Quantity','Expiry Date','product Date','Code Number','Product Name','Manufacturing Order Number','COUNTRY']]
      }


    const rows :(number|string)[][]=[];
    this.Data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
    temp[0]= part.countryName;
    temp[1]= part.manfOrderNo;
    temp[2]= part.itemName;
    temp[3]= part.batchNo;
    temp[4]= part.prodDate;
    temp[5]= part.expiryDate;
    temp[6]= part.countryQty;
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

    const Title = currentLang == "ar" ? "كشف قائمة التصنيع للدول" :"Produced Quantities";
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
