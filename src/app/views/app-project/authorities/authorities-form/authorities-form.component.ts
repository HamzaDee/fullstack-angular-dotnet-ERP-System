import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { AuthoritiesService } from '../authorities.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import Swal from 'sweetalert2';
import { formatDate } from '@angular/common';
import { delay, of } from 'rxjs';
import { AuthoritiesEvaluationComponent } from '../authorities-evaluation/authorities-evaluation.component';

@Component({
  selector: 'app-authorities-form',
  templateUrl: './authorities-form.component.html',
  styleUrl: './authorities-form.component.scss'
})
export class AuthoritiesFormComponent {
  showLoader = false;
  loading: boolean;
  AuthoritiesForm: FormGroup;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(AuthoritiesEvaluationComponent) childAuthoritiesEvaluation: AuthoritiesEvaluationComponent;
  showsave: boolean;
  disableSave: boolean;
  public TitlePage: string;
  public id: any;
  public opType: string;
  disableAll: boolean = false;
  isSaving: boolean = false;
  // List
  public AuthorityClassificationList: any;
  public AuthorityAttributeList: any;
  public StatusOfAuthorityList: any;
  public EntityCategoryList: any;
  public CountryList: any;
  public GovernorateList: any;
  public DistrictList: any;
  public SubDistrictList: any;
  public AreaList: any;
  magDirList: any;
  authEvaluationDTsList: any[] = [];
  filteredCountries: Array<any> = [];
  filtergovernorate: Array<any> = [];
  public HiddenBookNoAndDate: boolean = false;
  isSubmitted = false;


  constructor(private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private AuthoritiesService: AuthoritiesService) { }


  ngOnInit(): void {
    debugger
    this.id = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;

    this.SetTitlePage();
    this.AuthoritiesForm = this.formbulider.group({
      id: [0 || this.id],
      companyId: [0],
      dealName: [""],
      entityName: ["", [Validators.required]],
      entityEName: ["", [Validators.required]],
      entityId: [0, [Validators.required, Validators.min(1)]],
      authorityAttribute: [0, [Validators.required, Validators.min(1)]],
      status: [0, [Validators.required, Validators.min(1)]],
      entityCategory: [0],
      countryId: [0, [Validators.required, Validators.min(1)]],
      governorateId: [0],
      districtId: [0],
      subDistrictId: [0],
      areaId: [0],
      registrationDate: [new Date()],
      detailedAddress: [''],
      mapLng: [0],
      mapLat: [0],
      website: ['', [Validators.pattern('https?://.+'), this.customWebsiteValidator]],
      nationalNo: [""],
      entityManagerName: [""],
      bookNo: [""],
      bookDate: [new Date()],
      notes: [''],
      phone: ["", [Validators.required]],
      fax: ["", [Validators.required]],
      facebook: [""],
      twitter: [""],
      email: [''],
      authorizedPersonName: ["", [Validators.required]],
      authorizedPersonPhone: ["", [Validators.required]],
      authorizedPersonPosition: ["", [Validators.required]],
      idDT: [0],
      ratingCode: [0],
      ratingDateFrom: [new Date()],
      ratingDateTo: [new Date()],
      ratingReason: [""],
      calceledBookNo: [""],
      calceledDate: [new Date()],
      developmentDirectId: [0],
      mobileNo: [0],
      generalAttachModelList: [null],
      authEvaluationDTModelList: [null],
      index: [0],
      inJordan: [false],
      areaName: [""]
    });

    if (this.id == null || this.id == undefined || this.id === "") {
      this.router.navigate(['Authorities/AuthoritiesList']);
    }

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    this.GetAuthoritiesInfo();

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AuthoritiesForm');
    this.title.setTitle(this.TitlePage);
  }

  GetAuthoritiesInfo() {
    debugger
    this.HiddenBookNoAndDate = true;
    this.AuthoritiesService.getAuthoritiesModelInfo(this.id, this.opType).subscribe(result => {
      debugger

      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Authorities/AuthoritiesList']);
        return;
      }
      result.registrationDate = formatDate(result.registrationDate, "yyyy-MM-dd", "en-US");
      result.bookDate = formatDate(result.bookDate, "yyyy-MM-dd", "en-US");
      result.calceledDate = formatDate(result.calceledDate, "yyyy-MM-dd", "en-US");
      this.AuthoritiesForm.get('ratingDateFrom')?.setValue(formatDate(new Date(), 'yyyy-MM-dd', 'en-US'));
      this.AuthoritiesForm.get('ratingDateTo')?.setValue(formatDate(new Date(), 'yyyy-MM-dd', 'en-US'));
      this.AuthorityClassificationList = result.authorityClassificationList;
      this.AuthorityAttributeList = result.authorityAttributeList;
      this.StatusOfAuthorityList = result.statusOfAuthorityList;
      this.EntityCategoryList = result.entityCategoryList;
      this.CountryList = result.countryList;
      this.GovernorateList = result.governorateList;
      this.DistrictList = result.districtList;
      this.SubDistrictList = result.subDistrictList;
      this.AreaList = result.areaList;
      this.authEvaluationDTsList = result.authEvaluationDTModelList;
      this.magDirList = result.developmentDirectList;
      if (result.status == 212) {
        this.HiddenBookNoAndDate = false;
      }
      else {
        this.HiddenBookNoAndDate = true;
      }

      // بعد جلب البيانات
      this.AuthoritiesForm.patchValue(result);

      // استدعاء onInJordanChange حسب القيمة الفعلية
      if (result.inJordan === true) {
        this.onInJordanChange(1);
      } else {
        this.onInJordanChange(2);
      }


      if (result.authEvaluationDTModelList != null) {
        debugger
        let index = 0;
        this.authEvaluationDTsList = result.authEvaluationDTModelList;
        this.authEvaluationDTsList.forEach(element => {
          this.authEvaluationDTsList[index].ratingDateFrom = element.ratingDateFrom === null ? null : formatDate(element.ratingDateFrom, "yyyy-MM-dd", "en-US");
          this.authEvaluationDTsList[index].ratingDateTo = element.ratingDateTo === null ? null : formatDate(element.ratingDateTo, "yyyy-MM-dd", "en-US");
          index++;
        });
      }

      this.childAuthoritiesEvaluation.authEvaluationDTsList = result.authEvaluationDTModelList;

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.AuthoritiesForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if (this.id > 0) {

          if (result.inJordan == true) {
            this.AuthoritiesForm.patchValue({ inJordan: 1 });
          }

          if (result.inJordan == false) {
            this.AuthoritiesForm.patchValue({ inJordan: 2 });
          }

          if (result.areaName) {
            this.AuthoritiesForm.get('areaName')?.setValue(result.areaName);
          }

        }
        else {
          this.AuthoritiesForm.get('entityCategory')?.setValue(-1);
          this.AuthoritiesForm.get('governorateId')?.setValue(-1);
          this.AuthoritiesForm.get('developmentDirectId')?.setValue(0);

          if (result.inJordan == true) {
            this.AuthoritiesForm.patchValue({ inJordan: 1 });
          }

          if (result.inJordan == false) {
            this.AuthoritiesForm.patchValue({ inJordan: 2 });
          }
        }
      });
    });
  }

  onInJordanChange(value: number | boolean) {
    const val = value === true ? 1 : value === false ? 2 : value;

    const fax = this.AuthoritiesForm.get('fax');
    const mobile = this.AuthoritiesForm.get('mobileNo');
    const authName = this.AuthoritiesForm.get('authorizedPersonName');
    const authPhone = this.AuthoritiesForm.get('authorizedPersonPhone');
    const authPosition = this.AuthoritiesForm.get('authorizedPersonPosition');
    const areaName = this.AuthoritiesForm.get('areaName');
    const entityManagerName = this.AuthoritiesForm.get('entityManagerName');
    const bookNo = this.AuthoritiesForm.get('bookNo');
    const bookDate = this.AuthoritiesForm.get('bookDate');

    [fax, mobile, authName, authPhone, authPosition, areaName, entityManagerName, bookNo, bookDate]
      .forEach(c => c?.clearValidators());


    mobile?.setValidators([Validators.required]);

    if (val === 1) { // داخل الأردن
      authName?.setValidators([Validators.required]);
      authPhone?.setValidators([Validators.required]);
      authPosition?.setValidators([Validators.required]);
      entityManagerName?.setValidators([Validators.required]);
      bookNo?.setValidators([Validators.required]);
      bookDate?.setValidators([Validators.required]);
      areaName?.setValue('');

    } else if (val === 2) { // خارج الأردن
      authName?.setValidators([Validators.required]);
      authPhone?.setValidators([Validators.required]);
      authPosition?.setValidators([Validators.required]);
      areaName?.setValidators([Validators.required]);
    }

    [fax, mobile, authName, authPhone, authPosition, areaName, entityManagerName, bookNo, bookDate]
      .forEach(c => c?.updateValueAndValidity());
  }




  isInvalid(controlName: string): boolean {
    const ctrl = this.AuthoritiesForm.get(controlName);
    if (!ctrl) return false;

    return ctrl.hasError('required') &&
      (ctrl.touched || this.isSubmitted);
  }


  AddNewLine(id) {
    debugger
    let isValid = true;
    this.disableSave = true;
    if (this.AuthoritiesForm.value.ratingCode == 0 || this.AuthoritiesForm.value.ratingCode == null) {
      isValid = false;
      this.alert.ShowAlert("msgEnterratingCode", 'error');
      this.disableSave = false;
      return;
    }
    if (this.AuthoritiesForm.value.ratingReason == null || this.AuthoritiesForm.value.ratingReason == undefined || this.AuthoritiesForm.value.ratingReason == '') {
      isValid = false;
      this.alert.ShowAlert("msgEnterratingReason", 'error');
      this.disableSave = false;
      return;
    }
    if (this.AuthoritiesForm.value.ratingDateFrom == null || this.AuthoritiesForm.value.ratingReason == '') {
      isValid = false;
      this.alert.ShowAlert("msgEnterratingDateFrom", 'error');
      this.disableSave = false;
      return;
    }
    if (this.AuthoritiesForm.value.ratingDateTo == null || this.AuthoritiesForm.value.ratingDateTo == '') {
      isValid = false;
      this.alert.ShowAlert("msgEnterratingDateTo", 'error');
      this.disableSave = false;
      return;
    }


    if (id > 0) {

    }
    else {
      this.authEvaluationDTsList.push(
        {
          ratingCode: this.AuthoritiesForm.value.ratingCode,
          ratingDateFrom: this.AuthoritiesForm.value.ratingDateFrom,
          ratingDateTo: this.AuthoritiesForm.value.ratingDateTo,
          ratingReason: this.AuthoritiesForm.value.ratingReason,
        });
      this.AuthoritiesForm.get("authEvaluationDTModelList").setValue(this.authEvaluationDTsList);
    }


  }

  updateRow(row, rowIndex: number) {
    debugger
    this.AuthoritiesForm.patchValue({
      ratingCode: row.ratingCode,
      ratingDateFrom: row.ratingDateFrom,
      ratingDateTo: row.ratingDateTo,
      ratingReason: row.ratingReason,
      index: rowIndex
    });
    this.disableSave = false;
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.authEvaluationDTsList.splice(rowIndex, 1);
    }
  }

  isEmpty(input) {
    return input === '' || input === null || input === undefined;
  }

  private customWebsiteValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && !/^https?:\/\//.test(control.value)) {
      return { invalidWebsite: true };
    }
    return null;
  }

  validatePhoneNumber(phone: string): boolean {
    const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return pattern.test(phone);
  }

  
 validateMobileNumber (mobileNo: string): boolean {
    const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return pattern.test(mobileNo);
  }

  validateEmail(email: string): boolean {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  }

  OnSaveForms() {
    debugger
    let isValid = true;
    this.disableSave = true;
    this.isSubmitted = true;

    if (this.AuthoritiesForm.value.inJordan == 1) {
      this.AuthoritiesForm.value.inJordan = true;
    }

    if (this.AuthoritiesForm.value.inJordan == 2) {
      this.AuthoritiesForm.value.inJordan = false;
    }



    if (this.CheckValidation(this.AuthoritiesForm.value)) {
      debugger
      isValid = false;
    }
    if (isValid) {
      if (!this.validateEmail(this.AuthoritiesForm.value.email)) {
        this.alert.ShowAlert("msgInvalidemailformat", 'error');
        isValid = false;
        this.disableSave = false;
        return;
      }
      if (this.opType == 'Add') {
        this.AuthoritiesForm.value.id = 0;
      }

      this.AuthoritiesForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      this.AuthoritiesForm.value.authEvaluationDTModelList = this.childAuthoritiesEvaluation.GetData();
      this.AuthoritiesForm.value.authEvaluationDTModelList.forEach(element => {
        if (element.ratingDateFrom > element.ratingDateTo) {
          this.alert.ShowAlert("TheFromDateOfTheratingMustBeGreaterThanTheToDate", 'error');
          this.disableSave = false;
          isValid = false;
          return false;
        }
      });
      this.AuthoritiesService.saveAuthorities(this.AuthoritiesForm.value).subscribe((result) => {
        debugger
        if (result.isSuccess) {
          this.alert.SaveSuccess();
          this.ClearAfterSave();
          this.router.navigate(['Authorities/AuthoritiesList']);
          this.disableSave = false;
          this.ngOnInit();
        } else {
          this.alert.SaveFaild();
          this.disableSave = false;
        }
        this.disableSave = false;
      }, (error) => {
        //this.isSaving = false;
        this.disableSave = false;
      });
    }
    else {
      this.disableSave = false;
    }
  }

  ClearAfterSave() {
    this.AuthoritiesForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    this.AuthoritiesForm.get('registrationDate').setValue(currentDate);
    this.AuthoritiesForm.get('bookDate').setValue(currentDate);
    this.AuthoritiesForm.get('ratingDateFrom').setValue(currentDate);
    this.AuthoritiesForm.get('ratingDateTo').setValue(currentDate);
    this.AuthoritiesForm.get('calceledDate').setValue(currentDate);
    this.AuthoritiesForm.value.entityName = '';
    this.AuthoritiesForm.value.entityEName = '';
    this.AuthoritiesForm.value.entityId = 0;
    this.AuthoritiesForm.value.authorityAttribute = 0;
    this.AuthoritiesForm.value.status = 0;
    this.AuthoritiesForm.value.entityCategory = 0;
    this.AuthoritiesForm.value.countryId = 0;
    this.AuthoritiesForm.value.governorateId = 0;
    this.AuthoritiesForm.value.DistrictList = 0;
    this.AuthoritiesForm.value.subDistrictId = 0;
    this.AuthoritiesForm.value.areaId = 0;
    this.AuthoritiesForm.value.detailedAddress = '';
    this.AuthoritiesForm.value.mapLng = 0;
    this.AuthoritiesForm.value.mapLat = 0;
    this.AuthoritiesForm.value.website = '';
    this.AuthoritiesForm.value.nationalNo = '';
    this.AuthoritiesForm.value.entityManagerName = '';
    this.AuthoritiesForm.value.bookNo = 0;
    this.AuthoritiesForm.value.notes = '';
    this.AuthoritiesForm.value.phone = '';
    this.AuthoritiesForm.value.fax = '';
    this.AuthoritiesForm.value.facebook = '';
    this.AuthoritiesForm.value.twitter = '';
    this.AuthoritiesForm.value.email = '';
    this.AuthoritiesForm.value.authorizedPersonName = '';
    this.AuthoritiesForm.value.authorizedPersonPhone = '';
    this.AuthoritiesForm.value.authorizedPersonPosition = '';
    this.AuthoritiesForm.value.ratingCode = 0;
    this.AuthoritiesForm.value.ratingReason = '';
    this.AuthoritiesForm.value.calceledBookNo = '';
    this.AuthoritiesForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    this.authEvaluationDTsList = [];
  }

  DeleteAuthoritie(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.AuthoritiesService.deleteAuthorities(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['Authorities/AuthoritiesList']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {

            this.alert.DeleteFaild();
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  getBookInfo(event: any) {              
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    if (selectedValue == 212) {
      this.HiddenBookNoAndDate = false;
    }
    else {
      this.HiddenBookNoAndDate = true;
    }

  }

  Filtercountries(country: number) {
    debugger
    if (country > 0) {
      this.filteredCountries = this.GovernorateList.filter(x => x.data1 === country.toString());
    } else {
      this.filteredCountries = [];
    }
  }

  Filtergovernorate(governorate: number) {
    debugger
    if (governorate > 0) {
      this.filtergovernorate = this.DistrictList.filter(x => x.data1 === governorate.toString());
    } else {
      this.filtergovernorate = [];
    }
  }

  getGoogleMapLink(): string {
    const lat = this.AuthoritiesForm.get('mapLat')?.value;
    const lng = this.AuthoritiesForm.get('mapLng')?.value;
    if (!lat || !lng) return '';

    return `https://maps.google.com/maps?q=${lat},${lng}&z=17&hl=en`;
  }

  CheckValidation(form: any) {
    debugger

    // تحقق من الحقول المطلوبة ديناميكياً حسب داخل/خارج الأردن
    if (form.inJordan === 1) { // داخل الأردن
      if (!form.mobileNo) {
        this.alert.ShowAlert("PleaseInsertMobile", 'error');
        return true;
      }
    } else if (form.inJordan === 2) { // خارج الأردن
      if (!form.fax) {
        this.alert.ShowAlert("PleaseInsertFaxNumber", 'error');
        return true;
      }
      if (!form.entityManagerName) {
        this.alert.ShowAlert("PleaseInsertEntityManagerName", 'error');
        return true;
      }
      if (!form.bookNo) {
        this.alert.ShowAlert("PleaseInsertCaseBookNumber", 'error');
        return true;
      }
      if (!form.bookDate) {
        this.alert.ShowAlert("PleaseInsertBookDate", 'error');
        return true;
      }
      if (!form.areaName) {
        this.alert.ShowAlert("PleaseInsertAreaName", 'error');
        return true;
      }
    }

    // باقي التحقق الحالي
    const checks: { cond: () => boolean; msg: string }[] = [
      { cond: () => !form.entityName, msg: "PleaseInsertEntityNameAr" },
      { cond: () => !form.entityEName, msg: "PleaseInsertEntityNameEn" },
      { cond: () => !form.authorityAttribute, msg: "PleaseInsertAuthorityAttribute" },
      { cond: () => !form.countryId, msg: "PleaseInsertCountry" },
      // { cond: () => !form.nationalNo, msg: "PleaseInsertNationalNo" },
      { cond: () => !form.email, msg: "PleaseEnterEmail" },
      { cond: () => !form.authorizedPersonName, msg: "PleaseInsertNameOfAuthorizedPerson" },
      { cond: () => !form.authorizedPersonPhone, msg: "PleaseInsertAuthorizedPersonPhone" },
      { cond: () => !form.authorizedPersonPosition, msg: "PleaseInsertAuthorizedPersonPosition" },
    ];

    for (const check of checks) {
      if (check.cond()) {
        this.alert.ShowAlert(check.msg, "error");
        return true;
      }
    }

    if (this.AuthoritiesForm.value.status == 212) {
      if (!this.AuthoritiesForm.value.calceledBookNo) {
        this.alert.ShowAlert("msgEntercalceledBookNo", 'error');
        return true;
      }
      if (!this.AuthoritiesForm.value.calceledDate) {
        this.alert.ShowAlert("msgEntercalceledDate", 'error');
        return true;
      }
    }

    const phone = this.AuthoritiesForm.value.phone || '';
    if (phone !== '' && !this.validatePhoneNumber(phone)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return true;
    }

            const mobileNo = this.AuthoritiesForm.value.mobileNo || '';
    if (mobileNo !== '' && !this.validateMobileNumber(mobileNo)) {
      this.alert.ShowAlert("msgDontEnterLattersMobile", 'error');
      return true;
    }

    return false;
  }


}
