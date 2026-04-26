import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-countriesqty',
  templateUrl: './countriesqty.component.html',
  styleUrls: ['./countriesqty.component.scss']
})
export class CountriesqtyComponent implements OnInit {
  CountriesqtyForm: FormGroup;
  RequstId: any; 
  public TitlePage: string;
  countriesList: any[];
  countriesQtyList: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
  ) { }

  ngOnInit(): void {
    debugger
    this.RequstId = this.routePartsService.GuidToEdit;

    this.SetTitlePage();
    this.InitiailCountriesqtyForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('addCompany');
    this.title.setTitle(this.TitlePage);
  }

  InitiailCountriesqtyForm() {    
    this.CountriesqtyForm = this.formbulider.group({
      id: [0],
      invRecId: [0],
      countryId: [0],
      countryQty: [0],
    });
    this.countriesList = this.data.countriesList;
    debugger
    if(this.data.transList == null || this.data.transList.length === 0){
      if(this.data.manfCountries.length > 0 ){
        const countriesArray: string[] = this.data.manfCountries.split(',');
        countriesArray.forEach(element => {
          if(parseInt(element)>0){
            this.countriesQtyList.push(
            {
              id: this.data.rowIndex,
              invRecId: 0,
              countryId: parseInt(element),
              countryQty: countriesArray.length > 1 ? 0 : this.data.qty,
              index: this.data.rowIndex
            });            
          }
        });
      }
      //this.AddNewLine();
    }
    else if(this.data.transList.length > 0){
      this.countriesQtyList = this.data.transList;
    } 
    else{
      this.AddNewLine();
    }
  }

  OnSaveForms() {
    debugger
    var total = this.countriesQtyList.reduce((sum, item) => sum + parseFloat(item.countryQty), 0); 
    if( total > this.data.qty){
      this.alert.ShowAlert("msgConQty",'error');
      return false;
    }
    let stopExecution = false;
    this.countriesQtyList.forEach(element => {
      if(element.countryId === 0 || Number(element.countryQty) == 0 ){
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        return false;
      }
    });
    if (stopExecution) {
      this.alert.ShowAlert("msgEnterAllData",'error');
      return; 
    } 
    this.dialogRef.close(this.countriesQtyList);
  }

  calculateSum(){
      return this.countriesQtyList.reduce((sum, item) => sum + parseFloat(item.countryQty), 0); 
  }

  AddNewLine(){    
    debugger
    this.countriesQtyList.push(
    {
      id: this.data.rowIndex,
      invRecId: 0,
      countryId: null,
      countryQty: 0,
      index: this.data.rowIndex
    });
    //this.CountriesqtyForm.get("countriesQtyList").setValue(this.countriesQtyList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.countriesQtyList.splice(rowIndex, 1);
    }
    //this.CountriesqtyForm.get("countriesQtyList").setValue(this.countriesQtyList);
  }
}

