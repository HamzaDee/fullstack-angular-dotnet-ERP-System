import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChangeFixedAssetsLocationService } from '../change-fixed-assets-location.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { FachangeLocationModel } from '../FachangeLocationModel';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-change-fixed-assets-location-form',
  templateUrl: './change-fixed-assets-location-form.component.html',
  styleUrls: ['./change-fixed-assets-location-form.component.scss']
})
export class ChangeFixedAssetsLocationFormComponent implements OnInit {
  public id: any;
  public Flag: number = 0;
  public transNo: any;
  public showLoader = false;
  loading: boolean;
  public AssestList: any;
  public selectedAssest: Number = 0;
  public NewLocationList: any;
  public selectedNewLocation: Number = 0;
  public FromLocationList: any;
  public selectedFromLocation: Number = 0;
  public Data: FachangeLocationModel = new FachangeLocationModel();
  FixedassetsChangeLocationForm: FormGroup;
  LocationList: any[];
  isDropdownDisabled: boolean = true;
  unitsList: Array<any> = [];
  public disabled = false;
  disableAll:boolean=false;
  public TitlePage: string;
  public opType: string;
  showsave: boolean;
  disableSave:boolean;
  newDate:Date = new Date;

  constructor(
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private ChangeFixedAssetsLocationService: ChangeFixedAssetsLocationService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private cdRef: ChangeDetectorRef,
    private title: Title,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.id = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit; 
    this.showsave = this.routePartsService.Guid3ToEdit;

    //this.Flag = this.routePartsService.Guid2ToEdit;
    //this.transNo = this.routePartsService.Guid3ToEdit;

    this.FixedassetsChangeLocationForm = this.formbulider.group({
      id               : [0 || this.id],
      companyId        : [0],               
      transNo          : [0 || this.transNo],                            
      transDate        : [new Date()],                         
      transNote        : [''],                            
      assetId          : [0],   
      fromLocationId   : [0],           
      toLocationId     : [0],                            
      note             : [''], 
      LocationList     : [null],
    });

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    if (this.id  == undefined)
    this.router.navigate(['ChangeFixedAssetsLocation/ChangeFixedAssetsLocationList']);


      this.GetFixedassetsChangLocationInfo();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ChangeFixedAssetsLocationList');
    this.title.setTitle(this.TitlePage);
  }

  GetFixedassetsChangLocationInfo() {
    debugger
    this.ChangeFixedAssetsLocationService.getFixedAssetLocationChangeInfo(this.id, this.opType).subscribe((result) => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['ChangeFixedAssetsLocation/ChangeFixedAssetsLocationList']);
          return;
        } 

      //this.AssestList       = result.assestList;
      debugger
      this.AssestList       = result.assestList;
      this.NewLocationList  = result.newLocationList;
      this.FromLocationList = result.newLocationList;
      this.LocationList     = result.locationList;
      this.Data = result;
      this.disableSave = false;
      if(result.id == 0)
      {
        result.transDate = formatDate(result.transDate, "yyyy-MM-dd", "en-US");

      }
      this.FixedassetsChangeLocationForm.patchValue(result); 
      if (result.locationList != null){
        this.LocationList = result.locationList;
        var i =0;
        this.LocationList.forEach(element => {
          this.unitsList[i] = this.NewLocationList;
          i++;
        })
      }
    /*   else{
        this.LocationList = [
          {                    
            assetId        :0,
            fromLocationId :0,
            toLocationId   :0,
            transNote      :"",                   
          }
        ]
      } */
    });
  }

  isDisabled(assetId: any): boolean {
    const selectedAsset = this.AssestList.find(asset => asset.id === assetId);
    return selectedAsset ? parseInt(selectedAsset.data1, 10) > 96 : false;
  }
  
  AddNewLine() {
    debugger
    if (this.disableAll === true) {
      return;
    } 
  
    this.disabled = true;
  
    // Ensure LocationList is initialized
    if (!this.LocationList) {
      this.LocationList = [];
    }
  
    let maxId = 0;
    if (this.LocationList.length > 0) {
      debugger
      this.LocationList.forEach(elements => {
        debugger
        if (elements.id > maxId) {
          maxId = elements.id;
        }
      });
    }
  
    const newRow = {         
      assetId: 0,
      fromLocationId: 0,
      toLocationId: 0,
      transNote: "",     		
    };
    
    this.LocationList.push(newRow);
  }

  deleteRow(rowIndex: number) {
    debugger
    if(this.disableAll == true)
      {
        return;
      } 
    this.disabled = false;
    if (rowIndex !== -1) {
      this.LocationList.splice(rowIndex, 1);
    }
  }

  GetCurrentLocation(i: number = 0 , row){
        debugger
      this.ChangeFixedAssetsLocationService.getCurrentlocation(this.LocationList[i].assetId).subscribe((result)=> {
      debugger

      this.unitsList[i] = this.NewLocationList;
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.LocationList[i].fromLocationId = result;
      });
    
    }); 
  } 

  OnSaveForms() {
    debugger
    this.disabled = false;
    let isValid = true;
    this.disableSave = true;
    if (this.LocationList == null) {
      debugger
      this.alert.ShowAlert("msgEnterAllData", 'error');
      isValid = false;
      this.disableSave = false;
      return;
    }
    
  
    this.LocationList.forEach(element => {
      if (element.assetId == null || element.assetId <= 0) {
        isValid = false;
        this.disabled = true;
        this.disableSave = false;
        this.alert.PleaseEnterAssest();
        return;
      } else if (element.toLocationId <= 0) {
        isValid = false;
        this.disabled = true;
        this.disableSave = false;
        this.alert.SaveFaildFieldRequired();
        return;
      }
    });
  
    if (isValid) {
      this.disabled = true;
      this.FixedassetsChangeLocationForm.value.LocationList = this.LocationList;
      debugger

      this.ChangeFixedAssetsLocationService.saveFixedAssetLocationChange(this.FixedassetsChangeLocationForm.value).subscribe((result) => {
        debugger;
        if (result == true) {
          this.alert.SaveSuccess();
          this.disabled = false;
          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['ChangeFixedAssetsLocation/ChangeFixedAssetsLocationList']);
            }
            this.id = 0;
            this.opType = 'Add'; 
            this.ngOnInit();
        } else {
          this.alert.SaveFaild();
          this.disabled = false;
        }
        this.disableSave = false;
      });
    }
  }

  CheckIfLocationDifferent(index){
    debugger
    for (let j = 0; j < this.LocationList.length; j++) {
      if (this.LocationList[index].fromLocationId === this.LocationList[j].toLocationId) {
          this.disabled = true;
          this.alert.CanntSameLocation();
          this.LocationList[index] = {
            ...this.LocationList[index],
            toLocationId: 0
          };           
          this.cdRef.detectChanges();
          break; 
      }
      else{
        this.disabled = false;

      }
  }
    // this.FixedassetsChangeLocationForm.value.LocationList = this.LocationList;
    // this.LocationList.forEach(element =>{
    //   debugger
    //   if(element.fromLocationId == element.toLocationId)
    //   {
    //       this.disabled = true;
    //       this.alert.CanntSameLocation();
    //   }
    //  else
    //  {
    //     this.disabled = false;
    //  }
    // });
  }

  CheckIfChooseSameAssest(i, row) {
      debugger
      for (let j = 0; j < this.LocationList.length; j++) {
          if (i !== j && this.LocationList[i].assetId === this.LocationList[j].assetId) {
              this.disabled = true;
              this.alert.CanntSameAssestID();
              this.LocationList[i] = {
                ...this.LocationList[i],
                assetId: 0
              };           
              this.cdRef.detectChanges();
              break; 
          }
          else{
            this.disabled = false;

          }
      }
  }

  // CopyRow(row,index)
  // {
  //   debugger
  //   this.LocationList.push(
  //     {
  //       assetId:row.assetId,
  //       fromLocationId:row.fromLocationId,
  //       toLocationId:row.toLocationId,
  //       transNote:row.transNote,  
  //     });     
  //     this.CheckIfChooseSameAssest(index+1,row);
  //     return false;    
  // }

  // handleF3Key(event: KeyboardEvent, row, index) {   
     
  //   if (event.key === 'F4') {
  //     this.CopyRow(row,index);
  //   }
  // }
}