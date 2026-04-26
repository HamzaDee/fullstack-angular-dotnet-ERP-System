import { Component, OnInit } from '@angular/core';
import { FixedassetsListService } from '../FixedAssetsList.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-fixed-aseets-list',
  templateUrl: './fixed-aseets-list.component.html',
  styleUrls: ['./fixed-aseets-list.component.scss']
})
export class FixedAseetsListComponent implements OnInit {
  showLoader: boolean;
  FixedAssetsList: any;
  screenId: number = 75;
  custom: boolean;
  exportData: any[];
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  public TitlePage: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private FixedassetsListService: FixedassetsListService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private appCommonserviceService : AppCommonserviceService) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetFixedassetslist();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('FixedAseetsList');
    this.title.setTitle(this.TitlePage);
  }

  GetFixedassetslist() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.FixedassetsListService.getFixedAssetsList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }

        this.FixedAssetsList = result;

        if (currentLang == "ar") {
          this.refreshCompanyListTableArabic(this.FixedAssetsList);
        }
        else {
          this.refreshCompanyListTableEnglish(this.FixedAssetsList);
        }

        this.showLoader = false;
      })
    }, 500);
  }

  openFixedAssetsListDetails(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['FixedAssetsList/FixedAseetsListForm']);
  }

  AddFixedAssetsListFormPopUp(id) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['FixedAssetsList/FixedAseetsListForm']);
  }

  EditFixedAssetsListFormPopUp(id: any){
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['FixedAssetsList/FixedAseetsListForm']);
  }

  DeleteFixedAssetsListForm(id: any) {
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
        this.FixedassetsListService.deleteFixedAssetsList(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetFixedassetslist();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }
          }
          else {
            if (results.message == "msgRecordHasLinks") {

              this.alert.ShowAlert("msgRecordHasLinks", 'error')

            }
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  refreshCompanyListTableArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم الاصل': x.fano,
      'الاسم': x.fanameA,
      'نوع الاصل': x.typeOfAssets,
      'فرع': x.branchOfName,
      'الموقع': x.locationOfName,
      'صاحب العهدة"': x.employeeName,
      'القيمة': x.amount,
      'خاضع للاستهلاك': x.isDepreciable,
      'الحالة': x.statusName,
    }));
  }

  refreshCompanyListTableEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Assest Number': x.fano,
      'Name': x.fanameA,
      'Assest Type': x.typeOfAssets,
      'Branch': x.branchOfName,
      'Location': x.locationOfName,
      'Custodian': x.employeeName,
      'Amount': x.amount,
      'Subject To Consumption': x.isDepreciable,
      'status': x.statusName,
    }));
  }


exportExcel() {
  debugger
  import("xlsx").then(xlsx => {
    debugger;

    const worksheet = xlsx.utils.json_to_sheet(this.exportData);

    const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const totalValue = totalAmount.toFixed(2);

    const headers = Object.keys(this.exportData[0]);
    const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

    const totalHeaderArabic = 'القيمة';
    const totalHeaderEnglish = 'Amount';
    const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
    const totalLabel = isArabic ? 'المجموع' : 'Total';

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
       head = [['الحالة', '  خاضع للاستهلاك', ' القيمة', 'صاحب العهدة"', ' الموقع', ' فرع', 'نوع الاصل', ' الاسم', ' رقم الاصل']]
    }
    else {
       head = [['status', 'Subject To Consumption', 'Amount ', 'Custodian', 'Location', 'Branch ', 'Assest Type', ' Name', 'Assest Number']]
    }
  
    const rows: (number|string)[][] = [];
    let totalAmount = 0;
  
    this.data.forEach((part) => {
      let temp: (number|string)[] = [];
      temp[0] = part.fano
      temp[1] = part.fanameA
      temp[2] = part.typeOfAssets
      temp[3] = part.branchOfName
      temp[4] = part.locationOfName
      temp[5] = part.employeeName
      temp[6] = part.amount
      temp[7] = part.isDepreciable
      temp[8] = part.statusName
  
      totalAmount += part.amount; // Accumulate total (make sure amount is a number)
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // reverse to match header order
    });
  
    // Prepare footer row (reverse the order like rows)
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); // assuming 10 columns
    let foot;
  
    if (currentLang == "ar")
    {
    footRow[5] =  "المجموع";
    footRow[6] = this.formatCurrency(totalAmount,3);
       foot = [footRow.reverse()];
    }
    else
    {
    footRow[5] ="Total";
    footRow[6] = this.formatCurrency(totalAmount,3);
       foot = [footRow.reverse()];
    }
  
  
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);
  
    const Title = currentLang == "ar" ? "قائمة الأصول الثابتة" : "Fixed Aseets List";
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



  updateFavourite(ScreenId: number) {
    debugger
    this.FixedassetsListService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.FixedassetsListService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  
  CalculateTotal()
  {
    if(this.FixedAssetsList)
    {
      return this.formatCurrency(this.FixedAssetsList.reduce((sum, item) => {item.amount 
        return sum +  item.amount;
    }, 0),3);
    }
  }

  
  formatCurrency(value: number, decimalPlaces : number): string {
    return this.appCommonserviceService.formatCurrency(value, decimalPlaces);
  }
}
