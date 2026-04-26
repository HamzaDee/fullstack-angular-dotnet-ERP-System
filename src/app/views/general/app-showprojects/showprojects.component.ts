import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-showprojects',
  templateUrl: './showprojects.component.html',
  styleUrls: ['./showprojects.component.scss']
})
export class ShowprojectsComponent implements OnInit {
  showProjectsForm: FormGroup;
  RequstId: any; 
  public TitlePage: string;
  ProjectsList: any[];
  ProjectsTransList: any[] = [];
  ProjectsTranModelList: any[] = [];
  disableAll:boolean=true;

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


  ngOnInit(): void {
    this.RequstId = this.routePartsService.GuidToEdit;

    this.SetTitlePage();
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['EntryVouchers/EntryVouchersList']);
    }
    this.InitiailProjectstransForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ShowProjects');
    this.title.setTitle(this.TitlePage);
  }

  InitiailProjectstransForm() {    
    this.showProjectsForm = this.formbulider.group({
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

  calculateSum(){
    return this.ProjectsTransList.reduce((sum, item) => sum + parseFloat(item.amount), 0); 
}
}
