import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { RepricingitemsService } from '../repricingitems.service'; 



@Component({
  selector: 'app-repricing-items-details',
  templateUrl: './repricing-items-details.component.html',
  styleUrls: ['./repricing-items-details.component.scss']
})
export class RepricingItemsDetailsComponent implements OnInit {

  RepricingItemForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private repricingitemsService: RepricingitemsService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.InitiailRepricingForm();
    this.GetInitailRepricingForm();
  }


  InitiailRepricingForm() {
    this.RepricingItemForm = this.formbulider.group({
      id: [0],
      amount: [0],
      changeType: [0],
      transDate: [""],
      increase: [false],
      categoryName: [""],
      changeTypeName: [""],
      brandName: [""],
      groupName: [""],
      modelName: [""],
      priceCategoryName: [""],
      unitName: [""],
      userName: [""],
      note: [""]
    });
  }

  GetInitailRepricingForm() {
    this.repricingitemsService.GetRepricingItemByID(this.data.id).subscribe(result => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }
        
      console.log(result)
      this.tabelData = result.repricingItemsDts
      this.RepricingItemForm.patchValue(result)
    });
  }
  clearForm() {
    this.InitiailRepricingForm();
    this.GetInitailRepricingForm();
  }

  printPage() {
    window.print();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('DetailRepricingItems');
    this.title.setTitle(this.TitlePage);
  }

  OnSaveForms() {
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
    /*
      Get Materials
      */
  }

}
