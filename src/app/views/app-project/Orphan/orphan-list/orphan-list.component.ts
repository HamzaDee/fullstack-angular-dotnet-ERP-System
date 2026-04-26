import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import { OrphanService } from '../orphan.service';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-orphan-list',
  templateUrl: './orphan-list.component.html',
  styleUrl: './orphan-list.component.scss'
})
export class OrphanListComponent {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 241;
  custom: boolean;
  data: any[];
  lang: string;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private orphanService: OrphanService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private appEntryvouchersService: AppEntryvouchersService,
      private readonly serv: AppCommonserviceService,

    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetProjectsList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('OrphanList');
    this.title.setTitle(this.TitlePage);
  }

  GetProjectsList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.orphanService.getOrphanList().subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
      {
        this.alert.ShowAlert("msNoPermission",'error');
        return;
      }
       this.tabelData = result;
        
        if(currentLang == "ar"){
           this.refresOrphanArabic(this.tabelData);
        }
       else{
          this.refreshOrphanEnglish(this.tabelData);
       }  
          this.showLoader = false;
      }); 
    });


  }

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['Orphan/OrphanForm']);
  }

  AddOrphanForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Orphan/OrphanForm']);
  }

  EditOrphanForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Orphan/OrphanForm']);
  }

  DeleteOrphan(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    })
      .then((result) => {
        if (result.value) {
               this.orphanService.deleteOrphan(id).subscribe((results) => {
                debugger
                if (results == true) {
                  this.alert.DeleteSuccess();
                  this.GetProjectsList();
                  this.router.navigate(['Orphan/OrphanList']);
                }
                else if(!results.isSuccess && results.message === "msNoPermission")
                {
                  this.alert.ShowAlert("msNoPermission",'error');
                  return;
                } 
                else 
                {
                  this.alert.DeleteFaild()
                }
              }); 
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          console.log('Delete action was canceled.');
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

  refresOrphanArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'اسم اليتيم': x.orphanName,
      ' جنسية اليتيم': x.orpNationalityName,
      'نوع وثيقة اليتيم': x.orpDocName,
      ' رقم وثيقة اليتيم': x.orpDocNo,
      'اسم الكفيل': x.guardianName,
      'جنسية الكفيل ': x.grNationalityName,
      ' نوع وثيقة الكفيل': x.grDocName,
      'رقم وثيقة الكفيل': x.grDocNo,
      'قيمة الكفالة الشهرية': x.monthlyValue,
      'مدة الكفالة بالاشهر': x.warrantyPeriod,
      'المبلغ الاجمالي': x.totalAmount,
    }));
  }   

  refreshOrphanEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Orphan Name': x.orphanName,
      'Orphan Nationality': x.orpNationalityName,
      'Orphan Document Type': x.orpDocName,
      'Orphan Document Number': x.orpDocNo,
      'Guardian Name': x.guardianName,
      'Guardian Nationality': x.grNationalityName,
      'Guardian Document Type': x.grDocName,
      'Guardian Document Number': x.grDocNo,
      'Monthly Value': x.monthlyValue,
      'Warranty Period': x.warrantyPeriod,
      'Total Amount': x.totalAmount,
    }));
  }

 exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'المبلغ الاجمالي';
      const totalHeaderEnglish ='Total Amount';
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
       head = [['مدة الكفالة بالاشهر','قيمة الكفالة الشهرية  ', 'رقم وثيقة الكفيل', 'نوع وثيقة الكفيل', 'جنسية الكفيل ', ' اسم الكفيل', 'رقم وثيقة  اليتيم', 'نوع وثيقة اليتيم', 'جنسية اليتيم ', ' اسم اليتيم']]
    }
    else {
        head =[[ 'Warranty Period','Monthly Value', 'Guardian Document Number', 'Guardian Document Type', 'Guardian Nationality', 'Guardian Name', 'Orphan Document Number', 'Orphan Document Type', 'Orphan Nationality', 'Orphan Name']]
    }
    const rows: (number | string)[][] = [];
    let totalAmount = 0;
    this.data.forEach((part) => {
      let temp: (number | string)[] = [];
     temp[0] = part.orphanName
      temp[1] = part.orpNationalityName
      temp[2] = part.orpDocName
      temp[3] = part.orpDocNo
      temp[4] = part.guardianName
      temp[5] = part.grNationalityName
      temp[6] = part.grDocName
      temp[7] = part.grDocNo
      temp[8] = part.monthlyValue
      temp[9] = part.warrantyPeriod
      temp[10] = part.totalAmount


      totalAmount += part.totalAmount; 
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); 
    });

    
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); 
    let foot;

    if (currentLang == "ar") {
      footRow[8] = "المجموع";
      footRow[9] = totalAmount;
      foot = [footRow.reverse()];
    }
    else {
      footRow[8] = "Total";
      footRow[9] = totalAmount;
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة الايتام": "Orphans List";
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
  
  CalculateTotal()
  {
  if(this.tabelData){
  return this.formatCurrency(this.tabelData.reduce((sum, item) => {
  return sum + item.totalAmount;
  }, 0), 3);
  }
  }

  formatCurrency(value: number, decimalPlaces: number): string {
  return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }
  }
