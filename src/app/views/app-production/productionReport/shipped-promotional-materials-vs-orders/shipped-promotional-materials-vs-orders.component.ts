import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { of, delay } from 'rxjs';
import { sweetalert } from 'sweetalert';
import { ProductionReportService } from '../production-report.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-shipped-promotional-materials-vs-orders',
  templateUrl: './shipped-promotional-materials-vs-orders.component.html',
  styleUrl: './shipped-promotional-materials-vs-orders.component.scss'
})
export class ShippedPromotionalMaterialsVsOrdersComponent {
 ShippedPromotionalMaterialsVsOrdersForm: FormGroup;
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
    (private formbulider: FormBuilder,
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
    this.ShippedPromotionalMaterialsVsOrdersForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      countryId: [0],
      agentId: [0],
      year: [0],
      fromdate: [""],
      todate: [""],
      itemId: [0],
      orderId: [0],
    });
    this.GetShippedPromotionalMaterialsVsOrdersInitialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ShippedPromotionalMaterialsVsOrders');
    this.title.setTitle(this.TitlePage);
  }

  GetShippedPromotionalMaterialsVsOrdersInitialForm() {
    debugger
    this.countryList = [];
    this.agentList = [];
    this.itemsList = [];
    this.service.GetShippedPromotionalMaterialsVsOrders().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.countryList = result.countrylist;
      this.agentList = result.agentlist;
      this.salesOrdersList = result.salesOrdersList;
      this.itemsList = result.itemslist;
      this.ShippedPromotionalMaterialsVsOrdersForm.get("year").setValue(result.year);
      this.ShippedPromotionalMaterialsVsOrdersForm.get("fromdate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
      this.ShippedPromotionalMaterialsVsOrdersForm.get("todate").setValue(formatDate(result.toDate, "yyyy-MM-dd", "en-US"));

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.ShippedPromotionalMaterialsVsOrdersForm.get("agentId").setValue(0);
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
    var countryId =  this.ShippedPromotionalMaterialsVsOrdersForm.value.countryId ?? 0;
    var agentId =  this.ShippedPromotionalMaterialsVsOrdersForm.value.agentId ?? 0;
    var orderId =  this.ShippedPromotionalMaterialsVsOrdersForm.value.orderId ?? 0;
    var itemId =  this.ShippedPromotionalMaterialsVsOrdersForm.value.itemId ?? 0;
    var fromdate =  this.ShippedPromotionalMaterialsVsOrdersForm.value.fromdate;
    var todate =  this.ShippedPromotionalMaterialsVsOrdersForm.value.todate;
    var year =  this.ShippedPromotionalMaterialsVsOrdersForm.value.year;

     this.service.GetShippedPromotionalSearch(
           countryId,
           agentId,
           orderId,
           itemId,
           fromdate,
           todate,
           year)
           .subscribe((result) =>{
           debugger
          this.Data = result;

          if(currentLang == "ar"){
            this.refresItemsLocationArabic(this.Data);
           }
           else{
            this.refreshItemsLocationEnglish(this.Data);
           }       
          });
  }

  clearFormData() {
    this.Data = [];
    this.ShippedPromotionalMaterialsVsOrdersForm.get('countryId').setValue(0);
    this.ShippedPromotionalMaterialsVsOrdersForm.get('agentId').setValue(0);        
    this.ShippedPromotionalMaterialsVsOrdersForm.get('itemId').setValue(0);
    this.ShippedPromotionalMaterialsVsOrdersForm.get('orderId').setValue(0);
    this.NewDate = new Date;
    this.ShippedPromotionalMaterialsVsOrdersForm.get("fromdate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ShippedPromotionalMaterialsVsOrdersForm.get("todate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.GetShippedPromotionalMaterialsVsOrdersInitialForm();
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
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'اسم المنتج': x.item_Name,
      'اسم الوحدة': x.unitName,
      'سعر الوحدة': x.price,
      'الكمية المتوقعه': x.forecastingQty,
      'قيمة الكمية المتوقعه': x.forecastingAmount,
      'الكمية المباعه': x.soldQty,
      'قيمة الكمية المباعه': x.salesAmount,
      'الكمية المتبقيه': x.remainingQty,
      'قيمة الكمية المتبقيه': x.remainingAmount,
      'نسبة التحقيق للكمية': x.qtyInvestegationRate,
      'نسبة التحقيق للقيمة': x.amountInvestegationRate,
      'المجاني المتوقع': x.forecastingFree,
      'المجاني المحقق': x.actualFree,
      'بونص متوقع': x.bonusForecastingQty,
      'بونص محقق': x.actualBonusQty,
      'كميات أخرى': x.otherQty,
      'كميات أخرى محققة': x.soldOtherQty,
    }));
  }

  refreshItemsLocationEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Product Name': x.item_Name,
      'Unit Name': x.unitName,
      'Unit Price': x.price,
      'Forcast Qty': x.forecastingQty,
      'Forcast Qty Value': x.forecastingAmount,
      'Sold Qty': x.soldQty,
      'Sold Qty Value': x.salesAmount,
      'Remaining Quantity': x.remainingQty,
      'Remaining Quantity Value': x.remainingAmount,
      'Achievement % Qty': x.qtyInvestegationRate,
      'Achievement % Amount': x.amountInvestegationRate,
      'Forcast Free': x.forecastingFree,
      'Achieved Free': x.actualFree,
      'Forcast Bonus': x.bonusForecastingQty,
      'Achieved Bonus': x.actualBonusQty,
      'Other Qty': x.otherQty,
      'Achieved Other Qty': x.soldOtherQty,
    }));
  }

  exportExcel() {
    debugger
    const selectedAgentId = this.ShippedPromotionalMaterialsVsOrdersForm.get('agentId')?.value;
    const selectedAgent = this.agentList.find(agent => agent.data1 === selectedAgentId)?.text;
    import("xlsx").then(xlsx => {
      // Define extra rows before the table
      const extraRows = [
        // ["Country:", this.selectedCountryName], // Replace with actual variable
        ["Agent Name:", selectedAgent], // Replace with actual variable
        [], // Empty row for spacing
      ];

      // Convert JSON data to worksheet
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // Convert worksheet to an array of arrays (ensuring correct type)
      const tableData: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      // Ensure tableData is an array before merging
      if (!Array.isArray(tableData)) {
        console.error("Error: tableData is not in array format.", tableData);
        return;
      }

      // Combine extra rows with table data
      const newWorksheet = xlsx.utils.aoa_to_sheet([...extraRows, ...tableData]);

      // Create workbook
      const workbook = { Sheets: { 'data': newWorksheet }, SheetNames: ['data'] };

      // Convert to Excel format
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Save file
      this.saveAsExcelFile(excelBuffer, "Forcasting Report");
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

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['كميات أخرى محققة', 'كميات أخرى', 'بونص محقق', 'بونص متوقع', 'المجاني المحقق', 'المجاني المتوقع', 'نسبة التحقيق للقيمة', 'نسبة التحقيق للكمية', 'قيمة الكميه المتبقيه', 'الكمية المتبقيه', 'قيمة الكمية المباعه', 'الكمية المباعه', 'قيمة الكميه المتوقعه', 'الكمية المتوقعه', ' سعر الوحدة', ' اسم الوحدة', ' اسم المنتج']]
    }
    else {
       head = [['Actual Other Qty', 'Other Qty', 'Actual Bonus', 'Forcast Bonus', 'Actual Free', 'Expected Free', 'Amount Realization Ratio', 'Quantity Realization Ratio', 'remaining Quantity Value', 'remaining Quantity', 'Sold Qty Value', 'Sold Qty', 'Expected Qty Value', 'Expected Qty', 'Unit Price', 'Unit Name', 'Product Name']]
    }
    const rows: (number | string)[][] = [];
    this.Data.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.item_Name
      temp[1] = part.unitName
      temp[2] = part.price
      temp[3] = part.forecastingQty
      temp[4] = part.forecastingAmount
      temp[5] = part.soldQty
      temp[6] = part.salesAmount
      temp[7] = part.remainingQty
      temp[8] = part.remainingAmount
      temp[9] = part.qtyInvestegationRate
      temp[10] = part.amountInvestegationRate
      temp[11] = part.forecastingFree
      temp[12] = part.actualFree
      temp[13] = part.bonusForecastingQty
      temp[14] = part.actualBonusQty
      temp[15] = part.otherQty
      temp[16] = part.soldOtherQty
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.Data)
      
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "تقرير  المبيعات الفعلية مقابل أوامر المبيعات" : "Actual Sales Vs Sales Orders";
    pdf.setFontSize(12);
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, {align: 'center'});
    autoTable(pdf as any, {
      head: head,
      body: rows,
      startY: 30,
      headStyles: { font: "Amiri", halign: 'right', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: 'right', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
  }
}
