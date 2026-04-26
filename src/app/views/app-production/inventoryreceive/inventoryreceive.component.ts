import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { QaproductionService } from '../qaProduction/qaproduction.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CountriesqtyComponent } from './countriesqty/countriesqty.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-inventoryreceive',
  templateUrl: './inventoryreceive.component.html',
  styleUrls: ['./inventoryreceive.component.scss']
})
export class InventoryreceiveComponent implements OnInit {

  QAAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  qaDetailsList: any[] = [];
  countriesList: any;
  customersList: any;
  showLoader = false;
  selectedCountries: any;
  countriesQtyList: any;
  data: any[];
  exportData: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private qaproductionService: QaproductionService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    debugger
    this.InitiailManOrderForm();
    this.GetInitailQA();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Inventoryreceive');
    this.title.setTitle(this.TitlePage);
  }

  InitiailManOrderForm() {
    this.QAAddForm = this.formbulider.group({
      QADetailsList: [null],
      countriesQtyList: [null],
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailQA() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.qaproductionService.GetInventoryItems().subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.qaDetailsList = result;

      if (currentLang == "ar") {
        this.refresInventoryreceiveArabic(this.qaDetailsList);
      }
      else {
        this.refreshInventoryreceiveEnglish(this.qaDetailsList);
      }


      //this.QAAddForm.get("countriesQtyList").setValue(result.invRecCountriesList);
      if (result.length > 0) {
        this.countriesList = result[0].countryList;
      }

      this.qaDetailsList.forEach(e => {
        e.prodDate = formatDate(e.prodDate, "yyyy-MM-dd", "en-US");
        e.expiryDate = formatDate(e.expiryDate, "yyyy-MM-dd", "en-US");
      })
      this.QAAddForm.get("QADetailsList").setValue(this.qaDetailsList);
    })
  }

  OnSaveForms(temp) {
    debugger
    let stopExecution = false;
    if (this.qaDetailsList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = true;
      return false;
    }
    const receivedExists = this.qaDetailsList.some(element => element.received === true);
    if (!receivedExists) {
      this.alert.ShowAlert("msgSelectOneItem", 'error');
      stopExecution = true;
      return false;
    }
    for (const element of this.qaDetailsList) {
      if (element.received === true) {
        if (element.countriesQtyList === null) {
          this.alert.ShowAlert("msgEnterCountryQty", 'error');
          stopExecution = true;
          return false;
          break;
        }
      }
    }
    if (stopExecution) {
      //this.alert.ShowAlert("msgEnterAllData",'error');
      return;
    }
    this.qaproductionService.SaveInventoryItems(this.qaDetailsList)
      .subscribe((result) => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        if (result.isSuccess) {
          this.alert.SaveSuccess();
          window.location.reload();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  OpenCountriesForm(row: any, rowIndex: number) {
    debugger
    var itemName = '';//this.accountsList.find(option => option.id === row.accountId).text;
    let title = this.translateService.instant('DistributeQtyByCountries');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CountriesqtyComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        itemName: row.itemName,
        qty: row.allQty,
        manfCountries: row.manfCountries,
        rowIndex: rowIndex,
        companyid: this.jwtAuth.getCompanyId(),
        countriesList: this.countriesList,
        transList: this.QAAddForm.value.countriesQtyList != null ? this.QAAddForm.value.countriesQtyList.filter(item => item.index == rowIndex) : null
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          var total = res.reduce((sum, item) => sum + parseFloat(item.countryQty), 0);
          var newList = this.QAAddForm.value.countriesQtyList != null ? this.QAAddForm.value.countriesQtyList.filter(item => item.index !== rowIndex) : [];
          newList = [...newList, ...res];
          this.QAAddForm.get("countriesQtyList").setValue(newList);
          this.qaDetailsList[rowIndex].countriesQtyList = res;
          row.holdQty = row.allQty - total;
          return;
        }
      })
  }

  refresInventoryreceiveArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم المنتج': x.itemNo,
      'المنتج': x.itemName,
      'الكمية': x.allQty,
      'رقم التشغيلة': x.batchNo,
      'ملاحظات': x.notes,
      'تاريخ الانتاج': x.prodDate,
      'تاريخ الانتهاء': x.expiryDate,
      'تم الاستلام ': x.received,
      'كميات الدول': x.expiryDate,
      'Hold ': x.holdQty,
    }));
  }

  refreshInventoryreceiveEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Product Number': x.itemNo,
      'Product Name': x.itemName,
      'Qty': x.allQty,
      'Run Number': x.batchNo,
      'Notes': x.notes,
      'Product Date': x.prodDate,
      'Expiry Date': x.expiryDate,
      'Received': x.received,
      'Country Qty': x.expiryDate,
      'Hold': x.holdQty,
    }));
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {
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
       head = [['Hold', ' كميات الدول', 'تم الاسستلام', ' تاريخ الانتهاء', ' تاريخ الانتاج', 'ملاحظات', ' رقم التشغيلة', 'الكمية', 'المنتج', 'رقم المنتج']]
    }
    else {
       head = [['Hold', 'Country Qty', 'Received', 'Expiry Date', 'Product Date', 'Notes', 'Run Number', 'Qty', 'Product Name', 'Product Number']]
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
      temp[0] = part.itemNo
      temp[1] = part.itemName
      temp[2] = part.allQty
      temp[3] = part.batchNo
      temp[4] = part.notes
      temp[5] = part.prodDate
      temp[6] = part.expiryDate
      temp[7] = part.received
      temp[8] = part.expiryDate
      temp[9] = part.holdQty

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

    const Title = currentLang == "ar" ? " استلام المستودعات"  : " Inventory Receiving"  ;
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
}



