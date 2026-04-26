import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-projectstrans',
  templateUrl: './projectstrans.component.html',
  styleUrls: ['./projectstrans.component.scss']
})
export class ProjectstransComponent implements OnInit {
  ProjectsTransForm: FormGroup;
  RequstId: any; 
  public TitlePage: string;
  ProjectsList: any[];
  ProjectsTransList: any[] = [];
  ProjectsTranModelList: any[] = [];
  SumAmount: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private appCommonserviceService : AppCommonserviceService,
    private alert: sweetalert,
  ) { }

  ngOnInit(): void {
    this.RequstId = this.routePartsService.GuidToEdit;
    this.SumAmount = this.data.debit + this.data.credit;

    this.SetTitlePage();
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['EntryVouchers/EntryVouchersList']);
    }
    this.InitiailProjectstransForm();
    //this.GetInitailEntryVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('addCompany');
    this.title.setTitle(this.TitlePage);
  }

  InitiailProjectstransForm() {    
    this.ProjectsTransForm = this.formbulider.group({
      id: [0],
      voucherDTId: [0],
      projectId: [0],
      projectName : [""],
      debit: [0],
      credit: [0],
    });
    this.ProjectsList = this.data.projectsList;
    debugger
    if(this.data.transList.length > 0){
      this.ProjectsTransList = this.data.transList;
    }
    else{
      this.ProjectsList.forEach(element=> {
        this.ProjectsTransList.push({
          id: this.data.rowIndex,
          voucherDTId: 0,
          projectId : element.id,
          projectName: element.text,
          amount:0,
          debit: 0,
          credit: 0,      
          isDebit:Number(this.data.debit)>0?true:false,    
          index: this.data.rowIndex
        });
      })
    }    
  }

  OnSaveForms() {
    // if(this.ProjectsTransList.reduce((sum, item) => sum + parseFloat(item.amt), 0) > (this.data.debit + this.data.credit)){
    //   alert("ddd");
    // }
    debugger
    this.ProjectsTranModelList = this.ProjectsTranModelList.filter(item => item.id !== this.data.rowIndex);
    this.ProjectsTransList.forEach(element=> {
      element.debit= this.data.debit > 0 ? element.amount : 0;
      element.credit= this.data.credit > 0 ? element.amount : 0;
    })
    this.dialogRef.close(this.ProjectsTransList);
  }

  calculateSum(){
      return this.ProjectsTransList.reduce((sum, item) => sum + parseFloat(item.amount), 0); 
  }

  DistributeAmtToAllProjects(){
    debugger
    this.ProjectsTransList.length = 0;
    var rowCount = this.ProjectsList.length;
    var amount = this.data.debit + this.data.credit;
    var amt =  amount / rowCount;
    this.ProjectsList.forEach(element=> {
      this.ProjectsTransList.push({
        id: this.data.rowIndex,
        voucherDTId: 0,
        projectId : element.id,
        projectName: element.text,
        amount: amt.toFixed(3),
        debit: this.data.debit > 0 ? amt : 0,
        credit: this.data.credit > 0 ? amt : 0,
        isDebit:Number(this.data.debit)>0?true:false,
        index: this.data.rowIndex
      });
    })
    var totamt = this.ProjectsTransList.reduce((sum, item) => sum + parseFloat(item.amount), 0)
    var diffamt = totamt - amount;
    this.ProjectsTransList[rowCount-1].amount = (amt - diffamt).toFixed(3);
  }

  ReEnterValues(){
    this.ProjectsTransList.length = 0;
    this.ProjectsList.forEach(element=> {
      this.ProjectsTransList.push({
        id: this.data.rowIndex,
        voucherDTId: 0,
        projectId : element.id,
        projectName: element.text,
        amount: 0,
        debit: 0,
        credit: 0,
        index: this.data.rowIndex
      });
    })
  }

  CheckBudget(row)
{
  debugger
  if(row.amount > 0)
    {
      if(Number(row.amount)> Number(this.SumAmount)){
        row.amount = 0;
        this.alert.ShowAlert("msTheProjectValueIsHigherThanTheBondValue",'error');
        return;
      }
    }
}

}
