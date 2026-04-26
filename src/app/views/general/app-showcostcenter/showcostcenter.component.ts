import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-showcostcenter',
  templateUrl: './showcostcenter.component.html',
  styleUrls: ['./showcostcenter.component.scss']
})
export class ShowcostcenterComponent implements OnInit {
  showCostCenterForm: FormGroup;
  RequstId: any; 
  public TitlePage: string;
  costcenterList: any[];
  CostcenterTransList: any[] = [];
  CostCenterTranModelList: any[] = [];
  disableAll:boolean = true;
  


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private appCommonserviceService : AppCommonserviceService,
  ) { }


  ngOnInit(): void 
  {
    debugger
    this.RequstId = this.routePartsService.GuidToEdit;

    this.SetTitlePage();
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['EntryVouchers/EntryVouchersList']);
    }
    this.InitiailCostcentertransForm();
  }



  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ShowCostCenter');
    this.title.setTitle(this.TitlePage);
  }

  InitiailCostcentertransForm() {    
    this.showCostCenterForm = this.formbulider.group({
      id: [0],
      voucherDTId: [0],
      costCenterId: [0],
      costCenterName : [""],
      debit: [0],
      credit: [0],
    });
    debugger
    this.costcenterList = this.data.costcenterList;
    debugger
    if(this.data.transList.length > 0){
      this.CostcenterTransList = this.data.transList;
    }
    else{
      this.costcenterList.forEach(element=> {
        this.CostcenterTransList.push({
          id: this.data.rowIndex,
          voucherDTId: 0,
          costCenterId : element.id,
          costCenterName: element.text,
          amount:0,
          debit: 0,
          credit: 0,
          isDebit:Number(this.data.debit)>0?true:false,
          index: this.data.rowIndex
        });
      })
    }    
  }


  calculateSum(){
      return this.CostcenterTransList.reduce((sum, item) => sum + parseFloat(item.amount), 0); 
  }
}
