import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { ReorderingService } from '../reordering.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-reorderings',
  templateUrl: './reorderings.component.html',
  styleUrl: './reorderings.component.scss'
})
export class ReorderingsComponent {
  public TitlePage: string;
  showLoader = false;
  ReorderingItemsForm: FormGroup;
  categoriesList: any[];
  reOrderingItemsList:any;
  loading: boolean;
  exportData: any[];
  data: any[];
  catId:any;
  disableSave:boolean;

    constructor(
       public routePartsService: RoutePartsService,
       public router: Router,
       private title: Title,
       private translateService: TranslateService,
       private formbulider: FormBuilder,
       private ForecastingService: ReorderingService,
       private alert: sweetalert,
       private egretLoader: AppLoaderService,
        private jwtAuth: JwtAuthService,
     ) { }


  ngOnInit(): void {
      debugger
      this.SetTitlePage();
      this.InitiailReorderForm();
    }
     
    SetTitlePage() {
      this.TitlePage = this.translateService.instant('ReorderingsList');
      this.title.setTitle(this.TitlePage);
    }
                
    InitiailReorderForm() {
      debugger
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
      this.ReorderingItemsForm = this.formbulider.group({
        reOrderingItemsList: [null],
        catId:[0],
      });
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ForecastingService.GetReorderingItemsList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            this.showLoader = false;
            this.egretLoader.close();
            return;
          }
        
        this.categoriesList = result[0].categoriesList;
        this.reOrderingItemsList = result;

        if(currentLang == "ar"){
          this.refresPurchaserequestArabic(this.reOrderingItemsList);
         }
         else{
          this.refreshPurchaserequestEnglish(this.reOrderingItemsList);
         } 
        // if(this.reOrderingItemsList.length > 0)
        //   {
        //     this.reOrderingItemsList.forEach(element => {
        //       element.oQ1 = element.loadTime * element.avUsedDaily;
        //     });
        //   }
        this.ReorderingItemsForm.patchValue(result);
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
          this.ReorderingItemsForm.get("catId").setValue(0);
        })
        this.egretLoader.close();
      })
    }
     
    OnSaveForms() {
      debugger
      this.disableSave = true;
      if(this.reOrderingItemsList.length > 0)
        {
          this.reOrderingItemsList.forEach(element => {
            if(element.ol == null || element.ol == undefined)
              {
                element.ol = 0
              } 
            if(element.oQ1 == null || element.oQ1 == undefined)
              {
                element.oQ1 = 0
              } 
            if(element.loadTime == null || element.loadTime == undefined)
              {
                element.loadTime = 0
              } 
            if(element.avUsedDaily == null || element.avUsedDaily == undefined)
              {
                element.avUsedDaily = 0
              } 
          });
        }
      this.ReorderingItemsForm.get("reOrderingItemsList").setValue(this.reOrderingItemsList)
      this.ForecastingService.SaveReorderingItems(this.ReorderingItemsForm.value).subscribe(res => {
        if(res){
          debugger
          this.alert.SaveSuccess();
        }
        else{
          this.alert.SaveFaild();
        }     
        this.disableSave = false;   
      }, err => {
        this.alert.SaveFaild();
      })
    }
     
    GetItemsByCategory(event)
    {
      if(event.value == 0)
        {
          this.InitiailReorderForm();
          return;
        }
      this.reOrderingItemsList = [];
      this.ForecastingService.GetReOrderingItemsByCategory(event.value).subscribe(result => {
        debugger
        this.categoriesList = result[0].categoriesList;
        this.reOrderingItemsList = result;
        // if(this.reOrderingItemsList.length > 0)
        //   {
        //     this.reOrderingItemsList.forEach(element => {
        //       element.oQ1 = element.loadTime * element.avUsedDaily;
        //     });
        //   }
        this.ReorderingItemsForm.patchValue(result);
      })

    }
     
    SaveRowReOrderingItems(row) {
      debugger 
      if(row.ol == null || row.ol == undefined)
        {
          row.ol = 0
        } 
      if(row.oQ1 == null || row.oQ1 == undefined)
        {
          row.oQ1 = 0
        } 
      if(row.loadTime == null || row.loadTime == undefined)
        {
          row.loadTime = 0
        } 
      if(row.avUsedDaily == null || row.avUsedDaily == undefined)
        {
          row.avUsedDaily = 0
        } 
      this.ForecastingService.SaveReorderingItemsByRow(row.item_No,row.ol,row.oQ1,row.loadTime,row.avUsedDaily).subscribe(res => {
        if(res){
          debugger
          this.alert.SaveSuccess();
          // this.router.navigate(['Forecasting/ForecastingList']);
  
        }
        else{
          this.alert.SaveFaild();
        }        
      }, err => {
        this.alert.SaveFaild();
      })
    }
  
    calcOQ1(row)
    {
      debugger
      if((row.loadTime != undefined && row.loadTime != null)  && (row.avUsedDaily != undefined && row.avUsedDaily != null ))
        {
          row.oQ1 = row.loadTime*row.avUsedDaily
        } 
        else if (row.loadTime == undefined || row.loadTime == null)  
          {
            row.loadTime = 0;
            row.oQ1 = row.loadTime*row.avUsedDaily
          } 
        else if (row.avUsedDaily == undefined || row.avUsedDaily == null)  
          {
            row.avUsedDaily = 0;
            row.oQ1 = row.loadTime*row.avUsedDaily
          } 
        else
        {
          row.loadTime = 0;
          row.avUsedDaily= 0;
          row.oQ1 = 0;
        }
    }


  refresPurchaserequestArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'اسم المادة': x.item_No,
      'الكمية المتوفرة': x.item_Name,
      ' كيفية اعاده الطلب ': x.availableQty,
      'مدة التسليم / يوم': x.loadTime,
      'متوسط الاستخدام اليومي': x.avUsedDaily,
      ' كيفية الطلب': x.oQ1,
    }));
  }

  refreshPurchaserequestEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Material Name': x.item_No,
      'Available Qty': x.item_Name,
      'Re Ordering Qty': x.availableQty,
      'Delivery Time': x.loadTime,
      'Avg Daily Use': x.avUsedDaily,
      'Ordering Qty': x.oQ1,
    }));
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

  exportPdf()
  {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    let head: string[][];

    if(currentLang == "ar"){
       head = [['كيفية الطلب','متوسط الاستخدام اليومي',' مدة التسليم / يوم',' كيفية اعادة الطلب ',' الكمية المتوفرة',' اسم المادة']]    }
    else{
       head = [['Ordering Qty','Avg Daily Use','Delivery Time','Re Ordering Qty','Available Qty','Material Name']]
    }
    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.item_No
     temp[1]= part.item_Name 
     temp[2]= part.availableQty
     temp[3]= part.loadTime
     temp[4]= part.avUsedDaily 
     temp[5]= part.oQ1 

     if (isArabic) {
       temp.reverse();
     }
     rows.push(temp)
   },this.data)
  
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

   const Title = currentLang == "ar" ? "اعادة طلب المواد" : "Reordering Items List" ;
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
