import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { CurrencyrateService } from '../currencyrate.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-currencyratelist',
  templateUrl: './currencyratelist.component.html',
  styleUrl: './currencyratelist.component.scss'
})
export class CurrencyratelistComponent {
  WorkflowsList: any[] = [];
  loading: boolean = false;
  public TitlePage: string;
  data: any[];
  exportData: any[];
  cols: any[];
  HasPerm: boolean;
  screenId: number = 211;
  custom: boolean;
  CurrencyRateForm: FormGroup;
  CurrencyList: any;
  decimalPlaces: number;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private currencyrateService: CurrencyrateService,
    private router: Router,
    private formbulider: FormBuilder,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.CurrencyRateForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      currencyId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      rate: [0, [Validators.required, , this.greaterThanZeroValidator]],
      rateDate: [new Date()],
    });

    this.GetInitailCurrencyList();
    this.GetInitailCurrencyRate();
  }

  GetInitailCurrencyList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      debugger
      this.currencyrateService.GetCurrencyRateList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.data = result;

        if (currentLang == "ar") {
          this.refreshCurrencyratelistArabic(this.data);
        }
        else {
          this.refreshCurrencyratelistEnglish(this.data);
        }

      });
    });
  }

  GetInitailCurrencyRate() {
    debugger
    this.currencyrateService.GetCurrencyRateInfo(this.CurrencyRateForm.value.id).subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.CurrencyList = result.currencyList;
      result.rateDate = formatDate(result.rateDate, "yyyy-MM-dd", "en-US")
      this.data = result;
      this.CurrencyRateForm.patchValue(result);
    });
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.CurrencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.CurrencyList.find(option => option.id === selectedValue).data2;
    this.CurrencyRateForm.get("rate").setValue(currRate);
  }

  OnSaveForms() {
    debugger
    this.currencyrateService.saveCurrencyRateForm(this.CurrencyRateForm.value).subscribe((result) => {
      debugger
      if (result.isSuccess == true) {
        this.alert.SaveSuccess();
        this.CurrencyRateForm.value.id = 0;
        this.GetInitailCurrencyRate();
        this.GetInitailCurrencyList();
      } else {
        this.alert.SaveFaild();
      }
    });
  }

  EditCurrencyrate(id: any) {
    debugger
    this.currencyrateService.GetCurrencyRateInfo(id).subscribe((result) => {
      debugger
      result.rateDate = formatDate(result.rateDate, "yyyy-MM-dd", "en-US");
      this.CurrencyList = result.currencyList;
      this.CurrencyRateForm.patchValue({
        id: result.id,
        currencyId: result.currencyId,
        rate: result.rate,
        rateDate: result.rateDate
      });
    });
  }

  DeleteCurrencyrate(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.currencyrateService.deleteCurrencyRate(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetInitailCurrencyList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {

            this.alert.DeleteFaild();
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Currencyratelist');
    this.title.setTitle(this.TitlePage);
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

  getFavouriteStatus(screenId) {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result.isSuccess) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refreshCurrencyratelistArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const rateDate = new Date(x.rateDate).toLocaleDateString('ar-EG');
      return {
        ' العملة': x.currencyName,
        'سعر الصرف ': x.rate,
        'تاريخ الحركة': rateDate,
      }
    });
  }

  refreshCurrencyratelistEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const rateDate = new Date(x.rateDate).toLocaleDateString('ar-EG');
      return {
        'Currency': x.currencyName,
        'Exchange Rate': x.rate,
        'Transaction Date': rateDate,
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

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];
    if (currentLang == "ar") {
       head = [[' تاريخ الحركة', ' سعر الصرف', '  العملة']]
    }
    else {
       head = [['Transaction Date', ' Exchange Rate', 'Currency']]
    }

    const rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date1 = new Date(part.rateDate);
      const rateDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.currencyName
      temp[1] = part.rate
      temp[2] = rateDate

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

    let Title = "";
    if (currentLang == "ar") {
      Title = "أسعار العملات";
    }
    else {
      Title = "Currency Rate List";
    }
    let pageWidth = pdf.internal.pageSize.width;
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
}
