import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { ProdordersService } from '../../prodorders.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-available-qty',
  templateUrl: './available-qty.component.html',
  styleUrls: ['./available-qty.component.scss']
})
export class AvailableQtyComponent implements OnInit {
  itemForm: FormGroup;
  avlQtyByCountryList: any[] = [];
  selectedList: any[] = [];
  isChecked: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private alert: sweetalert,
    private prodordersService: ProdordersService,
    private formbulider: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.itemForm = this.formbulider.group({
      isChecked: [false],
      countryName: [''], 
      fromCountryId : [0],
      toCountryId : [0],
      avlQty: [0],      
      reqQty: [0]       
    });
    this.InitiailForm();
  }

  InitiailForm() { 
    debugger
      this.prodordersService.GetItemQtyByCountry(this.data.itemNo).subscribe(result => {
        // var materialList = result.filter(c=> c.qty * element.manFactQty > c.avlQty);
        // if(materialList.length>0){
        //   materialList.forEach(e=> {
        //     e.reqQty = e.qty * element.manFactQty;
        //   })
        // }
        this.avlQtyByCountryList = result;//[...this.avlQtyByCountryList , ...result];
      })
  }

  Save(){
    debugger
    let stopExecution = false;
    if(this.selectedList.length>0){
      this.selectedList.forEach(c=> {
        if(c.reqQty === 0){
          this.alert.ShowAlert("msgEnterAllData",'error');
          stopExecution = true;
          return false;
        }
      })
      if (stopExecution) {
        return; 
      } 
      localStorage.setItem('items',JSON.stringify(this.selectedList));
      this.dialogRef.close(this.selectedList);
    }
    else{
      this.alert.ShowAlert("SelectOneRecord",'error');
    }    
  }

  calculateSum(){
     
    return this.avlQtyByCountryList.reduce((sum, item) => sum + parseFloat(item.reqQty), 0);
 
  }

  checkQty(row: any){
    debugger
    if (row.reqQty > row.avlQty) {
      row.reqQty = row.avlQty;
    }
}
}
