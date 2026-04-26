import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-items-locations',
  templateUrl: './items-locations.component.html',
  styleUrls: ['./items-locations.component.scss']
})
export class ItemsLocationsComponent implements OnInit {

  @Input() itemsLocationsFormData: any;
  storesList: any;
  itemsLocationsFormArray: FormArray;
  constructor(
    private fb: FormBuilder,

  ) { }

  ngOnInit(): void {
    this.initializeTable();
  }

  initializeTable() {
    this.storesList = this.itemsLocationsFormData?.storesList;
    this.itemsLocationsFormArray = this.fb.array([]);
    if (this.itemsLocationsFormData?.itemsLocationsSubs?.length > 0) {
      this.itemsLocationsFormData?.itemsLocationsSubs?.forEach((itemsLocation) => {
        const unitFormGroup = this.fb.group({
          id: [itemsLocation.id],
          itemId: 0,
          storeId: [itemsLocation.storeId, Validators.min(1)],
          location: [itemsLocation.location],
          maxQty:[itemsLocation.maxQty],
          minQty:[itemsLocation.minQty],
          orderQty:[itemsLocation.orderQty],
        });
        this.itemsLocationsFormArray.push(unitFormGroup);
      });
    }
  }

  addNewRow() {
    debugger
    const newFormGroup = this.fb.group({
      id: [0],
      itemId: 0,
      storeId: [0, Validators.min(1)],
      location: [""],
      maxQty:[0],
      minQty:[0],
      orderQty:[0],
    });

    this.itemsLocationsFormArray.push(newFormGroup);
  }

  deleteRow(index: number) {
    this.itemsLocationsFormArray.removeAt(index);
  }

  getUnitFormGroupIndex(itemLocationForm: FormGroup): number {
    return this.itemsLocationsFormArray.controls.findIndex(control => control === itemLocationForm);
  }
}