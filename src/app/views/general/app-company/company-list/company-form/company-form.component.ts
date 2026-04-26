import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CompanyService } from '../../company.service';
import { sweetalert } from 'sweetalert';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss']
})
export class CompanyFormComponent implements OnInit {
  public TitlePage: string = "";
  uploadedFiles: FormData = new FormData();
  file: File = new File([], "");
  RequstId: any;
  hasPerm: boolean = false;
  titlePage: string = "";
  showLoader = false
  CompanyAddForm: FormGroup = new FormGroup({});
  companyActivityList: any;
  groupList: any;
  selectedCompanyActivity: any;
  selectedGroup: any;
  companyImage = "assets/images/defualt-upload.png";
  cardImageBase64: string = "";
  image:any;
  selectedlatitude: any;
  selectedlongitude: any;
  zoom = 6;
  mapCenter = {
    lat: 32.018275,
    lng: 35.863822
  }
  constructor(
    private translateService: TranslateService,
    private title: Title,
    private alert: sweetalert,
    public router: Router,
    private formbulider: FormBuilder,
    private companyService: CompanyService,
    public routePartsService: RoutePartsService,
  ) { }

  ngOnInit(): void {
    this.RequstId = this.routePartsService.GuidToEdit;

    this.SetTitlePage();
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['Company/CompanyList']);
    }
    this.InitiailCompanyForm();
    this.GetInitailCompany();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('companyForm');
    this.title.setTitle(this.TitlePage);
  }

  onUploadIamge(event : any) {
    if (event) {
      this.file = event[0]
      let reader = new FileReader();
      reader.readAsDataURL(event[0]);
      reader.onload = (event: any) => {
        this.companyImage = event.target.result;
        const imgBase64Path = event.target.result;
        this.cardImageBase64 = imgBase64Path;
      }
    }
  }

  ClearImagePath(image: any): void {
    image.value = "";
    this.image = "";
    this.companyImage = "assets/images/defualt-upload.png";
  }
  InitiailCompanyForm() {
    this.CompanyAddForm = this.formbulider.group({
      id: [0, [Validators.required]],
      activityID: [null],
      groupID: [null],
      companyNameA: ["", [Validators.required]],    /* , Validators.pattern(/[\u0600-\u06FF-/]/) */
      companyNameE: ["", [Validators.required]],
      website: [null, [Validators.pattern('^(https?:\/\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*\/?$')]],
      email: ["", [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      tel1: [""],
      tel2: [""],
      fax: [""],
      addressA: [""],
      addressE: [""],
      taxNo: [""],
      note: [""],
      mapLat: [0],
      mapLng: [0],
      facebook: [""],
      twitter: [""],
      whatsApp: [""],
      nationalNo: [""],
      incomeSourceNo: [0],
      clientId: [""],
      secretKey: [""],
      buildingNo: [""],
      city: [""],
      citySubdivisionName: [""],
      postalCode: [""],
    });
  }
  GetInitailCompany() {
    debugger
    this.companyService.GetInitialCompany(this.RequstId).subscribe(result => {
      debugger
      debugger
      if(!result.isSuccess && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['Company/CompanyList']);
          return;
        }


      this.CompanyAddForm.patchValue(result);
      this.companyActivityList = result.activityList
      this.groupList = result.groupList
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if(result.activityID == null)
          {
            this.selectedCompanyActivity = 0;    
          }
        else
          {
            this.selectedCompanyActivity = result.activityID;
          }
          if(result.groupID == null)
            {
              this.selectedGroup = 0;
            }
          else
            {
              this.selectedGroup = result.groupID;
            }
      });
      debugger
      if (result.logo && result.logo != "")
        {
          this.companyImage = environment.apiURL_Main + result.logo;  
          this.image=result.logo;
        }
        else       
        {
          this.companyImage = "assets/images/defualt-upload.png";
        }
      // if (result.logo != null && result.logo != "")
      //  // this.companyImage = 'http://localhost:7205' + result.logo;
      //  this.companyImage = environment.apiURL_Main + result.logo;

      // else
      //   this.companyImage = "assets/images/defualt-upload.png";
    })
  }

  validatePhoneNumber(phone: string): boolean {
    const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return pattern.test(phone);
  }
  
  OnSaveForms() {
    debugger
    const tel1 = this.CompanyAddForm.value.tel1 || '';
    const tel2 = this.CompanyAddForm.value.tel2 || '';

    if (tel1 !== '' && !this.validatePhoneNumber(tel1)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    if (tel2 !== '' && !this.validatePhoneNumber(tel2)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    const formData = new FormData();
    this.CompanyAddForm.value.mapLat ??= 0;
    this.CompanyAddForm.value.mapLng ??= 0;
    this.CompanyAddForm.value.activityID ??= 0;
    this.CompanyAddForm.value.groupID ??= 0;

    formData.append('Id', this.RequstId)
    formData.append("activityID", this.CompanyAddForm.value.activityID)
    formData.append("groupID", this.CompanyAddForm.value.groupID)
    formData.append("CompanyNameA", this.CompanyAddForm.value.companyNameA)
    formData.append("companyNameE", this.CompanyAddForm.value.companyNameE)
    formData.append("website", this.CompanyAddForm.value.website)
    formData.append("email", this.CompanyAddForm.value.email)
    formData.append("tel1", this.CompanyAddForm.value.tel1)
    formData.append("tel2", this.CompanyAddForm.value.tel2)
    formData.append("fax", this.CompanyAddForm.value.fax)
    formData.append("addressA", this.CompanyAddForm.value.addressA)
    formData.append("addressE", this.CompanyAddForm.value.addressE)
    formData.append("taxNo", this.CompanyAddForm.value.taxNo)
    formData.append("note", this.CompanyAddForm.value.note)
    formData.append("mapLat", this.CompanyAddForm.value.mapLat)
    formData.append("mapLng", this.CompanyAddForm.value.mapLng)
    formData.append("facebook", this.CompanyAddForm.value.facebook)
    formData.append("twitter", this.CompanyAddForm.value.twitter)
    formData.append("whatsApp", this.CompanyAddForm.value.whatsApp)
    formData.append("nationalNo", this.CompanyAddForm.value.nationalNo)
    formData.append("buildingNo", this.CompanyAddForm.value.buildingNo)
    formData.append("city", this.CompanyAddForm.value.city)
    formData.append("citySubdivisionName", this.CompanyAddForm.value.citySubdivisionName)
    formData.append("postalCode", this.CompanyAddForm.value.postalCode)

    formData.append("incomeSourceNo", this.CompanyAddForm.value.incomeSourceNo)
    formData.append("clientId", this.CompanyAddForm.value.clientId)
    formData.append("secretKey", this.CompanyAddForm.value.secretKey)
    if(this.image != "" && this.image != undefined && this.image != null)
      {
        formData.append("logo", this.image )
      }
    if (this.file == undefined) {
      formData.append("file", null as unknown as Blob)
    }
    else {
      formData.append("file", this.file)
      formData.append("logo", this.file.type)
      
    }
    debugger
    this.companyService.PostCompany(formData).subscribe({
      next: (res) => {
        debugger
        this.alert.SaveSuccess()
        this.router.navigate(['Company/CompanyList']);
      },
      error: (err) => {
        this.alert.SaveFaildFieldRequired()
      }
    })
  }
  handleMapClick(Gmap: any) {
    this.selectedlatitude = Gmap.latitude;
    this.selectedlongitude = Gmap.longitude
  }
}
