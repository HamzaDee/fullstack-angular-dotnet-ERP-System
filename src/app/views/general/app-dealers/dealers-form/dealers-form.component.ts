import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { DealersService } from '../dealers.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-dealers-form',
  templateUrl: './dealers-form.component.html',
  styleUrls: ['./dealers-form.component.scss']
})
export class DealersFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  cardImageBase64: string;
  file: File;
  DealersAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  classificationList: any;
  categoryList: any;
  priceCategoryList: any;
  dealerTypesList: any;
  suppliersTypesList: any;
  accountsList: any;
  currencyList: any;
  deliverytermList: any;
  paymenttermList: any;
  limitspolicyList: any
  countryList: any;
  cityList: Array<any> = [];
  areaList: Array<any> = [];
  allCitiesList: any;
  allAreasList: any;
  dealerAddressList: any[] = [];
  dealerContactList: any[] = [];
  dealersBranchesList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  voucherId: any;
  imagePath = "assets/images/defualt-upload.png";
  isTax: number;
  active: number;
  agent: number;
  iscash: number;
  isHidden: boolean;
  type: any;
  Classification: string;
  dealerType: string;
  DealerNo: string;
  Category: string;
  issupplier: boolean;
  disableAll: boolean = false;
  image: any;
  swift: any;
  bankName: any;
  iban: any;
  bankAccNo: any;
  employeesList: any;
  leadId: number;
  public opType: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private dealerService: DealersService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private appCommonserviceService: AppCommonserviceService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly  route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    debugger
    this.route.queryParams.subscribe((params: Params) => {

    if (params['leadId']) {
      this.leadId = +params['leadId'];
      this.voucherId = 0;
      this.opType = 'Add';
      this.isHidden = false;
      this.type = 1;     
    } else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.isHidden = this.routePartsService.Guid2ToEdit;
      this.type = this.routePartsService.Guid3ToEdit;
      this.opType = this.routePartsService.Guid4ToEdit;
    }

  });

    setTimeout(() => {
      if (this.isHidden == true) {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });


    if (this.type == 1) {
      this.Classification = 'CustomerClassification';
      this.dealerType = 'CustomerType';
      this.Category = 'CustomerCategory'
      this.DealerNo = 'CustomerNo';
    }
    else {
      this.Classification = 'SupplierClassification';
      this.dealerType = 'SupplierType';
      this.Category = 'SupplierCategory'
      this.DealerNo = 'SupplierNO';
    }
    // this.opType = this.routePartsService.Guid2ToEdit;

    if (this.type == 1) {
      this.SetTitlePage1();
    }
    else {
      this.SetTitlePage();
    }
    debugger
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      if (this.type == 1) {
        this.router.navigate(['Dealers/GetCustomersList']);
      }
      else {
        this.router.navigate(['Dealers/GetDealersList']);
      }

    }
    this.InitiailEntryVoucherForm();
    this.GetInitailEntryVoucher();

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
    this.TitlePage = this.translateService.instant('DealersForm');
    this.title.setTitle(this.TitlePage);
  }

  SetTitlePage1() {
    this.TitlePage = this.translateService.instant('DealersForm1');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.DealersAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      nameA: ["", [Validators.required]],
      nameE: ["", [Validators.required]],
      classId: [0],
      dealerTypeId: [0],
      dealerNo: [""],
      categoryId: [0],
      priceCategoryId: [0],
      accountId: [0, [Validators.required, Validators.min(1)]],
      currencyId: [0],
      deliveryTermId: [0],
      paymentTermId: [0],
      tel1: [""],
      tel2: [""],
      website: ['', [Validators.pattern('https?://.+'), this.customWebsiteValidator]],
      email: ['', [Validators.email, this.customEmailValidator]],
      nationalNo: [""],
      fax: [""],
      allowedLimit: [0],
      allowedCheques: [0],
      limitPolicy: [0],
      startDateDealing: [""],
      note: [""],
      isTaxable: [0],
      isActive: [0],
      isAgent: [0],
      logo: [""],
      dealersAddressesModelList: [null],
      dealersContactModelList: [null],
      accVouchersDocModelList: [null],
      dealersBranchesModelList: [null],
      dealeraddressList: [""],
      dealerContactList: [""],
      dealerBranchesList: [""],
      dealersDocList: [""],
      image: [null],
      taxNo: [''],
      poBox: [''],
      swift: [''],
      bankName: [''],
      iban: [''],
      bankAccNo: [''],
      isCash: [0],
      DealerId: [0],
      BranchName: [''],
      BranchTel: [''],
      RepresentativeId: [0],
      LocX: [''],
      LocY: [''],
      leadId:[0],
      // voucherDate: ["", [Validators.required]],
      // currencyId: [0, [Validators.required, Validators.min(1)]],
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailEntryVoucher() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.dealerService.GetDealersInitialForm(this.voucherId, this.type, this.isHidden, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        if (this.type == 1) {
          this.router.navigate(['Dealers/GetCustomersList']);
        }
        else {
          this.router.navigate(['Dealers/GetDealersList']);
        }
        return;
      }
      if (result.isActive) {
        this.active = 1;
      }
      else {
        this.active = 0;
      }
      if (result.isTaxable) {
        this.isTax = 1;
      }
      else {
        this.isTax = 0;
      }
      if (result.isAgent) {
        this.agent = 1;
      }
      else {
        this.agent = 0;
      }

      if (result.isCash) {
        this.iscash = 1;
      }
      else {
        this.iscash = 0;
      }
      result.startDateDealing = formatDate(result.startDateDealing, "yyyy-MM-dd", "en-US")
      this.classificationList = result.dealersClassesList;
      this.categoryList = result.dealersCategoriesList;
      this.priceCategoryList = result.priceCategoryList;
      this.accountsList = result.accountList;
      this.currencyList = result.currencyModels;
      this.deliverytermList = result.deliveryTermsList;
      this.paymenttermList = result.paymentTermsList;
      this.limitspolicyList = result.limitPolicyList;
      this.countryList = result.countryList;
      this.allCitiesList = result.cityList;
      this.employeesList = result.employeesList;
      this.allAreasList = result.areasList;
      debugger
      if(this.leadId > 0)
        {
          this.DealersAddForm.get("leadId").setValue(this.leadId);
        }
       
      debugger
      if (result.dealersBranchesModelList != null && result.dealersBranchesModelList.length > 0) {
        this.dealersBranchesList = result.dealersBranchesModelList;
        this.DealersAddForm.get("dealersBranchesModelList").setValue(this.dealersBranchesList);
      }

      if (this.leadId > 0) {
        this.dealerService.getLeadsInfo(this.leadId).subscribe(res => {
          debugger
          this.DealersAddForm.get("nameA").setValue(res.customerName);
          this.DealersAddForm.get("nameE").setValue(res.customerName);
          this.DealersAddForm.get("email").setValue(res.mainContactEmail);
          this.DealersAddForm.get("tel1").setValue(res.mainContactPhone);
          this.DealersAddForm.get("note").setValue(res.note);
        });
      }


      if (this.type == 1) {
        this.dealerTypesList = result.customersTypesList;
      }
      else {
        this.dealerTypesList = result.supplierTypesList;
      }
      this.DealersAddForm.patchValue(result);
      //  this.accVouchersDTsList = result.accVouchersDTModelList; 
      if (result.dealersAddressesModelList != null) {
        if (result.dealersAddressesModelList.length > 0) {
          this.dealerAddressList = result.dealersAddressesModelList;
          this.dealersBranchesList = result.dealersBranchesModelList;

        }
      }
      if (result.dealersContactModelList != null) {
        if (result.dealersContactModelList.length > 0) {
          this.dealerContactList = result.dealersContactModelList;
        }
      }
      debugger
      if (result.dealersAddressesModelList !== null) {
        let index = 0;
        this.dealerAddressList = result.dealersAddressesModelList;
        this.dealerAddressList.forEach(element => {
          debugger
          this.allCitiesList.forEach(item => {
            debugger
            if (item.id === element.cityId) {
              debugger
              this.cityList[index] = this.allCitiesList.filter(city => city.id == element.cityId);
              index++;
            }
          });
        })
      }
      if (result.dealersAddressesModelList !== null) {
        let index = 0;
        this.dealerAddressList = result.dealersAddressesModelList;
        this.dealerAddressList.forEach(element => {
          debugger
          this.allAreasList.forEach(item => {
            debugger
            if (item.id === element.areaId) {
              debugger
              this.areaList[index] = this.allAreasList.filter(area => area.id == element.areaId);
              index++;
            }
          });
        })
      }
      debugger
      if (result.dealersAttachments !== undefined && result.dealersAttachments !== null) {
        this.DealersAddForm.get("accVouchersDocModelList").setValue(result.dealersAttachments);
        this.childAttachment.data = result.dealersAttachments;
        this.childAttachment.ngOnInit();
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if (this.voucherId > 0) {
          debugger
          if (result.classId == null || result.classId == undefined) {
            result.classId = 0
          }
          if (result.categoryId == null || result.categoryId == undefined) {
            result.categoryId = 0
          }
          if (result.priceCategoryId == null || result.priceCategoryId == undefined) {
            result.priceCategoryId = 0
          }
          if (result.currencyId == null || result.currencyId == undefined) {
            result.currencyId = 0
          }
          if (result.deliveryTermId == null || result.deliveryTermId == undefined) {
            result.deliveryTermId = 0
          }
          if (result.paymentTermId == null || result.paymentTermId == undefined) {
            result.paymentTermId = 0
          }
          if (result.limitPolicy == null || result.limitPolicy == undefined) {
            result.limitPolicy = 0
          }
          this.DealersAddForm.get("nameA").setValue(result.nameA);
          this.DealersAddForm.get("nameE").setValue(result.nameE);
          this.DealersAddForm.get("accountId").setValue(result.accountId);
          this.DealersAddForm.get("classId").setValue(result.classId);
          this.DealersAddForm.get("categoryId").setValue(result.categoryId);
          this.DealersAddForm.get("priceCategoryId").setValue(result.priceCategoryId);
          this.DealersAddForm.get("currencyId").setValue(result.currencyId);
          this.DealersAddForm.get("deliveryTermId").setValue(result.deliveryTermId);
          this.DealersAddForm.get("paymentTermId").setValue(result.paymentTermId);
          this.DealersAddForm.get("tel1").setValue(result.tel1);
          this.DealersAddForm.get("tel2").setValue(result.tel2);
          this.DealersAddForm.get("website").setValue(result.website);
          this.DealersAddForm.get("email").setValue(result.email);
          this.DealersAddForm.get("nationalNo").setValue(result.nationalNo);
          this.DealersAddForm.get("fax").setValue(result.fax);
          this.DealersAddForm.get("allowedLimit").setValue(result.allowedLimit);
          this.DealersAddForm.get("limitPolicy").setValue(result.limitPolicy);
          this.DealersAddForm.get("startDateDealing").setValue(formatDate(result.startDateDealing, "yyyy-MM-dd", "en-US"));
          this.DealersAddForm.get("note").setValue(result.note);
          this.DealersAddForm.get("allowedCheques").setValue(result.allowedCheques);
          debugger
          this.DealersAddForm.get("bankAccNo").setValue(result.bankAccNo);
          this.DealersAddForm.get("iban").setValue(result.iban);
          this.DealersAddForm.get("bankName").setValue(result.bankName);
          this.DealersAddForm.get("swift").setValue(result.swift);


          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyModels.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.DealersAddForm.get("currencyId").setValue(result.currencyId);
          }
          debugger
        }
        else {
          debugger
          this.DealersAddForm.get("startDateDealing").setValue(formatDate(new Date, "yyyy-MM-dd", "en-US"));
          if (result.classId == null || result.classId == undefined) {
            this.DealersAddForm.get("classId").setValue(0);
          }
          if (result.categoryId == null || result.categoryId == undefined) {
            this.DealersAddForm.get("categoryId").setValue(0);
          }
          if (result.priceCategoryId == null || result.priceCategoryId == undefined) {
            this.DealersAddForm.get("priceCategoryId").setValue(0);
          }
          if (result.currencyId == null || result.currencyId == undefined) {
            this.DealersAddForm.get("currencyId").setValue(0);
          }
          if (result.deliveryTermId == null || result.deliveryTermId == undefined) {
            this.DealersAddForm.get("deliveryTermId").setValue(0);
          }
          if (result.paymentTermId == null || result.paymentTermId == undefined) {
            this.DealersAddForm.get("paymentTermId").setValue(0);
          }
          if (result.limitPolicy == null || result.limitPolicy == undefined) {
            this.DealersAddForm.get("limitPolicy").setValue(0);
          }

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyModels.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.DealersAddForm.get("currencyId").setValue(result.defaultCurrency);
          }
        }
      });

      debugger
      if (result.image && result.image != "") {
        this.imagePath = environment.apiURL_Main + result.image;
        this.image = result.image;
      }
      else {
        this.imagePath = "assets/images/defualt-upload.png";
      }

    })
  }

  onUploadIamge(event) {
    if (event) {
      this.file = event[0]
      var reader = new FileReader();
      reader.readAsDataURL(event[0]);
      reader.onload = (event: any) => {
        this.imagePath = event.target.result;
        const imgBase64Path = event.target.result;
        this.cardImageBase64 = imgBase64Path;
      }
    }
  }

  ClearImagePath(image): void {
    image.value = "";
    this.image = "";
    this.imagePath = "assets/images/defualt-upload.png";
  }

  validatePhoneNumber(phone: string): boolean {
    const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return pattern.test(phone);
  }

  OnSaveForms() {
    debugger
    const tel1 = this.DealersAddForm.value.tel1 || '';
    const tel2 = this.DealersAddForm.value.tel2 || '';

    if (tel1 !== '' && !this.validatePhoneNumber(tel1)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    if (tel2 !== '' && !this.validatePhoneNumber(tel2)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }


    let stopExecution = false;
    var index = 0;

    if (this.dealerAddressList.length > 0) {
      debugger
      for (let element of this.dealerAddressList) {
        if (element.addressA === '' || element.addressA === null || element.addressA <= 0 && element.addressE === '' || element.addressE === null || element.addressE <= 0
        ) {
          this.alert.ShowAlert("msgEnterAllDataDealerAddress", 'error');
          stopExecution = true;
          return false;
        }
        if (element.tel !== '' && !this.validatePhoneNumber(element.tel)) {
          this.alert.ShowAlert("msgDontEnterLattersInHomePhone", 'error');
          return;
        }
        element.index = index.toString();
        index++;
      }
    }
    if (this.dealerContactList.length > 0) {
      debugger
      for (let element of this.dealerContactList) {
        if (element.nameA === '' || element.nameA === null || element.nameA <= 0 && element.nameE === '' || element.nameE === null || element.nameE <= 0 && element.position === '' || element.position === null || element.position <= 0) {
          this.alert.ShowAlert("msgEnterAllDataDealerContacts", 'error');
          stopExecution = true;
          return false;
        }
        if (element.tel !== '' && !this.validatePhoneNumber(element.tel)) {
          this.alert.ShowAlert("msgDontEnterLatters", 'error');
          return;
        }
        element.index = index.toString();
        index++;
      }
    }


    if (this.dealersBranchesList.length > 0) {
      debugger
      for (let element of this.dealersBranchesList) {
        if (element.branchName == "" || element.branchName == undefined || element.branchName == null) {
          this.alert.ShowAlert("PleaseInsertBranch", 'error');
          return;
        }
        element.index = index.toString();
        index++;
      }
    }
    debugger
    this.DealersAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.DealersAddForm.value.userId = this.jwtAuth.getUserId();
    this.DealersAddForm.value.dealersAddressesModelList = this.dealerAddressList;
    this.DealersAddForm.value.dealersContactModelList = this.dealerContactList;
    this.DealersAddForm.get("dealersBranchesModelList").setValue(this.dealersBranchesList);
    this.DealersAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    if (this.active == 1) {
      this.DealersAddForm.value.isActive = true;
    }
    else {
      this.DealersAddForm.value.isActive = false;
    }
    if (this.isTax == 1) {
      this.DealersAddForm.value.isTaxable = true;
    }
    else {
      this.DealersAddForm.value.isTaxable = false;
    }
    if (this.agent == 1) {
      this.DealersAddForm.value.isAgent = true;
    }
    else {
      this.DealersAddForm.value.isAgent = false;
    }

    if (this.iscash == 1) {
      this.DealersAddForm.value.isCash = true;
    }
    else {
      this.DealersAddForm.value.isCash = false;
    }
    if (this.DealersAddForm.value.allowedLimit == null || this.DealersAddForm.value.allowedLimit == undefined) {
      this.DealersAddForm.get("allowedLimit").setValue(0);
    }
    if (this.DealersAddForm.value.allowedCheques == null || this.DealersAddForm.value.allowedCheques == undefined) {
      this.DealersAddForm.get("allowedCheques").setValue(0);
    }
    if (this.DealersAddForm.value.email == null) {
      this.DealersAddForm.value.email == '';
    }
    if (this.DealersAddForm.value.fax == null) {
      this.DealersAddForm.value.fax == '';
    }
    if (this.DealersAddForm.value.nationalNo == null) {
      this.DealersAddForm.value.nationalNo == 0;
    }
    if (this.DealersAddForm.value.note == null) {
      this.DealersAddForm.value.note == '';
    }
    if (this.DealersAddForm.value.tel1 == null) {
      this.DealersAddForm.value.tel1 == '';
    }
    if (this.DealersAddForm.value.tel2 == null) {
      this.DealersAddForm.value.tel2 == '';
    }
    if (this.DealersAddForm.value.website == null) {
      this.DealersAddForm.value.website == '';
    }

    if (this.DealersAddForm.value.swift == null) {
      this.DealersAddForm.value.swift == '';
    }

    if (this.DealersAddForm.value.bankName == null) {
      this.DealersAddForm.value.bankName == '';
    }

    if (this.DealersAddForm.value.iban == null) {
      this.DealersAddForm.value.iban == '';
    }

    if (this.DealersAddForm.value.bankAccNo == null) {
      this.DealersAddForm.value.bankAccNo == '';
    }


    this.DealersAddForm.get("leadId").setValue(this.leadId);
    debugger
    this.changeDetectorRef.detectChanges();
    const formData = new FormData();
    formData.append('Id', this.DealersAddForm.value.id)
    formData.append("nameA", this.DealersAddForm.value.nameA)
    formData.append("nameE", this.DealersAddForm.value.nameE)
    formData.append("accountId", this.DealersAddForm.value.accountId)
    formData.append("classId", this.DealersAddForm.value.classId ?? 0)
    formData.append("categoryId", this.DealersAddForm.value.categoryId ?? 0)
    formData.append("priceCategoryId", this.DealersAddForm.value.priceCategoryId ?? 0)
    formData.append("currencyId", this.DealersAddForm.value.currencyId)
    formData.append("deliveryTermId", this.DealersAddForm.value.deliveryTermId ?? 0)
    formData.append("paymentTermId", this.DealersAddForm.value.paymentTermId ?? 0)
    formData.append("tel1", this.DealersAddForm.value.tel1)
    formData.append("tel2", this.DealersAddForm.value.tel2)
    formData.append("website", this.DealersAddForm.value.website)
    formData.append("email", this.DealersAddForm.value.email)
    formData.append("nationalNo", this.DealersAddForm.value.nationalNo)
    formData.append("fax", this.DealersAddForm.value.fax)
    formData.append("allowedLimit", this.DealersAddForm.value.allowedLimit)
    formData.append("limitPolicy", this.DealersAddForm.value.limitPolicy ?? 0)
    formData.append("startDateDealing", this.DealersAddForm.value.startDateDealing)
    formData.append("note", this.DealersAddForm.value.note)
    formData.append("allowedCheques", this.DealersAddForm.value.allowedCheques)
    formData.append("isActive", this.DealersAddForm.value.isActive)
    formData.append("isTaxable", this.DealersAddForm.value.isTaxable)
    formData.append("isAgent", this.DealersAddForm.value.isAgent)
    formData.append("isCash", this.DealersAddForm.value.isCash)
    formData.append("dealeraddressList", JSON.stringify(this.dealerAddressList));
    formData.append("dealerContactList", JSON.stringify(this.dealerContactList));
    formData.append("dealerBranchesList", JSON.stringify(this.dealersBranchesList));
    formData.append("dealersDocList", JSON.stringify(this.DealersAddForm.value.accVouchersDocModelList));
    formData.append("taxNo", this.DealersAddForm.value.taxNo)
    formData.append("poBox", this.DealersAddForm.value.poBox)
    formData.append("dealerTypeId", this.DealersAddForm.value.dealerTypeId)
    formData.append("dealerNo", this.DealersAddForm.value.dealerNo)    
    formData.append("swift", this.DealersAddForm.value.swift ?? '');
    formData.append("bankName", this.DealersAddForm.value.bankName ?? '');
    formData.append("iban", this.DealersAddForm.value.iban ?? '');
    formData.append("bankAccNo", this.DealersAddForm.value.bankAccNo ?? '');
    formData.append("leadId",  this.DealersAddForm.value.leadId ?? 0);
     


    if (this.image != "" && this.image != undefined && this.image != null) {
      formData.append("image", this.image)
    }
    if (this.file == undefined) {
      formData.append("file", null)
    }
    else {
      formData.append("file", this.file)
      formData.append("image", this.file.type)
    }
    this.changeDetectorRef.detectChanges();
    debugger

    this.dealerService.SaveDealers(this.type, formData).subscribe((result) => {
      if (result) {
        this.alert.SaveSuccess();
        if (this.type == 1) {
          this.router.navigate(['Dealers/GetCustomersList']);
        }
        else {
          this.router.navigate(['Dealers/GetDealersList']);
        }
      }
      else {
        this.alert.SaveFaild();
      }
    })
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.DealersAddForm.get("currRate").setValue(currRate);
  }

  AddNewLine(type: number) {
    if (this.disableAll == true) {
      return;
    }
    debugger
    if (type == 1) {
      this.dealerAddressList.push(
        {
          id: 0,
          dealerId: 0,
          addressName: "",
          addressA: "",
          addressE: "",
          email: "",
          tel: "",
          countryId: 0,
          cityId: 0,
          areaId: 0,
          index: ""
        });
      this.DealersAddForm.get("dealersAddressesModelList").setValue(this.dealerAddressList);
    }
    else if (type == 4) {
      this.dealersBranchesList.push({
        Id: 0,
        CompanyId: 0,
        DealerId: 0,
        BranchName: '',
        BranchTel: '',
        RepresentativeId: null,
        LocX: '',
        LocY: '',
      });
      this.DealersAddForm.get("dealersBranchesList").setValue(this.dealersBranchesList);
    }
    else {
      this.dealerContactList.push(
        {
          id: 0,
          dealerId: 0,
          nameA: "",
          nameE: "",
          position: "",
          email: "",
          tel: "",
          index: ""
        });
      this.DealersAddForm.get("dealersContactModelList").setValue(this.dealerContactList);
    }

  }

  deleteRow(rowIndex: number, type: number) {
    if (this.disableAll == true) {
      return;
    }
    if (type == 1) {
      if (rowIndex !== -1) {
        this.dealerAddressList.splice(rowIndex, 1);
      }
      this.DealersAddForm.get("dealersAddressesModelList").setValue(this.dealerAddressList);
    }
    else if (type == 2) {
      if (rowIndex !== -1) {
        this.dealerContactList.splice(rowIndex, 1);
      }
      this.DealersAddForm.get("dealersContactModelList").setValue(this.dealerContactList);
    }
    else {
      if (rowIndex !== -1) {
        this.dealersBranchesList.splice(rowIndex, 1);
      }
      this.DealersAddForm.get("dealersBranchesModelList").setValue(this.dealersBranchesList);
    }
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  isOneEmpty(row: any, type: number) {
    if (type == 1) {
      if ((row.addressA === '' || row.addressA === null) && (row.addressE === '' || row.addressE === null)
        && (row.email === '' || row.email === null) && (row.tel === '' || row.tel === null)
        && (row.countryId === '' || row.countryId === null || row.countryId <= 0) && (row.cityId === '' || row.cityId === null || row.cityId <= 0)
        && (row.areaId === '' || row.areaId === null || row.areaId <= 0)) {
        return true;
      }
      else {
        return false;
      }
    }
    else if (type == 2) {
      if ((row.nameA === '' || row.nameA === null) && (row.nameE === '' || row.nameE === null)
        && (row.position === '' || row.position === null)) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      if (row.branchName === '' || row.branchName === null) {
        return true;
      }
    }
  }

  isValidVoucherDate(event) {
    debugger
    this.validDate = true;
    if (event.target.value == "") {
      this.validDate = false;
      return;
    }
    this.appCommonserviceService.isValidVoucherDate(event.target.value).subscribe(res => {
      if (!res) {
        this.validDate = false;
        this.alert.ShowAlert("msgInvalidDate", 'error');
      }
    }, err => {
      this.validDate = false;
    })
  }

  isSupplier() {
    if (this.type == 1) {
      return false;
    }
    else {
      return true;
    }
  }

  private customWebsiteValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && !/^https?:\/\//.test(control.value)) {
      return { invalidWebsite: true };
    }
    return null;
  }

  areAllEmailsValid(contactList: any[]): boolean {
    return contactList.every(contact => this.checkEmailValidity(contact.email));
  }

  // checkEmailValidity(email: string): boolean {
  //   const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  //   return emailRegex.test(email);
  // }

  checkEmailValidity(email: string): boolean {
    // Check if the email is non-empty before performing the validation
    if (email !== '') {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return emailRegex.test(email);
    }

    // Return true if the email is empty (no validation needed)
    return true;
  }

  private customEmailValidator(control) {
    if (control.value && Validators.email(control)) {
      return { invalidEmailFormat: true };
    }
    return null;
  }

  onCountryChange(row: any, index: number): void {
    debugger
    if (row !== 0 && row !== null) {
      debugger
      this.dealerService.GetCityList(row).subscribe(result => {
        debugger
        this.cityList[index] = result.cityList;
      });
    }
  }

  onCityChange(row: any, index: number) {
    debugger
    if (row !== 0 && row !== null) {
      debugger
      this.dealerService.GetAreasList(row).subscribe(result => {
        debugger
        this.areaList[index] = result.areasList;
      })
    }
  }


  GetmaxDealerNo(event: any) {
    debugger
    if(this.DealersAddForm.value.id >0)
      return;
    this.dealerService.GetMaxDealerNo(event.value).subscribe(result => {
      debugger
      this.DealersAddForm.get("dealerNo").setValue(result);
    });
  }


  AddNewLine3() {
    debugger
    if (this.dealersBranchesList == undefined || this.dealersBranchesList == null)
      this.dealersBranchesList = [];
    this.dealersBranchesList.push({
      id: 0,
      companyId: 0,
      dealerId: 0,
      branchName: '',
      branchTel: '',
      representativeId: 0,
      locX: '',
      locY: '',
    });
    this.DealersAddForm.get("dealersBranchesModelList").setValue(this.dealersBranchesList);

  }

  deleteRow3(index: number) {
    this.dealersBranchesList.splice(index, 1);
  }

}
