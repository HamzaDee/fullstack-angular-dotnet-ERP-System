import { Component, OnInit } from '@angular/core';
import { ProductionReportService } from '../production-report.service'; 
import * as XLSX from 'xlsx';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';

interface RegionData {
  qty: number;
  freeQty: number;
  bonus: number;
  totalQty: number;
}

interface Product {
  name: string;
  [key: string]: any; // Allow dynamic properties
}


@Component({
  selector: 'app-countryforecast',
  templateUrl: './countryforecast.component.html',
  styleUrls: ['./countryforecast.component.scss']
})
export class CountryforecastComponent implements OnInit {
  products: Product[] = [];
  regions: string[] = [];
  year:number;
  month:number;
  CountryId:number;
  showCost:boolean;
  totals: { [key: string]: { qty: number, freeQty: number, bonus: number, totalQty: number,price: number,cost: number } } = {};
  productTotals: { [key: string]: { qty: number, freeQty: number, bonus: number, totalQty: number,price: number,cost: number } } = {};
  screenId: number = 204;
  custom: boolean;
  ShowPrice: boolean = false;
  ShowCost: boolean = false;
  public TitlePage: string;
  countriesList: any[];
  lang:string = this.jwtAuth.getLang()
  allMonths: string;
  constructor(    private title: Title,
    private translateService: TranslateService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private productionReportService: ProductionReportService,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    debugger
     if (this.lang === 'ar') {
      this.allMonths = "(0 - لكل الشهور)";
    }
    else
      {
        this.allMonths = "(0 - All Months)";
      }
    this.SetTitlePage();
    debugger
    const date = new Date();
    this.year = date.getFullYear();
    this.month = 0;
    if (this.CountryId == undefined) {
      this.CountryId = 0;
    }
    this.productionReportService.getForecastingData(this.year,this.month,this.CountryId).subscribe(data => {
      if (data.isSuccess == false && data.message == "msNoPermission") 
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      debugger   
      this.showCost = data[0].showCost;
      this.countriesList = data[data.length-1].countryList;
      data.pop(); 
      this.products = this.transformData(data);
      this.regions = this.getRegions(data);
      this.calculateTotals();
    });
    this.getFavouriteStatus(this.screenId);   
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Countryforecast');
    this.title.setTitle(this.TitlePage);
  }

  GetReport(){
    debugger
    
    this.productionReportService.getForecastingData(this.year,this.month,this.CountryId).subscribe(data => {
      if (data.isSuccess == false && data.message == "msNoPermission") 
      {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      debugger
      data.pop();
      this.products = this.transformData(data);
      this.regions = this.getRegions(data);
      this.calculateTotals();
    });
  }

  transformData(data: any[]): Product[] {
    const productsMap = new Map<string, Product>();

    data.forEach(item => {
      if (!productsMap.has(item.itemName)) {
        productsMap.set(item.itemName, { name: item.itemName });
      }

      const product = productsMap.get(item.itemName);
      product[item.countryName] = {
        qty: item.qty1,
        freeQty: item.free1,
        bonus: item.bonus1,
        totalQty: item.qty1 + item.free1 + item.bonus1,
        price : item.price,
        itemCost : item.itemCost
      };
    });

    return Array.from(productsMap.values());
  }

  getRegions(data: any[]): string[] {
    const regionsSet = new Set<string>();

    data.forEach(item => {
      regionsSet.add(item.countryName);
    });

    return Array.from(regionsSet);
  }

  getBackgroundColor(index: number): string {
    // Alternate colors based on index
    return index % 2 === 0 ? '#ADD8E6' : '#007bd9a6'; // Light blue and light blue alternate colors
  }

  calculateTotals() {
    this.totals = {};
    this.productTotals = {};

    this.regions.forEach(region => {
      this.totals[region] = { qty: 0, freeQty: 0, bonus: 0, totalQty: 0,price:0, cost:0 };

      this.products.forEach(product => {
        if (product[region]) {
          this.totals[region].qty += product[region].qty || 0;
          this.totals[region].freeQty += product[region].freeQty || 0;
          this.totals[region].bonus += product[region].bonus || 0;
          this.totals[region].totalQty += product[region].totalQty || 0;
          this.totals[region].price += product[region].price * product[region].qty || 0;
          this.totals[region].cost += product[region].itemCost * product[region].totalQty || 0;
        }

        if (!this.productTotals[product.name]) {
          this.productTotals[product.name] = { qty: 0, freeQty: 0, bonus: 0, totalQty: 0, price:0,cost:0 };
        }

        this.productTotals[product.name].qty += product[region]?.qty || 0;
        this.productTotals[product.name].freeQty += product[region]?.freeQty || 0;
        this.productTotals[product.name].bonus += product[region]?.bonus || 0;
        this.productTotals[product.name].totalQty += product[region]?.totalQty || 0;
        this.productTotals[product.name].price += product[region]?.price * product[region]?.qty || 0;
        this.productTotals[product.name].cost += product[region]?.itemCost * product[region]?.totalQty || 0;
      });
    });
  }

  getGrandTotal(field: string): number {
    if(field === 'totalprice'){
      return this.regions.reduce((sum, region) => sum + (this.totals[region]['price'] || 0), 0);
    }
    else if(field === 'totalCost'){
      return this.regions.reduce((sum, region) => sum + (this.totals[region]['cost'] || 0), 0);
    }
    else{
      return this.regions.reduce((sum, region) => sum + (this.totals[region][field] || 0), 0);
    }    
  }

  exportExcel() {
    if(this.ShowPrice){
      this.exportExcelPrice();
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
  
    // Add headers - First row for country names
    const firstRowHeaders = ['Product'];
    this.regions.forEach(region => {
      firstRowHeaders.push(region, '', '', '');
    });
    firstRowHeaders.push('Total', '', '', '');
  
    // Add headers - Second row for column titles
    const secondRowHeaders = [''];
    this.regions.forEach(region => {
      secondRowHeaders.push('Qty', 'Free Qty', 'Bonus', 'Total Qty');
    });
    secondRowHeaders.push('Qty', 'Free Qty', 'Bonus', 'Total Qty');
  
    // Add the headers to the worksheet
    XLSX.utils.sheet_add_aoa(ws, [firstRowHeaders, secondRowHeaders], { origin: 'A1' });
  
    // Add data rows
    this.products.forEach((product, rowIndex) => {
      const row = [product.name];
      this.regions.forEach(region => {
        row.push(
          (product[region]?.qty || 0).toString(),
          (product[region]?.freeQty || 0).toString(),
          (product[region]?.bonus || 0).toString(),
          (product[region]?.totalQty || 0).toString()
        );
      });
      row.push(
        this.productTotals[product.name].qty.toString(),
        this.productTotals[product.name].freeQty.toString(),
        this.productTotals[product.name].bonus.toString(),
        this.productTotals[product.name].totalQty.toString()
      );
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
    });
  
    // Add totals row
    const totalsRow = ['Total'];
    this.regions.forEach(region => {
      totalsRow.push(
        this.totals[region].qty.toString(),
        this.totals[region].freeQty.toString(),
        this.totals[region].bonus.toString(),
        this.totals[region].totalQty.toString()
      );
    });
    totalsRow.push(
      this.getGrandTotal('qty').toString(),
      this.getGrandTotal('freeQty').toString(),
      this.getGrandTotal('bonus').toString(),
      this.getGrandTotal('totalQty').toString()
    );
    XLSX.utils.sheet_add_aoa(ws, [totalsRow], { origin: -1 });
  
    // Merge cells for the first row headers to span the correct columns
    const mergeRanges = [];
    let colIndex = 1; // Start after the 'Product' column
    this.regions.forEach(() => {
      mergeRanges.push({ s: { r: 0, c: colIndex }, e: { r: 0, c: colIndex + 3 } });
      colIndex += 4;
    });
    mergeRanges.push({ s: { r: 0, c: colIndex }, e: { r: 0, c: colIndex + 3 } });
  
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'] = ws['!merges'].concat(mergeRanges);
  
    // Create workbook and export
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Forecasting Data');
    XLSX.writeFile(wb, 'forecasting_data.xlsx');
  }

  exportExcelPrice() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    debugger
    // Add headers - First row for country names
    const firstRowHeaders = ['Product'];
    this.regions.forEach(region => {
      firstRowHeaders.push(region, '', '');
    });
    firstRowHeaders.push('Total', '', '');
  
    // Add headers - Second row for column titles
    const secondRowHeaders = [''];
    this.regions.forEach(region => {
      secondRowHeaders.push('Qty', 'Price', 'Total Price');
    });
    secondRowHeaders.push('Qty', 'Price', 'Total Price');
  
    // Add the headers to the worksheet
    XLSX.utils.sheet_add_aoa(ws, [firstRowHeaders, secondRowHeaders], { origin: 'A1' });
  
    // Add data rows
    this.products.forEach((product, rowIndex) => {
      const row = [product.name];
      this.regions.forEach(region => {
        row.push(
          (product[region]?.qty || 0).toString(),
          (product[region]?.price || 0).toString(),
          (product[region]?.qty * product[region]?.price || 0).toString()
        );
      });
      row.push(
        this.productTotals[product.name].qty.toString(),
        '0',
        this.productTotals[product.name].price.toString()
      );
      XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });
    });
  
    // Add totals row
    const totalsRow = ['Total'];
    this.regions.forEach(region => {
      totalsRow.push(
        this.totals[region].qty.toString(),
        '0',
        this.totals[region].price.toString()
      );
    });
    totalsRow.push(
      this.getGrandTotal('qty').toString(),
      '0',
      this.getGrandTotal('price').toString()
    );
    XLSX.utils.sheet_add_aoa(ws, [totalsRow], { origin: -1 });
  
    // Merge cells for the first row headers to span the correct columns
    const mergeRanges = [];
    let colIndex = 1; // Start after the 'Product' column
    this.regions.forEach(() => {
      mergeRanges.push({ s: { r: 0, c: colIndex }, e: { r: 0, c: colIndex + 2 } });
      colIndex += 3;
    });
    mergeRanges.push({ s: { r: 0, c: colIndex }, e: { r: 0, c: colIndex + 2 } });
  
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'] = ws['!merges'].concat(mergeRanges);
  
    // Create workbook and export
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Forecasting Data');
    XLSX.writeFile(wb, 'forecasting_data.xlsx');
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

  ShowWithPrice(event: any) {
    debugger
    // this.clearFormData();
    if (event.target.checked) {
      this.ShowPrice = true;
      this.ShowCost = false;
    }
    else {
      this.ShowPrice = false;
      this.ShowCost = false;
    }
    this.calculateTotals();
  }

  ShowWithCost(event: any) {
    debugger
    // this.clearFormData();
    if (event.target.checked) {
      this.ShowCost = true;
      this.ShowPrice = false;
    }
    else {
      this.ShowCost = false;
      this.ShowPrice = false;
    }
    this.calculateTotals();
  }
}
