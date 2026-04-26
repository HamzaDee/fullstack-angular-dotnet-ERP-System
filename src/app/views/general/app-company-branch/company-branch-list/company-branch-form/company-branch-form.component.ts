import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { CheckPermissionsService } from 'app/shared/services/app-permissions/check-permissions.service';
import { ScreenActionsEnum } from 'app/shared/Enum/enum';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropDownModel } from 'app/shared/models/DropDownModel';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as _ from 'lodash';
import { CompanyBranchModel } from '../companyBranchModel';
import { CompanyBranchService } from '../../company-branch.service';
@Component({
  selector: 'app-company-branch-form',
  templateUrl: './company-branch-form.component.html',
  styleUrls: ['./company-branch-form.component.scss']
})
export class CompanyBranchFormComponent implements OnInit {
  public TitlePage: string;
  RequstId: any;
  hasPerm: boolean;
  titlePage: string;
  showLoader = false
  CompanyBranchAddForm: FormGroup;
  companyInFoModel: CompanyBranchModel
  companyActivityList: any;
  groupList: any;
  selectedCompanyActivity: any;
  selectedGroup: any;
  selectedlatitude: any;
  selectedlongitude: any;
  zoom = 6;
  mapCenter = {
    lat: 31.94676919212428,
    lng: 35.91525067276346
  }

  public Type: any;

  constructor(
    private translateService: TranslateService,
    private jwtAuth: JwtAuthService,
    private title: Title,
    private alert: sweetalert,
    public router: Router,
    private formbulider: FormBuilder,
    private companyBranchService: CompanyBranchService,
    public routePartsService: RoutePartsService,
  ) { }

  ngOnInit(): void {
    debugger
    this.RequstId = this.routePartsService.GuidToEdit;
    this.Type = this.routePartsService.Guid2ToEdit;

    this.SetTitlePage();
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['CompanyBranch/CompanyBranchList']);
    }
    this.InitiailCompanyForm();
    this.GetCompanyBranchInitialForm();
  }
  SetTitlePage() {
    debugger
    if(this.Type == 'Show'){
      this.TitlePage = this.translateService.instant('EditCompanyBranchList');
    }
    else{
      this.TitlePage = this.translateService.instant('CompanyBranchList');
    }
    this.title.setTitle(this.TitlePage);
  }
  InitiailCompanyForm() {
    this.CompanyBranchAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      branchNameA: ["",[Validators.required, Validators.min(1)]],
      branchNameE: ["",[Validators.required,Validators.min(1)]],
      tel1: [""],
      tel2: [""],
      addressA: [""],
      addressE: [""],
      fax: [""],
      note: [""],
      mapLat: [0],
      mapLng: [0],
    });
  }
  GetCompanyBranchInitialForm() {
    debugger
    this.companyBranchService.GetCompanyBranchInitialForm(this.RequstId).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['CompanyBranch/CompanyBranchList']);
          return;
        }
      this.CompanyBranchAddForm.patchValue(result);
    })
  }


  validatePhoneNumber(phone: string): boolean {
    const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return pattern.test(phone);
  }
  

  OnSaveForms() {
    debugger
    const tel1 = this.CompanyBranchAddForm.value.tel1 || '';
    const tel2 = this.CompanyBranchAddForm.value.tel2 || '';

    if (tel1 !== '' && !this.validatePhoneNumber(tel1)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    if (tel2 !== '' && !this.validatePhoneNumber(tel2)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }


    this.CompanyBranchAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.companyBranchService.PostCompanyBranch(this.CompanyBranchAddForm.value).subscribe(res => {
      debugger
      this.alert.SaveSuccess()
      this.router.navigate(['CompanyBranch/CompanyBranchList']);
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }
  handleMapClick(Gmap) {
    this.selectedlatitude = Gmap.latitude;
    this.selectedlongitude = Gmap.longitude
  }
}
