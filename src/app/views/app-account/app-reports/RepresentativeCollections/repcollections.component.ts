import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ReportsService } from '../reports.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';


@Component({
  selector: 'app-repcollections',
  templateUrl: './repcollections.component.html',
  styleUrl: './repcollections.component.scss'
})
export class RepcollectionsComponent implements OnInit {
  RepcollectionsAddForm: FormGroup;
  brancheisList:any;
  representedList:any;
  paymentMethodList:any;
  customerList:any;

  total: number;
  totalF: string = '0';

  hidden:boolean=true;
  cumulative: boolean = false;
  currentLang = this.jwtAuth.getLang();
  chooseText = this.currentLang === 'en' ? 'Select one' : 'اختر';
  statusList: { id: number; text: string }[] = [
    { id: -1, text: this.chooseText },    // ID 0 for "Choose"
    { id: 1, text: 'مرحل' },    // ID 1 for "Posted"
    { id: 0, text: 'غير مرحل' },  // ID 2 for "Unposted"
  ];
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;

  isPost: number = 1;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 285;
  custom: boolean;
  data: any[];
  public TitlePage: string;

   constructor
    ( 
      private readonly title: Title,
      private readonly formbulider: FormBuilder,
      private readonly translateService: TranslateService,
      private readonly ReportsService: ReportsService,
      private readonly alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private readonly jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private readonly egretLoader: AppLoaderService,
      private readonly cdr : ChangeDetectorRef,
      private readonly serv: AppCommonserviceService,
    ) { }

    ngOnInit(): void {
      this.SetTitlePage();
      this.GetRepresentativeCollectionsForm();
      this.GetRepresentativeCollectionsInitialForm();
      this.getFavouriteStatus(this.screenId);
    }
  
    GetRepresentativeCollectionsForm() {
      debugger
      this.RepcollectionsAddForm = this.formbulider.group({
        id: [0],
        companyId: [0],
        fromdate: [''],
        todate: [''],
        branchId: [0],
        represntedId: [0],
        paymentMethod: [0],
        customerId: [0],
        collective: [0],        
      });
    }
  
    GetRepresentativeCollectionsInitialForm() {
      debugger
      this.ReportsService.GetRepresentativeCollectionsForm().subscribe((result) => {
        debugger
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }          
        this.brancheisList = result.getBrancheisList;
        this.representedList = result.getRepresentedList;
        this.paymentMethodList = result.getPaymentMethodList;
        this.customerList = result.getCustomerList;
        this.RepcollectionsAddForm.patchValue(result);
        result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
        result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
        this.RepcollectionsAddForm.patchValue(result);
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(value => {
          if(result.branchId == null || result.branchId == undefined)
            {
              result.serviceID = 0;
            }
          if(result.represntedId == null || result.represntedId == undefined)
            {
              result.accountId = 0;
            }
          if(result.paymentMethod == null || result.paymentMethod == undefined)
            {
              result.branchId = 0;
            }
          if(result.customerId == null || result.customerId == undefined)
            {
              result.employeeID = 0;
            }
            
          this.RepcollectionsAddForm.get("collective").setValue(0);
          this.RepcollectionsAddForm.get("fromdate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
          this.RepcollectionsAddForm.get("todate").setValue(formatDate(result.toDate, "yyyy-MM-dd", "en-US"));
        });
      });
    }
  
    GetReport() {
      const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';        
      debugger
      setTimeout(() => {
        this.voucherData = [];
        const formValues = this.RepcollectionsAddForm.value;
        debugger
        this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
        if(this.cumulative)
          {
            this.ReportsService.GetRepresentativeCollections(
              formValues.fromdate,
              formValues.todate,
              formValues.branchId,
              formValues.represntedId,
              formValues.paymentMethod,
              formValues.customerId,
              formValues.collective,                  
            ).subscribe((result) => {
              debugger;
          
              this.voucherData = result;
      
              if(currentLang == "ar"){
                this.refresCurrencyexchangeratehistoryArabic(this.voucherData);
               }
               else{
                this.refreshCurrencyexchangeratehistoryeEnglish(this.voucherData);
               }
      
              this.calcultevalues();
              this.egretLoader.close();
            });
          }
        else
          {
            this.ReportsService.GetRepresentativeCollectionsDetailed(
              formValues.fromdate,
              formValues.todate,
              formValues.branchId,
              formValues.represntedId,
              formValues.paymentMethod,
              formValues.customerId,
              formValues.collective,                  
            ).subscribe((result) => {
              debugger;
          
              this.voucherData = result;
      
              if(currentLang == "ar"){
                this.refresCurrencyexchangeratehistoryArabic(this.voucherData);
               }
               else{
                this.refreshCurrencyexchangeratehistoryeEnglish(this.voucherData);
               }
      
              this.calcultevalues();
              this.egretLoader.close();
            });
          }       
      });
    }
  
    SetTitlePage() {
      this.TitlePage = this.translateService.instant('RepresentativeCollections');
      this.title.setTitle(this.TitlePage);
    }
  
    clearFormData() {
      this.RepcollectionsAddForm.reset(); // Reset the form
      this.voucherData = []; // Clear the table data
      this.GetRepresentativeCollectionsInitialForm();
      this.clearTotals()
    }
  
    calcultevalues() {
      this.total = 0;

      const field = this.cumulative ? 'totalCollection' : 'amount';

      for (const row of this.voucherData) {
        const value = parseFloat(row[field]);
        if (!isNaN(value)) {
          this.total += value;
        }
      }
      const rounded = Number(this.total.toFixed(3));
      this.totalF = rounded.toLocaleString(undefined, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      });
    }

    clearTotals() {
      this.total = 0;
      this.totalF = '0';
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
  
    refresCurrencyexchangeratehistoryArabic(data) {
      debugger
      this.data = data;
      if(this.cumulative)
        {
          this.exportData = this.data.map(x => ({
            'رقم المندوب': x.representId,           
            'اسم المندوب': x.representName,
            'قيمة التحصيل': x.totalCollection.toFixed(3),                                
          }));
        }
      else
        {
          this.exportData = this.data.map(x => ({
            'رقم سند القبض': x.voucherNo,
            'التاريخ': formatDate(x.voucherDate, "yyyy-MM-dd", "en-US") ,
            'نوع السند': x.voucherName,
            'العميل': x.customer,
            'قيمة السند': x.amount.toFixed(3),
            'المندوب': x.represntedName,
            'طريقة الدفع': x.paymentMethods,                        
          }));
        }
      
      
      
    }
  
    refreshCurrencyexchangeratehistoryeEnglish(data) {
      debugger
      this.data = data;
      if(this.cumulative)
        {
          this.exportData = this.data.map(x => ({
            'Representative No': x.representId,           
            'RepresentedName': x.representName,
            'Collection Value': x.totalCollection.toFixed(3),                                
          }));
        }
      else
        {
          this.exportData = this.data.map(x => ({
            'Voucher No': x.voucherNo,
            'Voucher Date': formatDate(x.voucherDate, "yyyy-MM-dd", "en-US"),
            'Voucher Name': x.voucherName,
            'Customer': x.customer,
            'Voucher Amount': x.amount.toFixed(3),
            'Man': x.represntedName,
            'Payment Methods': x.paymentMethods,       
          }));
        }
      
    }
  
    exportExcel1() {
      import("xlsx").then(xlsx => {
        debugger;

        const worksheet = xlsx.utils.json_to_sheet(this.exportData);

        // حساب المجاميع
        let total = 0;
        if(this.cumulative)
        {
           total = this.voucherData.reduce((sum, item) => sum + item.totalCollection, 0);
        }
        else
        {
          total = this.voucherData.reduce((sum, item) => sum + item.amount, 0);
        }
       
        const headers = Object.keys(this.exportData[0]);
        const isArabic = this.currentLang == 'ar';

        const totalLabel = isArabic ? 'المجموع' : 'Total';
        let fieldMap : any;
        if(this.cumulative)
        {
           fieldMap = isArabic
          ? {
            'قيمة التحصيل': total,
          }
          : {
            'Collection Value': total,
          };
        }
        else
        {
          fieldMap = isArabic
          ? {
            'قيمة السند': total,
          }
          : {
            'Voucher Amount': total,
          };
        }
        


        // دالة لتحويل رقم العمود إلى حرف إكسل
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

        // حساب الصف الأخير
        const lastRow = Object.keys(worksheet)
          .filter(key => /^[A-Z]+\d+$/.test(key))
          .map(key => parseInt(key.match(/\d+/)![0]))
          .reduce((a, b) => Math.max(a, b), 0) + 1;

        // إدخال المجاميع في الأعمدة المناسبة
        headers.forEach((header, index) => {
          const trimmedHeader = header.trim(); // إزالة الفراغات من الاسم
          const sumValue = fieldMap[trimmedHeader];
          if (sumValue !== undefined) {
            const colLetter = getExcelColumnLetter(index);
            const cellAddress = colLetter + lastRow;
            worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
          }
        });

        // وضع التسمية "Total" أو "المجموع" في أول عمود
        const labelCellAddress = getExcelColumnLetter(0) + lastRow;
        worksheet[labelCellAddress] = { t: 's', v: totalLabel };

        // تحديث نطاق الورقة
        const range = xlsx.utils.decode_range(worksheet['!ref']!);
        range.e.r = lastRow - 1;
        worksheet['!ref'] = xlsx.utils.encode_range(range);

        // إنشاء ملف الإكسل وتصديره
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "RepresentativeCollections");
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

    exportPdf1() {
      debugger;
        const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
        let head :any;
        if(this.cumulative)
        {
          if(currentLang == "ar"){
          head = [['قيمة التحصيل','اسم المندوب','رقم المندوب']] }
          else{
          head = [['Collection Value','Represented Name','Representative No']]
          }
        }
        else
        {
          if(currentLang == "ar"){
          head = [['طريقة الدفع',' المندوب','قيمة السند','العميل','نوع السند','التاريخ','رقم سند القبض']] }
          else{
          head = [['Payment Methods','Man','Voucher Amount','Customer','Voucher Name','Voucher Date','Voucher No']]
          }
        }
        
      const rows: (number | string)[][] = [];

      // متغيرات المجاميع
      let total = 0;
      // إنشاء الصفوف وجمع القيم
      if(this.cumulative)
      {
        this.voucherData.forEach(function (part) {
        let temp: (number | string)[] = [];
        temp[0]= part.representId
        temp[1]= part.representName
        temp[2]= part.totalCollection.toFixed(3)       
        total += parseFloat(part.totalCollection.toFixed(3)) || 0;

        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp); // لعكس الأعمدة حسب اللغة
      });
      }
      else
      {
        this.voucherData.forEach(function (part) {
        let temp: (number | string)[] = [];
        temp[0]= part.voucherNo
        temp[1]= formatDate(part.voucherDate, "yyyy-MM-dd", "en-US")  
        temp[2]= part.voucherName
        temp[3]= part.customer
        temp[4]= part.amount.toFixed(3) 
        temp[5]= part.represntedName
        temp[6]= part.paymentMethods 
        total += parseFloat(part.amount.toFixed(3)) || 0;

        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp); // لعكس الأعمدة حسب اللغة
      });
      }
      

      // عدد الأعمدة
      const columnCount = head[0].length;

      // إنشاء صف التذييل (footer row)
      let footRow: (string | number)[] = new Array(columnCount).fill('');
      let foot: (string | number)[][];

      if (currentLang === "ar") {
        footRow[3] = "المجموع";
        footRow[4] = total.toFixed(3);    

      } else {
        footRow[3] = "Total";
        footRow[4] = total.toFixed(3);     
      }

      foot = [footRow.reverse()];

      // إعداد ملف PDF
      const pdf = new jsPDF('l', 'pt', 'a4');
      pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
      pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      pdf.setFont('Amiri');
      pdf.setFontSize(14);

      let title :any;
      if(this.cumulative)
      {
        title  = currentLang === "ar"
        ? "كشف تحصيلات المندوب التجميعي"
        : "Collections Report From The Collection Agent";
      }
      else
      {
       title  = currentLang === "ar"
        ? "كشف تحصيلات المندوب التفصيلي"
        : "Detailed Report Of The Representative's Collections";
      }
      

      const pageWidth = pdf.internal.pageSize.width;
      pdf.text(title, pageWidth / 2, 8, { align: 'center' });

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
  
    OpenVoucher(id:number,categoryId:any){
      // alert(catId)
      if(categoryId == 19)
        {
          let url='';
          debugger;  
          this.routePartsService.GuidToEdit = id;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReceiptVoucher/Receiptform?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
          window.open(url,'_blank');
        }
      else if (categoryId == 131)
        {
          let url='';
          debugger;  
          this.routePartsService.GuidToEdit = id;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/CustomerReceiptVoucher/CustRecieptvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
          window.open(url,'_blank');
        }
                            
    }

    onchangeCumulative(event:any) {
    debugger
    this.voucherData = [];
    this.clearTotals()
    this.cumulative = event.target.checked;
    if (this.cumulative) {
      this.RepcollectionsAddForm.get("collective").setValue(1);
    } else {
      this.RepcollectionsAddForm.get("collective").setValue(0);
    }
    this.cdr.detectChanges();
    }
}
