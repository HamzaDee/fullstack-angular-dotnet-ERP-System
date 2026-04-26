import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { sweetalert } from 'sweetalert';
import { ProductionReportService } from '../production-report.service';
import { ValidatorsService } from 'app/shared/services/validators.service';
import * as FileSaver from 'file-saver';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { formatDate } from '@angular/common';
import { of, delay } from 'rxjs';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';


@Component({
  selector: 'app-actual-sales-vs-sales-orders',
  templateUrl: './actual-sales-vs-sales-orders.component.html',
  styleUrl: './actual-sales-vs-sales-orders.component.scss'
})
export class ActualSalesVsSalesOrdersComponent {
  ActualSalesVsSalesOrdersForm: FormGroup;
  Data: any;
  showLoader = false;
  hasPerm: boolean;
  public TitlePage: string;
  //List
  countryList: any;
  agentList: any;
  itemsList: any;
  salesOrdersList: any[];
  allcustomers: any;
  disabledate: boolean;
  disableYear: boolean;
  exportData: any[];
  screenId: number = 245;
  custom: boolean;
  selectedCountryName: string = '';
  NewDate:Date = new Date;

  constructor
    (
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private alert: sweetalert,
      public validatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private serv: AppCommonserviceService,
      private cdr: ChangeDetectorRef,
      private title: Title,
      private service: ProductionReportService
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.ActualSalesVsSalesOrdersForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      countryId: [0],
      agentId: [0],
      orderId:[0],
      itemId: [0],
      fromdate: [""],
      todate: [""],
      year: [0],
    });
    this.GetActualSalesVsSalesOrdersInitialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ActualSalesVsSalesOrders');
    this.title.setTitle(this.TitlePage);
  }

  GetActualSalesVsSalesOrdersInitialForm() {
    debugger
     var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';        
    this.countryList = [];
    this.agentList = [];
    this.itemsList = [];
    this.service.GetActualSalesVsSalesOrdersForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.Data = result.reportRows;
                if(currentLang == "ar"){
              this.refresItemsLocationArabic(this.Data);
            }
            else{
              this.refreshItemsLocationEnglish(this.Data);
            }  
      this.countryList = result.countrylist;
      this.agentList = result.agentlist;
      this.salesOrdersList = result.salesOrdersList;
      this.itemsList = result.itemslist;
      this.ActualSalesVsSalesOrdersForm.get("year").setValue(result.year);
      this.ActualSalesVsSalesOrdersForm.get("fromdate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
      this.ActualSalesVsSalesOrdersForm.get("todate").setValue(formatDate(result.toDate, "yyyy-MM-dd", "en-US"));

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.ActualSalesVsSalesOrdersForm.get("agentId").setValue(0);
        this.ActualSalesVsSalesOrdersForm.get("itemId").setValue(0);
      });
    });
  }

  getCustomers(event: any) {
    debugger
    const countryId = event.value === undefined ? event : event.value;
    const selectedCountry = this.countryList.find(c => c.id === countryId);
    this.selectedCountryName = selectedCountry ? selectedCountry.text : '';
    if (countryId == 0)
      this.agentList = this.allcustomers;
    else
      this.agentList = this.allcustomers.filter(c => c.id == countryId || c.id == -1);
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';        
    var countryId =  this.ActualSalesVsSalesOrdersForm.value.countryId ?? 0;
    // var agentId =  this.ActualSalesVsSalesOrdersForm.value.agentId ?? 0;
    var agentId = Number(this.ActualSalesVsSalesOrdersForm.value.agentId) ?? 0;
    var orderId =  this.ActualSalesVsSalesOrdersForm.value.orderId ?? 0;
    var itemId =  this.ActualSalesVsSalesOrdersForm.value.itemId ?? 0;
    var fromdate =  this.ActualSalesVsSalesOrdersForm.value.fromdate;
    var todate =  this.ActualSalesVsSalesOrdersForm.value.todate;
    var year =  this.ActualSalesVsSalesOrdersForm.value.year;

     this.service.GetActualSalesVsSalesOrdersSearch(
        countryId,
        agentId,
        orderId,
        itemId,
        fromdate,
        todate,
        year)
        .subscribe((result) =>{
           debugger
          this.Data = result.reportRows;
          if(result.reportRows.length >0){
            if(currentLang == "ar"){
              this.refresItemsLocationArabic(this.Data);
            }
            else{
              this.refreshItemsLocationEnglish(this.Data);
            }  
          }
    });
  }

  clearFormData() {
    this.Data = [];
    this.ActualSalesVsSalesOrdersForm.get('countryId').setValue(0);
    this.ActualSalesVsSalesOrdersForm.get('agentId').setValue(0);        
    this.ActualSalesVsSalesOrdersForm.get('itemId').setValue(0);
    this.ActualSalesVsSalesOrdersForm.get('orderId').setValue(0);
    this.NewDate = new Date;    
    this.ActualSalesVsSalesOrdersForm.get("fromdate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ActualSalesVsSalesOrdersForm.get("todate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.GetActualSalesVsSalesOrdersInitialForm();
    this.Data = [];
    this.cdr.detectChanges();
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

  refresItemsLocationArabic(data) {
  debugger
  this.Data = data;
  this.exportData = this.Data.map(x => ({
  ' رقم المنتج': x.itemNo,
  'اسم المنتج': x.itemName,
  ' السعر': x.price,
  'كمية طلب المبيعات': x.salesOrderQuantity,
  'قيمة طلب المبيعات': x.salesOrderValue,
  'الكمية المباعه الفعليه': x.actualSoldQuantity,
  'القيمه المباعه الفعليه': x.actualSoldValue,
  'نسبة المبيعات مقابل اوامر الشراء': x.soldPercentage,
  'الكمية المتبقيه': x.remainingQuantity,
  }));
  }


  refreshItemsLocationEnglish(data) {
  debugger
  this.Data = data;
  this.exportData = this.Data.map(x => ({
  'Product Number': x.itemNo,
  'Product Name': x.itemName,
  'Price': x.price,
  'Sales Order Quantity': x.salesOrderQuantity,
  'Sales Order Value': x.salesOrderValue,
  'Actual Sold Quantity': x.actualSoldQuantity,
  'Actual Sold Value': x.actualSoldValue,
  'Percentage Of Sold Vs Purchase Orders': x.soldPercentage,
  'remaining': x.remainingQuantity,
  }));
  }

  exportExcel() {
  debugger
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
  if(currentLang == "ar"){
  var head = [['الكمية المتبقيه',' نسبة المبيعات مقابل اوامر الشراء','القيمة المباعة الفعلية',' الكميه المباعه الفعلية',' قيمة طلب المبيعات','كمية طلب المبيعات',' السعر',' اسم المنتج',' رقم المنتج']]    }
  else{
      var head = [['remaining','Percentage Of Sold Vs Purchase Orders','Actual Sold Value','Actual Sold Quantity','Sales Order Value','Sales Order Quantity','Price',' Product Name','Product Number']]
  }
  const rows :(number|string)[][]=[];
  this.Data.forEach(function(part, index) {
  let temp: (number|string)[] =[];
  temp[0]= part.itemNo
  temp[1]= part.itemName 
  temp[2]= part.price
  temp[3]= part.salesOrderQuantity
  temp[4]= part.salesOrderValue 
  temp[5]= part.actualSoldQuantity
  temp[6]= part.actualSoldValue
  temp[7]= part.soldPercentage
  temp[8]= part.remainingQuantity 
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

    const Title = currentLang == "ar" ? "المبيعات الفعلية مقابل أوامر المبيعات " :"Actual sales vs sales orders";
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
