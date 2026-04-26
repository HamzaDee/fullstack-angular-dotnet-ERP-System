import { Component, OnInit, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { ProjectDefinitionService } from '../projDef.service';
import { tr } from 'date-fns/locale';


export interface ProjectMediaFileModel {
  id: number;
  projectId: number;
  docPath: string;
  description: string;
}

@Component({
  selector: 'app-projdefform',
  templateUrl: './projdefform.component.html',
  styleUrl: './projdefform.component.scss'
})
export class ProjdefformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  ProjectsAddForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  voucherId: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll: boolean;
  disableSave: boolean;
  lang: string;
  NewDate: any;
  showsave: boolean;
  geoScopeList: any;
  governorateList: any;
  filteredDistrictList: any[] = [];
  districtList: any;
  countriesList: any;
  nationalitiesList: any;
  citiesList: any;
  projectImpTypeList: any;
  impTypeList: any;
  financialMethodList: any;
  associationsOrganizationsList: any;
  associationsOrganizationsList2: any;
  associationsOrganizationsList3: any;
  AuthorityClassificationList: any;
  AuthorityAttributeList: any;
  fullAssociationsList: any;
  itemsSourceList: any;
  projectOfficerList: any;
  expensesTypesList: any;
  householdTypeList: any;
  medicalNeedsList: any;
  authoritiesTargetedList: any;
  agreementsList: any;
  projectStatusList: any;
  pendingIssuesList: any;
  houseHoldAdjectiveList: any;
  programTypesList: any;
  donateToList: any;
  cashDonateTypeList: any;
  filteredCashDonateTypes: Array<any> = [];
  filtereddonationTypeList: Array<any> = [];
  filtereddonationIdList: Array<any> = [];
  filteredCityList: Array<any> = [];
  mediaRequestedList: any;
  filteredAuthoritiesList: any;
  mediaTimingList: any;
  currenciesList: any;
  houseHoldTypeList2: any;
  donationTypeList: any;
  donationTypesList: any[] = [];
  expensesTypesModelList: any[] = [];
  nationalityModelsList: any[] = [];
  projectCashTypesList: any = [];
  empowermentModelsList: any = [];
  geoInsideJordan: number = 0;;
  geoOutsideJordan: number = 0;;
  dollarRate: number = 0;
  isSample: number = 0;
  isCash: number = 0;
  isSustDevelop: number = 0;
  isOtherMaterials: number = 0;
  isAgreement: number = 0;
  isRealted: number = 0;
  filterImplementationList: any;
  totalDonations: any;
  totalDollarDonations: any;
  materialAmtDollar: any;
  dollarCash: any;
  dollarCheques: any;
  dollarCreditCards: any;
  TotalProjectAmountDollar: any;
  CashDinarTotal: any;
  CashDollarTotal: any;
  empJodTotal: any;
  empDollarTotal: any;
  loadLazyTimeout = null;
  documentsList: any;
  requiredMediaMaterialsList: any;
  targetingCriteriaList: any;
  authoritiesList: any;
  typeOfBenefitList: any;
  AuthorityCountry: string = "";
  pageType: any;
  helpTypeList: any;
  beneficiaryClasslist: any;
  mediaFilesList: ProjectMediaFileModel[] = [];
  expenseAmountDollar: any;
  ResidualValueDollar: any;
  estimatedAmount = 0;
  usersList:any;
  filteredMediaReqList:any;
  dealAmountInDollars: string;
  hidePublicDonation: boolean;
  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private readonly alert: sweetalert,
      private readonly translateService: TranslateService,
      public router: Router,
      private readonly formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private readonly http: HttpClient,
      private readonly appCommonserviceService: AppCommonserviceService,
      private readonly dialog: MatDialog,
      private readonly route: ActivatedRoute,
      private readonly Service: ProjectDefinitionService,
      private readonly cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;


    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.pageType = queryParams.get('Guid4ToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
      this.pageType = this.routePartsService.Guid4ToEdit;
    }
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.voucherId = 0;
    }
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      if (this.pageType == 1 || this.pageType == undefined) {
        this.router.navigate(['ProjectDefinition/ProjectDefinitionList']);
      }
      else {
        this.router.navigate(['Empowerment/ProjectDefinitionList']);
      }

    }
    this.InitiailProjectDefinitionForm();
    this.GetProjectDefinition();
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProjectDefinitionForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailProjectDefinitionForm() {
    this.ProjectsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      isPublicDonation: [false],
      projectNo: [0, [Validators.required]],
      projectDate: ["", [Validators.required]],
      projectBookNo: ["", [Validators.required]],
      inJordan: [false, [Validators.required]],
      governorateId: [""],
      districtId: [""],
      intAddress: [""],
      outJordan: [false, [Validators.required]],
      countryId: [0],
      cityId: [0],
      extAddress: [""],
      projShortName: ["", [Validators.required]],
      projImplTypeId: [0, [Validators.required, Validators.min(1)]],
      bookNo: [""],
      bookDate: [""],
      implTypeId: [""],
      financingMethodId: [0],
      organisationsIds: [""],
      localOrganisationsIds: [""],
      materialsSourceId: ["", [Validators.required, Validators.min(1)]],
      liaisonOfficerId: [0, [Validators.required, Validators.min(1)]],
      sample: [false],
      cash: [false],
      sustDevelop: [false],
      otherMaterials: [false],
      materialType: [""],
      materialQty: [0],
      materialUnit: [""],
      materialValue: [0],
      totalProjectAmount: [0, [Validators.required]],
      assocTargetingId: [""],
      agreement: [false],
      agreementNo: [0],
      projStartDate: [""],
      projEndDate: [""],
      actualStartDate: [""],
      actualEndDate: [""],
      projectStatusId: [0],
      projectEvaluation: [""],
      suspensionReasonsId: [0],
      requstedMediaId: [""],
      mediaTimingId: [""],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required]],
      householdTypeId: [""],
      houseHoldAdjectiveId: [0],
      isRealtedToDoc: [0],
      docRealted: [0],
      authorityId: [0],
      requiredMediaMaterialsId: [""],
      specialHealthNeeds: [""],
      beneficiaryClass: [0],
      donationTypesModels: [null],
      projectCashTypesModels: [null],
      projectExpensesTypesModels: [null],
      targetNationalitiesModels: [null],
      empowermentModels: [null],
      generalAttachModelList: [null],
      projectMediaFilesModels: [null],  
      expenseAmount: [0],
      ResidualValue: [0],
      estimatedAmount: [0],
      generalPublications:[""],
      unOrderNo:[""],
      dinarAmount : [0],
      entityId: [0],
      authorityAttribute: [0],      
    });
    this.setupDateValidation();
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetProjectDefinition() {
    this.Service.GetInitailProjectDefinition(this.voucherId, this.opType).subscribe(result => {
      if (!result.isSuccess && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        if (this.pageType == 1) {
          this.router.navigate(['ProjectDefinition/ProjectDefinitionList']);
        }
        else {
          this.router.navigate(['Empowerment/ProjectDefinitionList']);
        }
        return;
      }
      debugger      
      result.projectDate = formatDate(result.projectDate, "yyyy-MM-dd", "en-US");
      result.projStartDate = formatDate(result.projStartDate, "yyyy-MM-dd", "en-US");
      result.projEndDate = formatDate(result.projEndDate, "yyyy-MM-dd", "en-US");
      result.actualStartDate = formatDate(result.actualStartDate, "yyyy-MM-dd", "en-US");
      result.actualEndDate = formatDate(result.actualEndDate, "yyyy-MM-dd", "en-US");
      result.bookDate = formatDate(result.bookDate, "yyyy-MM-dd", "en-US");
      this.geoScopeList = result.geoScopeList;      
      this.governorateList = result.governorateList.filter(r => r.data1 == "67");
      this.districtList = result.districtList;
      this.countriesList = result.countriesList;
      this.citiesList = result.citiesList;
      this.projectImpTypeList = result.projectImpTypeList;
      this.impTypeList = result.impTypeList;
      this.nationalitiesList = result.nationalitiesList;
      this.filterImplementationList = result.impTypeList;
      this.financialMethodList = result.financialMethodList;
      this.associationsOrganizationsList = result.associationsOrganizationsList;
      this.associationsOrganizationsList2 = result.associationsOrganizationsList;
      this.associationsOrganizationsList3 = result.associationsOrganizationsList;
      this.fullAssociationsList = result.associationsOrganizationsList;
      this.itemsSourceList = result.itemsSourceList;
      this.projectOfficerList = result.projectOfficerList;
      this.expensesTypesList = result.expensesTypesList;
      this.householdTypeList = result.householdTypeList;
      this.medicalNeedsList = result.medicalNeedsList;
      this.authoritiesTargetedList = result.authoritiesTargetedList;
      this.AuthorityClassificationList = result.authorityClassificationList;
      this.AuthorityAttributeList = result.authorityAttributeList;
      debugger
      this.agreementsList = result.agreementsList;
      this.projectStatusList = result.projectStatusList;
      this.pendingIssuesList = result.pendingIssuesList;
      this.mediaRequestedList = result.mediaRequestedList;
      this.filteredMediaReqList = result.mediaRequestedList;
      this.mediaTimingList = result.mediaTimingList;
      this.currenciesList = result.currenciesList;
      this.donationTypeList = result.donationTypeList;
      this.dollarRate = result.currRate;
      this.decimalPlaces = result.decimalPlaces;
      this.donateToList = result.donateToList;
      this.cashDonateTypeList = result.cashDonateTypeList;
      this.programTypesList = result.programTypesList;
      this.houseHoldTypeList2 = result.houseHoldTypeList2;
      this.houseHoldAdjectiveList = result.houseHoldAdjectiveList;
      this.documentsList = result.documentsList;
      this.requiredMediaMaterialsList = result.requiredMediaMaterialsList;
      this.targetingCriteriaList = result.targetingCriteriaList;
      this.authoritiesList = result.authoritiesList;
      this.filteredAuthoritiesList = result.authoritiesList;
      this.typeOfBenefitList = result.typeOfBenefitList;
      this.helpTypeList = result.helpTypeList;
      this.beneficiaryClasslist = result.beneficiaryClasslist;
      this.usersList = result.usersList;
      debugger
       if (result.generalAttachModelList != null && result.generalAttachModelList != undefined) {
        if (result.generalAttachModelList.length > 0) {
          this.childAttachment.data = result.generalAttachModelList;
          this.childAttachment.ngOnInit();
          this.ProjectsAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        }
      }
      if (result.donationTypesModels != null && result.donationTypesModels != undefined) {
        if (result.donationTypesModels.length > 0) {
          this.donationTypesList = result.donationTypesModels;
          this.donationTypesList.forEach(element => {
            this.CalcDinar(element);
            this.CalcDollar(element);
          });
          this.ProjectsAddForm.get("donationTypesModels").setValue(this.donationTypesList);

          let index = 0;
          this.donationTypesList.forEach(element => {
            this.donationTypeList.forEach(item => {
              if (item.id === element.donationId) {
                this.filtereddonationTypeList[index] = this.donationTypeList.filter(c => c.data1 == element.programTypeId.toString());
                index++;
              }
            });
          })

          let index1 = 0;
          this.donationTypesList.forEach(element => {
            this.helpTypeList.forEach(item => {
              debugger
              if (item.id === element.donationId2) {
                this.filtereddonationIdList[index1] = this.helpTypeList.filter(c => c.data1 == element.donationId.toString());
                index1++;
              }
            });
          })

        }
      }
      if (result.projectExpensesTypesModels != null && result.projectExpensesTypesModels != undefined) {
        if (result.projectExpensesTypesModels.length > 0) {
          this.expensesTypesModelList = result.projectExpensesTypesModels;
          for (let i = 0; i < this.expensesTypesModelList.length; i++) {
            let row = this.expensesTypesModelList[i];
            this.CalcExpensesDollar(row, i);            
          }
          this.ProjectsAddForm.get("projectExpensesTypesModels").setValue(this.expensesTypesModelList);
        }
      }
      if (result.targetNationalitiesModels != null && result.targetNationalitiesModels != undefined) {
        if (result.targetNationalitiesModels.length > 0) {
          this.nationalityModelsList = result.targetNationalitiesModels;
          this.ProjectsAddForm.get("targetNationalitiesModels").setValue(this.nationalityModelsList);
        }
      }
      if (result.empowermentModels != null && result.empowermentModels != undefined) {
        if (result.empowermentModels.length > 0) {
          this.empowermentModelsList = result.empowermentModels;
          this.ProjectsAddForm.get("empowermentModels").setValue(this.empowermentModelsList);
          for (let i = 0; i < this.empowermentModelsList.length; i++) {
            let row = this.empowermentModelsList[i];
            this.CalcEmpowermentDollar(row, i);
          }

        }
      }
      if (result.projectCashTypesModels != null && result.projectCashTypesModels != undefined) {
        if (result.projectCashTypesModels.length > 0) {
          this.projectCashTypesList = result.projectCashTypesModels;
          this.ProjectsAddForm.get("projectCashTypesModels").setValue(this.projectCashTypesList);

          let index = 0;
          this.projectCashTypesList.forEach(element => {
            this.cashDonateTypeList.forEach(item => {
              debugger
              if (item.id === element.cashShapeId) {
                this.filteredCashDonateTypes[index] = this.cashDonateTypeList.filter(c => c.data1 == element.cashTypeId.toString());
                index++;
              }
            });
          })
        }
      }
      if (result.projectMediaFilesModels != null && result.projectMediaFilesModels != undefined) {
        if (result.projectMediaFilesModels.length > 0) {
          this.mediaFilesList = result.projectMediaFilesModels;
          this.ProjectsAddForm.get("projectMediaFilesModels").setValue(this.mediaFilesList);
        }
      }
      this.ProjectsAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          debugger
          this.ProjectsAddForm.get("projectNo").setValue(result.projectNo);
          this.ProjectsAddForm.get("projectDate").setValue(result.projectDate);
          this.ProjectsAddForm.get("projectBookNo").setValue(result.projectBookNo);
          this.ProjectsAddForm.get("inJordan").setValue(result.inJordan);
          this.ProjectsAddForm.get("governorateId").setValue(result.governorateId);
          this.filterDistrictsByvalue(result.governorateId);
          this.ProjectsAddForm.get("districtId").setValue(result.districtId);
          this.ProjectsAddForm.get("intAddress").setValue(result.intAddress);
          this.ProjectsAddForm.get("outJordan").setValue(result.outJordan);
          this.ProjectsAddForm.get("countryId").setValue(result.countryId);
          this.ProjectsAddForm.get("cityId").setValue(result.cityId);
          this.ProjectsAddForm.get("extAddress").setValue(result.extAddress);
          this.ProjectsAddForm.get("projShortName").setValue(result.projShortName);
          this.ProjectsAddForm.get("projImplTypeId").setValue(result.projImplTypeId);
          this.ProjectsAddForm.get("bookNo").setValue(result.bookNo);
          this.ProjectsAddForm.get("bookDate").setValue(result.bookDate);
          this.ProjectsAddForm.get("implTypeId").setValue(Number(result.implTypeId));
          // this.ProjectsAddForm.get("financingMethodId").setValue(result.financingMethodId);
          this.ProjectsAddForm.get("organisationsIds").setValue(result.organisationsIds);
          this.ProjectsAddForm.get("localOrganisationsIds").setValue(result.localOrganisationsIds);
          this.ProjectsAddForm.get("materialsSourceId").setValue(result.materialsSourceId);
          this.ProjectsAddForm.get("liaisonOfficerId").setValue(result.liaisonOfficerId);
          this.ProjectsAddForm.get("sample").setValue(result.sample);
          this.ProjectsAddForm.get("sustDevelop").setValue(result.sustDevelop);
          this.ProjectsAddForm.get("otherMaterials").setValue(result.otherMaterials);
          this.ProjectsAddForm.get("materialType").setValue(result.materialType);
          this.ProjectsAddForm.get("materialQty").setValue(result.materialQty);
          this.ProjectsAddForm.get("materialUnit").setValue(result.materialUnit);
          this.ProjectsAddForm.get("materialValue").setValue(result.materialValue);
          this.ProjectsAddForm.get("totalProjectAmount").setValue(result.totalProjectAmount);
          this.ProjectsAddForm.get("assocTargetingId").setValue(result.assocTargetingId);
          this.ProjectsAddForm.get("agreementNo").setValue(result.agreementNo);
          this.ProjectsAddForm.get("isRealtedToDoc").setValue(result.isRealtedToDoc);
          this.ProjectsAddForm.get("docRealted").setValue(result.docRealted);
          this.ProjectsAddForm.get("projStartDate").setValue(result.projStartDate);
          this.ProjectsAddForm.get("projEndDate").setValue(result.projEndDate);
          this.ProjectsAddForm.get("actualStartDate").setValue(result.actualStartDate);
          this.ProjectsAddForm.get("actualEndDate").setValue(result.actualEndDate);
          this.ProjectsAddForm.get("projectStatusId").setValue(result.projectStatusId);
          this.ProjectsAddForm.get("requiredMediaMaterialsId").setValue(result.projectStatusId);
          this.ProjectsAddForm.get("projectEvaluation").setValue(result.projectEvaluation);
          this.ProjectsAddForm.get("suspensionReasonsId").setValue(result.suspensionReasonsId);
          this.ProjectsAddForm.get("requstedMediaId").setValue(result.requstedMediaId);
          this.ProjectsAddForm.get("mediaTimingId").setValue(result.mediaTimingId);
          this.ProjectsAddForm.get("currencyId").setValue(result.currencyId);
          this.ProjectsAddForm.get("authorityId").setValue(result.authorityId);
          this.ProjectsAddForm.get("currRate").setValue(result.currRate);
          this.ProjectsAddForm.get("householdTypeId").setValue(result.householdTypeId);
          this.ProjectsAddForm.get("specialHealthNeeds").setValue(result.specialHealthNeeds);
          this.ProjectsAddForm.get("houseHoldAdjectiveId").setValue(result.houseHoldAdjectiveId);
          this.ProjectsAddForm.get("beneficiaryClass").setValue(result.beneficiaryClass);
          this.ProjectsAddForm.get("generalPublications").setValue(result.generalPublications);
          this.ProjectsAddForm.get("unOrderNo").setValue(result.unOrderNo);
          this.ProjectsAddForm.get("dinarAmount").setValue(result.dinarAmount);
          this.ProjectsAddForm.get("entityId").setValue(result.entityId);
          if(result.authorityAttribute != null && result.authorityAttribute != undefined && result.authorityAttribute > 0)
          {
            this.filterauthoritiesByAttribute(result.authorityAttribute);
          }
          this.ProjectsAddForm.get("authorityAttribute").setValue(result.authorityAttribute);
          if(result.estimatedAmount != null && result.estimatedAmount != undefined && result.estimatedAmount > 0)
          {
             this.filterauthoritiesByentityId(result.entityId);
          }

          this.dealAmountInDollars = this.formatCurrency(result.estimatedAmount / 0.708);
          if (result.isPublicDonation == true) {
            this.ProjectsAddForm.patchValue({ isPublicDonation: 1 });
            this.PublicDonationChange(1);
          }

          if (result.isPublicDonation == false) {
            this.ProjectsAddForm.patchValue({ isPublicDonation: 2 });
            this.PublicDonationChange(2);
          }
          this.DisplayCheckBoxes(result);
          this.ConvertIdsToNumber(result);
          debugger;
          if (result.cash) {
            for (let i = 0; i < this.projectCashTypesList.length; i++) {
              this.CalcCashTypesTotal(this.projectCashTypesList[i]);
            }
          }
          if (result.otherMaterials) {
            this.MaterialAmountDollar(result.materialValue);
          }
          if (this.ProjectsAddForm.value.authorityId > 0) {
            this.AuthorityCountry = this.authoritiesList.find(x => x.id === this.ProjectsAddForm.value.authorityId)?.data1 || "";
          }
          else {
            this.AuthorityCountry = "";
          }
        }
        else {
          this.ProjectsAddForm.get("projectNo").setValue(result.projectNo);
          this.ProjectsAddForm.get("projectDate").setValue(result.projectDate);
          this.ProjectsAddForm.get("projectBookNo").setValue("");
          this.ProjectsAddForm.get("inJordan").setValue(false);
          this.ProjectsAddForm.get("governorateId").setValue("");
          this.ProjectsAddForm.get("districtId").setValue("");
          this.ProjectsAddForm.get("intAddress").setValue("");
          this.ProjectsAddForm.get("outJordan").setValue(false);
          this.ProjectsAddForm.get("countryId").setValue(0);
          this.ProjectsAddForm.get("cityId").setValue(0);
          this.ProjectsAddForm.get("extAddress").setValue("");
          this.ProjectsAddForm.get("projShortName").setValue("");
          this.ProjectsAddForm.get("projImplTypeId").setValue(0);
          this.ProjectsAddForm.get("bookNo").setValue("");
          this.ProjectsAddForm.get("bookDate").setValue(result.bookDate);
          this.ProjectsAddForm.get("implTypeId").setValue(0);
          // this.ProjectsAddForm.get("financingMethodId").setValue(0);
          this.ProjectsAddForm.get("organisationsIds").setValue("");
          this.ProjectsAddForm.get("localOrganisationsIds").setValue("");
          this.ProjectsAddForm.get("materialsSourceId").setValue("");
          this.ProjectsAddForm.get("generalPublications").setValue("");          
          this.ProjectsAddForm.get("sample").setValue(false);
          this.ProjectsAddForm.get("cash").setValue(false);
          this.ProjectsAddForm.get("sustDevelop").setValue(false);
          this.ProjectsAddForm.get("otherMaterials").setValue(false);
          this.ProjectsAddForm.get("materialType").setValue("");
          this.ProjectsAddForm.get("materialQty").setValue(0);
          this.ProjectsAddForm.get("materialUnit").setValue("");
          this.ProjectsAddForm.get("materialValue").setValue(0);
          this.ProjectsAddForm.get("totalProjectAmount").setValue(0);
          this.ProjectsAddForm.get("assocTargetingId").setValue("");
          this.ProjectsAddForm.get("agreementNo").setValue(0);
          this.ProjectsAddForm.get("isRealtedToDoc").setValue(0);
          this.ProjectsAddForm.get("docRealted").setValue(0);
          this.ProjectsAddForm.get("projStartDate").setValue(result.projStartDate);
          this.ProjectsAddForm.get("projEndDate").setValue(result.projEndDate);
          this.ProjectsAddForm.get("actualStartDate").setValue(result.actualStartDate);
          this.ProjectsAddForm.get("actualEndDate").setValue(result.actualEndDate);
          this.ProjectsAddForm.get("projectStatusId").setValue(0);
          this.ProjectsAddForm.get("requiredMediaMaterialsId").setValue("");
          this.ProjectsAddForm.get("projectEvaluation").setValue("");
          this.ProjectsAddForm.get("suspensionReasonsId").setValue(0);
          this.ProjectsAddForm.get("requstedMediaId").setValue("");
          this.ProjectsAddForm.get("mediaTimingId").setValue("");
          this.ProjectsAddForm.get("currencyId").setValue(0);
          this.ProjectsAddForm.get("authorityId").setValue(0);
          this.ProjectsAddForm.get("currRate").setValue(0);
          this.ProjectsAddForm.get("householdTypeId").setValue("");
          this.ProjectsAddForm.get("specialHealthNeeds").setValue("");
          this.ProjectsAddForm.get("houseHoldAdjectiveId").setValue(0);
          this.ProjectsAddForm.get("beneficiaryClass").setValue(0);
          this.ProjectsAddForm.get("unOrderNo").setValue("");      
          this.ProjectsAddForm.get("dinarAmount").setValue(""); 
          this.ProjectsAddForm.get("entityId").setValue(0);
          this.ProjectsAddForm.get("authorityAttribute").setValue(0);  
          this.ProjectsAddForm.patchValue({ isPublicDonation: 1 });   
          debugger
          let userId = this.jwtAuth.getUserId();
          let email = this.usersList.filter(r =>r.id == userId);
          if(email != null)
            {
              let exist = this.projectOfficerList.filter(r => r.data1 == email[0].data3)
              if(exist != null)
                {
                  this.ProjectsAddForm.get("liaisonOfficerId").setValue(exist[0].id);
                }
            }
          
          this.DisplayCheckBoxes(result);
        }
        // this.calculateSumProject()
      });
        debugger
     
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    this.PrepareCheckBoxesForSave();
    if (!this.CheckValidationSave()) {
      this.disableSave = false;
      return false;
    }

    // if (this.ProjectsAddForm.value.financingMethodId == 142) {
    //   if (this.ProjectsAddForm.value.organisationsIds <= 0 || this.ProjectsAddForm.value.organisationsIds == '') {
    //     this.disableSave = false;
    //     this.alert.ShowAlert("msgMustSelectMainAssociationsOrganizations", 'error');
    //     return false;
    //   }

    //   if (this.ProjectsAddForm.value.localOrganisationsIds <= 0 || this.ProjectsAddForm.value.localOrganisationsIds == '') {
    //     this.disableSave = false;
    //     this.alert.ShowAlert("msgMustSelectBranchedAssociationsOrganizations", 'error');
    //     return false;
    //   }
    // }
    debugger
    this.ProjectsAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ProjectsAddForm.value.userId = this.jwtAuth.getUserId();
    this.ProjectsAddForm.get("donationTypesModels").setValue(this.donationTypesList);
    this.ProjectsAddForm.get("projectExpensesTypesModels").setValue(this.expensesTypesModelList);
    this.ProjectsAddForm.get("targetNationalitiesModels").setValue(this.nationalityModelsList);
    this.ProjectsAddForm.get("projectCashTypesModels").setValue(this.projectCashTypesList);
    this.ProjectsAddForm.get("projectMediaFilesModels").setValue(this.mediaFilesList);
    this.ProjectsAddForm.get("generalAttachModelList").setValue(this.childAttachment.getVoucherAttachData());
     if (this.ProjectsAddForm.value.isPublicDonation == 1) 
      {
        this.ProjectsAddForm.patchValue({ isPublicDonation: true });
      }
      else if (this.ProjectsAddForm.value.isPublicDonation == 2) 
      {
        this.ProjectsAddForm.patchValue({ isPublicDonation: false });
      }

          
    this.ConvertIdsToString();


    debugger
    this.Service.SaveProject(this.ProjectsAddForm.value)
      .subscribe((result) => {
        debugger

        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          this.clearFormdata();
          if (this.opType == 'Edit') {
            if (this.pageType == 1) {
              this.router.navigate(['ProjectDefinition/ProjectDefinitionList']);
            }
            else {
              this.router.navigate(['Empowerment/ProjectDefinitionList']);
            }
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  AddNewLineDonation() {
    debugger
    if (this.disableAll) {
      return;
    }
    if (this.ProjectsAddForm.value.currRate == 0 || this.ProjectsAddForm.value.currRate == undefined || this.ProjectsAddForm.value.currRate == null) {
      this.alert.ShowAlert("PleaseChooseTheCurrency", "error");
      return;
    }
    this.donationTypesList ??= [];
    this.donationTypesList.push(
      {
        id: 0,
        projectId: 0,
        programTypeId: 0,
        donationId: 0,
        donationId2: 0,
        couponsNo: 0,
        couponsAmount: 0,
        total: 0,
        dollarTotal: 0,
        couponLoc: "",
        index: ""
      });
    this.ProjectsAddForm.get("donationTypesModels").setValue(this.donationTypesList);
  }

  calculateSum() {
    return this.formatCurrency(
      this.donationTypesList.reduce((sum, item) => {
        const qty = parseFloat(item.couponsNo);
        const price = parseFloat(item.couponsAmount);

        // Check for invalid qty or price and treat them as 0 if invalid
        const validQty = isNaN(qty) ? 0 : qty;
        const validPrice = isNaN(price) ? 0 : price;

        return sum + (validPrice);
      }, 0)
    );
  }

  calculateSumDollar() {
    return this.formatCurrency(
      this.donationTypesList.reduce((sum, item) => {
        const qty = parseFloat(item.couponsNo);
        const price = parseFloat(item.couponsAmount);

        // Check for invalid qty or price and treat them as 0 if invalid
        const validQty = isNaN(qty) ? 0 : qty;
        const validPrice = isNaN(price) ? 0 : price;

        return sum + (validPrice) / this.dollarRate;
      }, 0)
    );
  }

  deleteRowDonation(rowIndex: number) {
    this.donationTypesList.splice(rowIndex, 1);
    this.ProjectsAddForm.get("donationTypesModels").setValue(this.donationTypesList);
    this.calculateSumProject();
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  DeleteProject(id: any) {
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
        this.Service.DeleteProject(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            if (this.pageType == 1) {
              this.router.navigate(['ProjectDefinition/ProjectDefinitionList']);
            }
            else {
              this.router.navigate(['Empowerment/ProjectDefinitionList']);
            }
          }
          else if (!results.isSuccess && results.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
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

  PrintPurchaseRequest(id: number) {
    this.lang = this.jwtAuth.getLang();
    if (this.lang == 'ar') {
      const reportUrl = `RptPurchaseRequestAr?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptPurchaseRequestEn?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  clearFormdata() {
    this.NewDate = new Date;
    this.NewDate = formatDate(this.NewDate, "yyyy-MM-dd", "en-US");
    this.ProjectsAddForm.get("projectNo").setValue(0);
    this.ProjectsAddForm.get("projectDate").setValue(this.NewDate);
    this.ProjectsAddForm.get("projectBookNo").setValue("");
    this.ProjectsAddForm.get("inJordan").setValue(false);
    this.ProjectsAddForm.get("governorateId").setValue("");
    this.ProjectsAddForm.get("districtId").setValue("");
    this.ProjectsAddForm.get("intAddress").setValue("");
    this.ProjectsAddForm.get("outJordan").setValue(false);
    this.ProjectsAddForm.get("countryId").setValue(0);
    this.ProjectsAddForm.get("cityId").setValue(0);
    this.ProjectsAddForm.get("extAddress").setValue("");
    this.ProjectsAddForm.get("projShortName").setValue("");
    this.ProjectsAddForm.get("projImplTypeId").setValue(0);
    this.ProjectsAddForm.get("bookNo").setValue("");
    this.ProjectsAddForm.get("bookDate").setValue(this.NewDate);
    this.ProjectsAddForm.get("implTypeId").setValue(0);
    // this.ProjectsAddForm.get("financingMethodId").setValue(0);
    this.ProjectsAddForm.get("organisationsIds").setValue("");
    this.ProjectsAddForm.get("localOrganisationsIds").setValue("");
    this.ProjectsAddForm.get("materialsSourceId").setValue("");
    this.ProjectsAddForm.get("liaisonOfficerId").setValue(0);
    this.ProjectsAddForm.get("sample").setValue(false);
    this.ProjectsAddForm.get("cash").setValue(false);
    this.CashDinarTotal = 0;
    this.CashDollarTotal = 0;
    this.empJodTotal = 0;
    this.empDollarTotal = 0;
    this.ProjectsAddForm.get("sustDevelop").setValue(false);
    this.ProjectsAddForm.get("otherMaterials").setValue(false);
    this.ProjectsAddForm.get("materialType").setValue("");
    this.ProjectsAddForm.get("materialQty").setValue(0);
    this.ProjectsAddForm.get("materialUnit").setValue("");
    this.ProjectsAddForm.get("materialValue").setValue(0);
    this.ProjectsAddForm.get("totalProjectAmount").setValue(0);
    this.ProjectsAddForm.get("assocTargetingId").setValue("");
    this.ProjectsAddForm.get("agreementNo").setValue(0);
    this.ProjectsAddForm.get("isRealtedToDoc").setValue(0);
    this.ProjectsAddForm.get("docRealted").setValue(0);
    this.ProjectsAddForm.get("projStartDate").setValue(this.NewDate);
    this.ProjectsAddForm.get("projEndDate").setValue(this.NewDate);
    this.ProjectsAddForm.get("actualStartDate").setValue(this.NewDate);
    this.ProjectsAddForm.get("actualEndDate").setValue(this.NewDate);
    this.ProjectsAddForm.get("projectStatusId").setValue(0);
    this.ProjectsAddForm.get("requiredMediaMaterialsId").setValue("");
    this.ProjectsAddForm.get("projectEvaluation").setValue("");
    this.ProjectsAddForm.get("suspensionReasonsId").setValue(0);
    this.ProjectsAddForm.get("requstedMediaId").setValue("");
    this.ProjectsAddForm.get("mediaTimingId").setValue("");
    this.ProjectsAddForm.get("currencyId").setValue(0);
    this.ProjectsAddForm.get("authorityId").setValue(0);
    this.ProjectsAddForm.get("currRate").setValue(0);
    this.ProjectsAddForm.get("householdTypeId").setValue("");
    this.ProjectsAddForm.get("specialHealthNeeds").setValue("");
    this.ProjectsAddForm.get("houseHoldAdjectiveId").setValue(0);
    this.donationTypesList = [];
    this.expensesTypesModelList = [];
    this.nationalityModelsList = [];
    this.projectCashTypesList = [];
    this.empowermentModelsList = [];
    this.mediaFilesList = [];
    this.ProjectsAddForm.get("projectMediaFilesModels").setValue(this.mediaFilesList);
    this.ProjectsAddForm.get("donationTypesModels").setValue([]);
    this.ProjectsAddForm.get("projectExpensesTypesModels").setValue([]);
    this.ProjectsAddForm.get("targetNationalitiesModels").setValue([]);
    this.ProjectsAddForm.get("projectCashTypesModels").setValue([]);
    this.ProjectsAddForm.get("generalAttachModelList").setValue([]);
    this.ProjectsAddForm.get("empowermentModels").setValue([]);
    this.childAttachment.data = [];
    this.isSample = 0;
    this.isCash = 0;
    this.isSustDevelop = 0;
    this.isOtherMaterials = 0;
    this.isAgreement = 0;
    this.isRealted = 0;
    this.totalDonations = 0;
    this.totalDollarDonations = 0;
    this.materialAmtDollar = 0;
    this.dollarCash = 0;
    this.dollarCheques = 0;
    this.dollarCreditCards = 0;
    this.TotalProjectAmountDollar = 0;
    this.expenseAmountDollar = 0;
    this.ResidualValueDollar = 0;
    this.estimatedAmount = 0;
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    let currRate = this.currenciesList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currenciesList.find(option => option.id === selectedValue).data2;
    this.ProjectsAddForm.get("currRate").setValue(currRate);
    this.dollarRate = currRate;
    for (let i = 0; i < this.projectCashTypesList.length; i++) {
      let row = this.projectCashTypesList[i];
      this.CalcCashTypesTotal(row);
    }
    for (let i = 0; i < this.donationTypesList.length; i++) {
      let row = this.donationTypesList[i];
      this.CalcDollar(row);
    }
    for (let i = 0; i < this.expensesTypesModelList.length; i++) {
      let row = this.expensesTypesModelList[i];
      this.CalcExpensesDollar(row, i);
    }
    this.calculateSumProject();
  }

  onChangeFinancialMethod(event: any) {
    debugger
    if (event.value != 528) {
      this.ProjectsAddForm.get("organisationsIds").setValue("");
      this.ProjectsAddForm.get("localOrganisationsIds").setValue("");
    }
  }

  GetImpData(event: any) {
    debugger
    this.ProjectsAddForm.get("implTypeId").setValue(0)
    if (event.value == 2) {
      this.filterImplementationList = this.impTypeList.filter(r => r.id != 1);
      this.ProjectsAddForm.get("bookNo").setValue("")
      this.ProjectsAddForm.get("bookDate").setValue("")
    }
    else {
      this.filterImplementationList = this.impTypeList;
    }
  }

  CalcDinar(row) {
    debugger
    row.dollarTotal = (row.couponsAmount / this.dollarRate).toFixed(this.decimalPlaces);
    this.calculateSumProject();
  }

  CalcDollar(row) {
    debugger
    row.couponsAmount = (row.dollarTotal * this.dollarRate).toFixed(this.decimalPlaces);
    this.calculateSumProject();
  }

  CalcCashTypesTotal(row) {
    debugger
    if (this.projectCashTypesList.length > 0) {
      this.CashDinarTotal = 0;
      this.CashDollarTotal = 0;
      const element = row;
      element.dollarAmount = (element.amount / this.dollarRate).toFixed(this.decimalPlaces);
      for (let i = 0; i < this.projectCashTypesList.length; i++) {
        let element = this.projectCashTypesList[i];
        let totDinar = Number(element.amount);
        let totDollar = Number(element.dollarAmount);
        this.CashDinarTotal += totDinar;
        this.CashDollarTotal += totDollar;
      }
      this.CashDinarTotal = this.formatCurrency(this.CashDinarTotal);
      this.CashDollarTotal = this.formatCurrency(this.CashDollarTotal);
    }
    else {
      row.total = 0;
      row.dollarTotal = 0;
      this.CashDinarTotal = 0;
      this.CashDollarTotal = 0;
    }
    this.calculateSumProject();
  }

  AddNewLineExpenses() {
    debugger
    if (this.disableAll == true) {
      return;
    }

    this.expensesTypesModelList ??= [];
    this.expensesTypesModelList.push(
      {
        id: 0,
        projectId: 0,
        expTypeId: 0,
        amount: 0,
        currencyId: 0,
        dollarTotal: 0,
        isActual: false,
        index: ""
      });
    this.ProjectsAddForm.get("projectExpensesTypesModels").setValue(this.expensesTypesModelList);
  }

  deleteRowExpenses(rowIndex: number) {
    this.expensesTypesModelList.splice(rowIndex, 1);
    this.ProjectsAddForm.get("projectExpensesTypesModels").setValue(this.expensesTypesModelList);
    this.calculateSumProject();
  }

  CalcExpensesDollar(row, index) {
    debugger

    if (row.amount > 0) {
      this.expensesTypesModelList[index].dollarTotal = (row.amount / this.dollarRate).toFixed(this.decimalPlaces)
    }
    else {
      this.expensesTypesModelList[index].dollarTotal = 0;
    }
    this.calculateSumProject();
  }

  CalcExpensesJod(value, index) {
    debugger
    if (value > 0) {
      this.expensesTypesModelList[index].amount = (value * this.dollarRate).toFixed(this.decimalPlaces)
    }
    else {
      this.expensesTypesModelList[index].amount = 0;
    }
    this.calculateSumProject();
  }

  calculateSumExpenses() {
    return this.formatCurrency(
      this.expensesTypesModelList.reduce((sum, item) => {
        const amount = parseFloat(item.amount);
        const validAmount = isNaN(amount) ? 0 : amount;
        return sum + (validAmount);
      }, 0)
    );
  }

  calculateSumDollarExpenses() {
    return this.formatCurrency(
      this.expensesTypesModelList.reduce((sum, item) => {
        const amount = parseFloat(item.amount);
        const validAmount = isNaN(amount) ? 0 : amount;
        return sum + (validAmount / this.dollarRate);
      }, 0)
    );
  }

  AddNewLineNationality() {
    debugger
    if (this.disableAll == true) {
      return;
    }

    this.nationalityModelsList ??= [];
    this.nationalityModelsList.push(
      {
        id: 0,
        projectId: 0,
        nationalityId: 0,
        familyNo: 0,
        personNo: 0,
        personTypeId: 0,
        beneficiaryPercent: 0,
        houseRolerId: 0,
        healthConditionsId: 0,
        index: ""
      });
    this.ProjectsAddForm.get("targetNationalitiesModels").setValue(this.nationalityModelsList);
  }

  deleteRowNationality(rowIndex: number) {
    this.nationalityModelsList.splice(rowIndex, 1);
    this.ProjectsAddForm.get("targetNationalitiesModels").setValue(this.nationalityModelsList);
  }

  AddNewLineCashTypes() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (this.ProjectsAddForm.value.currRate == 0 || this.ProjectsAddForm.value.currRate == undefined || this.ProjectsAddForm.value.currRate == null) {
      this.alert.ShowAlert("PleaseChooseTheCurrency", "error");
      return;
    }
    this.projectCashTypesList ??= [];
    this.projectCashTypesList.push(
      {
        id: 0,
        projectId: 0,
        cashTypeId: 0,
        cashShapeId: 0,
        amount: 0,
        dollarAmount: 0,
        index: ""
      });
    this.ProjectsAddForm.get("projectCashTypesModels").setValue(this.projectCashTypesList);
  }

  deleteRowCashTypes(Row: any, rowIndex: number) {
    this.projectCashTypesList.splice(rowIndex, 1);
    this.ProjectsAddForm.get("projectCashTypesModels").setValue(this.projectCashTypesList);
    this.CalcCashTypesTotal(Row);
    this.calculateSumProject();
  }

  calculateSumProject() {
    let exp = 0;
    let donation = 0
    let cash = 0;
    let emp = 0;
    let Total = "";
    for (let i = 0; i < this.expensesTypesModelList.length; i++) {
      const element = this.expensesTypesModelList[i];
      exp += Number(element.amount);
    }
    for (let i = 0; i < this.donationTypesList.length; i++) {
      const element = this.donationTypesList[i];
      donation += Number(element.couponsAmount);
    }
    for (let i = 0; i < this.projectCashTypesList.length; i++) {
      const element = this.projectCashTypesList[i];
      cash += Number(element.amount);
    }
    for (let i = 0; i < this.empowermentModelsList.length; i++) {
      const element = this.empowermentModelsList[i];
      emp += Number(element.amount);
    }
    Total = (donation + this.ProjectsAddForm.value.materialValue + cash + emp).toFixed(this.decimalPlaces);
    this.TotalProjectAmountDollar = (parseFloat(Total) / this.dollarRate).toFixed(this.decimalPlaces);
    this.ProjectsAddForm.get("totalProjectAmount").setValue(Total);



    this.ProjectsAddForm.get("expenseAmount").setValue(exp.toFixed(this.decimalPlaces));
    this.expenseAmountDollar = (exp / this.dollarRate).toFixed(this.decimalPlaces);


    const residual = Number(Total) - Number(exp);
    this.ProjectsAddForm.get("ResidualValue").setValue(residual.toFixed(this.decimalPlaces));
    this.ResidualValueDollar = (residual / this.dollarRate).toFixed(this.decimalPlaces);
    this.filterMediaOnCash(Number(Total));
  }

  //handel CheckBoxes Events 
  ongeoInsideJordanChange(): void {
    this.geoInsideJordan = this.geoInsideJordan === 0 ? 1 : 0;
    this.ProjectsAddForm.get("governorateId").setValue(0);
    this.ProjectsAddForm.get("districtId").setValue(0);
    this.ProjectsAddForm.get("intAddress").setValue("");
  }

  ongeoOutsideJordanChange(): void {
    this.geoOutsideJordan = this.geoOutsideJordan === 0 ? 1 : 0;
    this.ProjectsAddForm.get("countryId").setValue(0);
    this.ProjectsAddForm.get("cityId").setValue(0);
    this.ProjectsAddForm.get("extAddress").setValue("");
  }

  onisAgreementChange(): void {
    this.isAgreement = this.isAgreement === 0 ? 1 : 0;
    this.ProjectsAddForm.get("agreementNo").setValue(0);
    this.estimatedAmount = 0;
  }

  onisRealtedChange(): void {
    this.isRealted = this.isRealted === 0 ? 1 : 0;
    this.ProjectsAddForm.get("docRealted").setValue(0);
  }

  onisCashChange(): void {
    this.isCash = this.isCash === 0 ? 1 : 0;
    if (this.isCash == 0) {
      this.ProjectsAddForm.get("projectCashTypesModels").setValue([]);
      this.projectCashTypesList = [];
      this.CashDinarTotal = 0;
      this.CashDollarTotal = 0;
      this.calculateSumProject();
    }
  }

  onisSampleChange(): void {
    debugger
    this.isSample = this.isSample === 0 ? 1 : 0;
    if (this.isSample == 0) {
      this.ProjectsAddForm.get("materialType").setValue("");
      this.ProjectsAddForm.get("materialQty").setValue(0);
      this.ProjectsAddForm.get("materialUnit").setValue("");
      this.ProjectsAddForm.get("materialValue").setValue(0);
      this.donationTypesList = [];
      this.ProjectsAddForm.get("donationTypesModels").setValue(this.donationTypesList);
      this.isOtherMaterials = 0;
    }
    else {
      this.isOtherMaterials = 1;
    }
    this.calculateSumProject();
  }

  onOtherMaterialsChange(): void {
    this.isOtherMaterials = this.isOtherMaterials === 0 ? 1 : 0;
    this.ProjectsAddForm.get("materialType").setValue("");
    this.ProjectsAddForm.get("materialQty").setValue(0);
    this.ProjectsAddForm.get("materialUnit").setValue("");
    this.ProjectsAddForm.get("materialValue").setValue(0);
    this.calculateSumProject();
  }
  //end

  CalcPercentage(Value, Row, index) {
    let tot = 0;
    for (let i = 0; i < this.nationalityModelsList.length; i++) {
      const element = this.nationalityModelsList[i];
      tot += Number(element.familyNo) + Number(element.personNo);
    }
    for (let i = 0; i < this.nationalityModelsList.length; i++) {
      const element = this.nationalityModelsList[i];
      let no = Number(element.familyNo) + Number(element.personNo)
      this.nationalityModelsList[i].beneficiaryPercent = ((no / tot) * 100).toFixed(0);
    }


  }

  onFamilyChange(value, row, index) {
    debugger
    row.personNo = (value * 5.2).toFixed(this.decimalPlaces)
    this.CalcPercentage(value, row, index);
  }

  onPersonChange(value, row, index) {
    debugger
    row.familyNo = (value / 5.2).toFixed(this.decimalPlaces)
    this.CalcPercentage(value, row, index);
  }

  MaterialAmountDollar(amount) {
    debugger
    this.materialAmtDollar = (amount / this.dollarRate).toFixed(this.decimalPlaces);
    this.calculateSumProject();
  }

  PrepareCheckBoxesForSave() {
    if (this.geoInsideJordan == 1) {
      this.ProjectsAddForm.get("inJordan").setValue(true);
    }
    else {
      this.ProjectsAddForm.get("inJordan").setValue(false);
    }
    if (this.geoOutsideJordan == 1) {
      this.ProjectsAddForm.get("outJordan").setValue(true);
    }
    else {
      this.ProjectsAddForm.get("outJordan").setValue(false);
    }
    if (this.isSample == 1) {
      this.ProjectsAddForm.get("sample").setValue(true);
    }
    else {
      this.ProjectsAddForm.get("sample").setValue(false);
    }
    if (this.isCash == 1) {
      this.ProjectsAddForm.get("cash").setValue(true);
    }
    else {
      this.ProjectsAddForm.get("cash").setValue(false);
    }
    if (this.isSustDevelop == 1) {
      this.ProjectsAddForm.get("sustDevelop").setValue(true);
    }
    else {
      this.ProjectsAddForm.get("sustDevelop").setValue(false);
    }
    if (this.isOtherMaterials == 1) {
      this.ProjectsAddForm.get("otherMaterials").setValue(true);
    }
    else {
      this.ProjectsAddForm.get("otherMaterials").setValue(false);
    }
    if (this.isAgreement == 1) {
      this.ProjectsAddForm.get("agreement").setValue(true);
    }
    else {
      this.ProjectsAddForm.get("agreement").setValue(false);
    }
    if (this.isRealted == 1) {
      this.ProjectsAddForm.get("isRealtedToDoc").setValue(true);
    }
    else {
      this.ProjectsAddForm.get("isRealtedToDoc").setValue(false);
    }

  }

  DisplayCheckBoxes(value) {
    if (value.inJordan) {
      this.geoInsideJordan = 1;
    }
    else {
      this.geoInsideJordan = 0;
    }
    if (value.outJordan) {
      this.geoOutsideJordan = 1;
    }
    else {
      this.geoOutsideJordan = 0;
    }
    if (value.sample) {
      this.isSample = 1;
    }
    else {
      this.isSample = 0;
    }
    if (value.cash) {
      this.isCash = 1;
    }
    else {
      this.isCash = 0;
    }
    if (value.sustDevelop) {
      this.isSustDevelop = 1;
    }
    else {
      this.isSustDevelop = 0;
    }
    if (value.otherMaterials) {
      this.isOtherMaterials = 1;
    }
    else {
      this.isOtherMaterials = 0;
    }
    if (value.agreement) {
      this.isAgreement = 1;
    }
    else {
      this.isAgreement = 0;
    }

    if (value.isRealtedToDoc) {
      this.isRealted = 1;
    }
    else {
      this.isRealted = 0;
    }
  }

  CheckValidationSave() {
    debugger
    if (this.geoInsideJordan == 0 && this.geoOutsideJordan == 0) {
      this.alert.ShowAlert("PleaseChooseProjectGeographicScope", 'error')
      return false;
    }
    if (this.ProjectsAddForm.value.totalProjectAmount == 0 || this.ProjectsAddForm.value.totalProjectAmount == null || this.ProjectsAddForm.value.totalProjectAmount == undefined) {
      this.alert.ShowAlert("PleaseInsertProjectValue", 'error')
      return false;
    }
    if (this.donationTypesList.length > 0) {
      for (let i = 0; i < this.donationTypesList.length; i++) {
        const element = this.donationTypesList[i];
        if (element.donationId == 0 || element.couponsAmount == 0) {
          this.alert.ShowAlert("PleaseInsertRequiredDataForDonationTable", 'error');
          return false;
        }
        element.i = i.toString();
      }
    }

    if (this.expensesTypesModelList.length > 0) {
      for (let i = 0; i < this.expensesTypesModelList.length; i++) {
        const element = this.expensesTypesModelList[i];
        if (element.expTypeId == 0 || element.amount == 0) {
          this.alert.ShowAlert("PleaseInsertRequiredDataForProjectExpensesTable", 'error');
          return false;
        }
        element.i = i.toString();
      }
    }

    if (this.projectCashTypesList.length > 0) {
      for (let i = 0; i < this.projectCashTypesList.length; i++) {
        const element = this.projectCashTypesList[i];
        if (element.cashTypeId == 0 || element.cashShapeId == 0 || element.amount == 0) {
          this.alert.ShowAlert("PleaseInsertRequiredDataForProjectCashTypesTable", 'error');
          return false;
        }
        element.i = i.toString();
      }
    }

    if (this.nationalityModelsList.length > 0) {
      for (let i = 0; i < this.nationalityModelsList.length; i++) {
        const element = this.nationalityModelsList[i];
        if (element.nationalityId == 0) {
          this.alert.ShowAlert("PleaseInsertRequiredDataForTargetedNationalitiesTable", 'error');
          return false;
        }
        element.i = i.toString();
      }
    }
    // && this.isOtherMaterials == 0
    if (this.isSample == 1) {
      if (this.donationTypesList.length == 0) {
        this.alert.ShowAlert("PleaseChooseSampleAmount", 'error')
        return false;
      }
      if (this.donationTypesList.length == 0 && this.isOtherMaterials == 1) {
        if (this.ProjectsAddForm.value.materialValue == 0 || this.ProjectsAddForm.value.materialValue == null || this.ProjectsAddForm.value.materialValue == undefined)
          this.alert.ShowAlert("PleaseInsertOtherMaterialsValue", 'error')
        return false;
      }

    }

    if (this.isSustDevelop == 1) {
      if (this.empowermentModelsList.length == 0) {
        this.alert.ShowAlert("PleaseInsertOneRowInTablePowerment", 'error')
        return false;
      }

      for (let i = 0; i < this.empowermentModelsList.length; i++) {
        const element = this.empowermentModelsList[i];
        if (element.empProjectType == "" || element.empProjectType == undefined || element.amount == 0 || element.amount == undefined || element.benefitTypeId == 0) {
          this.alert.ShowAlert("PleaseInsertRequiredDataForEmpowermentTable", 'error');
          return false;
        }
        element.i = i.toString();
      }
    }


    if (this.isAgreement == 1) {
      if (this.ProjectsAddForm.value.agreementNo <= 0) {
        this.alert.ShowAlert("PleaseSpecifyTheAgreement", 'error');
        return false;
      }
    }

    return true;
  }

  ConvertIdsToString() {
    debugger
    let org = this.ProjectsAddForm.value.organisationsIds;
    if (Array.isArray(org)) {
      let validOrgs = org
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let OrgsString = validOrgs.join(',');
      this.ProjectsAddForm.get("organisationsIds").setValue(OrgsString);
      console.log('Filtered paymentMethod:', OrgsString);
    } else {
      console.error('organisationsIds is not an array');
    }

    let org2 = this.ProjectsAddForm.value.localOrganisationsIds;
    if (Array.isArray(org2)) {
      let validOrgs = org2
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let OrgsString2 = validOrgs.join(',');
      this.ProjectsAddForm.get("localOrganisationsIds").setValue(OrgsString2);
      console.log('Filtered paymentMethod:', OrgsString2);
    } else {
      console.error('localOrganisationsIds is not an array');
    }

    let material = this.ProjectsAddForm.value.materialsSourceId;
    if (Array.isArray(material)) {
      let validOrgs = material
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let OrgsString3 = validOrgs.join(',');
      this.ProjectsAddForm.get("materialsSourceId").setValue(OrgsString3);
      console.log('Filtered paymentMethod:', OrgsString3);
    } else {
      console.error('materialsSourceId is not an array');
    }



    let household = this.ProjectsAddForm.value.householdTypeId;
    if (Array.isArray(household)) {
      let validhousehold = household
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let householdString = validhousehold.join(',');
      this.ProjectsAddForm.get("householdTypeId").setValue(householdString);
      console.log('Filtered paymentMethod:', householdString);
    } else {
      console.error('householdTypeId is not an array');
    }


    let assocTargeting = this.ProjectsAddForm.value.assocTargetingId;
    if (Array.isArray(assocTargeting)) {
      let validassocTargeting = assocTargeting
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let assocTargetingString = validassocTargeting.join(',');
      this.ProjectsAddForm.get("assocTargetingId").setValue(assocTargetingString);
      console.log('Filtered paymentMethod:', assocTargetingString);
    } else {
      console.error('assocTargetingId is not an array');
    }


    let ReqMedia = this.ProjectsAddForm.value.requstedMediaId;
    if (Array.isArray(ReqMedia)) {
      let validReqMedia = ReqMedia
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let ReqMediaString = validReqMedia.join(',');
      this.ProjectsAddForm.get("requstedMediaId").setValue(ReqMediaString);
      console.log('Filtered paymentMethod:', ReqMediaString);
    } else {
      console.error('requstedMediaId is not an array');
    }


    let ReqTiming = this.ProjectsAddForm.value.mediaTimingId;
    if (Array.isArray(ReqTiming)) {
      let validReqTiming = ReqTiming
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let ReqTimingString = validReqTiming.join(',');
      this.ProjectsAddForm.get("mediaTimingId").setValue(ReqTimingString);
      console.log('Filtered paymentMethod:', ReqTimingString);
    } else {
      console.error('mediaTimingId is not an array');
    }


    let governorate = this.ProjectsAddForm.value.governorateId;
    if (Array.isArray(governorate)) {
      let validgov = governorate
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let govString = validgov.join(',');
      this.ProjectsAddForm.get("governorateId").setValue(govString);
      console.log('Filtered paymentMethod:', govString);
    } else {
      console.error('governorateId is not an array');
    }


    let district = this.ProjectsAddForm.value.districtId;
    if (Array.isArray(district)) {
      let validdistrict = district
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let districtString = validdistrict.join(',');
      this.ProjectsAddForm.get("districtId").setValue(districtString);
      console.log('Filtered paymentMethod:', districtString);
    } else {
      console.error('districtId is not an array');
    }

    let reqitems = this.ProjectsAddForm.value.requiredMediaMaterialsId;
    if (Array.isArray(reqitems)) {
      let validreqitems = reqitems
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let reqitemsString = validreqitems.join(',');
      this.ProjectsAddForm.get("requiredMediaMaterialsId").setValue(reqitemsString);
      console.log('Filtered paymentMethod:', reqitemsString);
    } else {
      console.error('requiredMediaMaterialsId is not an array');
    }

  }

  ConvertIdsToNumber(data) {
    debugger
    if (data.organisationsIds != null && data.organisationsIds != undefined && data.organisationsIds != "" && data.organisationsIds != "0") {
      let org = data.organisationsIds.split(',').map(Number)
      this.ProjectsAddForm.get("organisationsIds").setValue(org);
    }
    else {
      this.ProjectsAddForm.get("organisationsIds").setValue("");
    }
    if (data.localOrganisationsIds != null && data.localOrganisationsIds != undefined && data.localOrganisationsIds != "" && data.localOrganisationsIds != "0") {
      let org2 = data.localOrganisationsIds.split(',').map(Number)
      this.ProjectsAddForm.get("localOrganisationsIds").setValue(org2);
    }
    else {
      this.ProjectsAddForm.get("localOrganisationsIds").setValue("");
    }
    if (data.materialsSourceId != null && data.materialsSourceId != undefined && data.materialsSourceId != "" && data.materialsSourceId != "0") {
      let material = data.materialsSourceId.split(',').map(Number)
      this.ProjectsAddForm.get("materialsSourceId").setValue(material);
    }
    else {
      this.ProjectsAddForm.get("materialsSourceId").setValue("");
    }
    if (data.householdTypeId != null && data.householdTypeId != undefined && data.householdTypeId != "" && data.householdTypeId != "0") {
      let household = data.householdTypeId.split(',').map(Number)
      this.ProjectsAddForm.get("householdTypeId").setValue(household);
    }
    else {
      this.ProjectsAddForm.get("householdTypeId").setValue("");
    }
    if (data.assocTargetingId != null && data.assocTargetingId != undefined && data.assocTargetingId != "" && data.assocTargetingId != "0") {
      let accT = data.assocTargetingId.split(',').map(Number)
      this.ProjectsAddForm.get("assocTargetingId").setValue(accT);
    }
    else {
      this.ProjectsAddForm.get("assocTargetingId").setValue("");
    }
    if (data.requstedMediaId != null && data.requstedMediaId != undefined && data.requstedMediaId != "" && data.requstedMediaId != "0") {
      let ReqMed = data.requstedMediaId.split(',').map(Number)
      this.ProjectsAddForm.get("requstedMediaId").setValue(ReqMed);
    }
    else {
      this.ProjectsAddForm.get("requstedMediaId").setValue("");
    }
    if (data.mediaTimingId != null && data.mediaTimingId != undefined && data.mediaTimingId != "" && data.mediaTimingId != "0") {
      let medTi = data.mediaTimingId.split(',').map(Number)
      this.ProjectsAddForm.get("mediaTimingId").setValue(medTi);
    }
    else {
      this.ProjectsAddForm.get("mediaTimingId").setValue("");
    }

    if (data.governorateId != null && data.governorateId != undefined && data.governorateId != "" && data.governorateId != "0") {
      let gov = data.governorateId.split(',').map(Number)
      this.ProjectsAddForm.get("governorateId").setValue(gov);
    }
    else {
      this.ProjectsAddForm.get("governorateId").setValue("");
    }

    if (data.districtId != null && data.districtId != undefined && data.districtId != "" && data.districtId != "0") {
      let dist = data.districtId.split(',').map(Number)
      this.ProjectsAddForm.get("districtId").setValue(dist);
    }
    else {
      this.ProjectsAddForm.get("districtId").setValue("");
    }

    if (data.requiredMediaMaterialsId != null && data.requiredMediaMaterialsId != undefined && data.requiredMediaMaterialsId != "" && data.requiredMediaMaterialsId != "0") {
      let reqitem = data.requiredMediaMaterialsId.split(',').map(Number)
      this.ProjectsAddForm.get("requiredMediaMaterialsId").setValue(reqitem);
    }
    else {
      this.ProjectsAddForm.get("requiredMediaMaterialsId").setValue("");
    }

  }

  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.associationsOrganizationsList) {
      this.associationsOrganizationsList = [];
    }

    // Make sure the array is large enough
    while (this.associationsOrganizationsList.length < last) {
      this.associationsOrganizationsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.associationsOrganizationsList[i] = this.associationsOrganizationsList[i];
    }

    this.loading = false;
  }

  setupDateValidation() {
    this.ProjectsAddForm.valueChanges.subscribe(values => {
      const { projStartDate, projEndDate, actualStartDate, actualEndDate } = values;

      const projEndControl = this.ProjectsAddForm.get('projEndDate');
      const actualEndControl = this.ProjectsAddForm.get('actualEndDate');

      // Clear old errors
      projEndControl?.setErrors(null);
      actualEndControl?.setErrors(null);

      if (projStartDate && projEndDate && new Date(projEndDate) < new Date(projStartDate)) {
        projEndControl?.setErrors({ projEndBeforeStart: true });
      }

      if (actualStartDate && actualEndDate && new Date(actualEndDate) < new Date(actualStartDate)) {
        actualEndControl?.setErrors({ actualEndBeforeStart: true });
      }
    });
  }

  SelectAllMainOrganisations(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.associationsOrganizationsList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("organisationsIds")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("organisationsIds")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("organisationsIds")?.setValue(cleaned);
    }
  }

  SelectAllBranchedOrganisations(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.associationsOrganizationsList2
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("localOrganisationsIds")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("localOrganisationsIds")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("localOrganisationsIds")?.setValue(cleaned);
    }
  }

  SelectAllMaterialSource(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.itemsSourceList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("materialsSourceId")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("materialsSourceId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("materialsSourceId")?.setValue(cleaned);
    }
  }

  SelectAllAssociationsRequiredForTargeting(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.associationsOrganizationsList3
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("assocTargetingId")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("assocTargetingId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("assocTargetingId")?.setValue(cleaned);
    }
  }

  SelectAllTargetingCriteria(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.targetingCriteriaList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("householdTypeId")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("householdTypeId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("householdTypeId")?.setValue(cleaned);
    }
  }

  SelectAllRequiredMediaCoverage(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.mediaRequestedList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("requstedMediaId")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("requstedMediaId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("requstedMediaId")?.setValue(cleaned);
    }
  }

  SelectAllMediaCoverageTiming(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);

    if (hasSelectAll) {
      const allIds = this.mediaTimingList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("mediaTimingId")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("mediaTimingId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("mediaTimingId")?.setValue(cleaned);
    }
  }

  SelectAllGovernorate(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);
    if (hasSelectAll) {
      const allIds = this.governorateList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("governorateId")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("governorateId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("governorateId")?.setValue(cleaned);
    }
    debugger
    this.filterDistricts(this.ProjectsAddForm.get("governorateId").value);
  }

  SelectAllDistrict(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);
    if (hasSelectAll) {
      const allIds = this.filteredDistrictList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("districtId")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("districtId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("districtId")?.setValue(cleaned);
    }
  }

  SelectAllRequstedItems(event: any) {
    let selectedValues = event.value || [];
    const hasSelectAll = selectedValues.includes(0);
    if (hasSelectAll) {
      const allIds = this.requiredMediaMaterialsList
        .filter(el => el.id !== 0)
        .map(el => el.id);

      if (selectedValues.length - 1 !== allIds.length) {
        this.ProjectsAddForm.get("requiredMediaMaterialsId")?.setValue(allIds);
      } else {
        this.ProjectsAddForm.get("requiredMediaMaterialsId")?.setValue([]);
      }
    } else {
      const cleaned = selectedValues.filter(id => id !== 0);
      this.ProjectsAddForm.get("requiredMediaMaterialsId")?.setValue(cleaned);
    }
  }

  AddNewLineEmpowerment() {
    debugger
    if (this.disableAll == true) {
      return;
    }

    this.empowermentModelsList ??= [];
    this.empowermentModelsList.push(
      {
        id: 0,
        projectId: 0,
        empProjectType: "",
        amount: 0,
        dollarAmount: 0,
        benefitTypeId: 0,
        index: ""
      });
    this.ProjectsAddForm.get("empowermentModels").setValue(this.empowermentModelsList);
  }

  deleteRowEmpowerment(rowIndex: number) {
    this.empowermentModelsList.splice(rowIndex, 1);
    this.ProjectsAddForm.get("empowermentModels").setValue(this.empowermentModelsList);
    this.calculateSumProject();
  }

  CalcEmpowermentDollar(row, index) {
    debugger
    if (row.amount > 0) {
      this.empowermentModelsList[index].dollarAmount = (row.amount / this.dollarRate).toFixed(this.decimalPlaces)
    }
    this.calculateSumProject();
  }

  CalcEmpowermentTotal(row) {
    debugger
    if (this.empowermentModelsList.length > 0) {
      this.empJodTotal = 0;
      this.empDollarTotal = 0;
      const element = row;
      element.dollarAmount = (element.amount / this.dollarRate).toFixed(this.decimalPlaces);
      for (let i = 0; i < this.empowermentModelsList.length; i++) {
        let element = this.empowermentModelsList[i];
        let totDinar = Number(element.amount);
        let totDollar = Number(element.dollarAmount);
        this.empJodTotal += totDinar;
        this.empDollarTotal += totDollar;
      }
      this.empJodTotal = this.empJodTotal.toFixed(this.decimalPlaces);
      this.empDollarTotal = this.empDollarTotal.toFixed(this.decimalPlaces);
    }
    else {
      row.total = 0;
      row.dollarTotal = 0;
      this.empJodTotal = 0;
      this.empDollarTotal = 0;
    }
    this.calculateSumProject();
  }

  onisEmpowermentChange(): void {
    this.isSustDevelop = this.isSustDevelop === 0 ? 1 : 0;
    if (this.isSustDevelop == 0) {
      this.ProjectsAddForm.get("empowermentModels").setValue([]);
      this.empowermentModelsList = [];
      this.empJodTotal = 0;
      this.empDollarTotal = 0;
      this.calculateSumProject();
    }
  }

  onAuthChange(value: any) {
    debugger
    if (value > 0) {
      this.AuthorityCountry = this.authoritiesList.find(x => x.id === value)?.data1 || "";
    }
    else {
      this.AuthorityCountry = "";
    }
  }

  filterDistricts(event: any) {
    const selectedGovernorates: number[] = event.value || event || [];

    if (selectedGovernorates.length === 0) {
      this.filteredDistrictList = [];
      this.ProjectsAddForm.get("districtId").setValue([]);
      return;
    }

    // filter by governorates (data1 is string, so convert to number)
    this.filteredDistrictList = this.districtList.filter(d =>
      selectedGovernorates.includes(+d.data1) // convert to number
    );

    // cleanup invalid districts
    const currentDistricts = this.ProjectsAddForm.get("districtId").value || [];
    const validDistricts = currentDistricts.filter(dId =>
      this.filteredDistrictList.some(fd => fd.id === dId)
    );
    this.ProjectsAddForm.get("districtId").setValue(validDistricts);
  }

  filterDistrictsByvalue(value: any) {
    const selectedGovernorates: number[] = value || [];

    if (selectedGovernorates.length === 0) {
      this.filteredDistrictList = [];
      this.ProjectsAddForm.get("districtId").setValue([]);
      return;
    }

    // filter by governorates (data1 is string, so convert to number)
    this.filteredDistrictList = this.districtList.filter(d =>
      selectedGovernorates.includes(+d.data1) // convert to number
    );

    // cleanup invalid districts
    // const currentDistricts = this.ProjectsAddForm.get("districtId").value || [];
    // const validDistricts = currentDistricts.filter(dId =>
    //   this.filteredDistrictList.some(fd => fd.id === dId)
    // );
    // this.ProjectsAddForm.get("districtId").setValue(validDistricts);
  }

  AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.authoritiesList) {
      this.authoritiesList = [];
    }

    // Make sure the array is large enough
    while (this.authoritiesList.length < last) {
      this.authoritiesList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.authoritiesList[i] = this.authoritiesList[i];
    }

    this.loading = false;
  }

  FilterCashDonateType(cashTypeId: number, index: number) {
    debugger
    if (cashTypeId > 0) {
      this.filteredCashDonateTypes[index] = this.cashDonateTypeList.filter(x => x.id == 0 || x.data1 === cashTypeId.toString());
    } else {
      this.filteredCashDonateTypes[index] = [];
    }
  }

  FilterDonationtypes(programTypeId: number, index: number) {
    debugger
    if (programTypeId > 0) {
      this.filtereddonationTypeList[index] = this.donationTypeList.filter(x => x.id == 0 || x.data1 === programTypeId.toString());
    } else {
      this.filtereddonationTypeList[index] = [];
    }
  }

  FilterDonationId(donationId: number, index: number) {
    debugger
    if (donationId > 0) {
      this.filtereddonationIdList[index] = this.helpTypeList.filter(x => x.id == 0 || x.data1 === donationId.toString());
    } else {
      this.filtereddonationIdList[index] = [];
    }
  }

  FilterCity(countryId: number) {
    debugger
    if (countryId > 0) {
      this.filteredCityList = this.citiesList.filter(x => x.id == 0 || x.data1 === countryId.toString());
    } else {
      this.filteredCityList = [];
    }
  }

  ShowDetailsOnly(id: number) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    const url = `/Agreements/AgreementsForm?id=${id}`;
    // Open the URL in a new tab
    window.open(url, '_blank');
    //this.router.navigate(['Agreements/AgreementsForm']);
  }

  onAgreementChange(event: any) {
    debugger
    const selectedId = event.value;
    const selected = this.agreementsList.find(x => x.id === selectedId);
    this.estimatedAmount = selected?.data1 || 0;
    this.ProjectsAddForm.get("estimatedAmount").setValue(this.estimatedAmount);


  }

  AddNewLineMediaFile() {
    this.mediaFilesList.push({
      id: 0,
      projectId: 0, 
      docPath: '',
      description: ''
    });
  }

  deleteRowMediaFile(index: number) {
    this.mediaFilesList.splice(index, 1);
  }
    
  onSelectFolder(event: any, row: ProjectMediaFileModel) {
    debugger
   let path =  this.jwtAuth.getMediaAttachmentsPath();
    
    const files = event.target.files;
    if (files && files.length > 0) {
      
      row.docPath = path + files[0].webkitRelativePath.split('/')[0];
    }
  }

  OnCurrBlur(currRate)
  {
    this.dollarRate = currRate;
    for (let i = 0; i < this.projectCashTypesList.length; i++) {
      let row = this.projectCashTypesList[i];
      this.CalcCashTypesTotal(row);
    }
    for (let i = 0; i < this.donationTypesList.length; i++) {
      let row = this.donationTypesList[i];
      this.CalcDinar(row);
    }
    for (let i = 0; i < this.expensesTypesModelList.length; i++) {
      let row = this.expensesTypesModelList[i];
      this.CalcExpensesDollar(row, i);
    }
    this.calculateSumProject();
  }

  filterMediaOnCash(USDAmount:number)
  {    
    debugger;
    let Amount = 0;
    let curr = this.ProjectsAddForm.value.currencyId;
    let currRate = Number(this.ProjectsAddForm.value.currRate);
    const USDRate = Number(this.currenciesList.find(r => r.id === 2)?.data1) ?? 0;
    Amount = USDAmount / USDRate
    if(Amount > 0 && Amount <= 5000)
      {
        this.filteredMediaReqList = this.mediaRequestedList.filter(r => r.data2 <= 1);
      }
    else if(Amount > 5000 && Amount <= 10000)
      {
        this.filteredMediaReqList = this.mediaRequestedList.filter(r => r.data2 <= 2);
      }
    else if(Amount > 10000 && Amount < 50000)
      {
        this.filteredMediaReqList = this.mediaRequestedList.filter(r => r.data2 <= 5 && r.data2 != 2 );
      }
    else if( Amount > 50000)
      {
        this.filteredMediaReqList = this.mediaRequestedList;
      }
  }

  onAgreementAmountChange(value): void {
    debugger
    const dinarAmount = value;
    
    if (dinarAmount && dinarAmount > 0) {
      this.dealAmountInDollars = (dinarAmount / 0.708).toFixed(2);

    } else {
      this.dealAmountInDollars = "0";
    }
  }

  onDollarChange(value): void {
    debugger;
    const dinarAmount = value;

    if (dinarAmount > 0) {
      const currRate = 0.701;
      const amt = +(dinarAmount * currRate).toFixed(2); // force number

      this.ProjectsAddForm.get('dinarAmount')?.setValue(amt);
    } else {
      this.ProjectsAddForm.get('dinarAmount')?.setValue(0);
    }
  }

  filterauthoritiesByentityId(entityId: number) {
    debugger
    if (entityId > 0) {
      this.filteredAuthoritiesList = this.authoritiesList.filter(x => x.data2 === entityId || x.id === 0);
    } else {
      this.filteredAuthoritiesList = this.authoritiesList;
    }

    const AttributeId = this.ProjectsAddForm.value.authorityAttribute;
    if (AttributeId > 0) {
      this.filteredAuthoritiesList = this.filteredAuthoritiesList.filter(x => x.data3 === AttributeId.toString() || x.id === 0);
    }
  }

  filterauthoritiesByAttribute(attributeId: number) {
    debugger
    if (attributeId > 0) {
      this.filteredAuthoritiesList = this.authoritiesList.filter(x => x.data3 === attributeId.toString() || x.id === 0);
    } else {
      this.filteredAuthoritiesList = this.authoritiesList;
    }
 
    const entityId = this.ProjectsAddForm.value.entityId;
    if (entityId > 0) {
      this.filteredAuthoritiesList = this.filteredAuthoritiesList.filter(x => x.data2 === entityId || x.id === 0);
    }
  }


   PublicDonationChange(value: number | boolean) {
      const val = value === true ? 1 : value === false ? 2 : value;

      if (val === 1) { // مشروع هيئة
        this.ProjectsAddForm.get("projImplTypeId").setValue(0);
        this.ProjectsAddForm.get("implTypeId").setValue(0);        
        this.ProjectsAddForm.get("materialsSourceId").setValue("");
        this.hidePublicDonation = false;
  
      } else if (val === 2) { //  تبرع عام
        this.ProjectsAddForm.get("projImplTypeId").setValue(2);
        this.ProjectsAddForm.get("implTypeId").setValue(4);        
        this.ProjectsAddForm.get("materialsSourceId").setValue([1]);
        this.hidePublicDonation = true;
      }
  
      
    }

}
