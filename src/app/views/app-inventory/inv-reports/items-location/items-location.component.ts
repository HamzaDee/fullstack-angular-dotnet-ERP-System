import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, RequiredValidator, FormControl } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ActivatedRoute, Params } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { InventoryReportsService } from '../invreports.service';
import { ChangeDetectorRef } from '@angular/core';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-items-location',
  templateUrl: './items-location.component.html',
  styleUrls: ['./items-location.component.scss']
})
export class ItemsLocationComponent implements OnInit {
  ItemsLocationsAddForm: FormGroup;
  showItemId: boolean = false;
  itemsList: any;
  groupsList: any;
  typesList: any;
  storesList: any;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 147;
  custom: boolean;
  data: any[];
  loading:boolean;
  public TitlePage: string;

  constructor
    ( 
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: InventoryReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private appCommonserviceService: AppCommonserviceService,
      private cdr: ChangeDetectorRef,
      private title: Title,
      private readonly serv: AppCommonserviceService,

    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetItemsLocationsForm();
    this.GetItemsLocationsInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetItemsLocationsForm() {
    debugger
    this.ItemsLocationsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      groupId: [0],
      catId: [0],
      itemId: [0],
      storeId: [0],
      // supplierId:[0,[Validators.required, Validators.min(1)]],
    });
  }

  GetItemsLocationsInitialForm() {
    debugger
    this.ReportsService.GetItemsLocationsForm().subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }
      this.groupsList = result.groupsList;
      this.typesList = result.typesList;
      this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.showItemId = false;
    });
  }

  GetReport() {
    setTimeout(() => {
      debugger
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

      const formValues = this.ItemsLocationsAddForm.value;

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));

      this.ReportsService.GetItemsLocations(
        formValues.groupId,
        formValues.catId,
        formValues.itemId,
        formValues.storeId,
      ).subscribe((result) => {
        debugger
     
        this.voucherData = result;

        if(currentLang == "ar"){
          this.refresItemsLocationArabic(this.voucherData);
         }
         else{
          this.refreshItemsLocationEnglish(this.voucherData);
         }  

        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsLocation');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.voucherData = [];
    this.GetItemsLocationsInitialForm();

    this.ItemsLocationsAddForm.get('itemId').setValue(0);
    this.ItemsLocationsAddForm.get('groupId').setValue(0);
    this.ItemsLocationsAddForm.get('catId').setValue(0);
    this.ItemsLocationsAddForm.get('storeId').setValue(0);
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

  refresItemsLocationArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم المادة': x.itemNo,
      'اسم المادة': x.itemName,
      'اسم المجموعة': x.groupName,
      'الصنف': x.catName,
      'المستودع': x.storeName,
      'الموقع': x.location,
    }));
  }

  refreshItemsLocationEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Material Number': x.itemNo,
      'Material Name': x.itemName,
      'Collection Name': x.groupName,
      'item': x.catName,
      'Store': x.storeName,
      'Location': x.location,
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
       head = [['الموقع','المستودع','الصنف',' اسم المجموعة',' اسم المادة',' رقم المادة']]    }
    else{
       head = [['Location','Store','item','Collection Name','Material Name','Material Number']]
    }

    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.itemNo
     temp[1]= part.itemName 
     temp[2]= part.groupName
     temp[3]= part.catName
     temp[4]= part.storeName 
     temp[5]= part.location
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

   let Title ="";
   if(currentLang == "ar"){
     Title = "تقرير مواقع المواد ";
  }
   else{
     Title = "Items Location Report ";
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
}
