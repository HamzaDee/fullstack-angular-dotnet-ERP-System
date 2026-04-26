import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog ,MatDialogRef} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { MmangerService } from '../marketmanger.service';
import { MmangerformComponent } from '../marketMangerForm/mmangerform.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-mmangerlist',
  templateUrl: './mmangerlist.component.html',
  styleUrl: './mmangerlist.component.scss'
})
export class MmangerlistComponent {
  tabelData: any[];
  showLoader: boolean;
  public TitlePage: string;
  Data: any[];
  exportData: any[];
  screenId:number = 214 ;
  custom:boolean;
  data: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private mservice: MmangerService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetMareketMangerList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MarketMangerList');
    this.title.setTitle(this.TitlePage);
  }

  GetMareketMangerList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
    debugger
    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.mservice.GetMarketMangersList().subscribe(result => {
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            this.showLoader = false;
            return;
          }
        this.tabelData = result;
        
        if(currentLang == "ar"){
          this.refreshForecastingListArabic(this.tabelData);
         }
         else{
          this.refreshForecastingListEnglish(this.tabelData);
         }

        this.showLoader = false;
      })
    });
  }

  OpenFormPopUp(id: number, optype:string  , isNew?) {
    let title = isNew ? this.translateService.instant('NEWManger') : this.translateService.instant('EditManger');
    let dialogRef: MatDialogRef<any> = this.dialog.open(MmangerformComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,optype:optype ,id: id, isNew,
        GetGetMareketMangerFormParent: () => { this.GetMareketMangerList() }
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }
  
  DeleteVoucher(id: any) {
    debugger
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
        this.mservice.DeleteMarketManger(id).subscribe((results) => {
          if (results) {
            if(results.isSuccess ==false && results.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission",'error');
                return;
              }
              else
              {
                this.alert.DeleteSuccess();
                this.GetMareketMangerList();
              }
            
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
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

  refreshForecastingListArabic(data) {
    this.data = data;
    this.exportData = this.data.map(x => ({
      ' رقم المدير': x.id,
      ' اسم المدير': x.nameA,
      '  السوق': x.countriessList[0],
      '  الوكيل': x.agentssList[0],
      '  الموبايل': x.mobile,
      '  البريد الالكتروني': x.email,
    }));
  }

  refreshForecastingListEnglish(data) {
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Manger Id': x.id,
      'Manger Name': x.nameA,
      'Market ': x.countriessList[0],
      'Agent': x.agentssList[0],
      'Mobile': x.mobile,
      'Email': x.email,
    }));
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Produced Quantities Report", ".xlsx");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string, extension: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = extension;
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
       head = [['البريد الالكتروني','الموبايل','الوكيل','السوق','اسم المدير' ,'رقم المدير']]
    }
    else{
       head = [['Email','Mobile','Agent','Market','Manger Name','Manger Id']]
    }
    
    const rows :(number|string)[][]=[];
    this.tabelData.forEach(function(part, index) {
    let temp: (number|string)[] =[];
    temp[0]= part.id;
    temp[1]= part.nameA;
    temp[2]= part.countriessList;
    temp[3]= part.agentssList;
    temp[4]= part.mobile;
    temp[5]= part.email;

     if (isArabic) {
       temp.reverse();
     }
     rows.push(temp)
   },this.tabelData)
  
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);
  
   const Title = currentLang == "ar" ? "قائمة مدراء الأسواق" : "Market Mangers List" ;
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
