import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import * as _ from 'lodash';
import { CompanyDocumentService } from '../../company-document.service';
import { formatDate } from '@angular/common';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-company-document-form',
  templateUrl: './company-document-form.component.html',
  styleUrls: ['./company-document-form.component.scss']
})
export class CompanyDocumentFormComponent implements OnInit {
  public TitlePage: string;
  file: File;
  RequstId: any;
  hasPerm: boolean;
  titlePage: string;
  showLoader = false
  companyDocumentAddForm: FormGroup;
  DocTypeList: any;
  selectedDocType: number;
  companyDocument = "assets/images/defualt-upload.png";
  cardImageBase64: string;
  issueDate: any;
  expiryDate: any;

  
  public issuDate: any = (new Date()).toISOString().substring(0, 10);
  public expiDate: any = (new Date()).toISOString().substring(0, 10);
  image:any;
  usersList: any;
  constructor(
    private translateService: TranslateService,
    private title: Title,
    private alert: sweetalert,
    public router: Router,
    private formbulider: FormBuilder,
    private companyDocumentService: CompanyDocumentService,
    public routePartsService: RoutePartsService,
  ) { }

  ngOnInit(): void {
    debugger
    this.RequstId = this.routePartsService.GuidToEdit;
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['CompanyDocument/CompanyDocumentList']);
    }
    this.SetTitlePage();
    this.InitiailCompanyDocumentForm();
    this.GetInitialCompnayDocumentForm();
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CompanyDocumentForm');
    this.title.setTitle(this.TitlePage);
  }
  onUploadIamge(event) {
    if (event) {
      this.file = event[0]
      var reader = new FileReader();
      reader.readAsDataURL(event[0]);
      reader.onload = (event: any) => {
        this.companyDocument = event.target.result;
        const imgBase64Path = event.target.result;
        this.cardImageBase64 = imgBase64Path;
      }
    }
  }
  ClearImagePath(image): void {
    image.value = "";
    this.image = "";
    this.companyDocument = "assets/images/defualt-upload.png";
  }
  InitiailCompanyDocumentForm() {
    this.companyDocumentAddForm = this.formbulider.group({
      id: [0, [Validators.required]],
      CompanyId: [0],
      docTypeId: [0, [Validators.required, Validators.min(1)]],
      docNameA: ["", [Validators.required]],
      docNameE: ["", [Validators.required]],
      docNo: ["", [Validators.required]],
      issueDate: [new Date],
      expiryDate: [new Date],
      issuDate:[this.issueDate],
      expiDate:[this.expiryDate],
      issuePlace: [""],
      note: [""],
      expDateReminder: [0],
      expDateReminderUsers: [""],
    });
  }
  GetInitialCompnayDocumentForm() {
    
    this.companyDocumentService.GetInitialCompnayDocumentForm(this.RequstId).subscribe(result => {
      debugger
      this.usersList = result.usersList
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['CompanyDocument/CompanyDocumentList']);
          return;
        }

      this.DocTypeList = result.docTypeList

      debugger
      if (this.RequstId == 0){
        result.issueDate = formatDate( this.issuDate , "yyyy-MM-dd" ,"en-US") 
        result.expiryDate= formatDate( this.expiDate , "yyyy-MM-dd" ,"en-US") 
      }
      else
      {
        result.issueDate = formatDate( result.issueDate , "yyyy-MM-dd" ,"en-US")
        result.expiryDate = formatDate( result.expiryDate , "yyyy-MM-dd" ,"en-US")
      }
    
      this.companyDocumentAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.selectedDocType = Number(result.docTypeID);
        this.companyDocumentAddForm.get("expDateReminderUsers").setValue(result.selectedReminderUsers);
      });
      if (result.docImage != null && result.docImage != "")
      {
        this.companyDocument = environment.apiURL_Main + result.docImage;
        this.image = result.docImage;
      }         
      else
      {
        this.companyDocument = "assets/images/defualt-upload.png";
      }
      
    })
  }
  OnSaveForms() {
    debugger
    const formData = new FormData();

    if(this.companyDocumentAddForm.value.expDateReminder == null)
    {
       this.companyDocumentAddForm.value.expDateReminder = 0;
    }

    formData.append('id', this.RequstId)
    formData.append("companyId", "0")
    formData.append("docTypeID", this.companyDocumentAddForm.value.docTypeId)
    formData.append("docNameA", this.companyDocumentAddForm.value.docNameA)
    formData.append("docNameE", this.companyDocumentAddForm.value.docNameE)
    formData.append("docNo", this.companyDocumentAddForm.value.docNo)
    formData.append("issueDate", this.companyDocumentAddForm.value.issueDate)
    formData.append("expiryDate", this.companyDocumentAddForm.value.expiryDate)
    formData.append("issuePlace", this.companyDocumentAddForm.value.issuePlace)
    formData.append("note", this.companyDocumentAddForm.value.note)
    formData.append("ExpDateReminder", this.companyDocumentAddForm.value.expDateReminder)
    formData.append("ExpDateReminderUsers", this.companyDocumentAddForm.value.expDateReminderUsers)
    formData.append("file", this.file)
    if(this.image != "" && this.image != undefined && this.image != null)
      {
        formData.append("docImage", this.image )
      }
    if (this.file == undefined) 
    {
      formData.append("file", null);
    }
    else 
    {
      formData.append("file", this.file);
      formData.append("docImage", this.file.type);
    }
    this.companyDocumentService.CompanyDocumentPost(formData).subscribe(res => {
      this.alert.SaveSuccess()
      this.router.navigate(['CompanyDocument/CompanyDocumentList']);
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }
}
