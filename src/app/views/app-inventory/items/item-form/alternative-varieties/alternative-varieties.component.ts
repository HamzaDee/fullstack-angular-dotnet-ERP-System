import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-alternative-varieties',
  templateUrl: './alternative-varieties.component.html',
  styleUrls: ['./alternative-varieties.component.scss']
})
export class AlternativeVarietiesComponent implements OnInit {

  @Input() alternativeItemFormData: any;
  itemsList: any;
  alternativeItemFormArray: FormArray;
  constructor(
    private fb: FormBuilder,

  ) { }

  ngOnInit(): void {
    this.initializeTable();
  }

  initializeTable() {
    this.itemsList = this.alternativeItemFormData?.itemsList;
    this.alternativeItemFormArray = this.fb.array([]);
    if (this.alternativeItemFormData?.alternativeItemSubs?.length > 0) {
      this.alternativeItemFormData?.alternativeItemSubs?.forEach((alternativeItem) => {
        const unitFormGroup = this.fb.group({
          id: [alternativeItem.id],
          itemId: 0,
          subItemId: [alternativeItem.subItemId, Validators.min(1)],
          note: [alternativeItem.note],
        });
        this.alternativeItemFormArray.push(unitFormGroup);
      });
    }
  }

  addNewRow() {
    const newFormGroup = this.fb.group({
      id: [0],
      itemId: 0,
      subItemId: [0, Validators.min(1)],
      note: [""],
    });

    this.alternativeItemFormArray.push(newFormGroup);
  }

  deleteRow(index: number) {
    this.alternativeItemFormArray.removeAt(index);
  }

  getUnitFormGroupIndex(alternativeItem: FormGroup): number {
    return this.alternativeItemFormArray.controls.findIndex(control => control === alternativeItem);
  }
}