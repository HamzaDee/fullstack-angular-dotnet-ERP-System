import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { QaproductionService } from '../qaProduction/qaproduction.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { formatDate } from '@angular/common';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RawMaterialsComponent } from '../prodorders/raw-materials/raw-materials.component';
import { AmiriRegular } from 'assets/fonts/amiri';


@Component({
  selector: 'app-proditemslist',
  templateUrl: './proditemslist.component.html',
  styleUrls: ['./proditemslist.component.scss']
})
export class ProditemslistComponent implements OnInit {
  QAAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  itemsList: any;
  allUnitsList: any;
  ManOrderDTList: any[] = [];
  manOrdersList: any[];
  qaDetailsList: any[] = [];
  countriesList: any;
  customersList: any;
  unitsList: Array<any> = [];
  showLoader = false;
  qaId: any;
  porderId: any;
  showOnly = false;
  approval = false;
  salesOrderDTList: any;
  previousSelectedOrderId: any[] = [];
  RawMaterialList: any[] = [];
  selectedCountries: any;
  exportData: any[];
  data: any[];

  constructor(
    private title: Title,
    private alert: sweetalert,
    private qaproductionService: QaproductionService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.porderId = localStorage.getItem('porderId');
    localStorage.removeItem('porderId');
    this.qaId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    if (this.opType == 'Show')
      this.showOnly = true;
    else if (this.opType == 'Approval')
      this.approval = true;
    this.SetTitlePage();
    debugger
    this.GetInitailQA();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('proditemslist');
    this.title.setTitle(this.TitlePage);
  }

  GetInitailQA() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.QAAddForm = this.formbulider.group({
      QADetailsList: [null],
    });

    this.qaproductionService.GetProdItems().subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.qaDetailsList = result;

      if (currentLang == "ar") {
        this.refresProditemslistArabic(this.qaDetailsList);
      }
      else {
        this.refreshProditemslistEnglish(this.qaDetailsList);
      }
      this.qaDetailsList = result.map(item => {
        return {
          ...item,
          notAvlQty: false
        };
      });

      this.qaDetailsList.forEach(e => {
        e.prodDate = formatDate(e.prodDate, "yyyy-MM-dd", "en-US");
        e.expiryDate = formatDate(e.expiryDate, "yyyy-MM-dd", "en-US");
        for (const rowitem of e.itemRawMaterials) {
          if ((rowitem.qty * e.qty) > rowitem.avlQty) {
            e.notAvlQty = true;
          }
        }
      })
      this.QAAddForm.get("QADetailsList").setValue(this.qaDetailsList);
    })
  }

  GetItemRawMaterials(row: any, rowIndex: number) {
    debugger
    var itemName = this.qaDetailsList.find(option => option.itemNo === row.itemNo).itemName;
    let title = this.translateService.instant('RawMaterial');
    let dialogRef: MatDialogRef<any> = this.dialog.open(RawMaterialsComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, itemName: itemName, totQty: row.qty, itemNo: row.itemNo, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId() }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          return;
        }
      })
  }

  OnSaveForms(temp) {
    debugger
    let stopExecution = true;
    if (this.qaDetailsList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = true;
      return false;
    }
    this.qaDetailsList.forEach(element => {
      if (element.prodDone === true) {
        stopExecution = false;
        return false;
      }
    })
    if (stopExecution) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      return;
    }
    this.qaproductionService.SaveProdItems(this.qaDetailsList)
      .subscribe((result) => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        if (result.isSuccess) {
          this.alert.SaveSuccess();
          window.location.reload();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  refresProditemslistArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const prodDate = new Date(x.prodDate).toLocaleDateString('ar-EG');
      const expiryDate = new Date(x.expiryDate).toLocaleDateString('ar-EG');
      return {
        'رقم المنتج': x.itemNo,
        ' المنتج': x.itemName,
        ' الكمية': x.qty,
        'رقم التشغيلة': x.batchNo,
        'ملاحظات': x.notes,
        'تاريخ الانتاج': prodDate,
        'تاريخ الانتهاء': expiryDate,
        'حالة المنتج \ تم ': x.prodDone,
      }
    });
  }

  refreshProditemslistEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const expiryDate = new Date(x.expiryDate).toLocaleDateString('ar-EG');
      const prodDate = new Date(x.prodDate).toLocaleDateString('ar-EG');
      return {
        'Product Number': x.itemNo,
        'Product Name': x.itemName,
        'Qty': x.qty,
        'Run Number': x.batchNo,
        'Notes': x.notes,
        'Product Date': prodDate,
        'Expiry Date': expiryDate,
        'Product Status / Done': x.prodDone,
      }
    });
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {

      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresProditemslistArabic(exportSource);
      } else {
        this.refreshProditemslistEnglish(exportSource);
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
       head = [['حاله المنتج  / تم', ' تاريخ الانتهاء', ' تاريخ الانتاج', 'ملاحظات', ' رقم التشغيلة', ' الكمية', 'المنتج', 'رقم المنتج']]
    }
    else {
       head = [['Product Status / Done', 'Expiry Date', 'Product Date', 'Notes', 'Run Number', 'Qty', ' Product Name', 'Product Number']]
    }
    const rows: (number | string)[][] = [];

    
    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    }
    else {
      exportSource = this.data;
    }

    exportSource.forEach(function (part, index) {

      const date1 = new Date(part.prodDate);
      const prodDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.expiryDate);
      const expiryDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.itemNo
      temp[1] = part.itemName
      temp[2] = part.qty
      temp[3] = part.batchNo
      temp[4] = part.notes
      temp[5] = prodDate
      temp[6] = expiryDate
      temp[7] = part.prodDone

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

    const Title = currentLang == "ar" ? "قائمة المنتجات المراد تصنيعها" : "List of products to be manufactured" ;
    let pageWidth = pdf.internal.pageSize.width;
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


