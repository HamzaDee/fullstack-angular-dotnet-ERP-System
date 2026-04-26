import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { ActivityService } from '../activities.service'; 
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-activitylist',
  templateUrl: './activitylist.component.html',
  styleUrl: './activitylist.component.scss'
})
export class ActivitylistComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId:number = 234 ;
  custom:boolean;
  data: any[] = [];
  lang:string;

  constructor
  (
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private service: ActivityService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private appEntryvouchersService: AppEntryvouchersService,
    private readonly serv: AppCommonserviceService,
  ) { }

   ngOnInit(): void 
    {
      this.SetTitlePage();
      this.GetActivitiesList();
      this.getFavouriteStatus(this.screenId);
    }

    SetTitlePage() {
      this.TitlePage = this.translateService.instant('Activitylist');
      this.title.setTitle(this.TitlePage); 
    }
  
    GetActivitiesList() {
      debugger
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
  
      this.showLoader = true;
      setTimeout(() => {
        debugger
        this.service.GetActivitiesList().subscribe(result => {
          debugger
          if(result.isSuccess == false && result.message ==="msNoPermission")
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }
          this.tabelData = result;
          this.data = result;

          if(currentLang == "ar"){
            this.refresActivitylistArabic(this.tabelData);
           }
           else{
            this.refreshActivitylistEnglish(this.tabelData);
           } 
  
          this.showLoader = false;
        })
      });
      
  
    }
  
    DeleteActivity(id: any) {
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
                this.service.DeleteActivity(id).subscribe((results) => {
                  if (results.isSuccess) {
                    this.alert.DeleteSuccess();
                    this.GetActivitiesList();
                    this.router.navigate(['Activities/Activitylist']);
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
    
    OpenDetailsForm(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      this.router.navigate(['Activities/Activityform']);
    }
  
    AddActivityForm(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Add';
      this.routePartsService.Guid3ToEdit = false;
      this.router.navigate(['Activities/Activityform']);
    }
  
    EditActivityForm(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Edit';
      this.routePartsService.Guid3ToEdit = false;
      this.router.navigate(['Activities/Activityform']);
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

    refresActivitylistArabic(data) {
      debugger
      this.exportData = data.map(x => ({
        ' اسم النشاط التطوعي': x.activityName,
        'تاريخ وقت التطوع من': x.fromDate,
        'تاريخ وقت التطوع الى': x.toDate,
        'مكان النشاط': x.activityLocation,
        'عدد المتطوعين المطلوبين': x.requestedVolunteers,
        'عدد المتطوعين الفعليين': x.actualVolunteers,
      }));
    }
  
    refreshActivitylistEnglish(data) {
      debugger
      this.exportData = data.map(x => ({
        'Activity Name': x.activityName,
        'Activity From Date': x.fromDate,
        'Activity To Date': x.toDate,
        'Activity Location': x.activityLocation,
        'Requested Volunteer': x.requestedVolunteers,
        'Actual Volunteer': x.actualVolunteers,
      }));
    }
  
    exportExcel(dt: any) {
      debugger
      import("xlsx").then(xlsx => {
        debugger;
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
        let exportSource: any[];

        if (dt.filteredValue && dt.filteredValue.length > 0) {
          exportSource = dt.filteredValue;
        } else {
          exportSource = this.data;
        }

        if (currentLang === 'ar') {
          this.refresActivitylistArabic(exportSource);
        } else {
          this.refreshActivitylistEnglish(exportSource);
        }

        const worksheet = xlsx.utils.json_to_sheet(this.exportData);

        const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.actualVolunteers), 0);
        const totalValue = totalAmount.toFixed(2);

        const headers = Object.keys(this.exportData[0]);
        const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

        const totalHeaderArabic = 'عدد المتطوعين الفعليين';
        const totalHeaderEnglish =  'Actual Volunteer';
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

        if(currentLang == "ar"){
           head = [['عدد المتطوعين الفعليين',' عدد المتطوعين المطلوبين',' مكان النشاط',' تاريخ وقت التطوع الى','  تاريخ وقت التطوع من','  اسم النشاط التطوعي']]    }
        else{
           head = [['Actual Volunteer','Requested Volunteer','Activity Location','Activity To Date','Activity From Date','Activity Name']]
        }

      const rows: (number | string)[][] = [];
      let totalAmount = 0;
      let exportSource: any[];
      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else {
        exportSource = this.data;
      }

      exportSource.forEach((part) => {
        let temp: (number | string)[] = [];
        temp[0]= part.activityName
        temp[1]= part.fromDate 
        temp[2]= part.toDate
        temp[3]= part.activityLocation
        temp[4]= part.requestedVolunteers 
        temp[5]= part.actualVolunteers

        totalAmount += part.actualVolunteers; 
        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp); 
      });

      
      const columnCount = head[0].length;
      let footRow: (string | number)[] = new Array(columnCount).fill(''); 
      let foot;

      if (currentLang == "ar") {
        footRow[4] = "المجموع";
        footRow[5] = this.formatCurrency(totalAmount, 3);
        foot = [footRow.reverse()];
      }
      else {
        footRow[4] = "Total";
        footRow[5] = this.formatCurrency(totalAmount, 3);
        foot = [footRow.reverse()];
      }


      const pdf = new jsPDF('l', 'pt', 'a4');
      pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
      pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      pdf.setFont('Amiri');
      pdf.setFontSize(14);

      const Title = currentLang == "ar" ? "قائمة النشاطات التطوعية": "Activity List";
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
      
    formatCurrency(value: number, decimalPlaces: number): string {
      return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
    }

    CalculateTotal()
    {
      if(this.tabelData){
        return this.formatCurrency(this.tabelData.reduce((sum, item) => {
          return sum + item.actualVolunteers;
        }, 0), 3);
      }
    }
}
