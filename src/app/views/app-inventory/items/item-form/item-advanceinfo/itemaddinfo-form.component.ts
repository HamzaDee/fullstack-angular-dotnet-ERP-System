import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-itemaddinfo-form',
  templateUrl: './itemaddinfo-form.component.html',
  styleUrl: './itemaddinfo-form.component.scss'
})
export class ItemaddinfoFormComponent {
  @Input() itemsAddInfoFormData: any;
  @Input() isViewMode: boolean = false;
  itemInfoList: any;
  itemsAddinfoFormArray: FormArray;

  constructor(
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
    private fb: FormBuilder,
    private translateService: TranslateService,
    private alert: sweetalert,
  ) { }

  ngOnInit(): void {
    debugger
    this.initializeTable();
  }

  checkViewMode(formGroup) {
    if (this.isViewMode) {
      formGroup.disable();
      this.itemsAddinfoFormArray.disable();
    }
  }

  initializeTable() {
    debugger
    this.itemInfoList = this.itemsAddInfoFormData?.itemsInfoList;
    this.itemsAddinfoFormArray = this.fb.array([]);

    if (this.itemsAddInfoFormData?.additemsInfoListLists.length > 0) {
      this.itemsAddInfoFormData?.additemsInfoListLists?.forEach((itemsaddinfo) => {
        const itemsdealersFormGroup = this.fb.group({
          id:[itemsaddinfo.id],
          infoId: [itemsaddinfo.infoId],
          itemId: [itemsaddinfo.itemId],  
          description:[itemsaddinfo.description]        
        });

         this.itemsAddinfoFormArray.push(itemsdealersFormGroup);
        this.checkViewMode(itemsdealersFormGroup);

      });
    } else {

    }
  }

  addNewRow() {
    if (!this.isViewMode) {
      const newFormGroup = this.fb.group({
        id:[0],
        infoId: [0],
        itemId:[0],
        description:[''],
       
      });
      this.itemsAddinfoFormArray.push(newFormGroup);
    }
  }



  deleteRow(index: number) {
    if (!this.isViewMode && this.itemsAddinfoFormArray.length >= 1) {
      this.itemsAddinfoFormArray.removeAt(index);
    }
  }
}
