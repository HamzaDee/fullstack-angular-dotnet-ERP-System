import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute,  Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { ProjectCustomsService } from '../projectcustoms.service';

@Component({
  selector: 'app-projcustomsform',
  templateUrl: './projcustomsform.component.html',
  styleUrl: './projcustomsform.component.scss'
})
export class ProjcustomsformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;  
  ProjectPlansForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string; 
  voucherId: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll:boolean;   
  disableSave:boolean;
  lang:string ;
  NewDate:any;
  showsave:boolean;
  customInvoicesList: any[] = [];
  projectsList:any;
  storesList:any;
  authoritiesList:any;
  transportList:any;
  countriesList:any;
  clearenceTypesList:any;
  dollarRate:any;
  clearanceCompaniesList:any;
  customscenterList:any;
  voucherDataList : any ;
  showPaid:any ;
  paymentReasonList :any;
  beneficiaryClassificationList : any ;

  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private Service: ProjectCustomsService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.voucherId = 0;
    }
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['ProjectCustoms/ProjectCustomsList']);
    }
    this.InitiailProjectCustomsForm();
    this.GetInitailProjectCustoms();
    setTimeout(() => {
      if (this.opType == "Show") 
        {
          this.disableAll = true;         
        }
      else 
        {
          this.disableAll = false;
        }
    });
debugger
    const paidCtrl = this.ProjectPlansForm.get('paid');
debugger

    this.showPaid = paidCtrl?.value === true;
debugger

    paidCtrl?.valueChanges.subscribe((v: any) => {
      this.showPaid = (v === true);
        });
    }

  SetTitlePage() {
      this.TitlePage = this.translateService.instant('ProjectCustomsForm');
      this.title.setTitle(this.TitlePage);
  }

  InitiailProjectCustomsForm() {
    this.ProjectPlansForm = this.formbulider.group({
      id: [0],
      companyId: [0],      
      projectId :[0],
      authorityId:[""],
      associationId:[""],
      storeId:[0],
      importDate:["",[Validators.required]],
      documentNo:[""],
      contents:[""],
      valueJOD:[0,[Validators.required, Validators.min(1)]],
      valueUSD:[0,[Validators.required]],
      transportId :[0,[Validators.required, Validators.min(1)]],
      qty:[0],
      carQty:[0],
      clearanceComp:["",[Validators.required]],
      customsCenter:[""],  
      policyNo:[""],  
      importedCountryId :[0,[Validators.required, Validators.min(1)]],      
      clearanceTypeId:[0],
      customsDeclarationNo:[""],
      customsDeclarationDate:[""],
      arrivalDate:["",[Validators.required]],
      weight:[""],
      payment:[""],
      paymentNote :[""],
      recommendationNo:[""],
      customsInvoicesModels:[null],
      generalAttachModelList: [null],
      paid: [false],
      note:[""],
      paymentDate:[""],
      notPaymentReasonId:[""],
      beneficiaryClassificationId:[""],
      
    });
  }

  GetInitailProjectCustoms() {
    this.Service.GetInitailProjectCustoms(this.voucherId,this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ProjectCustoms/ProjectCustomsList']);
        return;
      }
      debugger
      result.importDate = formatDate(result.importDate, "yyyy-MM-dd", "en-US");
      result.customsDeclarationDate = formatDate(result.customsDeclarationDate, "yyyy-MM-dd", "en-US");
      result.arrivalDate = formatDate(result.arrivalDate, "yyyy-MM-dd", "en-US");
      result.paymentDate = result.paymentDate?formatDate(result.paymentDate, "yyyy-MM-dd'T'HH:mm", "en-US"): "";

      this.projectsList = result.projectsList;
      this.storesList = result.storesList;
      this.authoritiesList = result.authoritiesList;  
      this.transportList = result.transportList;
      this.countriesList = result.countriesList;
      this.clearenceTypesList = result.clearenceTypesList;
      this.dollarRate = result.dollarRate;
      this.decimalPlaces = result.decimalPlaces;
      debugger
      this.customInvoicesList = result.customsInvoicesModels;
      this.clearanceCompaniesList = result.clearanceCompaniesList;
      this.customscenterList = result.customscenterList;
      this.paymentReasonList = result.paymentReasonList;
      this.beneficiaryClassificationList = result.beneficiaryClassificationList;
      this.voucherDataList = result.customsVoucherDataModel;
      if(result.generalAttachModelList != null && result.generalAttachModelList != undefined)
        {
          if(result.generalAttachModelList.length > 0)
            {              
              this.childAttachment.data = result.generalAttachModelList;
              this.childAttachment.ngOnInit();
              this.ProjectPlansForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
            }
        }
      if(this.customInvoicesList != null && this.customInvoicesList != undefined)
        {
          if(this.customInvoicesList.length > 0)
            {
              this.customInvoicesList.forEach(element => {
                element.billDate = formatDate(element.billDate, "yyyy-MM-dd", "en-US")
              });
              this.ProjectPlansForm.get("customsInvoicesModels").setValue(this.customInvoicesList);
            }
        }          
      this.ProjectPlansForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          debugger
          this.ProjectPlansForm.get("projectId").setValue(result.projectId);
          this.SelectprojectsList(result.projectId)
          this.ProjectPlansForm.get("authorityId").setValue(result.authorityId);
          // this.ProjectPlansForm.get("associationId").setValue(result.associationId);
          this.ProjectPlansForm.get("storeId").setValue(result.storeId);
          this.ProjectPlansForm.get("importDate").setValue(result.importDate);
          this.ProjectPlansForm.get("documentNo").setValue(result.documentNo);
          this.ProjectPlansForm.get("contents").setValue(result.contents);
          this.ProjectPlansForm.get("valueJOD").setValue(result.valueJOD);
          this.ProjectPlansForm.get("valueUSD").setValue(result.valueUSD);
          this.ProjectPlansForm.get("transportId").setValue(result.transportId);
          this.ProjectPlansForm.get("qty").setValue(result.qty);
          this.ProjectPlansForm.get("carQty").setValue(result.carQty);
          this.ProjectPlansForm.get("clearanceComp").setValue(result.clearanceComp);
          this.ProjectPlansForm.get("customsCenter").setValue(result.customsCenter);
          this.ProjectPlansForm.get("notPaymentReasonId").setValue(result.notPaymentReasonId);
          // this.ProjectPlansForm.get("beneficiaryClassificationId").setValue(result.beneficiaryClassificationId);
          this.ProjectPlansForm.get("policyNo").setValue(result.policyNo);
          this.ProjectPlansForm.get("importedCountryId").setValue(result.importedCountryId);          
          this.ProjectPlansForm.get("clearanceTypeId").setValue(result.clearanceTypeId);
          this.ProjectPlansForm.get("customsDeclarationNo").setValue(result.customsDeclarationNo);  
          this.ProjectPlansForm.get("customsDeclarationDate").setValue(result.customsDeclarationDate);
          this.ProjectPlansForm.get("arrivalDate").setValue(result.arrivalDate);     
          this.ProjectPlansForm.get("weight").setValue(result.weight);
          this.ProjectPlansForm.get("payment").setValue(result.payment);    
          this.ProjectPlansForm.get("paymentNote").setValue(result.paymentNote);    
          this.ProjectPlansForm.get("recommendationNo").setValue(result.recommendationNo);  
          this.ProjectPlansForm.get("note").setValue(result.note);  
          this.ProjectPlansForm.get("paid").setValue(result.paid);  
          this.ProjectPlansForm.get("paymentDate").setValue(result.paymentDate);  
          this.ConvertIdsToNumber(result);                     
        }
        else {
        this.ProjectPlansForm.get("projectId").setValue(0);
        this.ProjectPlansForm.get("authorityId").setValue("");
        // this.ProjectPlansForm.get("associationId").setValue("");
        this.ProjectPlansForm.get("storeId").setValue(0);
        this.ProjectPlansForm.get("importDate").setValue(result.importDate);
        this.ProjectPlansForm.get("documentNo").setValue("");
        this.ProjectPlansForm.get("contents").setValue("");
        this.ProjectPlansForm.get("valueJOD").setValue(0);
        this.ProjectPlansForm.get("valueUSD").setValue(0);
        this.ProjectPlansForm.get("transportId").setValue(0);
        this.ProjectPlansForm.get("qty").setValue(0);
        this.ProjectPlansForm.get("carQty").setValue(0);
        this.ProjectPlansForm.get("clearanceComp").setValue("");
        this.ProjectPlansForm.get("customsCenter").setValue(0);
        this.ProjectPlansForm.get("notPaymentReasonId").setValue(0);
        this.ProjectPlansForm.get("beneficiaryClassificationId").setValue(0);
        this.ProjectPlansForm.get("policyNo").setValue("");
        this.ProjectPlansForm.get("importedCountryId").setValue(0);          
        this.ProjectPlansForm.get("clearanceTypeId").setValue(0);
        this.ProjectPlansForm.get("customsDeclarationNo").setValue("");  
        this.ProjectPlansForm.get("customsDeclarationDate").setValue(result.customsDeclarationDate);
        this.ProjectPlansForm.get("arrivalDate").setValue(result.arrivalDate);     
        this.ProjectPlansForm.get("weight").setValue("");
        this.ProjectPlansForm.get("payment").setValue("");    
        this.ProjectPlansForm.get("paymentNote").setValue("");    
        this.ProjectPlansForm.get("recommendationNo").setValue("");    
        this.ProjectPlansForm.get("note").setValue("");    
        this.ProjectPlansForm.get("paid").setValue(false);   
        this.ProjectPlansForm.get("paymentDate").setValue(result.paymentDate); 
        }
           debugger
    this.showPaid = this.ProjectPlansForm.get("paid").value

      });
    })
   
  }

  OnSaveForms() {
    debugger
    if (this.CheckValidationOnSave() == false) {
      return;
    }
    debugger
    this.ProjectPlansForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ProjectPlansForm.value.userId = this.jwtAuth.getUserId();
    this.ProjectPlansForm.get("customsInvoicesModels").setValue(this.customInvoicesList);    
    this.ProjectPlansForm.get("valueUSD").setValue(Number(this.ProjectPlansForm.value.valueUSD));
    this.ProjectPlansForm.get("generalAttachModelList").setValue(this.childAttachment.getVoucherAttachData());
    this.ConvertIdsToString();
    const pd = this.ProjectPlansForm.get('paymentDate')?.value;
    this.ProjectPlansForm.get('paymentDate')?.setValue(pd ? new Date(pd).toISOString() : null);
    this.Service.SaveProjectsCustoms(this.ProjectPlansForm.value)
      .subscribe((result) => {
        debugger
        
        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          if(this.opType == 'Edit')
            {
              this.router.navigate(['ProjectCustoms/ProjectCustomsList']);
            }
          this.clearFormdata();
          
            this.voucherId = 0;
            this.opType = 'Add'; 
            this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    this.NewDate = new Date;  
    this.customInvoicesList ??= [];  
    this.customInvoicesList.push(
      {
        id: 0,
        customsId: 0,
        billNo: 0,
        billDate: formatDate(this.NewDate, "yyyy-MM-dd", "en-US"),
        amount: 0,
        index: ""
      });
      this.ProjectPlansForm.get("customsInvoicesModels").setValue(this.customInvoicesList);
  }
  
  deleteRow(rowIndex: number) {  
    this.customInvoicesList.splice(rowIndex, 1);
    this.ProjectPlansForm.get("customsInvoicesModels").setValue(this.customInvoicesList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  DeleteVoucher(id: any) {
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
        this.Service.DeleteProjectsCustoms(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ProjectCustoms/ProjectCustomsList']);
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        // No action needed if the user cancels
      }
    })      
  } 
  
  ConvertToUsd(amount:any)
  {
    debugger
    let amt = (amount / this.dollarRate).toFixed(this.decimalPlaces);   
    this.ProjectPlansForm.get("valueUSD").setValue(amt);
  }

  CheckValidationOnSave() 
  {
    if(this.customInvoicesList.length > 0)
      {
        for (let i = 0; i < this.customInvoicesList.length; i++) {
        const element = this.customInvoicesList[i];
        if(element.billNo == 0 || element.billDate == "" || element.amount == 0)
          {
            this.alert.ShowAlert("PleaseInserRequierdFieldsInTable", 'error');
            return false;
          }
      }
      }      
  }

  clearFormdata()
  {   
    this.NewDate = new Date;    
    this.ProjectPlansForm.get("id").setValue(0);       
    this.ProjectPlansForm.get("projectId").setValue(0);
    this.ProjectPlansForm.get("authorityId").setValue("");
    // this.ProjectPlansForm.get("associationId").setValue("");
    this.ProjectPlansForm.get("storeId").setValue(0);
    this.ProjectPlansForm.get("importDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ProjectPlansForm.get("documentNo").setValue("");
    this.ProjectPlansForm.get("contents").setValue("");
    this.ProjectPlansForm.get("valueJOD").setValue(0);
    this.ProjectPlansForm.get("valueUSD").setValue(0);
    this.ProjectPlansForm.get("transportId").setValue(0);
    this.ProjectPlansForm.get("qty").setValue(0);
    this.ProjectPlansForm.get("carQty").setValue(0);
    this.ProjectPlansForm.get("clearanceComp").setValue("");
    this.ProjectPlansForm.get("customsCenter").setValue(0);
    this.ProjectPlansForm.get("notPaymentReasonId").setValue(0);
    this.ProjectPlansForm.get("beneficiaryClassificationId").setValue(0);
    this.ProjectPlansForm.get("policyNo").setValue("");
    this.ProjectPlansForm.get("importedCountryId").setValue(0);          
    this.ProjectPlansForm.get("clearanceTypeId").setValue(0);
    this.ProjectPlansForm.get("customsDeclarationNo").setValue("");  
    this.ProjectPlansForm.get("customsDeclarationDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ProjectPlansForm.get("arrivalDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));     
    this.ProjectPlansForm.get("paymentDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd'T'HH:mm", "en-US"));
    this.ProjectPlansForm.get("weight").setValue("");
    this.ProjectPlansForm.get("payment").setValue("");    
    this.ProjectPlansForm.get("paymentNote").setValue("");   
    this.ProjectPlansForm.get("recommendationNo").setValue("");   
    this.ProjectPlansForm.get("note").setValue("");   
    this.customInvoicesList = [];
    this.ProjectPlansForm.get("customsInvoicesModels").setValue(this.customInvoicesList); 
    this.ProjectPlansForm.get("generalAttachModelList").setValue([]);     
    this.childAttachment.data =[];  
    this.voucherId = 0;
    this.opType = 'Add';
    this.GetInitailProjectCustoms();      
  }

  ConvertIdsToString()
  {    
    debugger
    let C1 = this.ProjectPlansForm.value.authorityId;
    if (Array.isArray(C1)) {
      let validC1 = C1
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C1String = validC1.join(',');
      this.ProjectPlansForm.get("authorityId").setValue(C1String);
      console.log('Filtered paymentMethod:', C1String);
    } else {
      console.error('authorityId is not an array');
    }

    // let C2 = this.ProjectPlansForm.value.associationId;
    // if (Array.isArray(C2)) {
    //   let validC2 = C2
    //     .filter((method: any) => method !== null && method !== undefined)
    //     .map((method: any) => method.toString().trim());
    //   let C2String = validC2.join(',');
    //   this.ProjectPlansForm.get("associationId").setValue(C2String);
    //   console.log('Filtered paymentMethod:', C2String);
    // } else {
    //   console.error('associationId is not an array');
    // }    
  }

  ConvertIdsToNumber(data)
  {
    debugger
    if(data.authorityId != null && data.authorityId != undefined && data.authorityId != "" && data.authorityId != "0")
      {
        let A1 = data.authorityId.split(',').map(Number)
        this.ProjectPlansForm.get("authorityId").setValue(A1);
      }
      else
      {
        this.ProjectPlansForm.get("authorityId").setValue("");
      }
    // if(data.associationId != null && data.associationId != undefined && data.associationId != "" && data.associationId != "0")
    //   {
    //     let A2 = data.associationId.split(',').map(Number)
    //     this.ProjectPlansForm.get("associationId").setValue(A2);
    //   }
    //   else
    //   {
    //     this.ProjectPlansForm.get("associationId").setValue("");
    //   }  
  }

  calculateSum() {
    return this.formatCurrency(
      this.customInvoicesList.reduce((sum, item) => {
        const Tot = parseFloat(item.amount);

        // Check for invalid qty or price and treat them as 0 if invalid
        const ValidTot = isNaN(Tot) ? 0 : Tot;

        return sum + (ValidTot);
      }, 0)
    );
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  loadLazyOptions(event: any) {
      const { first, last } = event;

      // Don't replace the full list; copy and fill only the needed range
      this.authoritiesList ??= [];

      // Make sure the array is large enough
      while (this.authoritiesList.length < last) {
          this.authoritiesList.push(null);
      }

      for (let i = first; i < last; i++) {
          this.authoritiesList[i] = this.authoritiesList[i];
      }

      this.loading = false;
  }

  projectloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.projectsList) {
      this.projectsList = [];
    }

    // Make sure the array is large enough
    while (this.projectsList.length < last) {
      this.projectsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.projectsList[i] = this.projectsList[i];
    }

    this.loading = false;
  }


  SelectAlluthority(event: any) {
  let selectedValues = event.value || [];
  const hasSelectAll = selectedValues.includes(0);
  if (hasSelectAll) {
    const allIds = this.authoritiesList
      .filter(el => el.id !== 0)
      .map(el => el.id);

    if (selectedValues.length - 1 !== allIds.length) {
      this.ProjectPlansForm.get("authorityId")?.setValue(allIds);
    } else {
      this.ProjectPlansForm.get("authorityId")?.setValue([]);
    }
  } else {
    const cleaned = selectedValues.filter(id => id !== 0);
    this.ProjectPlansForm.get("authorityId")?.setValue(cleaned);
  }
  }

  SelectAllAssociation(event: any) {
  let selectedValues = event.value || [];
  const hasSelectAll = selectedValues.includes(0);
  if (hasSelectAll) {
    const allIds = this.authoritiesList
      .filter(el => el.id !== 0)
      .map(el => el.id);

    // if (selectedValues.length - 1 !== allIds.length) {
    //   this.ProjectPlansForm.get("associationId")?.setValue(allIds);
    // } else {
    //   this.ProjectPlansForm.get("associationId")?.setValue([]);
    // }
  } else {
    // const cleaned = selectedValues.filter(id => id !== 0);
    // this.ProjectPlansForm.get("associationId")?.setValue(cleaned);
  }
  }

 OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    const url = `/EntryVoucherH/EntryvouhcerhForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
      window.open(url, '_blank');
           
}

SelectprojectsList(e){
  debugger
  const change = this.projectsList.find(x=>x.id == e)
  this.ProjectPlansForm.get("beneficiaryClassificationId").setValue(change.data2);
}
SelectprojectsList1(e){
  debugger
  const change = this.projectsList.find(x=>x.id == e.value)
   var pm = change.data1.split(',').map(Number)
  this.ProjectPlansForm.get("authorityId").setValue(pm);
  this.ProjectPlansForm.get("beneficiaryClassificationId").setValue(change.data2);
  
}

SelectclearanceTypeId(e){

  this.ProjectPlansForm.get("recommendationNo").setValue("");
  
}

}