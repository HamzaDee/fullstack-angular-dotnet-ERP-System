import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { sweetalert } from 'sweetalert';
import { BeneficiariesService } from '../beneficiaries.service';
import { delay, of } from 'rxjs';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-beneficiarie-form',
  templateUrl: './beneficiarie-form.component.html',
  styleUrl: './beneficiarie-form.component.scss'
})
export class BeneficiarieFormComponent {
  public TitlePage: string;
  loading: boolean;
  opType: string;
  voucherId: any;
  BeneficiarieForm: FormGroup;
  disableAll: boolean;
  showLoader = false;
  disableSave: boolean;
  lang: string;
  showsave: boolean;
  isJordanian: boolean = false;
  Id: any;
  filteredDistrictList: Array<any> = [];
  isBreadwinner: number = 0;
  isSpecialNeed: number = 0;
  isOtherIncomeSource: number = 0;
  isJordanianGuardian: boolean = false;
  Typeofsponsorship:number = 1;
  benData:any =[];
  benConVouchersList:any;
  //list
  NationalityList: { id: number; text: string }[] = [
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'أردني' : 'Jordanian' },
    { id: 2, text: this.jwtAuth.getLang() === 'ar' ? 'غير أردني' : 'Non-Jordanian' },
  ];

  GenderList: { id: number; text: string }[] = [
    { id: 0, text: this.jwtAuth.getLang() === 'ar' ? 'اختر' : 'Choose' },
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'انثى' : 'Female' },
    { id: 2, text: this.jwtAuth.getLang() === 'ar' ? ' ذكر' : 'Male' },
  ];

  GovernorateList: any;
  DistrictList: any;
  AreaList: any;
  IdentityProofList: any;
  AuthorityList: any;
  IntermediaryList: any;
  SupportTypeList: any;
  SupportWayList: any;
  GrNationalityList: any;
  GuardianDocTypeList: any;
  RelationshipIdList: any;
  IncomeSourceList: any;
  GuaranteesList: any;

  isSample: boolean = true; // عيني
  isCash: boolean = false; // نقدي
  isGuarantees: boolean = false; // كفالات


  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private beneficiariesService: BeneficiariesService,
      private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.SetTitlePage();

    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.Id = queryParams.get('GuidToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else {
      this.Id = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.Id = 0;
    }

    this.BeneficiarieForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      nationalityId: [1, Validators.pattern('^[1-9][0-9]*')],
      documentTypeId: [0, Validators.pattern('^[1-9][0-9]*')],
      documentNo: ["", [Validators.required]],
      securityNo: [""],
      committeeNo: [""],
      registrationNo: [""],
      benName: ["", Validators.required],
      birthDate: [""],
      genderId: [0, Validators.pattern('^[1-9][0-9]*')],
      age: [0],
      governorateId: [0],
      districtId: [0],
      areaId: [0],
      address: [""],
      phoneNo1: [""],
      phoneNo2: [""],
      isBreadwinner: [false, Validators.required],
      dependentsNo: [0],
      notes: [""],
      donorId: [0],
      intermediaryId: [0],
      supportType: [0],
      totalAmount: [0],
      supportWay: [0],
      cardNo: [0],
      serviceProvider: [""],
      sponsorCode: [""],
      sponsorNo: [0],
      guardianName: [""],
      grNationalityId: [0],
      grDocTypeId: [0],
      grDocNo: [""],
      grSecurityNo: [""],
      grCommitteeNo: [""],
      grRelationshipId: [0],
      grPhoneNo: [""],
      malesNo: [0],
      femalesNo: [0],
      malesNoLess18: [0],
      femalesNoLess18: [0],
      housingType: [""],
      isSpecialNeed: [false],
      specialNeed: [""],
      incomeSource: [0],
      monthlyIncomeAmt: [0],
      isOtherIncomeSource: [false],
      otherIncomeSource: [""],

    });

    if (this.Id == null || this.Id == undefined || this.Id === "") {
      this.router.navigate(['Beneficiaries/BeneficiariesList']);
    }

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    this.GetInitailBeneficiarie();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('BeneficiarieForm');
    this.title.setTitle(this.TitlePage);
  }

  GetInitailBeneficiarie() {
    this.lang = this.jwtAuth.getLang();
    this.beneficiariesService.GetBeneficiarieForm(this.Id, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Beneficiaries/BeneficiariesList']);
        return;
      }
      debugger
      result.nationalityId = result.nationalityId;
      result.grNationalityId = result.grNationalityId;
      result.birthDate = result.birthDate == null ? null : formatDate(result.birthDate, "yyyy-MM-dd", "en-US");
      this.IdentityProofList = result.identityProofList;
      this.GovernorateList = result.governorateList;
      this.DistrictList = result.districtList;
      this.AreaList = result.areaList;
      this.AuthorityList = result.authorityList;
      this.IntermediaryList = result.authorityList;
      this.SupportTypeList = result.supportTypeList;
      this.SupportWayList = result.supportWayList;
      this.GuardianDocTypeList = result.guardianDocTypeList;
      this.RelationshipIdList = result.relationshipIdList;
      this.IncomeSourceList = result.incomeSourceList;
      this.GuaranteesList = result.guaranteesList;
      debugger
      this.benConVouchersList = result.benConVouchersList;
      this.BeneficiarieForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        if (this.Id > 0) {
          if (result.nationalityId === 1) { this.isJordanian = true; }
          if (result.grNationalityId === 1) { this.isJordanianGuardian = true; }


          // sample = 277 
          if (result.supportType === 6772) {
            this.isSample = true;
            this.isCash = false;
            this.isGuarantees = false;
          }// cash = 278
          else if (result.supportType === 6771) {
            this.isSample = false;
            this.isCash = true;
            this.isGuarantees = false;
          }// Guarantees = 279
          else if (result.supportType === 6773) {
            this.isSample = false;
            this.isCash = false;
            this.isGuarantees = true;
          }


          this.BeneficiarieForm.get("nationalityId").setValue(result.nationalityId);
          this.BeneficiarieForm.get("grNationalityId").setValue(result.grNationalityId);
          this.BeneficiarieForm.get("supportType").setValue(result.supportType);
          this.BeneficiarieForm.get("documentTypeId").setValue(result.documentTypeId);
          this.BeneficiarieForm.get("governorateId").setValue(result.governorateId);
          this.BeneficiarieForm.get("districtId").setValue(result.districtId);
          this.BeneficiarieForm.get("areaId").setValue(result.areaId);
          this.BeneficiarieForm.get("genderId").setValue(result.genderId);
          this.BeneficiarieForm.get("donorId").setValue(result.donorId);
          this.BeneficiarieForm.get("intermediaryId").setValue(result.intermediaryId);
          this.BeneficiarieForm.get("supportWay").setValue(result.supportWay);
          this.BeneficiarieForm.get("grDocTypeId").setValue(result.grDocTypeId);
          this.BeneficiarieForm.get("grRelationshipId").setValue(result.grRelationshipId);
          this.BeneficiarieForm.get("incomeSource").setValue(result.incomeSource);
          if (this.BeneficiarieForm.get("governorateId").value > 0) {
            this.filteredDistrictList = this.DistrictList.filter(x => x.data1 === this.BeneficiarieForm.get("governorateId").value.toString());
          } else {
            this.filteredDistrictList = [];
          }
        }
        else {
          if (result.nationalityId === 1) { this.isJordanian = true; }
          if (result.grNationalityId === 1) { this.isJordanianGuardian = true; }
          this.BeneficiarieForm.get("supportType").setValue(0);
          this.BeneficiarieForm.get("documentTypeId").setValue(0);
          this.BeneficiarieForm.get("governorateId").setValue(0);
          this.BeneficiarieForm.get("districtId").setValue(0);
          this.BeneficiarieForm.get("areaId").setValue(0);
          this.BeneficiarieForm.get("genderId").setValue(0);
          this.BeneficiarieForm.get("donorId").setValue(0);
          this.BeneficiarieForm.get("intermediaryId").setValue(0);
          this.BeneficiarieForm.get("supportWay").setValue(0);
          this.BeneficiarieForm.get("grDocTypeId").setValue(0);
          this.BeneficiarieForm.get("grRelationshipId").setValue(0);
          this.BeneficiarieForm.get("incomeSource").setValue(0);
        }
      });
    })
  }

  validatePhoneNumber(phone: string): boolean {
    const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return pattern.test(phone);
  }

  OnSaveForms() {
    debugger
    const tel1 = this.BeneficiarieForm.value.phoneNo1 || '';
    const tel2 = this.BeneficiarieForm.value.phoneNo2 || '';

    if (tel1 !== '' && !this.validatePhoneNumber(tel1)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    if (tel2 !== '' && !this.validatePhoneNumber(tel2)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    if (this.BeneficiarieForm.value.isBreadwinner === true) {
      if (this.BeneficiarieForm.value.dependentsNo <= 0) {
        this.alert.ShowAlert("msgPleaseEnterdependentsNo", 'error');
        this.disableSave = false;
        return;
      }
    }

    if (this.BeneficiarieForm.value.isSpecialNeed === true) {
      if (this.BeneficiarieForm.value.specialNeed === "" || this.BeneficiarieForm.value.specialNeed === null || this.BeneficiarieForm.value.specialNeed === undefined) {
        this.alert.ShowAlert("msgPleaseEnterspecialNeed", 'error');
        this.disableSave = false;
        return;
      }
    }

    if (this.BeneficiarieForm.value.isOtherIncomeSource === true) {
      if (this.BeneficiarieForm.value.otherIncomeSource === "" || this.BeneficiarieForm.value.otherIncomeSource === null || this.BeneficiarieForm.value.otherIncomeSource === undefined) {
        this.alert.ShowAlert("msgPleaseEnterotherIncomeSource", 'error');
        this.disableSave = false;
        return;
      }
    }

    this.BeneficiarieForm.value.companyId = this.jwtAuth.getCompanyId();
    this.BeneficiarieForm.value.userId = this.jwtAuth.getUserId();
    debugger
    this.beneficiariesService.SaveBeneficiarie(this.BeneficiarieForm.value).subscribe((result) => {
      debugger
      if (result) {
        this.alert.SaveSuccess();
        this.ClearAfterSave();
        if (this.opType == 'Edit' || this.opType == 'Copy') {
          this.router.navigate(['Beneficiaries/BeneficiariesList']);
        }
        this.Id = 0;
        this.opType = 'Add';
        this.ngOnInit();
      }
      else {
        this.alert.SaveFaild();
      }
    })
  }

  ClearAfterSave() {
    this.BeneficiarieForm.get("nationalityId").setValue(0);
    this.BeneficiarieForm.get("documentTypeId").setValue(0);
    this.BeneficiarieForm.get("documentNo").setValue(0);
    this.BeneficiarieForm.get("securityNo").setValue("");
    this.BeneficiarieForm.get("committeeNo").setValue("");
    this.BeneficiarieForm.get("registrationNo").setValue("");
    this.BeneficiarieForm.get("benName").setValue("");
    this.BeneficiarieForm.get("birthDate").setValue("");
    this.BeneficiarieForm.get("phoneNo1").setValue("");
    this.BeneficiarieForm.get("phoneNo2").setValue("");
    this.BeneficiarieForm.get("address").setValue("");
    this.BeneficiarieForm.get("governorateId").setValue(0);
    this.BeneficiarieForm.get("districtId").setValue(0);
    this.BeneficiarieForm.get("areaId").setValue(0);
    this.BeneficiarieForm.get("genderId").setValue(0);
    this.BeneficiarieForm.get("donorId").setValue(0);
    this.BeneficiarieForm.get("intermediaryId").setValue(0);
    this.BeneficiarieForm.get("supportType").setValue(0);
    this.BeneficiarieForm.get("totalAmount").setValue(0);
    this.BeneficiarieForm.get("supportWay").setValue(0);
    this.BeneficiarieForm.get("cardNo").setValue(0);
    this.BeneficiarieForm.get("serviceProvider").setValue("");
    this.BeneficiarieForm.get("sponsorCode").setValue("");
    this.BeneficiarieForm.get("sponsorNo").setValue(0);
    this.BeneficiarieForm.get("guardianName").setValue("");
    this.BeneficiarieForm.get("grNationalityId").setValue(0);
    this.BeneficiarieForm.get("grDocTypeId").setValue(0);
    this.BeneficiarieForm.get("grDocNo").setValue("");
    this.BeneficiarieForm.get("grSecurityNo").setValue("");
    this.BeneficiarieForm.get("grCommitteeNo").setValue("");
    this.BeneficiarieForm.get("grRelationshipId").setValue(0);
    this.BeneficiarieForm.get("grPhoneNo").setValue("");
    this.BeneficiarieForm.get("isBreadwinner").setValue(0);
    this.BeneficiarieForm.get("dependentsNo").setValue(0);
    this.BeneficiarieForm.get("malesNo").setValue(0);
    this.BeneficiarieForm.get("malesNoLess18").setValue(0);
    this.BeneficiarieForm.get("femalesNo").setValue(0);
    this.BeneficiarieForm.get("femalesNoLess18").setValue(0);
    this.BeneficiarieForm.get("housingType").setValue("");
    this.BeneficiarieForm.get("isSpecialNeed").setValue(0);
    this.BeneficiarieForm.get("specialNeed").setValue("");
    this.BeneficiarieForm.get("incomeSource").setValue(0);
    this.BeneficiarieForm.get("monthlyIncomeAmt").setValue(0);
    this.BeneficiarieForm.get("isOtherIncomeSource").setValue(0);
    this.BeneficiarieForm.get("otherIncomeSource").setValue("");
  }

  onNationalityChange(event: any): void {
    debugger
    const selectedId = event.value;
    this.isJordanian = selectedId === 1;
    this.BeneficiarieForm.get("documentTypeId").setValue(0);
    this.BeneficiarieForm.get("documentNo").setValue(0);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  checkIsBreadwinner(event: Event) {
    debugger
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    if (isChecked == false) {
      this.BeneficiarieForm.get("dependentsNo").setValue(0);
    }
  }

  FilterGover(gover: number) {
    debugger
    if (gover > 0) {
      this.filteredDistrictList = this.DistrictList.filter(x => x.data1 === gover.toString());
    } else {
      this.filteredDistrictList = [];
    }
  }

  onNationalityGuardianChange(event: any): void {
    debugger
    const selectedId = event.value;
    this.isJordanianGuardian = selectedId === 1;
    this.BeneficiarieForm.get("grDocTypeId").setValue(0);
    this.BeneficiarieForm.get("grDocNo").setValue(0);
  }

  checkIsSpecialNeed(event: Event) {
    debugger
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    if (isChecked == false) {
      this.BeneficiarieForm.get("specialNeed").setValue("");
    }
  }

  checkisOtherIncomeSource(event: Event) {
    debugger
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    if (isChecked == false) {
      this.BeneficiarieForm.get("otherIncomeSource").setValue("");
    }
  }

  OnChangeSupportType(event: any): void {
    debugger
    
    const selectedId = event.value;
    if (selectedId === 0) {
      this.isSample = true;
      this.isCash = true;
      this.isGuarantees = true;
    }
    // sample = 277 
    else if (selectedId === 6772) {
      this.isSample = true;
      this.isCash = false;
      this.isGuarantees = false;
    }// cash = 278
    else if (selectedId === 6771) {
      this.isSample = false;
      this.isCash = true;
      this.isGuarantees = false;
    }// Guarantees = 279
    else if (selectedId === 6773) {
      this.isSample = false;
      this.isCash = false;
      this.isGuarantees = true;
    }
  }
}
