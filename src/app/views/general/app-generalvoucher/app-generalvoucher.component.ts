import { Component, Inject, OnInit,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef,MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';
import { voucherService } from './generalvoucher.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { ShowcostcenterComponent } from '../app-showcostcenter/showcostcenter.component';
import { ShowprojectsComponent } from '../app-showprojects/showprojects.component';


@Component({
  selector: 'app-app-generalvoucher',
  templateUrl: './app-generalvoucher.component.html',
  styleUrls: ['./app-generalvoucher.component.scss']
})
export class AppGeneralvoucherComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment:AppGeneralAttachmentComponent;
  EntryVoucherDetails: FormGroup;
  accVouchersDTsList: any[] = [];
  accountsList:any;
  costcenterList:any;
  projectsList:any;
  VoucherName:string;
  VoucherNo:string;
  VoucherDate:any;
  BranchName:string;
  CurrencyId:number;
  CurrRate:number;
  Notes:string;
  disableAll:boolean=true;
  decimalPlaces: number;
  sumDebit:number=0;
  sumCredit:number=0;
  sumDebitForamtted:string='0.000'
  sumCreditForamtted:string='0.000'
  constructor(
    @Inject(MAT_DIALOG_DATA) public impdata: any,
    public dialogRef: MatDialogRef<any>,
    private title: Title,
    private formbulider: FormBuilder,
    private translateService: TranslateService ,
    private serv:voucherService,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private appCommonserviceService : AppCommonserviceService,
    public routePartsService: RoutePartsService,
  ) { }
  public TitlePage: string;
  
  ngOnInit(): void {
    debugger
    this.InitiailEntryVoucherForm();
    this.SetTitlePage();
    // alert(this.impdata.id)
    this.VoucherName = this.impdata.voucherName;
    this.VoucherNo = this.impdata.VoucherNo;
    this.VoucherDate = formatDate( this.impdata.VoucherDate , "yyyy-MM-dd" ,"en-US")
    this.BranchName = this.impdata.BranchName ==null ?'':this.impdata.BranchName;
    this.CurrencyId = this.impdata.currencyName;
    this.CurrRate = this.impdata.curRate;
    this.Notes = this.impdata.Notes;
    this.routePartsService.GuidToEdit = this.impdata.id;
    this.getvoucherdata(this.impdata.id);
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('VoucherInfo');
    this.title.setTitle(this.TitlePage);
  }
  InitiailEntryVoucherForm() {
    this.EntryVoucherDetails = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0],
      voucherTypeEnum : [0],
      voucherNo: [""],
      voucherDate: [""],
      currencyId: [0],
      currRate: [0],
      isCanceled: [false],
      isPosted: [false],
      note: [""],
      branchId: [null],
      amount: [0],
      status: [null],
      userId: [0],
      accVouchersDTModelList: [null],
      costCenterTranModelList : [null],
      projectTransModelList : [null],
      accVouchersDocModelList : [null]
    });
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }



  calculateSum(){
    debugger
    this.sumDebit=0;
    this.sumCredit=0;
    this.sumDebitForamtted='0.000'
    this.sumCreditForamtted='0.000'
    this.sumDebitForamtted= this.formatCurrency(this.accVouchersDTsList.reduce((sum, item) => sum + parseFloat(item.debit), 0));
    this.sumCreditForamtted = this.formatCurrency(this.accVouchersDTsList.reduce((sum, item) => sum + parseFloat(item.credit), 0));
    // if(type == 0){
    //   return 0;
    // }
    // else if(type == 1){
    //   this.formatCurrency(this.accVouchersDTsList.reduce((sum, item) => sum + parseFloat(item.debit), 0));
    // }
    // else if(type == 2){
    //   this.formatCurrency(this.accVouchersDTsList.reduce((sum, item) => sum + parseFloat(item.credit), 0));
    // }    
  }


  getvoucherdata(Id:number)
  {
    this.serv.getvoucherdata(Id).subscribe(result => {
      debugger
      this.accountsList= result.accountList;
      this.costcenterList = result.costCenterList;
      this.projectsList = result.projectsList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.EntryVoucherDetails.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.EntryVoucherDetails.get("costCenterTranModelList").setValue(result.costCenterTranModelList);
      this.EntryVoucherDetails.get("projectTransModelList").setValue(result.projectTransModelList);
      this.EntryVoucherDetails.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      this.childAttachment.data = result.accVouchersDocModelList;
      this.childAttachment.ngOnInit();   
      this.calculateSum();      
    })

  }


  OpenCostcenterTransForm(row: any, rowIndex: number) {
    debugger
    var accName = this.accountsList.find(option => option.id === row.accountId).text;
    let title = this.translateService.instant('Constcenters');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ShowcostcenterComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, 
              accName: accName, 
              debit: row.debit, 
              credit: row.credit, 
              rowIndex: rowIndex, 
              companyid: this.jwtAuth.getCompanyId(), 
              costcenterList: this.costcenterList, 
              transList:this.EntryVoucherDetails.value.costCenterTranModelList.filter(item => item.index == rowIndex)
            }
    });
    return;
  }

  OpenProjectsTransForm(row: any, rowIndex: number) {
    debugger
    var accName = this.accountsList.find(option => option.id === row.accountId).text;
    let title = this.translateService.instant('Projects');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ShowprojectsComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, accName: accName, debit: row.debit, credit: row.credit, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId(), projectsList: this.projectsList, transList:this.EntryVoucherDetails.value.projectTransModelList.filter(item => item.index == rowIndex)}
    });
    return;

  }

}
