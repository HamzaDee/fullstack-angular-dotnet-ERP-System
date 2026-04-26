import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ProductionReportService } from '../../production-report.service';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart } from 'chart.js';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-produced-quantities-list',
  templateUrl: './produced-quantities-list.component.html',
  styleUrls: ['./produced-quantities-list.component.scss']
})
export class ProducedQuantitiesListComponent implements OnInit {
  public Data: any;
  screenId:number = 187;
  exportData: any[];
  custom:boolean;
  fromDate: any;
  toDate : any;
  public myChart: Chart;
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

    const today = new Date();
    this.fromDate=today.toISOString().split('T')[0];
    this.toDate=today.toISOString().split('T')[0];
    this.GetReport();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProducedQuantitiesList');
    this.title.setTitle(this.TitlePage);
  }

  GetReport() {
    debugger    
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.productionReportService.GetProducedQty(this.fromDate,this.toDate).subscribe(result => {     
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        return
      } 
      this.Data = result;                  
      if(currentLang == "ar"){
        this.refreshInventoryReportArabic(this.Data);
       }
       else{
        this.refreshInventoryReportEnglish(this.Data);
       }
      this.GetChart()
    })
  }

  calculateSum(){
    if(this.Data != undefined)
      return this.Data.reduce((sum, item) => sum + parseFloat(item.countryQty), 0); 
    else  
      return 0;
  }

  GetChart() {
    debugger
    const xAxis = this.Data.map(item => item.itemName);
    const yAxis = this.Data.map(item => item.countryQty);
    
    this.myChart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: xAxis,
        datasets: [{
          label: 'الكميات المنتجة',
          data: yAxis,
          backgroundColor: '#1a389f',
          borderWidth: 1,
        }]
      },
      options: {
        scales: {
          yAxes: {
            ticks: {
              font: {
                family: 'ArFont', // Font family
              }
            },
            title: {
              display: true,
              text: '', // Use 'text' instead of 'labelString'
              font: {
                  family: 'ArFont', // Font family
                  size: 20, // Font size
                  weight: 'bold' // Font style
              },
              color: '#2B1B17' // Replaces 'fontColor'
            }
          },
          xAxes: {
            beginAtZero: true,
            ticks: {
              display: true,              
            },
            title: {
              display: true,
              text: 'الكميات المنتجة', // Use 'text' instead of 'labelString'
              font: {
                  family: 'ArFont', // Font family
                  size: 20, // Font size
                  weight: 'bold' // Font style
              },
              color: '#2B1B17' // Replaces 'fontColor'
            }
          },
        },
      }
    });
  
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

  refreshInventoryReportArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      ' رقم المنتج': x.itemNo,
      ' اسم المنتج': x.itemName,
      ' الكميات المصنعه': x.countryQty,
    }));
  }

  refreshInventoryReportEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Product Number': x.itemNo,
      'Product Name': x.itemName,
      'Manufactured Quantities': x.countryQty,
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
       head = [[' الكميات المصنعه',' اسم المنتج' ,'رقم المنتج']]
    }
      else{
       head = [['Manufactured Quantities','Product Name','Product Number']]
    }
    
    const rows :(number|string)[][]=[];
    this.Data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
    temp[0]= part.itemNo;
    temp[1]= part.itemName;
    temp[2]= part.countryQty;
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

   const Title = currentLang == "ar" ? "كشف الكميات المنتجة" :"Produced Quantities";
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
