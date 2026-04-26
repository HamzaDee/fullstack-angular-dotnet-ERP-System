import { Component, Input, OnInit ,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-item-informationsn',
  templateUrl: './item-informationsn.component.html',
  styles: [
  ]
})
export class ItemInformationsnComponent implements OnInit {
  informationForm: FormGroup
  prioritiesLevelsList: any;
  sizesList: any;
  storesList:any;
  suppliersList: any;
  taxesList: any;
  colorsList: any;
  modelsList: any;
  brandIsList: any;
  countriesOriginList: any;
  categoriesList: any;
  itemTypeList:any;
  @Input() informationFormData: any;
  @Input() UseTax: any;
  @Input() TaxId: any;
  @Input() CategoryId: any;
  CompanyName:string;
  filteredCategoriesList = [];
  allcatogriesList:any;
  groupId :any;
  constructor(
    private formbulider: FormBuilder,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {
    this.CompanyName = window.localStorage.getItem('companyName');
    this.initializeForm();
  }

  initializeForm() {
    this.informationForm = this.formbulider.group({
      countryOrigin: [0],
      categoryId: [0, Validators.required],
      modelId: [0],
      brandId: [0],
      colorId: [0],
      supplierId: [0],
      taxId: [0],
      priorityLevelId: [0],
      productionCompany: [0],
      sizeId: [0],
      season: [""],
      maxQty: [0],
      minQty: [0],
      orderQty: [0],
      storeId:[0],
      typeId:[0,Validators.required],
      specifications: [""],
      length:  [0],
      width:  [0],
      height:  [0],
      weight:  [0],
      expDateReminder:[0],
    });
    this.getInialiazeForm();
  }

  getInialiazeForm() {
    debugger
    if (this.informationFormData) {
      this.informationForm.patchValue(this.informationFormData);
      if(this.CompanyName =="Hashmyieh")
        {
          this.allcatogriesList = this.informationFormData.hashCatList;
          this.filteredCategoriesList = []
        }
      else
        {
          this.filteredCategoriesList =this.informationFormData.categoriesList;
        }
     
      this.countriesOriginList = this.informationFormData.countriesOriginList;
      this.brandIsList = this.informationFormData.brandIsList;
      this.modelsList = this.informationFormData.modelsList;
      this.colorsList = this.informationFormData.colorsList;
      this.taxesList = this.informationFormData.taxesList;
      this.suppliersList = this.informationFormData.suppliersList;
      this.prioritiesLevelsList = this.informationFormData.prioritiesLevelsList;
      this.sizesList = this.informationFormData.sizesList;
      this.storesList = this.informationFormData.storesList;
      this.itemTypeList = this.informationFormData.itemTypeList;
      if(this.informationFormData.countryOrigin == null || this.informationFormData.countryOrigin == undefined)
        {
          this.informationForm.get("countryOrigin").setValue(0);
        }
        debugger         
      if(this.CompanyName =="Hashmyieh")
          {
            if(this.informationFormData.groupId !== 0 && this.informationFormData.groupId !== undefined && this.informationFormData.groupId !== null)
              {
                  this.filteredCategoriesList = this.allcatogriesList.filter(x => x.id == 0 ||  x.data1 === this.informationFormData.groupId.toString());
              }  
          } 
      if(this.informationFormData.categoryId == null || this.informationFormData.categoryId == undefined)
        {
          this.informationForm.get("categoryId").setValue(0);
        }
        else if (this.TaxId != 0 && this.TaxId != null && this.TaxId != undefined)
        {
          this.informationForm.get("categoryId").setValue(this.CategoryId);                    
        }
      if(this.informationFormData.modelId == null || this.informationFormData.modelId == undefined)
        {
          this.informationForm.get("modelId").setValue(0);
        }
      if(this.informationFormData.brandId == null || this.informationFormData.brandId == undefined)
        {
          this.informationForm.get("brandId").setValue(0);
        }
      if(this.informationFormData.colorId == null || this.informationFormData.colorId == undefined)
        {
          this.informationForm.get("colorId").setValue(0);
        }
      if(this.informationFormData.supplierId == null || this.informationFormData.supplierId == undefined)
        {
          this.informationForm.get("supplierId").setValue(0);
        }
      if(this.informationFormData.taxId == null || this.informationFormData.taxId == undefined)
        {
          this.informationForm.get("taxId").setValue(0);
        }
        else if (this.TaxId != 0 && this.TaxId != undefined && this.TaxId != null)
        {
          this.informationForm.get("taxId").setValue(this.TaxId);
        }
      if(this.informationFormData.priorityLevelId == null || this.informationFormData.priorityLevelId == undefined)
        {
          this.informationForm.get("priorityLevelId").setValue(0);
        }  
      if(this.informationFormData.expDateReminder == null || this.informationFormData.expDateReminder == undefined)
        {
          this.informationForm.get("expDateReminder").setValue(0);
        }  
      debugger
      if(this.informationFormData.typeId == 0 ||this.informationFormData.typeId == undefined ||this.informationFormData.typeId == null)
        {
          this.informationForm.get("typeId").setValue(182);        
        }
        else
        {
          this.informationForm.get("typeId").setValue(this.informationFormData.typeId);        
        }  
         
        this.cdr.detectChanges();
    }
  }

 public SetvariblesValue(catId :any , taxId : any)
  {
     if (catId != 0 && catId!= null && catId != undefined)
      {
        this.informationForm.get("categoryId").setValue(catId);                    
      }
      else
      {
        this.informationForm.get("categoryId").setValue(0);
      }
    if (taxId != 0 && taxId!= null && taxId != undefined)
      {
        this.informationForm.get("taxId").setValue(taxId);                    
      }
    else
    {
      this.informationForm.get("taxId").setValue(0);
    }

  }
}