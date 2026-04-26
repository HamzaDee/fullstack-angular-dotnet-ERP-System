import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  showLoader = true;
  tabelData: any;
  public TitlePage: string;
  searchQuery: string = '';

  constructor(
    private title: Title,
    private userService: UserService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private alert: sweetalert,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetUserDefinitionList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('UserList');
    this.title.setTitle(this.TitlePage);
  }
  GetUserDefinitionList() {
    debugger
    this.showLoader = true;
    setTimeout(() => {
      this.userService.GetUserDefinitionList().subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
        this.tabelData = result;
        this.showLoader = false;
      })
    });
  }

  get filteredData() {
    if (!this.searchQuery) {
      return this.tabelData;
    }
    const query = this.searchQuery.toLowerCase();
    return this.tabelData.filter(item =>
      item.fullName?.toLowerCase().includes(query) ||
      (item.groupName ? item.groupName.toLowerCase().includes(query) : false) ||
      item.email?.toLowerCase().includes(query) ||
      item.tel?.toLowerCase().includes(query)
    );
  }

  NavigateUserForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.router.navigate(['User/UserDefinitionList/UserForm']);
  }

  NavigateLinkingUsersToCompaniesBranchesForm(id: any, fullName: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = fullName;
    this.router.navigate(['User/UserDefinitionList/LinkingUsersToCompaniesBranchesForm']);
  }

  NavigateUserPermissionsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.router.navigate(['User/UserDefinitionList/GetUserPermissionForm']);
  }

  DeleteUser(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.userService.DeleteUser(id).subscribe((results) => {
          if (results) {
            this.alert.DeleteSuccess();
            this.GetUserDefinitionList();
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }
}
