import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { UserService } from '../../user.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-linking-users-to-companies-branches-form',
  templateUrl: './linking-users-to-companies-branches-form.component.html',
  styleUrls: ['./linking-users-to-companies-branches-form.component.scss']
})
export class LinkingUsersToCompaniesBranchesFormComponent implements OnInit {
  public id: any;
  public fullName: any;
  public showLoader: boolean;
  public UsersList: any[] = [];
  UsersForm: FormGroup;
  selectedItems: any[] = [];
  default: number;
  isSelected: boolean[] = [];
  // selectedItem: any = null;
  // isSelected: boolean[] = new Array(this.UsersList.length).fill(false);
  public TitlePage: string;

  constructor(private routePartsService: RoutePartsService,
              private router: Router,
              private userService: UserService,
              private formbulider: FormBuilder,
              private alert: sweetalert,
              private cdr: ChangeDetectorRef,
              private title: Title,
              private translateService: TranslateService,
            ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();

    this.id = this.routePartsService.GuidToEdit;
    this.fullName = this.routePartsService.Guid2ToEdit;

    this.UsersForm = this.formbulider.group({
      id              :[0],
      companyId       :[0],
      branchId        :[0],
      isDefault        :[false],
      companyModelList: [null],
      companyName:[''],
      branchName:[''],
    });

    if (this.id  == undefined)
    this.router.navigate(['User/UserDefinitionList']);
    //this.GetUsersCompany();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('LinkingUsersToCompaniesBranchesForm');
    this.title.setTitle(this.TitlePage);
  }

  ngAfterViewInit(): void {
  this.showLoader = true;

  this.userService.GetUsersCompany(this.id).subscribe(result => {
    this.UsersList = result.map(u => ({
      ...u,
      uniqueKey: `${u.companyId}-${u.branchId}` // For dataKey matching
    }));

    // Ensure p-table uses the same key
    // <p-table ... dataKey="uniqueKey" ...>
    
    this.selectedItems = []; // clear before filling

    if (result[0].usersCompanyModelList.length > 0) {
      for (let j = 0; j < this.UsersList.length; j++) {
        const matchingObject = result[0].usersCompanyModelList.find(
          c => c.companyId === this.UsersList[j].companyId &&
               c.branchId === this.UsersList[j].branchId
        );

        if (matchingObject) {
          this.selectedItems.push(this.UsersList[j]); // PrimeNG will tick it
          this.isSelected[j] = true; // enable isDefault checkbox
          
          // Restore default state from backend if available
          this.UsersList[j].isDefault = matchingObject.isDefault || false;
        } else {
          this.isSelected[j] = false;
        }
      }
    }

    this.cdr.detectChanges();
    this.showLoader = false;
  });
}


  // ngAfterViewInit(): void {
  //   debugger
  //   this.showLoader = true;
  //     this.userService.GetUsersCompany(this.id).subscribe(result => {
  //       debugger
  //       this.UsersList = result;
  //       if (result[0].usersCompanyModelList.length > 0) {
  //         for (let j = 0; j < this.UsersList.length; j++) {
  //           const matchingObject = result[0].usersCompanyModelList.find(c => c.companyId === this.UsersList[j].companyId && c.branchId === this.UsersList[j].branchId);    
  //           if (matchingObject) {
  //             this.selectedItems.push(this.UsersList[j]);
  //             setTimeout(() => {
  //               this.isSelected[j] = true; 
  //               this.cdr.detectChanges();
  //             });
              
  //           }
  //         }
  //       }      
  //       this.cdr.detectChanges();
  //       this.showLoader = false;
  //     })
 
  // }


  

  handleCheckboxClick(rowData: any) {
  const isAlreadySelected = this.selectedItems.some(
    item => item.uniqueKey === rowData.uniqueKey
  );

  if (!isAlreadySelected) {
    // If deselected, reset its isDefault flag
    rowData.isDefault = false;
  }
  // No need to manually update isSelected[] —
  // PrimeNG manages selectedItems based on dataKey
}

OnSaveForms() {
  if (!this.selectedItems || this.selectedItems.length === 0) {
    this.alert.SaveFaild();
    return;
  }

  const selectedItemsWithDefault = this.selectedItems.map(item => ({
    ...item,
    isDefault: !!item.isDefault // Ensure explicit boolean
  }));

  const requestData = { UsersCompanyModelList: selectedItemsWithDefault };

  this.userService.SaveUsersCompany(requestData).subscribe(result => {
    if (result.isSuccess) {
      this.alert.SaveSuccess();
      this.router.navigate(['User/UserDefinitionList']);
    } else {
      this.alert.SaveFaild();
    }
  });
}


isRowSelected(row: any): boolean {
  return !!this.selectedItems?.some(it => it.uniqueKey === row.uniqueKey);
}

// Called when user toggles the isDefault checkbox
onDefaultChange(row: any, checked: boolean) {
  if (checked) {
    // Clear other defaults for the same company among SELECTED rows only
    for (const u of this.selectedItems) {
      if (u.companyId === row.companyId && u.uniqueKey !== row.uniqueKey) {
        u.isDefault = false;
      }
    }
    row.isDefault = true;
  } else {
    // user unchecked the box
    row.isDefault = false;
  }

  // If you do not see the UI update in some edge cases, uncomment next line:
  // this.cdr.detectChanges();
}
  // handleCheckboxClick(rowData: any, index: number) {
  // const isAlreadySelected = this.selectedItems.some(item => item.id === rowData.id);

  // if (isAlreadySelected) {
  //   this.isSelected[index] = true;
  // } else {
  //   this.isSelected[index] = false;
  //   this.UsersList[index].isDefault = false;
  // }
  // }

  
  // OnSaveForms() {
  //   if (this.selectedItems.length === 0) {
  //     this.alert.SaveFaild();
  //     return;
  //   }
  // debugger
  //     const selectedItemsWithDefault = this.selectedItems.map(item => ({
  //     ...item,
  //     isDefault: !!item.isDefault, // Explicit boolean
  //   }));

  
  //   const requestData = { UsersCompanyModelList: selectedItemsWithDefault };
  
  //   this.userService.SaveUsersCompany(requestData).subscribe((result) => {
  //     if (result.isSuccess) {
  //       this.alert.SaveSuccess();
  //       this.router.navigate(['User/UserDefinitionList']);
  //     } else {
  //       this.alert.SaveFaild();
  //     }
  //   });
  // }
  
}
