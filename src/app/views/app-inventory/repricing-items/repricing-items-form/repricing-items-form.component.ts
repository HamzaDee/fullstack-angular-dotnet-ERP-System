import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { RepricingitemsService } from '../repricingitems.service'; 
import { RepricingItemsSaveForm } from '../models/RepricingItemsSaveForm'; 
import { AppCommonserviceService } from 'app/views/app-commonservice.service'

@Component({
  selector: 'app-repricing-items-form',
  templateUrl: './repricing-items-form.component.html',
  styleUrls: ['./repricing-items-form.component.scss']
})
export class RepricingItemsFormComponent implements OnInit {

  RepricingItemForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  changeTypeList: any[];
  brandList: any[];
  byUserList: any[];
  categoryList: any[];
  changeTypeNavigationList: any[];
  groupList: any[];
  modelList: any[];
  priceCategoryList: any[];
  unitList: any[];
  repricingItemsSaveForm: RepricingItemsSaveForm;
  GetAllLists: any;
  manualEditingId: number = 140;
  disableSave:boolean;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private repricingitemsService: RepricingitemsService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private route: ActivatedRoute,
    private appCommonserviceService : AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.GetAllLists = params['GetAllLists'];
    });
    this.SetTitlePage();
    this.InitiailRepricingForm();
    this.GetInitailRepricingForm();
    this.disableSave = false;
  }


  InitiailRepricingForm() {
    this.RepricingItemForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      amount: [0, [Validators.required]],
      transDate: [""],
      increase: ['true'],
      note: [""],
      changeTypeId: [0],
      brandId: [0],
      byUserId: [0],
      categoryId: [0],
      changeTypeNavigationId: [0, [Validators.required, Validators.min(1)]],
      groupId: [0],
      modelId: [0],
      priceCategoryId: [0],
      unitId: [0],
      changeType: [null],
      brand: [null],
      byUser: [null],
      category: [null],
      changeTypeNavigation: [null],
      group: [null],
      model: [null],
      priceCategory: [null],
      unit: [null],
    });
  }

  GetInitailRepricingForm() {
    this.repricingitemsService.GetRepricingItemForm().subscribe(result => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['RepricingItem/RepricingItems']);
          return;
        }

      this.unitList = result.unit;
      this.brandList = result.brand;
      this.groupList = result.group;
      this.modelList = result.model;
      this.byUserList = result.byUser;
      this.categoryList = result.category;
      this.changeTypeList = result.changeType;
      this.priceCategoryList = result.priceCategory;
      this.changeTypeNavigationList = result.changeTypeNavigation;
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.RepricingItemForm.get("id").setValue(result.id);
        this.RepricingItemForm.get("transDate").setValue((new Date()).toISOString().substring(0, 10));
      });
    });
  }
  clearForm() {
    this.InitiailRepricingForm();
    this.GetInitailRepricingForm();
    this.tabelData = [];
  }


  SetTitlePage() {
    this.TitlePage = this.translateService.instant('RepricingItemsForm');
    this.title.setTitle(this.TitlePage);
  }

  FilterLists() {
    if (this.RepricingItemForm.value.changeTypeNavigationId == this.manualEditingId) { this.RepricingItemForm.get("amount").setValue(0) }
    if (this.RepricingItemForm.value.changeTypeNavigationId == this.manualEditingId || this.RepricingItemForm.value.amount > 0 && this.RepricingItemForm.value.changeTypeNavigationId > 0) {
      const formData = this.getFormData();
      this.repricingitemsService.GetFilteredRepricingItemsDT(formData).subscribe((result) => {
        this.tabelData = result
        this.tabelData.forEach(e => {
          e.selected = false;
        });
      });
    } else {
      this.alert.SaveFaildFieldRequired();
    }

    // if (this.RepricingItemForm.value.amount > 0 && this.RepricingItemForm.value.changeTypeNavigationId > 0) {
    //   const formData = this.getFormData();
    //   this.repricingitemsService.GetFilteredRepricingItemsDT(formData).subscribe((result) => {
    //     this.tabelData = result
    //     this.tabelData.forEach(e => {
    //       e.selected = false;
    //     });
    //   });
    // } else {
    //   this.alert.SaveFaildFieldRequired();
    // }
  }

  selectAllItems(event) {
    const checkbox = event.target as HTMLInputElement;
    this.tabelData.forEach((item) => (item.selected = checkbox.checked));
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    if (this.tabelData == undefined) {
      this.alert.ShowAlert("msgEnterAllData",'error');
      this.disableSave = false;
      return false;      
    }
    else{
      const list = this.tabelData.filter(e => e.selected === true);
      if (list.length == 0){
        this.alert.ShowAlert("msgSelectOneItem",'error');
        this.disableSave = false;
        return false;
      }
      else{     
     //   if (this.RepricingItemForm.value.amount > 0 && this.RepricingItemForm.value.changeTypeNavigationId > 0) {
        if (this.RepricingItemForm.value.changeTypeNavigationId == this.manualEditingId || this.RepricingItemForm.value.amount > 0 && this.RepricingItemForm.value.changeTypeNavigationId > 0) {
          const dataToSend = {
            id: this.RepricingItemForm.value.id,
            transDate: this.RepricingItemForm.value.transDate,
            changeType: this.RepricingItemForm.value.changeTypeNavigationId,
            amount: this.RepricingItemForm.value.amount,
            increase: this.RepricingItemForm.value.increase === 'true' ? true : false,
            note: this.RepricingItemForm.value.note,
            repricingItemsFilter: {
              amount: this.RepricingItemForm.value.amount,
              unitId: this.RepricingItemForm.value.unitId,
              brandId: this.RepricingItemForm.value.brandId,
              modelId: this.RepricingItemForm.value.modelId,
              groupId: this.RepricingItemForm.value.groupId,
              changeTypeNavigationId: this.RepricingItemForm.value.changeTypeNavigationId,
              priceCategoryId: this.RepricingItemForm.value.priceCategoryId,
              categoryId: this.RepricingItemForm.value.categoryId,
              increase: this.RepricingItemForm.value.increase === 'true' ? true : false,
            },
            repricingItemsDts: list
          };
          this.repricingitemsService.PostRepricingItemsDT(dataToSend).subscribe(() => {
            this.alert.SaveSuccess();
            this.ClearAfterSave();
            this.ngOnInit();
            this.GetAllLists();
          });
          this.disableSave = false;
        } else {
          this.alert.SaveFaildFieldRequired();
        }
      //  this.router.navigate(['RepricingItem/RepricingItems']);
      }
    }
  }

  ClearAfterSave()
  {
    debugger
   this.tabelData = [];
  }

  getFormData() {
    const formData = new FormData();
    formData.append('id', this.RepricingItemForm.value.id)
    formData.append("amount", this.RepricingItemForm.value.amount)
    formData.append("transDate", this.RepricingItemForm.value.transDate)
    formData.append("increase", this.RepricingItemForm.value.increase)
    formData.append("note", this.RepricingItemForm.value.note)
    formData.append("changeTypeId", this.RepricingItemForm.value.changeTypeId)
    formData.append("costCenterPolicy", this.RepricingItemForm.value.costCenterPolicy)
    formData.append("brandId", this.RepricingItemForm.value.brandId)
    formData.append("byUserId", this.RepricingItemForm.value.byUserId)
    formData.append("categoryId", this.RepricingItemForm.value.categoryId)
    formData.append("changeTypeNavigationId", this.RepricingItemForm.value.changeTypeNavigationId)
    formData.append("groupId", this.RepricingItemForm.value.groupId)
    formData.append("modelId", this.RepricingItemForm.value.modelId)
    formData.append("priceCategoryId", this.RepricingItemForm.value.priceCategoryId)
    formData.append("unitId", this.RepricingItemForm.value.unitId)
    formData.append("companyId", this.jwtAuth.getCompanyId())
    return formData;
  }

}
