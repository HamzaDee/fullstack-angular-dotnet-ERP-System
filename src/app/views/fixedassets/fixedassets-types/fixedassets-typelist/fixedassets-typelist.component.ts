import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { FixedassetsTypeService } from '../fixedassets-type.service';
import { FixedassetsTypeformComponent } from '../fixedassets-typeform/fixedassets-typeform.component';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from '../../../../../assets/fonts/amiri'; 

@Component({
  selector: 'app-fixedassets-typelist',
  templateUrl: './fixedassets-typelist.component.html',
  styleUrls: ['./fixedassets-typelist.component.scss']
})
export class FixedassetsTypelistComponent implements OnInit {
  showLoader: boolean;
  FixedAssetsTypeList: any;
  screenId:number = 72;
  custom:boolean;
  exportData: any[];
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  public TitlePage: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private FixedassetsTypeService: FixedassetsTypeService) {}

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetFixedassetsTypelist();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('FixedassetsTypelist');
    this.title.setTitle(this.TitlePage);
  }

  GetFixedassetsTypelist() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
     debugger
    this.showLoader = true;
    setTimeout(() => {
      this.FixedassetsTypeService.getFixedAssetsTypeList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
        this.FixedAssetsTypeList = result;

        if(currentLang == "ar"){
          this.refreshCompanyListTableArabic(this.FixedAssetsTypeList);
         }
         else{
          this.refreshCompanyListTableEnglish(this.FixedAssetsTypeList);
         }  
        this.showLoader = false;
      })
    }, 500);
  }

  OpenFixedassetsTypeFormPopUp(id: number, crruntrow: any, isNew?) { 
    let title = isNew ? this.translateService.instant('AddFixedassetsType') : this.translateService.instant('modifiyFixedAssestType');
    let dialogRef: MatDialogRef<any> = this.dialog.open(FixedassetsTypeformComponent, {
      width: '1000px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, row: crruntrow, isNew, companyid: this.jwtAuth.getCompanyId(), GetAllMainSystemsDefinitionList: () => { this.GetFixedassetsTypelist() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  DeleteFixedassetsTypeForm(id: any) {
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
        this.FixedassetsTypeService.deleteFixedAssetsType(id).subscribe((results) => {
          
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetFixedassetsTypelist();
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
              {
                this.alert.ShowAlert("msNoPermission",'error');
                return;
              }}
          else
          {
            if(results.message == "msgRecordHasLinks"){

              this.alert.ShowAlert("msgRecordHasLinks",'error')
          }
           else  if(results.message == "msgRecordHasChildren"){

            this.alert.ShowAlert("msgRecordHasChildren",'error')

           }
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  refreshCompanyListTableArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      ' الرقم': x.id,
      ' الاسم': x.typeNameA,
      ' النوع الرئيسي': x.mainTypeName,
      ' طريقة الحساب': x.paymentMethod,
      ' نسبة الاهلاك': x.depreciationPercentage,
      '  متفرع': x.isMain,
    }));
  }

  refreshCompanyListTableEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Number': x.id,
      'Name': x.typeNameA,
      'Main Type': x.mainTypeName,
      'Calculation Method ': x.paymentMethod,
      'Depreciation Ratio': x.depreciationPercentage,
      'Branched': x.isMain,
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
       head = [['متفرع','نسبة الاهلاك','طريقة الحساب','النوع الرئيسي ',' الاسم',' الرقم']]
    }
    else{
       head = [['Branched','Depreciation Ratio',' Calculation Method ','Main Type ',' Name','Number']]
    }

    const rows :(number|string)[][]=[];
    this.data.forEach(function(part, index) {
    let temp: (number|string)[] =[];
     temp[0]= part.id
     temp[1]= part.typeNameA 
     temp[2]= part.mainTypeName
     temp[3]= part.paymentMethod
     temp[4]= part.depreciationPercentage 
     temp[5]= part.isMain


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

   const Title = currentLang == "ar" ? " كشف قائمه الشركات " : "List of Types Of Fixed Assets" ;
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

  updateFavourite(ScreenId:number)
  {
    debugger
    this.FixedassetsTypeService.UpdateFavourite(ScreenId).subscribe(result => {
        this.getFavouriteStatus(this.screenId);               
    })        
  }

  getFavouriteStatus(screenId)
  {
    debugger
    this.FixedassetsTypeService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if(result)
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
}
