import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItemService } from '../../../item.service'; 
import { ItemsPrices, Price } from '../../../model/items-prices';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-price-by-category',
  templateUrl: './price-by-category.component.html',
  styleUrls: ['./price-by-category.component.scss']
})
export class PriceByCategoryComponent implements OnInit {
  PriceByCategoryForm: FormGroup;
  pricesCategoriesList: any[] = [];
  unitsPriceList: any[] = [];
  dataTable: ItemsPrices[];
  selectedPriceTemp: any;
  selectedPrice: any;
  loading: boolean = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private itemService: ItemService,
    private formbulider: FormBuilder,
  ) { }

  ngOnInit() {
    this.getItemsPrices();
  }

  getItemsPrices() {
    debugger
    this.PriceByCategoryForm = this.formbulider.group({
      id: [0],
      itemUnitId: [0],
      price: [0],
      discount : [0],
      priceCategoryId: [0],
      text: [''],
    });
    this.pricesCategoriesList = this.data.pricesCategoriesList;
    if(this.data.unitPricesList.length > 0){
      //this.unitsPriceList = this.data.unitPricesList;
      this.pricesCategoriesList.forEach(element=> {
        if (element.id > 0){
          let uprice  = this.data.unitPricesList.filter(c=> c.priceCategoryId == element.id);
          this.unitsPriceList.push({
            id: this.data.rowIndex,
            itemUnitId: this.data.unitId,
            price: uprice.length>0 ? uprice[0].price : 0,
            discount : uprice.length>0 ? uprice[0].discount : 0,
            priceCategoryId: element.id,
            text: element.text,
          });
        }        
      })
    }
    else{
      this.pricesCategoriesList.forEach(element=> {
        if (element.id > 0){
          this.unitsPriceList.push({
            id: this.data.rowIndex,
            itemUnitId: this.data.unitId,
            price: 0,
            discount : 0,
            priceCategoryId: element.id,
            text: element.text,
          });
        }        
      })
    }   
  }

  getUintName() {
    return this.data?.unitName;
  }


  setAllPrices() {
    const firstRowPrice = this.unitsPriceList[0].price;
    this.unitsPriceList.forEach(itemPrice => {
      itemPrice.price = firstRowPrice;
    });
  }

  setAllDiscounts() {
    const firstRowDiscount = this.unitsPriceList[0].discount;
    this.unitsPriceList.forEach(itemPrice => {
      itemPrice.discount = firstRowDiscount;
    });
  }


  onSave() {
    this.dialogRef.close(this.unitsPriceList)
    console.log(this.unitsPriceList);
  }
}