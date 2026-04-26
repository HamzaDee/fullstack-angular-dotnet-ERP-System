import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { MaterialforecastService } from '../app-materialforecast.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';


@Component({
  selector: 'app-materialforecast',
  templateUrl: './materialforecast.component.html',
  styleUrl: './materialforecast.component.scss'
})
export class MaterialforecastComponent {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 223;
  itemId: number = 0;
  materialId: number = 0;
  custom: boolean;
  data: any[];
  ItemsList: any;
  MaterialList: any;
  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private service: MaterialforecastService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private readonly serv: AppCommonserviceService,
    ) { }


  ngOnInit(): void {
    this.SetTitlePage();
    this.GetMaterialForecastingData();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('GetMaterialForecast');
    this.title.setTitle(this.TitlePage);
  }

  GetMaterialForecastingData() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetMaterialForecast(this.itemId, this.materialId).subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.showLoader = false;
          return;
        }
        this.ItemsList = result[0].itemsList;
        this.MaterialList = result[0].materialList;
        this.tabelData = result;
        debugger
        if (currentLang == "ar") {
          this.refresPurchaserequestArabic(this.tabelData);
        }
        else {
          this.refreshPurchaserequestEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });

  }

  GetReport() {
    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetMaterialForecast(this.itemId, this.materialId).subscribe(result => {
        debugger
        this.tabelData = result;
        this.showLoader = false;

      })
    });
  }

  calculateTotalCost(): number {
    debugger
  return this.tabelData?.reduce((acc, item) => acc + (item.cost || 0), 0) || 0;
  }

  clearFormData() {
    debugger
    // this.tabelData = [];
    this.itemId =0;
    this.materialId =0;
    this.GetReport();
  }

  formatAmount(amount: number, decimalPlaces: number = 3): string {
    return amount.toFixed(decimalPlaces);
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

  refresPurchaserequestArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'المادة المنتجة': x.productedItem,
      'المادة الاولية': x.materialItem,
      'الكمية': x.qty,
      'الكلفة': x.cost,
    }));
  }

  refreshPurchaserequestEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Producted Item': x.productedItem,
      'Material Item': x.materialItem,
      'Quantity': x.qty,
      'Cost': x.cost,
    }));
  }

 exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.cost), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic =  'الكلفة';
      const totalHeaderEnglish = 'Cost';
      const totalHeader = isArabicFromHeaders ? totalHeaderArabic : totalHeaderEnglish;
      const totalLabel = isArabicFromHeaders ? 'المجموع' : 'Total';

      const totalColIndex = headers.indexOf(totalHeader);

      function getExcelColumnLetter(colIndex: number): string {
        let dividend = colIndex + 1;
        let columnName = '';
        let modulo;
        while (dividend > 0) {
          modulo = (dividend - 1) % 26;
          columnName = String.fromCharCode(65 + modulo) + columnName;
          dividend = Math.floor((dividend - modulo) / 26);
        }
        return columnName;
      }

      const totalColLetter = getExcelColumnLetter(totalColIndex);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      const valueCell = totalColLetter + lastRow;
      worksheet[valueCell] = { t: 'n', v: parseFloat(totalValue) };

      if (totalColIndex > 0) {
        const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
        const labelCell = labelColLetter + lastRow;
        worksheet[labelCell] = { t: 's', v: totalLabel };
      }

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

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
       head = [[' الكلفة', 'الكمية', ' المادة الاولية', ' المادة المنتجة']]
    }
    else {
       head = [['Cost', 'Quantity', 'Material Item', 'Producted Item']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;
    this.data.forEach((part) => {
      let temp: (number | string)[] = [];
      temp[0] = part.productedItem
      temp[1] = part.materialItem
      temp[2] = part.qty
      temp[3] = part.cost

      totalAmount += part.cost; // Accumulate total (make sure amount is a number)
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // reverse to match header order
    });

    // Prepare footer row (reverse the order like rows)
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); // assuming 10 columns
    let foot;

    if (currentLang == "ar") {
      footRow[3] = "المجموع";
      footRow[4] = totalAmount;
      foot = [footRow.reverse()];
    }
    else {
      footRow[3] = "Total";
      footRow[4] = totalAmount;
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? " توقعات المواد الأولية": "Material Forecasting Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      foot: foot,
      showFoot: 'lastPage',
      headStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      bodyStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold'
      },
      footStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
        textColor: 'black'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }

}
