import { Component } from '@angular/core';
import { DailyMachineryMovementService } from '../daily-machinery-movement.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { CheckUpService } from '../../vehiclecheckup/checkup.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-daily-machinery-movement',
  templateUrl: './daily-machinery-movement.component.html',
  styleUrl: './daily-machinery-movement.component.scss'
})
export class DailyMachineryMovementComponent {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 237;
  custom: boolean;
  data: any[] = [];
  lang: string;

    constructor(
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private service: CheckUpService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private MachineryMovementService: DailyMachineryMovementService) { }
  
    ngOnInit(): void {
      this.SetTitlePage();
      this.GetDailyMachineryMovementList();
    }

    SetTitlePage() {
      this.TitlePage = this.translateService.instant('DailyMachineryMovement');
      this.title.setTitle(this.TitlePage);
    }

    GetDailyMachineryMovementList() {
        debugger
        var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
    
        this.showLoader = true;
        setTimeout(() => {
          debugger
          this.MachineryMovementService.getDailyMachineryMovementList().subscribe(result => {
            debugger
            if(result.isSuccess == false && result.message ==="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission",'error');
                return;
              }
            this.tabelData = result;
            this.data = result;

             if(currentLang == "ar"){
               this.refresDailyMachineryMovementArabic(this.tabelData);
              }
              else{
               this.refreshDailyMachineryMovementEnglish(this.tabelData);
              } 
    
            this.showLoader = false;
          }) 
        });
      }
    
      ShowDetailsOnly(id) {
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        this.router.navigate(['DailyMachineryMovement/DailyMachineryMovementForm']);
      }
    
      AddDailyMachineryMovementForm(id: any) {
        debugger
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Add';
        this.routePartsService.Guid3ToEdit = false;
        this.router.navigate(['DailyMachineryMovement/DailyMachineryMovementForm']);
      }
    
      EditDailyMachineryMovementForm(id: any) {
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Edit';
        this.routePartsService.Guid3ToEdit = false;
        this.router.navigate(['DailyMachineryMovement/DailyMachineryMovementForm']);
      }
    
      DeleteDailyMachineryMovement(id: any) {
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
             this.MachineryMovementService.deleteDailyMachineryMovement(id).subscribe((results) => {
            debugger
               if (results.isSuccess == true) {
              this.alert.DeleteSuccess();
             this.GetDailyMachineryMovementList();
             }
              else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
             this.alert.ShowAlert("msNoPermission",'error');
               return;
                 }}
             else {
    
             this.alert.DeleteFaild();
             } 
             });  
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        })
      }
      
      updateFavourite(ScreenId: number) {
        debugger
        this.MachineryMovementService.UpdateFavourite(ScreenId).subscribe(result => {
          this.getFavouriteStatus(this.screenId);
        })
      }
    
      getFavouriteStatus(screenId) {
        debugger
        this.MachineryMovementService.GetFavouriteStatus(screenId).subscribe(result => {
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

      refresDailyMachineryMovementArabic(data) {
        debugger
        this.exportData = data.map(x => ({
          'اسم السائق': x.driverNames,
          'ساعة الذهاب': x.goingTime,
          'ساعة العودة': x.returnTime,
          'من ': x.fromLocation,
          'الى': x.toLocation,
          'رقم الالية': x.plateNo,
          ' المرافق': x.companion,
        }));
      }

      refreshDailyMachineryMovementEnglish(data) {
        debugger
        this.exportData = data.map(x => ({
          'Driver Name': x.driverNames,
          'Going Time': x.goingTime,
          'Return Time ': x.returnTime,
          'of': x.fromLocation,
          'to': x.toLocation,
          'Mechanism Number': x.plateNo,
          'Facilities': x.companion,
        }));
      }
    
      exportExcel(dt: any) {
        import("xlsx").then(xlsx => {

          
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresDailyMachineryMovementArabic(exportSource);
      } else {
        this.refreshDailyMachineryMovementEnglish(exportSource);
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
           head = [['المرافق','رقم الالية', 'الى', 'من', ' ساعة العودة', ' ساعة الذهاب', ' اسم السائق']]
        }
        else {
           head = [['Facilities','Mechanism Number', 'to', 'of', 'Return Time', 'Going Time', 'Driver Name']]
        }

        const rows: (number | string)[][] = [];
        let exportSource: any[];
          if (dt.filteredValue && dt.filteredValue.length > 0) {
            exportSource = dt.filteredValue;
          } else {
            exportSource = this.data;
          }

       exportSource.forEach(function (part, index) {
          let temp: (number | string)[] = [];
          temp[0] = part.driverNames
          temp[1] = part.goingTime
          temp[2] = part.returnTime
          temp[3] = part.fromLocation
          temp[4] = part.toLocation
          temp[5] = part.plateNo
          temp[6] = part.companion
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

        const Title = currentLang == "ar" ? "قائمة حركة الاليات اليومي" : "Daily Machinery Movement List" ;
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
