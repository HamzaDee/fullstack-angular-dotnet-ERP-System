import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { sweetalert } from 'sweetalert';
import { AgreementsService } from '../agreements.service';
import { id } from 'date-fns/locale';
import { formatDate } from '@angular/common';
import { delay, of } from 'rxjs';
import Swal from 'sweetalert2';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'

@Component({
  selector: 'app-agreements-form',
  templateUrl: './agreements-form.component.html',
  styleUrl: './agreements-form.component.scss'
})
export class AgreementsFormComponent {
  showLoader = false;
  loading: boolean;
  AgreementsForm: FormGroup;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  showsave: boolean;
  disableSave: boolean;
  public TitlePage: string;
  public AgreementTypeList: any;
  public currencyList: any;
  public FirstPartyList: any;
  fullFirstPartyList: any;
  public SecondPartyList: any;
  public ThirdPartyList: any;
  public FourthPartyList: any;
  decimalPlaces: number;
  disableCurrRate: boolean;
  defaultCurrencyId: number;
  public id: any;
  public opType: string;
  disableAll: boolean = false;
  monthsDiff: number = 0;
  dealAmountInDollars: string;
  country1: string;
  country2: string;
  country3: string;
  country4: string;



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
    private AgreementsService: AgreementsService,
    private readonly appCommonserviceService: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    debugger
    this.route.queryParams.subscribe((params: Params) => {
      debugger
      this.id = +params['id'];
      this.opType = params.opType;

      if (params.showsave == "true") {
        this.showsave = true;
      }
      else {
        this.showsave = false;
      }
    });

    if (this.id == null || this.id == undefined || this.id === 0 || isNaN(this.id)) {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.id = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
      }
      else {
        this.id = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
      }
    }

    this.SetTitlePage();
    this.AgreementsForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      dealName: ["", Validators.required],
      dealNo: ["", Validators.required],
      dealSummary: ["", Validators.required],
      dealType: [0, Validators.pattern('^[1-9][0-9]*')],
      dealSignDate: [new Date()],
      dealFromDate: [new Date()],
      dealToDate: [new Date()],
      firstParty: [0, [Validators.required, Validators.min(1)]],
      secondParty: [0, Validators.pattern('^[1-9][0-9]*')],
      thirdParty: [0],
      fourthParty: [0],
      dealAmount: [0],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, Validators.min(0.000001)]],
      userId: [0],
      stampDate: [new Date()],
      donorCountry: [""],
      agreementType: [0],
      generalAttachModelList: [null],
      dinarAmount:[0],
    });
    this.setupDateValidation();
    if (this.id == null || this.id == undefined || this.id === "") {
      this.router.navigate(['Agreements/AgreementsList']);
    }

    this.GetAgrementsInfo();

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
    this.TitlePage = this.translateService.instant('AgreementsForm');
    this.title.setTitle(this.TitlePage);
  }

  GetAgrementsInfo() {
    debugger
    this.AgreementsService.GetAgrementsInfo(this.id, this.opType).subscribe(result => {
      debugger

      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Agreements/AgreementsList']);
        return;
      }

      result.dealSignDate = formatDate(result.dealSignDate, "yyyy-MM-dd", "en-US");
      result.dealFromDate = formatDate(result.dealFromDate, "yyyy-MM-dd", "en-US");
      result.dealToDate = formatDate(result.dealToDate, "yyyy-MM-dd", "en-US");

      this.AgreementTypeList = result.agreementTypes;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.defaultCurrencyId = result.defaultCurrency;
      this.FirstPartyList = result.authoritiesList;
      this.fullFirstPartyList = result.authoritiesList;
      this.SecondPartyList = result.authoritiesList;
      this.ThirdPartyList = result.authoritiesList;
      this.FourthPartyList = result.authoritiesList;
      this.AgreementsForm.patchValue(result);


      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.AgreementsForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {

        if (this.id > 0) {
          if (result.dinarAmount && result.dinarAmount > 0) {
            let currRate = this.AgreementsForm.get('currRate').value;
     
              this.dealAmountInDollars = this.formatCurrency(result.dinarAmount / 0.708);
  

          }
          this.calculateMonthsDifference(result.dealFromDate, result.dealToDate);

          if (result.firstParty > 0) {
            this.FirstPartyChange(result.firstParty);
          }
          if (result.secondParty > 0) {
            this.SecondPartyChange(result.secondParty);
          }
          if (result.thirdParty > 0) {
            this.ThirdPartyChange(result.thirdParty);
          }
          if (result.fourthParty > 0) {
            this.FourthPartyChange(result.fourthParty);
          }


          if (result.agreementType == 1) {
            this.AgreementsForm.patchValue({ agreementType: 1 });
          }

          if (result.agreementType == 2) {
            this.AgreementsForm.patchValue({ agreementType: 2 });
          }
        }
        else {
          this.dealAmountInDollars = "0";
          debugger
          if (this.AgreementsForm.value.currencyId == 0 ||this.AgreementsForm.value.currencyId == null ) {
            this.AgreementsForm.get("currencyId").setValue(this.defaultCurrencyId);
            let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.AgreementsForm.get("currRate").setValue(currRate);
          }
          if (this.AgreementsForm.value.currencyId == 1) {
            this.disableCurrRate = true;
          }
          else {
            this.disableCurrRate = false;
          }



          this.AgreementsForm.patchValue({ agreementType: 1 });
        }

      });
    });
  }

  getCurrencyRate(event: any) {
    debugger
    this.dealAmountInDollars = "";
    this.AgreementsForm.get("dinarAmount").setValue(0);
    const selectedValue = event.value;
    let currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    this.AgreementsForm.get("currRate").setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  OnSaveForms() {
    debugger

    // if (this.AgreementsForm.value.dinarAmount == 0) {
    //   this.alert.ShowAlert("msgMustEnterDelarAmount", 'error');
    //   this.disableSave = false;
    //   return false;
    // }
    let rate = this.AgreementsForm.value.currRate;
    if(rate == null || rate == undefined)
      {
        rate = 0;
        this.AgreementsForm.get("currRate").setValue(rate)
      }
    let curr = this.AgreementsForm.value.currencyId;
    if(curr == null || curr == undefined)
      {
        curr = 0;
        this.AgreementsForm.get("currencyId").setValue(curr)
      }
    let amount = this.AgreementsForm.value.dinarAmount;
    if(amount == null || amount == undefined)
      {
        amount = 0;
        this.AgreementsForm.get("dinarAmount").setValue(amount)
      }
    this.AgreementsForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    if (this.opType == 'Add') {
      this.AgreementsForm.value.id = 0;
    }
    this.AgreementsService.saveAgrements(this.AgreementsForm.value).subscribe((result) => {
      if (result.isSuccess == true) {
        debugger
        this.alert.SaveSuccess();
        this.ClearAfterSave();
        if (this.opType == 'Edit') {
          this.router.navigate(['Agreements/AgreementsList']);
        }
        this.id = 0;
        this.opType = 'Add';
        this.ngOnInit();
      } else {
        this.alert.SaveFaild();
      }
      this.disableSave = false;
    }); 
  }

  ClearAfterSave() {
    this.AgreementsForm.reset();
    this.dealAmountInDollars = "0";
    this.monthsDiff = 0;
    this.AgreementsForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
  }

  onDateChange(): void {
    const fromDate = this.AgreementsForm.get('dealFromDate')?.value;
    const toDate = this.AgreementsForm.get('dealToDate')?.value;

    if (fromDate && toDate) {
      this.calculateMonthsDifference(fromDate, toDate);
    }
  }

  calculateMonthsDifference(fromDate: string, toDate: string): void {
    const startDate = this.AgreementsForm.get('dealFromDate')?.value;
    const endDate = this.AgreementsForm.get('dealToDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const months = (end.getFullYear() - start.getFullYear()) * 12;
      this.monthsDiff = months + (end.getMonth() - start.getMonth());
    }
  }

  onAgreementAmountChange(value): void {
    debugger
    const dinarAmount = value;
    let rate = this.AgreementsForm.value.currRate;
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
      const currRate = 0.708;
      const amt = +(dinarAmount * currRate).toFixed(2); // force number

      this.AgreementsForm.get('dinarAmount')?.setValue(amt);
    } else {
      this.AgreementsForm.get('dinarAmount')?.setValue(0);
    }
  }


  DeleteAgreement(id: any) {
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
        this.AgreementsService.deleteAgrements(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['Agreements/AgreementsList']);
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

  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.FirstPartyList) {
      this.FirstPartyList = [];
    }

    // Make sure the array is large enough
    while (this.FirstPartyList.length < last) {
      this.FirstPartyList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.FirstPartyList[i] = this.fullFirstPartyList[i];
    }

    this.loading = false;
  }

  FirstPartyChange(value: any) {
    debugger
    if (value > 0) {
      this.country1 = this.FirstPartyList.find(x => x.id === value)?.data1 || "";
    }
    else {
      this.country1 = "";
    }
  }

  SecondPartyChange(value: any) {
    debugger
    if (value > 0) {
      this.country2 = this.SecondPartyList.find(x => x.id === value)?.data1 || "";
    }
    else {
      this.country2 = "";
    }
  }

  ThirdPartyChange(value: any) {
    debugger
    if (value > 0) {
      this.country3 = this.ThirdPartyList.find(x => x.id === value)?.data1 || "";
    }
    else {
      this.country3 = "";
    }
  }

  FourthPartyChange(value: any) {
    debugger
    if (value > 0) {
      this.country4 = this.FourthPartyList.find(x => x.id === value)?.data1 || "";
    }
    else {
      this.country4 = "";
    }
  }

  setupDateValidation() {
    this.AgreementsForm.valueChanges.subscribe(values => {
      const { dealFromDate, dealToDate } = values;


      const projEndControl = this.AgreementsForm.get('dealToDate');
      const actualEndControl = this.AgreementsForm.get('dealToDate');

      // Clear old errors
      projEndControl?.setErrors(null);
      actualEndControl?.setErrors(null);

      if (dealFromDate && dealToDate && new Date(dealToDate) < new Date(dealFromDate)) {
        projEndControl?.setErrors({ projEndBeforeStart: true });
      }

    });
  }

  CalcAmount(rate: number) {
    debugger
    if (rate == 1) {
      let amount = this.AgreementsForm.get('dinarAmount').value;
      this.dealAmountInDollars = this.formatCurrency(amount / rate);
    }
    else {
      debugger
      let amount = this.dealAmountInDollars;
      let value = parseFloat(amount) * rate
      this.dealAmountInDollars = this.formatCurrency(value);

      let jod = this.formatCurrency(value * rate);
      this.AgreementsForm.get('dinarAmount').setValue(jod);
    }

  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }
}
