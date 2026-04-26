import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { ItemService } from '../item.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ImageViewComponent } from '../image-view/image-view.component'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import { ItemSearchFormComponent } from '../ItemSearchForm/item-search-form/item-search-form.component';
import { environment } from "environments/environment";
import { AmiriRegular } from '../../../../../assets/fonts/amiri'; 

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})
export class ItemsListComponent implements OnInit {
  @ViewChild(ItemSearchFormComponent)childSearch:ItemSearchFormComponent;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  baseUrl = environment.apiURL_Main;
  exportData: any[];
  data: any[];
  public showLoader: boolean;
  voucherTypeEnum :number = 111
  
  constructor(
    private title: Title,
    private translateService: TranslateService,
    private itemService: ItemService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private alert: sweetalert,
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetItemList();
   // this.GetItemsList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsList' );
    this.title.setTitle(this.TitlePage);
  }

  GetItemsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    this.itemService.GetItemsList().subscribe(result => {
      this.tabelData = result;
      if(currentLang == "ar"){
        this.refreshItemsListArabic(this.tabelData);
       }
       else{
        this.refreshItemsListEnglish(this.tabelData);
       }   
    })
  }

  GetItemList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
    this.showLoader = true;
    setTimeout(() => {
      this.itemService.GetItemList(this.voucherTypeEnum).subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }

        this.tabelData = result;

        if(currentLang == "ar"){
          this.refreshItemsListArabic(this.tabelData);
         }
         else{
          this.refreshItemsListEnglish(this.tabelData);
         }   

        this.tabelData.forEach(element => {
          if(element.amount == null)
          {
            element.amount =0;
          }
          
        });
        this.showLoader = false;
        debugger
if(result.length > 0 )
{
  if (this.childSearch) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const firstDayOfYear = new Date(currentYear, 0, 1);

    this.childSearch.vGroupList = result[0].searchItemCriteriaModel.itemGroupList;
    this.childSearch.vCategoriesList = result[0].searchItemCriteriaModel.categoriesList;
    this.childSearch.vModelsList = result[0].searchItemCriteriaModel.modelsList;
    this.childSearch.vBrandIList = result[0].searchItemCriteriaModel.brandIsList;
    this.childSearch.itemNo = "";
    this.childSearch.itemName = "";          
    this.childSearch.ngOnInit();
  } else {
    console.error('childSearch is not defined!');
  }
}
      
        debugger
      })
    });
    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        this.tabelData =result;
      });
    } else {
      console.error('childSearch is not defined!');
    }
  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
  }


  DeleteItem(id: any) {
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
        this.itemService.DeleteItem(id).subscribe((result) => {
          debugger
          if (result.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetItemsList();
          }
          else if(result.isSuccess == false && result.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
            this.alert.ShowAlert('DeleteItemFaild','error');
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  AddItemForm(id: any, isViewMode = false, isCopied = false) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = isViewMode;
    this.routePartsService.Guid3ToEdit = isCopied;
    this.routePartsService.Guid4ToEdit = "Add";
    this.router.navigate(['/Items/ItemsList/ItemForm']);
  }

 EditItemForm(id: any, isViewMode = false, isCopied = false) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = isViewMode;
    this.routePartsService.Guid3ToEdit = isCopied;
    this.routePartsService.Guid4ToEdit = "Edit";
    this.router.navigate(['/Items/ItemsList/ItemForm']);
  }

  ShowItemForm(id: any, isViewMode = false, isCopied = false) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = isViewMode;
    this.routePartsService.Guid3ToEdit = isCopied;
    this.routePartsService.Guid4ToEdit = "Show";
    this.router.navigate(['/Items/ItemsList/ItemForm']);
  }


  CopyItemForm(id: any, isViewMode = false, isCopied = true) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = isViewMode;
    this.routePartsService.Guid3ToEdit = isCopied;
    this.router.navigate(['/Items/ItemsList/ItemForm']);
  }

  TransactionItemLogs(item: any) {
    debugger
    const url = `/InventoryReports/GetItemTransactionsForm?item=${item}`;
    window.open(url, '_blank');
  /*   this.routePartsService.GuidToEdit = id;
    this.router.navigate(['/ItemsTrans/ItemsTrans']); */
  }

  viewImage(image) {
    let imageurl = this.baseUrl + image;

    let title = this.translateService.instant('itemImage');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ImageViewComponent, {
      width: '600px',
      height: '600px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        imageurl: imageurl,
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
      })
  }

  refreshItemsListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رمز المادة': x.itemNo,
      'اسم المادة': x.itemName,
      'المجموعه': x.itemGroupName,
      'الصنف': x.categoryName,
      'الماركة': x.brandName,
      'الموديل': x.modelName,
      'موقوفه': x.stopped,
    }));
  }

  refreshItemsListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Item Code': x.itemNo,
      'Item Name': x.itemName,
      'Group': x.itemGroupName,
      'Category': x.categoryName,
      'Brand': x.brandName,
      'Model': x.modelName,
      'Stopped': x.stopped,
    }));
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Stores list");
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
       head = [[' موقوفه','  الموديل','الماركة',' الصنف','المجموعه','اسم المادة','رمز المادة']]    }
    else{
       head = [['Stopped','Model','Brand','Category',' Group','Item Name','Item Code']]
    }
    const rows :(number|string)[][]=[];

    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.itemNo
     temp[1]= part.itemName 
     temp[2]= part.itemGroupName
     temp[3]= part.categoryName
     temp[4]= part.brandName 
     temp[5]= part.modelName
     temp[6]= part.stopped
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

   let Title = "";
   if(currentLang == "ar"){
     Title = "قائمة المواد  ";
  }
   else{
     Title = "Items List";
   }
  
   let pageWidth = pdf.internal.pageSize.width;
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