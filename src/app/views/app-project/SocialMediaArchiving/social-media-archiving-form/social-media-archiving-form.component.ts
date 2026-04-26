import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { sweetalert } from 'sweetalert';
import { SocialMediaArchivingService } from '../social-media-archiving.service';
import { formatDate, PathLocationStrategy } from '@angular/common';
import { delay, of } from 'rxjs';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { UplodeFileService } from 'app/shared/services/upload-file.service';


export class UplodeFileModel {
  fullName: string;
  docName: string;
  docExt: string;
  base64: string;
  docType: string;
  docId: number;
  typeId: number;
  companyId: number;
}

@Component({
  selector: 'app-social-media-archiving-form',
  templateUrl: './social-media-archiving-form.component.html',
  styleUrl: './social-media-archiving-form.component.scss'
})
export class SocialMediaArchivingFormComponent {
  SocialMediaArchivingForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll: boolean;
  disableSave: boolean;
  lang: string;
  showsave: boolean;
  public id: any;
  public opType: string;
  //List
  ProjectList: any;
  PlaceList: any;
  EventClassList: any;
  EventTypeList: any;
  DocumentTypeList: any;
  NameOftheMediaStationList: any;
  RawMaterialLocation: any;
  FinalMaterialLocation: any;
  place:any ;
  public CountryList: any[] = [];
  public GovernorateList: any[] = [];
  public DistrictList: any[] = [];
  public filteredGovernorates: any[] = [];
  public filteredDistricts: any[] = [];

  constructor(
    private readonly title: Title,
    private readonly jwtAuth: JwtAuthService,
    private readonly alert: sweetalert,
    private readonly translateService: TranslateService,
    public router: Router,
    private readonly formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private readonly http: HttpClient,
    private readonly appCommonserviceService: AppCommonserviceService,
    private readonly dialog: MatDialog,
    private readonly route: ActivatedRoute,
    private readonly Service: SocialMediaArchivingService,
    private uplodeFileService: UplodeFileService,
  ) { }

  ngOnInit(): void {
    debugger
    this.id = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;
    this.SetTitlePage();
    this.SocialMediaArchivingForm = this.formbulider.group({
      id: [0 || this.id],
      companyId: [0],
      projectId: ["", Validators.required,],
      eventNo: [0, Validators.pattern('^[1-9][0-9]*')],
      description: ["", Validators.required],
      eventDate: [new Date(), Validators.required],
      placeId: [0],
      eventClass: [0],
      eventType: [0],
      documentType: [0],
      participants: [""],
      rawMaterialLocation: [""],
      finalMaterialLocation: [''],
      mediaStation: [0],
      countryId: [0],
      governorateId: [0],
      districtId: [0],
      place :[""],

    });

    if (this.id == null || this.id == undefined || this.id === "") {
      this.router.navigate(['SocialMediaArchiving/SocialMediaArchivingList']);
    }

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
    this.GetSocialMediaArchivingInfo();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SocialMediaArchivingForm');
    this.title.setTitle(this.TitlePage);
  }

  GetSocialMediaArchivingInfo() {
    debugger
    this.Service.getSocialMediaArchivingInfo(this.id, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['SocialMediaArchiving/SocialMediaArchivingList']);
        return;
      }
      result.eventDate = formatDate(result.eventDate, "yyyy-MM-dd", "en-US");
      this.ProjectList = result.projectList;
      this.PlaceList = result.placeList;
      this.EventClassList = result.eventClassList;
      this.EventTypeList = result.eventTypeList;
      this.DocumentTypeList = result.documentTypeList;
      this.NameOftheMediaStationList = result.nameOftheMediaStationList;
      this.SocialMediaArchivingForm.patchValue(result);


      this.CountryList = result.countryList || [];
      this.GovernorateList = result.governorateList || [];
      this.DistrictList = result.districtList || [];
      const countryId = +this.SocialMediaArchivingForm.get('countryId')!.value || 0;
      const governorateId = +this.SocialMediaArchivingForm.get('governorateId')!.value || 0;
      this.filterGovernorates(countryId);
      this.filterDistricts(governorateId);



      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if (this.id > 0) {
          this.SocialMediaArchivingForm.get('rawMaterialLocation').setValue(result.rawMaterialLocation);
          this.SocialMediaArchivingForm.get('finalMaterialLocation').setValue(result.finalMaterialLocation);
        }
        else {
          this.SocialMediaArchivingForm.get('placeId').setValue(0);
          this.SocialMediaArchivingForm.get('eventClass').setValue(0);
          this.SocialMediaArchivingForm.get('eventType').setValue(0);
          this.SocialMediaArchivingForm.get('documentType').setValue(0);
          this.SocialMediaArchivingForm.get('mediaStation').setValue(0);
        }
      });
    });
  }

  OnSaveForms() {
    debugger
    let isValid = true;
    this.disableSave = true;

    const formValue = this.SocialMediaArchivingForm.value;

    if (!this.RawMaterialLocation) {
      this.RawMaterialLocation = formValue.rawMaterialLocation;
    }
    if (!this.FinalMaterialLocation) {
      this.FinalMaterialLocation = formValue.finalMaterialLocation;
    }

    const saveModel = {
      ...formValue,
      rawMaterialLocation: this.RawMaterialLocation,
      finalMaterialLocation: this.FinalMaterialLocation

    };

    if (isValid) {
      this.Service.saveSocialMediaArchiving(saveModel).subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();
          this.ClearAfterSave();
          this.router.navigate(['SocialMediaArchiving/SocialMediaArchivingList']);
          this.ngOnInit();
        } else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      }, (error) => {
        this.disableSave = false;
      });
    }
  }
onFolderSelected(event: any) {
  debugger
  const files: FileList = event.target.files;
  if (!files || files.length === 0) return;

  const firstFile = files[0];
  const relativePath = firstFile.webkitRelativePath; 
  // e.g. "Project/Data/Excel/file.xlsx"

  // Get the full folder path by removing the file name
  const folderPath = relativePath.substring(0, relativePath.lastIndexOf('/'));


  // Set the full folder path to the textbox
  this.SocialMediaArchivingForm.get('rawMaterialLocation')?.setValue(folderPath);

  // Clear input so files are not uploaded
  event.target.value = '';
}



onFileSelected(event: Event, type: 'file' | 'folder') {
  const input = event.target as HTMLInputElement;

  if (!input?.files?.length) return;

  const files = Array.from(input.files);

  const uploadedPaths: string[] = [];
  let completedUploads = 0;

  let rootFolderName = '';
  if (type === 'folder') {
    const firstRelativePath = files[0].webkitRelativePath;
    rootFolderName = firstRelativePath.split('/')[0];
  }

  files.forEach(file => {
    const model = new UplodeFileModel();

    model.fullName = type === 'folder' ? file.webkitRelativePath : file.name;

    this.uplodeFileService.convertFileToBase64(file).subscribe(base64 => {
      model.base64 = base64;

      this.Service.uploadRawMaterial(model).subscribe((response: any) => {
        completedUploads++;

        if (response?.path) {
          uploadedPaths.push(response.path);
        }

        if (completedUploads === files.length) {
          if (type === 'folder') {
            this.RawMaterialLocation = `C:/Companies/Folder/${rootFolderName}`;
          } else {
            this.RawMaterialLocation = uploadedPaths[0]; 
          }

          this.SocialMediaArchivingForm.get('rawMaterialLocation').setValue(this.RawMaterialLocation);
        }

      }, error => {
        completedUploads++;
        this.alert.ShowAlert("ErrorForUploadFolder", 'error');
      });
    });
  });
}

onFileSelecteds(event: Event, type: 'file' | 'folder') {
  const input = event.target as HTMLInputElement;

  if (!input?.files?.length) return;

  const files = Array.from(input.files);
  const uploadedPaths: string[] = [];
  let completedUploads = 0;

  let rootFolderName = '';
  if (type === 'folder') {
    const firstRelativePath = files[0].webkitRelativePath;
    rootFolderName = firstRelativePath.split('/')[0];
  }

  files.forEach(file => {
    const model = new UplodeFileModel();
    model.fullName = type === 'folder' ? file.webkitRelativePath : file.name;

    this.uplodeFileService.convertFileToBase64(file).subscribe(base64 => {
      model.base64 = base64;

      this.Service.uploadRawMaterial(model).subscribe((response: any) => {
        completedUploads++;

        if (response?.path) {
          uploadedPaths.push(response.path);
        }

        if (completedUploads === files.length) {
          if (type === 'folder') {
            this.FinalMaterialLocation = `C:/Companies/Folder/${rootFolderName}`;
          } else {
            this.FinalMaterialLocation = uploadedPaths[0]; 
          }

          this.SocialMediaArchivingForm.get('finalMaterialLocation')?.setValue(this.FinalMaterialLocation);
        }

      }, error => {
        completedUploads++;
        this.alert.ShowAlert("ErrorForUploadFolder", 'error');
      });
    });
  });
}



/* 
  onFileSelecteds(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input?.files?.length) {
      const files = Array.from(input.files);
      const uploadedPaths: string[] = [];
      let completedUploads = 0;

      const firstRelativePath = files[0].webkitRelativePath;
      const rootFolderName = firstRelativePath.split('/')[0];

      files.forEach(file => {
        const model = new UplodeFileModel();
        model.fullName = file.webkitRelativePath;

        this.uplodeFileService.convertFileToBase64(file).subscribe(base64 => {
          model.base64 = base64;

          this.Service.uploadRawMaterial(model).subscribe((response: any) => {
            completedUploads++;

            if (response?.path) {
              uploadedPaths.push(response.path);
            }

            if (completedUploads === files.length) {

              this.FinalMaterialLocation = `C:/Companies/Folder/${rootFolderName}`;
              this.SocialMediaArchivingForm.get('finalMaterialLocation').setValue(this.FinalMaterialLocation);

            }
          }, error => {
            completedUploads++;
            this.alert.ShowAlert("ErrorForUploadFolder", 'error')
          });
        });
      });
    }
  } */


  ClearAfterSave() {
    this.SocialMediaArchivingForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    this.SocialMediaArchivingForm.get('eventDate').setValue(currentDate);
    this.SocialMediaArchivingForm.value.projectId = 0;
    this.SocialMediaArchivingForm.value.eventNo = 0;
    this.SocialMediaArchivingForm.value.description = '';
    this.SocialMediaArchivingForm.value.placeId = 0;
    this.SocialMediaArchivingForm.value.eventClass = 0;
    this.SocialMediaArchivingForm.value.eventType = 0;
    this.SocialMediaArchivingForm.value.documentType = 0;
    this.SocialMediaArchivingForm.value.participants = '';
    this.SocialMediaArchivingForm.value.rawMaterialLocation = '';
    this.SocialMediaArchivingForm.value.finalMaterialLocation = '';
    this.SocialMediaArchivingForm.value.mediaStation = 0;
    this.SocialMediaArchivingForm.value.place = '';
  }

    onCountryChange(countryId: number) {
    // reset children
    this.SocialMediaArchivingForm.patchValue({
      governorateId: 0,
      districtId: 0,
    });

    this.filterGovernorates(countryId);
    this.filteredDistricts = [];
  }

  onGovernorateChange(governorateId: number) {
    // reset child
    this.SocialMediaArchivingForm.patchValue({
      districtId: 0,
    });

    this.filterDistricts(governorateId);
  }

  private filterGovernorates(countryId: number) {
    if (countryId > 0) {
      // نفس فكرتك: data1 يحمل الـ parentId كنص
      this.filteredGovernorates = (this.GovernorateList || []).filter(
        x => x.data1 === countryId.toString()
      );
    } else {
      this.filteredGovernorates = [];
    }
  }

  private filterDistricts(governorateId: number) {
    if (governorateId > 0) {
      this.filteredDistricts = (this.DistrictList || []).filter(
        x => x.data1 === governorateId.toString()
      );
    } else {
      this.filteredDistricts = [];
    }
  }


}
