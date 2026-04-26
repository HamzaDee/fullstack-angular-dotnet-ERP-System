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
import { OpportunitiesService } from '../opportunities.service';
import { formatDate } from '@angular/common';
import { delay, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-opportunities-form',
  templateUrl: './opportunities-form.component.html',
  styleUrl: './opportunities-form.component.scss'
})
export class OpportunitiesFormComponent {
  OpportunitiesForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  Id: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll: boolean;
  disableSave: boolean;
  lang: string;
  NewDate: any;
  showsave: boolean;
  UseTax: boolean;
  showLeadList = false;
  showCustomerList = false;
  fTotal: string | number = 0;
  fDiscount: string | number = 0;
  fTaxTotal: string | number = 0;
  fNetTotal: string | number = 0;
  //List
  opportunityItemsDTsList: any[] = [];
  BranchList: any;
  StageList: any;
  SalesEmployeeList: any;
  LeadList: any;
  DealersList: any;
  ItemsList: any;
  unitsList: Array<any> = [];
  taxesList: any;
  TaxModelList: any;
  allUntiesList: any;
  LostReasonList: any;
  CustomerTypes: { id: number; text: string }[] = [
    { id: 0, text: this.jwtAuth.getLang() === 'ar' ? 'اختر' : 'Select' },
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'عميل محتمل' : 'Potential Client' },
    { id: 2, text: this.jwtAuth.getLang() === 'ar' ? 'عميل' : 'Client' },
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
      private CrmService: OpportunitiesService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;
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
    this.SetTitlePage();
    if (this.Id == null || this.Id == undefined || this.Id === "") {
      this.router.navigate(['Opportunities/OpportunitiesList']);
    }

    this.OpportunitiesForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      branchId: [0],
      opportunityNo: [0, [Validators.required, Validators.min(1)]],
      leadId: [0],
      customerId: [0],
      title: [""],
      stageId: [0, [Validators.required, Validators.min(1)]],
      probability: [0],
      expectedCloseDate: [new Date],
      expectedAmount: [0],
      salesUserId: [0, [Validators.required]],
      createdById: [0, [Validators.required]],
      createdAt: [new Date],
      isDeleted: [false],
      customerType: [0],
      lostReasonId: [0],
      status: [0],
      opportunityItemsDTsList: [null],
    });    
    this.GetInitailOpportunities();

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
      this.toggleDisable();
    });
    
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Opportunities');
    this.title.setTitle(this.TitlePage);
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  loadLazyOptions(event: any) {
    const { first, last } = event;
    

    // Don't replace the full list; copy and fill only the needed range
    if (!this.ItemsList) {
      this.ItemsList = [];
    }

    // Make sure the array is large enough
    while (this.ItemsList.length < last) {
      this.ItemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.ItemsList[i] = this.ItemsList[i];
    }

    this.loading = false;
  }

  GetInitailOpportunities() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.CrmService.GetInitailOpportunities(this.Id, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Opportunities/OpportunitiesList']);
        return;
      }
      result.expectedCloseDate = formatDate(result.expectedCloseDate, "yyyy-MM-dd", "en-US")
      this.BranchList = result.branchList;
      this.StageList = result.stageList;
      this.SalesEmployeeList = result.salesEmployeeList;
      this.LeadList = result.leadList;
      this.DealersList = result.dealersList;
      this.ItemsList = result.itemsList;
      this.TaxModelList = result.taxModelList;
      this.UseTax = result.useTax;
      this.allUntiesList = result.unitList;
      this.LostReasonList = result.lostReasonList;

      if (result.opportunityItemsDTsList !== undefined && result.opportunityItemsDTsList !== null) {
        debugger
        let index = 0;
        this.opportunityItemsDTsList = result.opportunityItemsDTsList;
        this.opportunityItemsDTsList.forEach(element => {
          debugger
          this.ItemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
              index++;
            }
          });
        });

        for (let i = 0; i < this.opportunityItemsDTsList.length; i++) {
          this.onChangeItem(0, this.opportunityItemsDTsList[i], i)
        }

        this.claculateAllAmount();
      }
      else {
        this.opportunityItemsDTsList = [];
      }


      this.OpportunitiesForm.patchValue(result);


      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        debugger
        if (this.Id > 0) {
          this.OpportunitiesForm.get("branchId").setValue(result.branchId);
          this.OpportunitiesForm.get("stageId").setValue(result.stageId);
          this.OpportunitiesForm.get("salesUserId").setValue(result.salesUserId);
          this.OpportunitiesForm.get("customerId").setValue(result.customerId);
          this.OpportunitiesForm.get("leadId").setValue(result.leadId);
          this.OpportunitiesForm.get("lostReasonId").setValue(result.lostReasonId);

          if (result.leadId > 0) {
            this.OpportunitiesForm.get("customerType").setValue(1);
          }
          else if (result.customerId > 0) {
            this.OpportunitiesForm.get("customerType").setValue(2);
          }
        }
        else {
          this.OpportunitiesForm.get("branchId").setValue(0);
          this.OpportunitiesForm.get("stageId").setValue(0);
          this.OpportunitiesForm.get("salesUserId").setValue(0);
          this.OpportunitiesForm.get("customerId").setValue(0);
          this.OpportunitiesForm.get("leadId").setValue(0);
          this.OpportunitiesForm.get("customerType").setValue(0);
          this.OpportunitiesForm.get("lostReasonId").setValue(0);
        }
      });
    });
  }

  onCustomerTypeChange(event: any) {
    debugger
    const value = event.value;

    if (value == 1) {
      // عميل محتمل
      this.showLeadList = true;
      this.showCustomerList = false;
      this.OpportunitiesForm.patchValue({ customerId: null });

    } else if (value == 2) {
      // عميل
      this.showLeadList = false;
      this.showCustomerList = true;
      this.OpportunitiesForm.patchValue({ leadId: null });

    } else {
      // اختر
      this.showLeadList = false;
      this.showCustomerList = false;
      this.OpportunitiesForm.patchValue({ leadId: null, customerId: null });
    }
  }

  AddNewLine() {
    if (this.disableAll == true) {
      return;
    }
    this.opportunityItemsDTsList.push(
      {
        id: 0,
        opportunityHDId: 0,
        itemId: 0,
        quantity: 0,
        unitPrice: 0,
        unitId: 0,
        unitRate: 0,
        discount: 0,
        notes: "",
        taxId: 0,
        taxAmt: 0,
        taxPerc: 0,
        createdAt: new Date(),
        createdById: 0,
        total: 0,
        netTotal: ""
      });
    this.OpportunitiesForm.get("opportunityItemsDTsList").setValue(this.opportunityItemsDTsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.opportunityItemsDTsList.splice(rowIndex, 1);
    }
  }

  onChangeItem(event, Row, i) {
    debugger
    if (event.value == 0 || event.value == undefined) {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }

      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.CrmService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
          debugger
          this.unitsList[i] = res;
          if (res.length == 2) {
            this.opportunityItemsDTsList[i].unitId = res[1].id;
          }
          else if (this.opType == "Edit") {

            let unit = this.unitsList[i].find(r => r.id == Row.unitId);
            if (unit == 0 || unit == undefined || unit == null) {
              this.opportunityItemsDTsList[i].unitId = 0;
              return;
            }
            if (this.opportunityItemsDTsList[i].unitId != 0) {
              this.opportunityItemsDTsList[i].unitId = Row.unitId;

            }
          }


        });
      }
      this.onChangeUnit(this.opportunityItemsDTsList[i], i, false);
    }
    else {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.opportunityItemsDTsList[i].quantity = 0;
        this.opportunityItemsDTsList[i].unitPrice = 0;
        this.opportunityItemsDTsList[i].total = 0;
        this.opportunityItemsDTsList[i].discount = 0;
        this.opportunityItemsDTsList[i].taxId = 0;
        this.opportunityItemsDTsList[i].taxAmt = 0;
        this.opportunityItemsDTsList[i].netTotal = "";
        this.opportunityItemsDTsList[i].notes = "";
        if (event.value > 0) {
          this.CrmService.GetItemUnitbyItemId(event.value).subscribe(res => {
            debugger
            this.unitsList[i] = res;
            // this.opportunityItemsDTsList[i] = res;
            if (res.length == 2) {
              this.opportunityItemsDTsList[i].unitId = res[1].id;
              this.opportunityItemsDTsList[i].unitPrice = res[1].data2;
            }
            if (res.length > 2) {
              this.opportunityItemsDTsList[i].unitId = 0;
            }
          });


          if (this.opportunityItemsDTsList.length > 0) {
            let isDuplicate = false;
            for (let m = 0; m < this.opportunityItemsDTsList.length; m++) {
              if (this.opportunityItemsDTsList[m].itemId == Row.itemId && i != m) {
                isDuplicate = true;
              }
            }

            if (isDuplicate) {
              this.opportunityItemsDTsList[i] = {
                ...this.opportunityItemsDTsList[i],
                itemId: 0
              };
              this.cdr.detectChanges();
              return;
            }

          }
        }
      }
    }
  }

  onTaxChange(event: any, i: number) {
    debugger
    const updatedElement = {
      ...this.opportunityItemsDTsList[i],
      taxAmt: 0,
      taxPerc: 0
    };
    this.opportunityItemsDTsList[i] = updatedElement;
    // Safely get tax value
    const tax = Number(event?.value ?? event ?? 0);

    if (tax === 0) {
      const updatedElement = {
        ...this.opportunityItemsDTsList[i],
        taxAmt: 0,
        taxId: 0,
        taxPerc: 0
      };
      this.opportunityItemsDTsList[i] = updatedElement;
    }

    // this.onCheckboxChange(0);
  }

  onChangeUnit(Row, i, type) {
    if (type == true) {
      this.opportunityItemsDTsList[i].qty = 0;
      const unitData = this.unitsList[i].find((u: any) => u.id === Row.unitId);
      if (unitData) {
        this.opportunityItemsDTsList[i].unitRate = unitData.data3;
        this.opportunityItemsDTsList[i].unitPrice = unitData.data2;
      }
    }
  }

  claculateAllAmount() {
    let totalSum = 0;
    let discountSum = 0;
    let taxSum = 0;
    let netSum = 0;

    for (let i = 0; i < this.opportunityItemsDTsList.length; i++) {

      let quantity = Number(this.opportunityItemsDTsList[i].quantity) || 0;
      let unitPrice = Number(this.opportunityItemsDTsList[i].unitPrice) || 0;
      let discount = Number(this.opportunityItemsDTsList[i].discount) || 0;
      let taxPerc = Number(this.opportunityItemsDTsList[i].taxPerc) || 0;

      let total = quantity * unitPrice;
      let tax = ((total - discount) * taxPerc) / 100;
      let net = total - discount + tax;

      // خزّنهم بثلاث منازل عشرية (كنص)
      this.opportunityItemsDTsList[i].total = total.toFixed(3);
      this.opportunityItemsDTsList[i].taxAmt = tax.toFixed(3);
      this.opportunityItemsDTsList[i].netTotal = net.toFixed(3);
      this.opportunityItemsDTsList[i].discount = discount.toFixed(3);
      this.opportunityItemsDTsList[i].taxPerc = taxPerc.toFixed(3);

      // الجمع يكون قبل التحويل
      totalSum += total;
      discountSum += discount;
      taxSum += tax;
      netSum += net;
    }

    // بعد انتهاء اللوب نحول المجاميع
    this.fTotal = totalSum.toFixed(3);
    this.fDiscount = discountSum.toFixed(3);
    this.fTaxTotal = taxSum.toFixed(3);
    this.fNetTotal = netSum.toFixed(3);
  }

  getTaxPersantage(i: number = 0, row) {
    this.CrmService.getTaxPersantage(this.opportunityItemsDTsList[i].taxId).subscribe((result) => {
      debugger
      this.opportunityItemsDTsList[i].taxPerc = result;
      this.claculateAllAmount();
    });
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let isValid = true;

    if (this.opportunityItemsDTsList.length <= 0) {
      isValid = false;
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.disableSave = false;
      return;
    }

    this.opportunityItemsDTsList.forEach(element => {
      if ((element.itemId == null || element.itemId <= 0)
        || (element.unitId == null || element.unitId <= 0)
        || (element.quantity == null || element.quantity <= 0)) {
        isValid = false;
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return;
      }
    });

    if (isValid) {
      this.OpportunitiesForm.value.opportunityItemsDTsList = this.opportunityItemsDTsList;
      this.OpportunitiesForm.value.companyId = this.jwtAuth.getCompanyId();
      this.OpportunitiesForm.value.userId = this.jwtAuth.getUserId();

      this.CrmService.saveOpportunities(this.OpportunitiesForm.value).subscribe((result) => {
        debugger;
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();

          debugger
/*                 var PrintAfterSave = this.VoucherTypeList.find(option => option.label === this.OpportunitiesForm.value.voucherTypeId)?.printAfterSave || false;
                if (PrintAfterSave == true) {
                  this.PrintOpportunities(Number(result.message));
                }  */

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['Opportunities/OpportunitiesList']);
          }
          this.Id = 0;
          this.opType = 'Add';
          this.ngOnInit();
        } else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      });
    }
  }

  ClearAfterSave() {
    this.opportunityItemsDTsList = [];
    this.Id = 0;
    // this.opType = 'Add';
    this.OpportunitiesForm.get("id").setValue(0);
    this.OpportunitiesForm.get("branchId").setValue(0);
    this.OpportunitiesForm.get("stageId").setValue(0);
    this.OpportunitiesForm.get("salesUserId").setValue(0);
    this.OpportunitiesForm.get("customerId").setValue(0);
    this.OpportunitiesForm.get("leadId").setValue(0);
    this.OpportunitiesForm.get("customerType").setValue(0);
    this.OpportunitiesForm.get("lostReasonId").setValue(0);
    this.OpportunitiesForm.get("title").setValue('');
    this.OpportunitiesForm.get("probability").setValue(0);
    this.OpportunitiesForm.get("expectedAmount").setValue(0);
    this.fTotal = 0;
    this.fDiscount = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
  }

  PrintOpportunities(Lead: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptOpportunitiesAR?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptOpportunitiesEN?Id=${Lead}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  DeleteOpportunities(id: any) {
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
        this.CrmService.CancelOpportunities(id).subscribe((results) => {
          debugger
          if (results == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['Opportunities/OpportunitiesList']);
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

  OpportunityNoBlur(opportunityNo) {
    debugger
    if (!opportunityNo) return;

    this.CrmService.IsValidOpportunityNo(opportunityNo).subscribe(res => {
      debugger
      if (res.id && res.id > 0) {

        this.Id = res.id;

        if (res.status == 66) {
          this.opType = "Edit";
          this.showsave = false;
          this.disableAll = false;
        }
        else if (res.status == 67 || res.status == 68) {
          this.opType = "Show";
          this.showsave = true;
        }

        this.GetInitailOpportunities();

      } else {
        this.Id = 0;
        this.opType = "Add";
        this.showsave = false;
        this.disableAll = false;
        this.ClearAfterSave();
      }
    });
  }

  toggleDisable() {
  const lead = this.OpportunitiesForm.get('leadId');
  const customer = this.OpportunitiesForm.get('customerId');

  if (this.disableAll) {
    lead?.disable();
    customer?.disable();
  } else {
    lead?.enable();
    customer?.enable();
  }
  }
}
