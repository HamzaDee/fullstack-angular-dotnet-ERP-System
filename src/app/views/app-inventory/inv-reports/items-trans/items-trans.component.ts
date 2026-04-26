import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { InventoryReportsService } from '../invreports.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-items-trans',
  templateUrl: './items-trans.component.html',
  styleUrls: ['./items-trans.component.scss']
})
export class ItemsTransComponent implements OnInit {
  itemTransAddForm: FormGroup;
  itemsList: any;
  itemsGroupList: any;
  typesList: any;
  branchesList: any;
  storesList: any;
  voucherTypesList: any;
  itemAddInfoList: any;
  itemADdInfo: any;
  isBatchNoDisabled: boolean = false;
  isSerialNoDisabled: boolean = false;
  isExpDateNoDisabled: boolean = false;
  data: any[];
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  voucherData: any;
  headerData: any;
  isDisabled: boolean = true;
  selectAll: boolean = false;
  isAnyRowChecked: boolean = false;
  total: number = 0;
  totalWithCost: number = 0;
  tot1: number = 0;
  tot2: number = 0;
  totbefore: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  tot3Formatted: string = '0';
  totalFormatted: string = '0';
  totalwCostFormatted: string = '0';
  screenId: number = 143;
  custom: boolean;
  showCost: boolean = false;
  showDisburseEntity: boolean;
  item: number;
  public TitlePage: string;
  deliveredToList: any;
  loading: boolean;
  isHis: boolean = false;
  public CompanyName: string = '';


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
      private router: Router,
      private appCommonserviceService: AppCommonserviceService,
      private title: Title,

    ) { }


  ngOnInit(): void {
    debugger
    this.CompanyName = window.localStorage.getItem('companyName');
    this.SetTitlePage();
    debugger
    this.route.queryParams.subscribe((params: Params) => {
      this.item = +params['item'];
    });
    this.GetItemtransactionsForm();
    this.GetItemtransactionsInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaterialTransactions');
    this.title.setTitle(this.TitlePage);
  }

  GetItemtransactionsForm() {
    debugger
    this.itemTransAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      itemId: [0],
      itemGroupId: [0],
      typeId: [0],
      branchId: [0],
      storeId: [0],
      voucherTypeId: [0],
      batchNo: [''],
      serialNo: [''],
      expDate: [''],
      itemAddInfo: [0],
      deliveredTo: [0],
      // supplierId:[0,[Validators.required, Validators.min(1)]],
    });
    this.itemTransAddForm.get('batchNo').disable();
    this.itemTransAddForm.get('serialNo').disable();
    this.itemTransAddForm.get('expDate').disable();
  }

  GetItemtransactionsInitialForm() {
    debugger
    this.ReportsService.GetItemTranactionsForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.typesList = result.typesList;
      this.itemsGroupList = result.groupsList;
      this.branchesList = result.branchesList;
      this.itemAddInfoList = result.itemsAddInfoList;
      this.deliveredToList = result.deliveredToList;
      this.showDisburseEntity = result.showDisburseEntity;
      this.isHis = result.isHis;
      debugger
      this.voucherTypesList = result.voucherTypesList;
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      result.expDate = formatDate(result.expDate, "yyyy-MM-dd", "en-US")
      this.itemTransAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger

        if (this.item > 0) {
          this.itemTransAddForm.get("itemId").setValue(this.item);
        }
        else {
          this.itemTransAddForm.get('itemId').setValue(0);
        }
        this.isDisabled = true;
        this.itemTransAddForm.get("branchId").setValue(result.defaultBranchId);
      });
    });
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      debugger

      const formValues = this.itemTransAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      if (formValues.storeId == null) {
        formValues.storeId = 0;
      }

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetItemTranactions(
        formValues.fromDate,
        formValues.toDate,
        formValues.itemGroupId,
        formValues.typeId,
        formValues.itemId,
        formValues.branchId,
        formValues.storeId,
        formValues.voucherTypeId,
        formValues.batchNo,
        formValues.serialNo,
        formValues.expDate,
        this.itemADdInfo,
        formValues.deliveredTo
      ).subscribe((result) => {
        debugger
        this.voucherData = result;

        if (currentLang == "ar") {
          this.refresItemsTransArabic(this.voucherData);
        }
        else {
          this.refreshItemsTransEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0) {
          debugger
          this.calcultevalues()
          this.egretLoader.close();
        }
        else {
          debugger
          if (this.itemTransAddForm.value.itemId != "" && this.itemTransAddForm.value.itemId != 0 && this.itemTransAddForm.value.itemId != null && this.itemTransAddForm.value.itemId != undefined) {
            this.alert.ShowAlert('NoItemTransactionsFound', 'Error');
            this.egretLoader.close();
          }
          else {
            this.alert.ShowAlert('ThereisNoData', 'Error');
            this.egretLoader.close();
          }

        }

      });
    });
  }

  OpenVoucher(id, catId) {
    debugger
    var url = '';
    var invId = 0;
    switch (catId) {
      case 44:   // sales invioce
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/SalesInvoices/SalesInvoicesForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 45:   // Return sales invioce
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReturnSalesInvoice/ReturnSalesInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 35: // Damage voucher
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/DamageStockVoucher/DamageStockVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 165:  //Items Reservation Voucher
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ItemsReservationVoucher/ItemsReservationVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 41: //Return Purchase Invoice
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReturnPurchaseInvoice/ReturnPurInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 33: //Items Entry Voucher
        if (this.CompanyName == 'Hashmyieh') {
          this.routePartsService.GuidToEdit = id
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/EntryVoucherH/EntryvouhcerhForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
          break;
        }
        else {
          this.routePartsService.GuidToEdit = id
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/EntryyVoucher/EntryyVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
          break;
        }
      case 34: //Items Output Voucher
        if (this.CompanyName == 'Hashmyieh') {
          this.routePartsService.GuidToEdit = id
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/OutputVoucherH/OutputvoucherhForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
          break;

        }
        else {
          this.routePartsService.GuidToEdit = id
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/InventoryVouchers/OutputVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
          break;
        }
      case 36: //Items Transfer Voucher
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/TransferStockVoucher/ItemsTransferVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 38: //Items Receipt Voucher
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReceiptItemsVoucher/AddInvVoucher?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 39: //Purchase Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/PurchaseInvoice/PurchaseInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 175: //Items Delivery
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ItemsDeliveryVoucher/ItemsDeliveryForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      default:
      // Default code if none of the cases match
    }
  }

  OnBatchChange(checkboxv) {
    debugger;
    if (checkboxv == true) {

      $('#batchd').prop('disabled', false);
    }
    else {
      $('#batchd').prop('disabled', true);
      this.itemTransAddForm.get("batchNo").setValue('');
    }
  }

  OnSerialChange(checdis) {
    if (checdis == true) {

      $('#seriald').prop('disabled', false);
    }
    else {
      $('#seriald').prop('disabled', true);
      this.itemTransAddForm.get("serialNo").setValue('');
    }
  }

  OnExpChange(expp) {
    if (expp == true) {

      $('#expd').prop('disabled', false);
    }
    else {
      $('#expd').prop('disabled', true);
      this.itemTransAddForm.get("expDate").setValue('');
    }
  }

  clearFormData() {
    this.voucherData = [];
    this.isBatchNoDisabled = false;
    this.isSerialNoDisabled = false;
    this.isExpDateNoDisabled = false;
    this.itemADdInfo = "";
    this.GetItemtransactionsInitialForm();
    this.clearTotals();
    this.itemTransAddForm.get('itemGroupId').setValue(0);
    this.itemTransAddForm.get('deliveredTo').setValue(0);


  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.totalWithCost = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    for (const row of this.voucherData) {
      const balance = parseFloat(row.total);
      if (!isNaN(balance)) {
        this.total += balance;
      }
      const totalcost = parseFloat(row.totalCost)
      if (!isNaN(totalcost)) {
        this.totalWithCost += totalcost;

        const pallets = parseFloat(row.pallets)
        if (!isNaN(pallets)) {
          this.tot1 += pallets;
        }
        const weight = parseFloat(row.weight)
        if (!isNaN(weight)) {
          this.tot2 += weight;
        }
      }
    }
    this.totalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.total);
    this.totalwCostFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalWithCost);
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
    this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot2);
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.totbefore = 0;
    this.totalWithCost = 0;
    this.tot1Formatted = '0.000';
    this.tot2Formatted = '0.000';
    this.totalFormatted = '0.000';
    this.tot3Formatted = '0.000';
    this.totalwCostFormatted = '0.000';
  }

  updateFavourite(ScreenId: number) {
  this.appCommonserviceService.UpdateFavourite(ScreenId).subscribe(result => {
  if (result.isSuccess) {
    this.getFavouriteStatus(this.screenId);
    this.appCommonserviceService.triggerFavouriteRefresh(); // 🔥 THIS is key
  } else {
    this.alert.ShowAlert(result.message, 'error');
  }
  });
  }

  getFavouriteStatus(screenId)
  {
  debugger
  this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
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
    const url = `/ItemsTrans/ItemsTrans?item=${item}`;
    window.open(url, '_blank');
  }

  refresItemsTransArabic(data) {
    debugger
    this.data = data;
    const round3 = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? Number(n.toFixed(3)) : 0;
    };
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم المادة': x.itemNo,
        'اسم المادة': x.itemName,
        'رقم السند': x.voucherNo,
        'نوع السند': x.voucherName,
        'تاريخ السند': voucherDate,
        'المستودع': x.storeName,
        'الوحدة': x.unitName,
        'الملاحظات': x.note,
        'الكمية': x.qty,
        'البونص': x.bonus,
        'السعر': round3(x.price),
        'المجموع': round3(x.total),
        'الكلفة ': round3(x.cost),
        'مجموع الكلفة': round3(x.totalCost),
      }
    });
  }

  refreshItemsTransEnglish(data) {
    debugger
    this.data = data;
    const round3 = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? Number(n.toFixed(3)) : 0;
    };
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Material Number': x.itemNo,
        'Material Name': x.itemName,
        'Voucher Number': x.voucherNo,
        'Voucher Type': x.voucherName,
        'Voucher Date': voucherDate,
        'Store': x.storeName,
        'Unit': x.unitName,
        'Notes': x.note,
        'Quentity': x.qty,
        'bonus': x.bonus,
        'Price': round3(x.price),
        'Total': round3(x.total),
        'cost ': round3(x.cost),
        'totalCost': round3(x.totalCost),
      }
    });
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.total), 0);
      const totalValue = totalAmount.toFixed(3);

      const totalAmount2 = this.data.reduce((sum, item) => sum + parseFloat(item.totalCost), 0);
      const totalValue2 = totalAmount2.toFixed(3);


      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'المجموع';
      const totalHeaderEnglish = 'Total';
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

      const totalCostColIndex = headers.indexOf('مجموع الكلفة');
      if (totalCostColIndex !== -1) {
        const totalCostColLetter = getExcelColumnLetter(totalCostColIndex);
        const totalCostCell = totalCostColLetter + lastRow;
        worksheet[totalCostCell] = { t: 'n', v: parseFloat(totalValue2), z: '0.000' };
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
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['مجموع الكلفة', 'الكلفة', 'المجموع', 'السعر', ' الكمية', 'الملاحظات', ' الوحدة', 'المستودع', 'تاريخ السند', ' نوع السند', ' رقم السند', ' اسم المادة', ' رقم المادة']]
    }
    else {
      head = [['totalCost', 'cost', 'Total', 'Price', 'Quentity', 'Notes', 'Unit', 'Store', 'Voucher Date', 'Voucher Type', 'Voucher Number', 'Material Name', 'Material Number']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;
    let totalAmount1 = 0;
    const round3 = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? Number(n.toFixed(3)) : 0;
    };

    this.data.forEach((part) => {
      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.itemNo
      temp[1] = part.itemName
      temp[2] = part.voucherNo
      temp[3] = part.voucherName
      temp[4] = voucherDate
      temp[5] = part.storeName
      temp[6] = part.unitName
      temp[7] = part.note
      temp[8] = part.qty
      temp[8] = part.bonus
      temp[10] = round3(part.price);
      temp[11] = round3(part.total);
      temp[12] = round3(part.cost);
      temp[13] = round3(part.totalCost)

      totalAmount += part.total
      totalAmount1 += part.totalCost// Accumulate total (make sure amount is a number
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);

    });
    totalAmount = round3(totalAmount)
    totalAmount1 = round3(totalAmount1)
    // Prepare footer row (reverse the order like rows)
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); // assuming 10 columns
    let foot;

    if (currentLang == "ar") {
      footRow[9] = "المجموع";
      footRow[10] = totalAmount;
      footRow[12] = totalAmount1;
      foot = [footRow.reverse()];
    }
    else {
      footRow[9] = "Total";
      footRow[10] = totalAmount;
      footRow[12] = totalAmount1;
      foot = [footRow.reverse()];
    }

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف حركات المواد" : "Items Transactions Report ";
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
    return this.appCommonserviceService.formatCurrency(value, decimalPlaces);
  }

  fillValue(event) {
    if (event.value > 0) {
      debugger
      const selectedItem = this.itemAddInfoList.find(r => r.id == event.value);
      const selectedText = selectedItem ? selectedItem.text : '';
      this.itemADdInfo = selectedText;
    }
    else {
      this.itemADdInfo = "";
    }
  }

  loadLazyOptions(event: any) {
    debugger
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
