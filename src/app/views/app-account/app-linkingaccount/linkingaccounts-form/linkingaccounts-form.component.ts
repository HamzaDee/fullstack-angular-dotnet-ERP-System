import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { LinkingAccountsService } from '../linkingaccount.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-linkingaccounts-form',
  templateUrl: './linkingaccounts-form.component.html',
  styleUrls: ['./linkingaccounts-form.component.scss']
})
export class LinkingaccountsFormComponent implements OnInit {
  LinkingAccountsFormInitialForm: FormGroup = new FormGroup({});
  selectedAcc: any;
  selectedAcc2: any;
  selectedAcc3: any;
  linkingaccountsList: any;
  linkingaccountsList2: any;
  linkingaccountsList3: any;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean = false;
  titlePage: string = "";
  isHidden: boolean = true;
  public TitlePage: string = "";
  public loading: boolean = true;

  constructor(
    private title: Title,
    private readonly formbulider: FormBuilder,
    private readonly translateService: TranslateService,
    private readonly LinkingAccountsService: LinkingAccountsService,
    private readonly alert: sweetalert,
    public readonly ValidatorsService: ValidatorsService,
    private readonly jwtAuth: JwtAuthService,) { }


  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.GetLinkingAccountsInitialForm();
    this.GetLinkingAccInitialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('linkingAccountsForm');
    this.title.setTitle(this.TitlePage);
  }

  GetLinkingAccountsInitialForm() {
    debugger
    this.LinkingAccountsFormInitialForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      discountAllowed: [0],
      discountReceived:[0],
      unbilledPurchasesAccId: [0],
      cashAccId:[0],
      chaqueAccId:[0],
      cardAccId:[0],
      expenseVarianceAccId:[0],
      receivableAccId:[0],
      payableAccId:[0],
      deferredRevenueAccId:[0],
      cliqAccId:[0],
    });
  }

  GetLinkingAccInitialForm() {
    this.LinkingAccountsService.GetLinkingAccountsInitialForm().subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      this.linkingaccountsList = result.accountsList;
      this.linkingaccountsList2 = result.accountsList;
      this.linkingaccountsList3 = result.accountsList;
      this.LinkingAccountsFormInitialForm.patchValue(result);
      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.LinkingAccountsFormInitialForm.get("cashAccId")?.setValue(result.discountAllowed);
        this.LinkingAccountsFormInitialForm.get("chaqueAccId")?.setValue(result.discountReceived);
        this.LinkingAccountsFormInitialForm.get("cardAccId")?.setValue(result.unbilledPurchasesAccId);
        this.LinkingAccountsFormInitialForm.get("cashAccId")?.setValue(result.cashAccId);
        this.LinkingAccountsFormInitialForm.get("chaqueAccId")?.setValue(result.chaqueAccId);
        this.LinkingAccountsFormInitialForm.get("cardAccId")?.setValue(result.cardAccId);
        this.LinkingAccountsFormInitialForm.get("expenseVarianceAccId")?.setValue(result.expenseVarianceAccId);
        this.LinkingAccountsFormInitialForm.get("receivableAccId")?.setValue(result.receivableAccId);
        this.LinkingAccountsFormInitialForm.get("payableAccId")?.setValue(result.payableAccId);
        this.LinkingAccountsFormInitialForm.get("deferredRevenueAccId")?.setValue(result.deferredRevenueAccId);
      });
    });

  }

  OnSaveForms() {

    this.LinkingAccountsFormInitialForm.value.companyId = this.jwtAuth.getCompanyId();
    this.LinkingAccountsService.PostLinkingAccounts(this.LinkingAccountsFormInitialForm.value)
      .subscribe((result) => {
        if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.alert.SaveSuccess()
        this.GetLinkingAccountsInitialForm();
        this.GetLinkingAccInitialForm();
      })
  }


    loadLazyAccountss(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.linkingaccountsList) {
        this.linkingaccountsList = [];
    }

    // Make sure the array is large enough
    while (this.linkingaccountsList.length < last) {
        this.linkingaccountsList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.linkingaccountsList[i] = this.linkingaccountsList[i];
    }

    this.loading = false;
  }
}
