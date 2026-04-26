import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { InventoryReportsService } from '../invreports.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-itemprices',
  templateUrl: './itemprices.component.html',
  styleUrl: './itemprices.component.scss'
})
export class ItempricesComponent implements OnInit {
  ItempricesAddForm: FormGroup;
  showItemId: boolean = false;
  itemsList: any;
  categoryList: any;
  unitList: any;
  groupList:any;
  typeList:any;
  priceCatList:any;
  showItemCat:boolean = false;
  catcheckBox:boolean = false;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 286;
  custom: boolean;
  data: any[];
  loading:boolean;
  public TitlePage: string;

  constructor
    ( private readonly formbulider: FormBuilder,
      private readonly translateService: TranslateService,
      private readonly ReportsService: InventoryReportsService,
      private readonly alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private readonly jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private readonly egretLoader: AppLoaderService,
      private readonly title: Title,
      private readonly serv: AppCommonserviceService,

    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetItempricesForm();
    this.GetItempricesInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetItempricesForm() {
    debugger
    this.ItempricesAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      itemId: [0],
      categoryId: [0],
      unitId: [0],
      groupId: [0],
      typeId: [0],
      priceCatId: [0],
    });
  }

  GetItempricesInitialForm() {
    debugger
    this.ReportsService.GetItemsPricesForm().subscribe((result) => {
      debugger
      if(!result.isSuccess && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }        
        this.itemsList = result.itemsList;
        this.categoryList = result.categoryList;
        this.unitList = result.unitList;
        this.groupList = result.groupList;
        this.typeList = result.typeList;
        this.priceCatList = result.priceCatList;        
        this.ItempricesAddForm.get("itemId").setValue(0);
        this.ItempricesAddForm.get("categoryId").setValue(0);
        this.ItempricesAddForm.get("unitId").setValue(0);
        this.ItempricesAddForm.get("groupId").setValue(0);
        this.ItempricesAddForm.get("typeId").setValue(0);
        this.ItempricesAddForm.get("priceCatId").setValue(0);
        this.showItemId = false;
    });
  }

  GetReport() {
    setTimeout(() => {
      debugger
      const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

      const formValues = this.ItempricesAddForm.value;

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));

      this.ReportsService.GetItemsPrices(
        formValues.itemId,
        formValues.categoryId,
        formValues.unitId,
        formValues.groupId,
        formValues.typeId,
        formValues.priceCatId,
      ).subscribe((result) => {
        debugger
     
        this.voucherData = result;
        if(currentLang == "ar"){
          this.refresItempricesArabic(this.voucherData);
         }
         else{
          this.refreshItempricesEnglish(this.voucherData);
         }  
        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItempricesReport');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
  this.voucherData = [];
  this.GetItempricesInitialForm();

  this.ItempricesAddForm.patchValue({
    itemId: 0,
    categoryId: 0,
    unitId: 0,
    groupId: 0,
    typeId: 0,
    priceCatId: 0
  });

  this.catcheckBox = false;
  this.showItemCat = false;
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

  OpenItemTransactionsForm(item: number) {
    debugger
    this.routePartsService.GuidToEdit = item;
    const url = `/Items/ItemsList/ItemForm?item=${item}`;
    window.open(url, '_blank');
  }

  refresItempricesArabic(data) {
    debugger
    this.data = data;
    if(this.showItemCat)
      {
         this.exportData = this.data.map(x => ({
          'رقم المادة': x.itemName,
          'الصنف': x.categoryName,
          'الوحدة': x.unitName,
          'معامل التحويل': x.convertRate,
          'السعر': x.price,
          'الضريبة': x.taxName,
          'المجموعة': x.groupName,
          'فئة السعر': x.priceCatName,
          'سعر الفئة': x.catPrice,
        }));
      }
    else
      {
        this.exportData = this.data.map(x => ({
          'رقم المادة': x.itemName,
          'الصنف': x.categoryName,
          'الوحدة': x.unitName,
          'معامل التحويل': x.convertRate,
          'السعر': x.price,
          'الضريبة': x.taxName,
          'المجموعة': x.groupName,
        }));
      }
   
  }

  refreshItempricesEnglish(data) {
    debugger
    this.data = data;
     if(this.showItemCat)
      {
         this.exportData = this.data.map(x => ({
        'material Number': x.itemName,
        'category': x.categoryName,
        'unit': x.unitName,
        'Curreny Rate': x.convertRate,
        'Price': x.price,
        'Tax': x.taxName,
        'Group': x.groupName,
        'Price Category Type': x.priceCatName,
        'category Price': x.catPrice,
      }));
      }
    else
      {
        this.exportData = this.data.map(x => ({
        'material Number': x.itemName,
        'category': x.categoryName,
        'unit': x.unitName,
        'Curreny Rate': x.convertRate,
        'Price': x.price,
        'Tax': x.taxName,
        'Group': x.groupName,
      }));
      }
   
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
        const worksheet = (xlsx.utils.json_to_sheet as any)(this.exportData, { origin: 'A2' });
      const title = this.translateService.instant(this.TitlePage);
      const titleCell = 'A1';
      worksheet[titleCell] = { t: 's', v: title };
      const headers1 = Object.keys(this.exportData[0]);

      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers1.length - 1 } }];
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "ItemsPrices");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    debugger
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
    let head :any; 
     if(this.showItemCat)
      {
        if(currentLang == "ar"){
          head = [['سعر الفئة','فئة السعر','المجموعة','الضريبة','السعر','معامل التحويل','الوحدة',' الصنف',' رقم المادة']]    }
        else{
          head = [['category Price','Price Category Type','Group','Tax','Price','Curreny Rate','unit','category','Material Number']]
        }
      }
    else
      {
        if(currentLang == "ar"){
          head = [['المجموعة','الضريبة','السعر','معامل التحويل','الوحدة',' الصنف',' رقم المادة']]    }
        else{
          head = [['Group','Tax','Price','Curreny Rate','unit','category','Material Number']]
        }
      }
   
    const rows :(number|string)[][]=[];
     if(this.showItemCat)
      {
        this.data.forEach(function(part, index) {
        let temp: (number|string)[] =[];
        temp[0]= part.itemName
        temp[1]= part.categoryName 
        temp[2]= part.unitName
        temp[3]= part.convertRate
        temp[4]= part.price 
        temp[5]= part.taxName
        temp[6]= part.groupName
        temp[7]= part.priceCatName
        temp[8]= part.catPrice
        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp)
        },this.data)
      }
    else
      {
        this.data.forEach(function(part, index) {
        let temp: (number|string)[] =[];
        temp[0]= part.itemName
        temp[1]= part.categoryName 
        temp[2]= part.unitName
        temp[3]= part.convertRate
        temp[4]= part.price 
        temp[5]= part.taxName
        temp[6]= part.groupName
        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp)
        },this.data)
      }
    
  
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

   let Title = "";
   if(currentLang == "ar"){
     Title = "كشف المواد و أسعارها";
  }
   else{
     Title = "Items Prices  Report ";
   }
  
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

  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.itemsList) {
        this.itemsList = [];
    }

    // Make sure the array is large enough
    while (this.itemsList.length < last) {
        this.itemsList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.itemsList[i] = this.itemsList[i];
    }

    this.loading = false;
  }

  HandelShow(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;

  this.catcheckBox = checked;
  this.showItemCat = checked;

  if (!checked) {
    this.voucherData = [];
    this.ItempricesAddForm.get('priceCatId')?.setValue(0);
  }
  }

}
