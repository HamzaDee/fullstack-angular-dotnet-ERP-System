import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ProductPricesForCountriesService } from '../product-prices-for-countries.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { delay } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import Swal from 'sweetalert2';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-product-prices-for-countries',
  templateUrl: './product-prices-for-countries.component.html',
  styleUrls: ['./product-prices-for-countries.component.scss']
})


export class ProductPricesForCountriesComponent implements OnInit {
  public data: any;
  screenId: number = 189;
  exportData: any[];
  custom: boolean;
  ProductPricesForCountriesForm: FormGroup;
  public showLoader: boolean;
  public loading: boolean;
  itemsList: any;
  CountryList: any;
  AgentsList: any;
  public TitlePage: string;
  filteredAgentsList: any;

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private productPricesForCountriesService: ProductPricesForCountriesService,
    private formbulider: FormBuilder,
    private readonly serv: AppCommonserviceService,

  ) { }

  ngOnInit(): void {
    debugger
    this.ProductPricesForCountriesForm = this.formbulider.group({
      id: [0],
      itemNo: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      countryId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      agentId: [0],
      price: ['', [Validators.required, this.greaterThanZeroValidator]],
    });
    this.SetTitlePage();
    //this.GetCountriesPricesInfo();
    this.GetCountriesPriceslist();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProductPricesForCountries');
    this.title.setTitle(this.TitlePage);
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetCountriesPriceslist() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      this.productPricesForCountriesService.getCountriesPricesList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.data = result;
        this.itemsList = result[0].itemsList;
        this.CountryList = result[0].countryList;
        this.AgentsList = result[0].agentsList;
        this.filteredAgentsList = result[0].agentsList;
        if (this.ProductPricesForCountriesForm.value.countryId != 0) {
          this.getFilterCustomers(this.ProductPricesForCountriesForm.value.countryId);
        }
        if (this.itemsList && this.itemsList.length > 0) {
          this.ProductPricesForCountriesForm.get('itemNo')?.setValue(this.itemsList[0].data1);
        }
        if (currentLang == "ar") {
          this.refreshProductPricesForCountriesArabic(this.data);
        }
        else {
          this.refreshProductPricesForCountriesEnglish(this.data);
        }

        this.showLoader = false;
      })
    }, 500);
  }

  navigateToProductPricesForCountriesForm(id: number) {
    debugger
    this.productPricesForCountriesService.getCountriesPricesInfo(id).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      // this.itemsList = result.itemsList;
      // this.CountryList = result.countryList;
      //this.data = result;
      this.ProductPricesForCountriesForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(1)).subscribe(value => {
        debugger
        this.ProductPricesForCountriesForm.get('itemNo')?.setValue(result.itemNo);
        this.ProductPricesForCountriesForm.get('countryId')?.setValue(result.countryId);
        this.ProductPricesForCountriesForm.get('agentId')?.setValue(parseFloat(result.agentId.toString()).toFixed(3));
      });
    });
  }

  OnSaveForms() {
    debugger
    this.ProductPricesForCountriesForm.value.agentId = Number(this.ProductPricesForCountriesForm.value.agentId);
    this.productPricesForCountriesService.SaveCountriesPrices(this.ProductPricesForCountriesForm.value).subscribe((result) => {
      debugger
      if (result.isSuccess == true) {
        this.alert.SaveSuccess();
        this.ProductPricesForCountriesForm.value.id = 0;
        this.clearForm();
        this.GetCountriesPriceslist();
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
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

  DeleteProductPricesForCountriesForm(id: any) {
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
        this.productPricesForCountriesService.deleteCountriesPrices(id).subscribe((results) => {

          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetCountriesPriceslist();
          }
          else {
            this.alert.SaveFaild();
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  refreshProductPricesForCountriesArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'المنتج': x.itemName,
      'الدولة': x.countryName,
      'السعر': x.price,
    }));
  }

  refreshProductPricesForCountriesEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Product': x.itemName,
      'Countries': x.countryName,
      'price': x.price,
    }));
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {

      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refreshProductPricesForCountriesArabic(exportSource);
      } else {
        this.refreshProductPricesForCountriesEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
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

  exportPdf(dt: any) {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['السعر', 'الدولة', ' المنتج']]
    }
    else {
       head = [['price', 'Countries', 'Product']]
    }
    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    }
    else {
      exportSource = this.data;
    }

    exportSource.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.itemName
      temp[1] = part.countryName
      temp[2] = part.price

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.data)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "اسعار المنتجات للدول" : "Product Prices For Countries " ;
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
  }

  getCustomers(event: any) {
    debugger
    const countryId = event.value === undefined ? event : event.value;
    if (countryId == 0)
      this.filteredAgentsList = this.AgentsList;
    else
      this.filteredAgentsList = this.AgentsList.filter(c => c.id == countryId || c.id == -1);
  }

  clearForm() {
    this.ProductPricesForCountriesForm.get("id").setValue(0);
    this.ProductPricesForCountriesForm.get("countryId").setValue(0);
    this.ProductPricesForCountriesForm.get("agentId").setValue(0);
    this.ProductPricesForCountriesForm.get("itemNo").setValue(0);
    this.ProductPricesForCountriesForm.get("price").setValue(0);
  }

  getFilterCustomers(countryId: any) {
    debugger
    if (countryId == 0)
      this.filteredAgentsList = this.AgentsList;
    else
      this.filteredAgentsList = this.AgentsList.filter(c => c.data2 == countryId || c.data2 == -1);
  }
}
