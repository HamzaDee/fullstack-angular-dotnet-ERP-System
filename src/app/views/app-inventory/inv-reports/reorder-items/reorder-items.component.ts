import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ActivatedRoute, Params } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { InventoryReportsService } from '../invreports.service';
import { ChangeDetectorRef } from '@angular/core';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-reorder-items',
  templateUrl: './reorder-items.component.html',
  styleUrls: ['./reorder-items.component.scss']
})
export class ReorderItemsComponent implements OnInit {
  limitItemsAddForm: FormGroup;
  showItemId: boolean = false;
  storesList: any;
  typesList: any;
  itemsGroupList: any;
  checked: boolean = false;
  itemcheck: { [key: string]: boolean } = {};
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  selectedRawMaterialList: any[] = [];
  // voucherData: any;
  headerCheckboxChecked = false;
  voucherData: any[];
  headerData: any;
  isDisabled: boolean = true;
  selectAll: boolean = false;
  isAnyRowChecked: boolean = false;
  total: number = 0;
  totalWithCost: number = 0;
  tot1: number = 0;
  tot2: number = 0;
  totbefore: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  tot3Formatted: string = '0';
  totalFormatted: string = '0';
  totalwCostFormatted: string = '0';
  screenId: number = 142;
  custom: boolean;
  showCost: boolean = false;
  data: any[];
  public TitlePage: string;

  constructor
    ( private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: InventoryReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private appCommonserviceService: AppCommonserviceService,
      private cdr: ChangeDetectorRef,
      private title: Title,

    ) { }


  ngOnInit(): void {
    this.SetTitlePage();
    this.GetItemBalanceForm();
    this.GetItemBalanceInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetItemBalanceForm() {
    debugger
    this.limitItemsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      typeId: [0],
      storeId: [0],
      itemGroupId: [0],
      selectAll: [false]
      // supplierId:[0,[Validators.required, Validators.min(1)]],
    });
  }

  GetItemBalanceInitialForm() {
    debugger
    this.ReportsService.GetReorderItemsForm().subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }
      this.typesList = result.typesList;
      this.storesList = result.storesList;
      this.itemsGroupList = result.itemsGroupList;
      this.showItemId = false;
      this.limitItemsAddForm.patchValue(result);
    });
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    setTimeout(() => {
      this.clearTotals();
      debugger

      const formValues = this.limitItemsAddForm.value;
      if (formValues.storeId == null) {
        formValues.storeId = 0;
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetOrderLimitItems(
        formValues.typeId,
        formValues.itemGroupId,
        formValues.storeId,
      ).subscribe((result) => {
        debugger
    
        this.voucherData = result;

        if(currentLang == "ar"){
          this.refresReorderItemsArabic(this.voucherData);
         }
         else{
          this.refreshReorderItemsEnglish(this.voucherData);
         }   

        this.voucherData.forEach((item) => {
          item.isChecked = false;
        });
        if (this.voucherData.length > 0) {
          this.calcultevalues()
          this.egretLoader.close();
        }
        else {
          this.egretLoader.close();
        }

      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaterialRequestLimit');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.limitItemsAddForm.reset();
    this.voucherData = [];
    this.selectedRawMaterialList = [];
    this.GetItemBalanceInitialForm();
    this.clearTotals();
  }

  calcultevalues() {
    debugger
    this.tot1 = 0;
    this.tot2 = 0;
    for (const row of this.voucherData) {
      const input = parseFloat(row.qty);
      const output = parseFloat(row.saleQty);
      const begbalance = parseFloat(row.beforeBalance);
      if (!isNaN(input)) {
        this.tot1 += input;
      }

      if (!isNaN(output)) {
        this.tot2 += output;
      }

      if (!isNaN(begbalance)) {
        this.totbefore += begbalance;
      }
    }
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
    this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot2);
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.totbefore = 0;
    this.totalWithCost = 0;
    this.tot1Formatted = '0.000';
    this.tot2Formatted = '0.000';
    this.totalFormatted = '0.000';
    this.tot3Formatted = '0.000';
    this.totalwCostFormatted = '0.000';
  }

  updateFavourite(ScreenId: number) {
  this.appCommonserviceService.UpdateFavourite(ScreenId).subscribe(result => {
  if (result.isSuccess) {
    this.getFavouriteStatus(this.screenId);
    this.appCommonserviceService.triggerFavouriteRefresh(); // 🔥 THIS is key
  } else {
    this.alert.ShowAlert(result.message, 'error');
  }
  });
  }

  getFavouriteStatus(screenId)
  {
  debugger
  this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
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

  toggleAllCheckboxes(event: any) {
    const isChecked = event;
    this.headerCheckboxChecked = isChecked;
    for (let row of this.voucherData) {
      row.isChecked = isChecked;
    }
    this.cdr.detectChanges();
  }

  gatherCheckedRows() {
    const checkedRows = this.voucherData.filter((row) => row.isChecked === true);
    return checkedRows;
  }

  OpenPO() {
    debugger
    if (this.selectedRawMaterialList.length > 0) {
      localStorage.setItem('items', JSON.stringify(this.selectedRawMaterialList));
      //this.selectedRawMaterialList.forEach(e=> {
      const url = `PurchaseRequest/PurchaseRequestForm?opType=createPO`;
      window.open(url, '_blank');
      //})
    }
    else {
      this.alert.ShowAlert("SelectItems", 'error');
    }

  }
  
  OpenItemTransactionsForm(item: number) {
    debugger
    this.routePartsService.GuidToEdit = item;
    const url = `/InventoryReports/GetItemTransactionsForm?item=${item}`;
    window.open(url, '_blank');
  }

  refresReorderItemsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم المادة': x.itemNo,
      'اسم المادة': x.itemName,
      'المجموعة': x.groupName,
      'الصنف': x.categoryName,
      'الكمية': x.qty,
      'حد ادنى (كمية)': x.minQty,
      'حد اعلى (كمية)': x.maxQty,
      'الكمية المطلوبة': x.saleQty,
      'حد الطلب': x.orderQty,
    }));
  }

  refreshReorderItemsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Material Number': x.itemNo,
      'Material Name': x.itemName,
      'Group': x.groupName,
      'Item': x.categoryName,
      'Quantity': x.qty,
      'Minimum(Quantity)': x.minQty,
      'Maxmium(Quantity)': x.maxQty,
      'Quantity Required': x.saleQty,
      'Request Limit': x.orderQty,
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
       head = [['حد الطلب ','الكمية المطلوبة ',' حد اعلى (كمية)','حد ادنى (كمية)','الكمية',' الصنف','المجموعة',' اسم المادة',' رقم المادة']]    }
    else{
       head = [['Request Limit','Quantity Required','Maxmium(Quantity)','Minimum(Quantity)','Quantity','Item','Group','Material Name','Material Number']]
    }

    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.itemNo
     temp[1]= part.itemName 
     temp[2]= part.groupName
     temp[3]= part.categoryName
     temp[4]= part.qty 
     temp[5]= part.minQty
     temp[6]= part.maxQty
     temp[7]= part.saleQty
     temp[8]= part.orderQty 

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

   const Title = currentLang == "ar" ? "تقرير المواد التي وصلت حد الطلب" : "Report of Items that have reached reorder limit ";   
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
