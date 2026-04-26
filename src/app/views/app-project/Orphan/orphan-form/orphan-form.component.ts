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
import { OrphanService } from '../orphan.service';
import { formatDate } from '@angular/common';
import { delay, of } from 'rxjs';

@Component({
  selector: 'app-orphan-form',
  templateUrl: './orphan-form.component.html',
  styleUrl: './orphan-form.component.scss'
})
export class OrphanFormComponent {
  public TitlePage: string;
  loading: boolean;
  opType: string;
  voucherId: any;
  OrphanForm: FormGroup;
  disableAll: boolean;
  showLoader = false;
  disableSave: boolean;
  lang: string;
  showsave: boolean;
  Id: any;
  isJordanianOrphan: boolean = false;
  isJordanianGuardian: boolean = false;
  filteredDistrictList: Array<any> = [];
   // Lists 
   OrphanDocTypeList: any;
   GuardianDocTypeList: any;
   DonatingAssoList: any;
   SponsorList: any;
   RelationshipIdList: any;
   GovernorateList: any;
   DistrictList: any;
   AreaList: any;
   PaymentList: any;

    NationalityOrphanList: { id: number; text: string }[] = [
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'أردني' : 'Jordanian' },
    { id: 2, text: this.jwtAuth.getLang() === 'ar' ? 'غير أردني' : 'Non-Jordanian' },
  ];

    NationalityGuardianList: { id: number; text: string }[] = [
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'أردني' : 'Jordanian' },
    { id: 2, text: this.jwtAuth.getLang() === 'ar' ? 'غير أردني' : 'Non-Jordanian' },
  ];

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
      private orphanService: OrphanService,
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

    this.OrphanForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      orphanName: ["", Validators.required],
      orpNationalityId: [0, Validators.pattern('^[1-9][0-9]*')],
      orpDocTypeId: [0, Validators.pattern('^[1-9][0-9]*')],
      orpDocNo: ["", [Validators.required]],
      orpSecurityNo: [""],
      orpCommitteeNo: [""],
      orpRegistrationNo: [""],
      guardianName: ["", Validators.required],
      grNationalityId: [0, Validators.pattern('^[1-9][0-9]*')],
      grDocTypeId: [0, Validators.pattern('^[1-9][0-9]*')],
      grDocNo: ["", [Validators.required]],
      grSecurityNo: [""],
      grCommitteeNo: [""],
      grRegistrationNo: [""],
      sponsorCode: [""],
      orphanNo: [0],
      monthlyValue: [0, [Validators.required , this.greaterThanZeroValidator]],
      warrantyPeriod: [0, [Validators.required, this.greaterThanZeroValidator]],
      totalAmount: [0],
      donatingAssoName: [0],
      sponsor: [0],
      phoneNo1: [""],
      phoneNo2: [""],
      relationshipId: [0],
      address: [""],
      governorateId: [0],
      districtId: [0],
      paymentId: [0],
      cardNo: [""],
    });

    if (this.Id == null || this.Id == undefined || this.Id === "") {
      this.router.navigate(['Orphan/OrphanList']);
    }

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    this.GetInitailOrphan();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('OrphanForm');
    this.title.setTitle(this.TitlePage);
  }

  GetInitailOrphan() {
    this.lang = this.jwtAuth.getLang();
    this.orphanService.GetGetInitailOrphanForm(this.Id, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
      this.router.navigate(['Orphan/OrphanList']);
        return;
      }
      debugger
      this.OrphanDocTypeList = result.orphanDocTypeList;
      this.GuardianDocTypeList = result.guardianDocTypeList;
      this.DonatingAssoList = result.donatingAssoList;
      this.SponsorList = result.sponsorList;
      this.RelationshipIdList = result.relationshipIdList;
      this.GovernorateList = result.governorateList;
      this.DistrictList = result.districtList;
      this.AreaList = result.areaList;
      this.PaymentList = result.paymentList;
      this.OrphanForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        if (this.Id > 0) {

          if (result.orpNationalityId === 1) {
           this.isJordanianOrphan = true;
          }
          if (result.grNationalityId === 1) {
           this.isJordanianGuardian = true;
          }
          if (this.OrphanForm.get("governorateId").value > 0) {
            this.filteredDistrictList = this.DistrictList.filter(x => x.data1 === this.OrphanForm.get("governorateId").value.toString());
          } else {
            this.filteredDistrictList = [];
          }
        }
        else 
        {
          this.OrphanForm.get("orpNationalityId").setValue(1);
          this.OrphanForm.get("orpDocTypeId").setValue(0);
          this.OrphanForm.get("grNationalityId").setValue(1);
          this.OrphanForm.get("grDocTypeId").setValue(0);
          this.OrphanForm.get("donatingAssoName").setValue(0);
          this.OrphanForm.get("sponsor").setValue(0);
          this.OrphanForm.get("relationshipId").setValue(0);
          this.OrphanForm.get("governorateId").setValue(0);
          this.OrphanForm.get("districtId").setValue(0);
          this.OrphanForm.get("paymentId").setValue(0);

         if (result.orpNationalityId === 1) {
           this.isJordanianOrphan = true;
          }
          if (result.grNationalityId === 1) {
           this.isJordanianGuardian = true;
          }
        }
      });
    })
  }

   greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  validatePhoneNumber(phone: string): boolean {
    const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return pattern.test(phone);
  }

  OnSaveForms() {
    debugger
    const tel1 = this.OrphanForm.value.phoneNo1 || '';
    const tel2 = this.OrphanForm.value.phoneNo2 || '';

    if (tel1 !== '' && !this.validatePhoneNumber(tel1)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    if (tel2 !== '' && !this.validatePhoneNumber(tel2)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    if(this.OrphanForm.value.isBreadwinner === true)
    {
      if(this.OrphanForm.value.dependentsNo <= 0)
      {
        this.alert.ShowAlert("msgPleaseEnterdependentsNo", 'error');
        this.disableSave = false;
        return;
      }
    }

    this.OrphanForm.value.companyId = this.jwtAuth.getCompanyId();
    this.OrphanForm.value.userId = this.jwtAuth.getUserId();
    debugger
     this.orphanService.saveOrphan(this.OrphanForm.value).subscribe((result) => {
      debugger
      if (result) {
        this.alert.SaveSuccess();
        this.ClearAfterSave();
        if (this.opType == 'Edit' || this.opType == 'Copy') {
        this.router.navigate(['Orphan/OrphanList']);
        }
        this.Id = 0;
        this.opType = 'Add';
        this.ngOnInit();
      }
      else {
        this.alert.SaveFaild();
      }
    }); 
  }

  ClearAfterSave() {
/*   this.BeneficiarieForm.get("nationalityId").setValue(0);
  this.BeneficiarieForm.get("documentTypeId").setValue(0);
  this.BeneficiarieForm.get("documentNo").setValue(0);
  this.BeneficiarieForm.get("securityNo").setValue("");
  this.BeneficiarieForm.get("committeeNo").setValue("");
  this.BeneficiarieForm.get("registrationNo").setValue("");
  this.BeneficiarieForm.get("benName").setValue("");
  this.BeneficiarieForm.get("birthDate").setValue(formatDate(new Date(), 'yyyy-MM-dd', "en-US"));
  this.BeneficiarieForm.get("genderId").setValue(0);
  this.BeneficiarieForm.get("age").setValue(0);
  this.BeneficiarieForm.get("governorateId").setValue(0);
  this.BeneficiarieForm.get("districtId").setValue(0);
  this.BeneficiarieForm.get("areaId").setValue(0);
  this.BeneficiarieForm.get("address").setValue("");
  this.BeneficiarieForm.get("phoneNo1").setValue("");
  this.BeneficiarieForm.get("phoneNo2").setValue("");
  this.BeneficiarieForm.get("isBreadwinner").setValue(false);
  this.BeneficiarieForm.get("dependentsNo").setValue(0);
  this.BeneficiarieForm.get("notes").setValue(""); */
  }

  onNationalityOrphanChange(event: any): void {
    debugger
    const selectedId = event.value;
    this.isJordanianOrphan = selectedId === 1;
    this.OrphanForm.get("orpDocTypeId").setValue(0);
    this.OrphanForm.get("orpDocNo").setValue(0);
  }

  onNationalityGuardianChange(event: any): void {
    debugger
    const selectedId = event.value;
    this.isJordanianGuardian = selectedId === 1;
    this.OrphanForm.get("grDocTypeId").setValue(0);
    this.OrphanForm.get("grDocNo").setValue(0);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }


  loadLazyOptions(event: any) {
      const { first, last } = event;

      // Don't replace the full list; copy and fill only the needed range
      this.SponsorList ??= [];

      // Make sure the array is large enough
      while (this.SponsorList.length < last) {
          this.SponsorList.push(null);
      }

      for (let i = first; i < last; i++) {
          this.SponsorList[i] = this.SponsorList[i];
      }

      this.loading = false;
  }

  FilterGover(gover: number) {
    debugger
    if (gover > 0) {
      this.filteredDistrictList = this.DistrictList.filter(x => x.data1 === gover.toString());
    } else {
      this.filteredDistrictList = [];
    }
  }
}
