import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DropDownModel } from 'app/shared/models/DropDownModel';
import { Subject } from 'rxjs';
import { AppAdminService } from '../app-admin.service';
import { Options } from "select2";
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { PermissionModel } from 'app/shared/models/PermissionModel';
import { CheckPermissionsService } from 'app/shared/services/app-permissions/check-permissions.service';
import { sweetalert } from 'sweetalert';
import { ScreenActionsEnum, ScreenMenu } from 'app/shared/Enum/enum';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-user-permission',
  templateUrl: './user-permission.component.html',
  styleUrls: ['./user-permission.component.css']
})

export class UserPermissionComponent implements OnInit {
  loading: boolean = true;

  constructor(
    private chRef: ChangeDetectorRef,
    private appAdminService: AppAdminService,
    private translateServie: TranslateService,
    private checkpermissionsservice: CheckPermissionsService,
    private alert: sweetalert,
    private title: Title

  ) { }
  dtTrigger: Subject<any> = new Subject();
  todoSubject = new Subject<DropDownModel[]>()
  protected _onDestroy = new Subject<void>();
  public userList: DropDownModel[];
  public mainSystemList: Array<DropDownModel>;
  public screenList: Array<DropDownModel>;
  public EmptyList: Array<DropDownModel>;
  public data: Array<PermissionModel>;
  public TitlePage: string;
  public options: Options = {
    width: "300",
  };
  public userId = null;
  public mainSystemId = null;
  public screenId = null;
  public pleaseSelectMsg: string;
  public UserIdformControl = new FormControl();
  public mainSystemIddformControl = new FormControl();
  public ScreenIdformControl = new FormControl();
  isCheckedAdd = false;
  isCheckedEdit = false;
  isCheckedDelete = false;
  isCheckedPrint = false;
  isCheckedOpen = false;
  showLoader = false
  HasPerm: boolean;
  isDtInitialized: boolean = false
  countries: DropDownModel[];
  ngOnInit() {
    // this.checkpermissionsservice.canActivePage(ScreenMenu.UserPermission);
    this.chRef.detectChanges();
    this.InitialSelectList();
    this.SetTitlePage();
  }
  SetTitlePage() {
    this.TitlePage = this.translateServie.instant('UserPermission');
    this.title.setTitle(this.TitlePage);
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  ngAfterViewInit() {
    this.dtTrigger.next(null);
  }
  InitialSelectList() {
    this.getUsersBySearch("");
    this.getScreensByMainModule("");
    this.getMainModule();
    this.screenList = this.EmptyList
    this.userId = this.mainSystemId = "-1"

  }
  getUsersBySearch(search: string) {
    this.appAdminService.getUsersBySearch(search).subscribe((results) => {
      this.userList = results;
    })
  }
  //And call it
  getUserPermission(id: string, mainSystemId: string, screenId: string) {

    if (id != null) {
      this.showLoader = true;
    }

    this.appAdminService.getUserPermission(id, mainSystemId, screenId).subscribe(async (results) => {
      if (id != "undefined"
        || id != null)
        this.refreshPermissionTable(results);
      this.showLoader = false;
    })
  }
  refreshPermissionTable(results) {
    this.data = results;
  }
  getMainModule() {
    this.appAdminService.getMainModule().subscribe((results) => {
      this.mainSystemList = results;
    })
  }
  getScreensByMainModule(id: string) {
    this.appAdminService.getScreensByMainModule(id).subscribe((results) => {
      this.screenList = results;
    })
  }
  ChangeMainModule(): void {
    if (this.userId != "-1") {
      this.getScreensByMainModule(this.mainSystemId);
      this.getUserPermission(this.userId, this.mainSystemId, this.screenId);
      this.setCheckboxAllFalse()
    }
  }

  ChangeScreenId(): void {

    if (this.userId != "-1")
      this.getUserPermission(this.userId, this.mainSystemId, this.screenId);
    this.setCheckboxAllFalse()
  }
  ChangeUserId() {
    this.getUserPermission(this.userId, this.mainSystemId, this.screenId);
    this.setCheckboxAllFalse();
  }
  setCheckboxAllFalse() {
    this.isCheckedAdd = false;
    this.isCheckedOpen = false;
    this.isCheckedEdit = false;
    this.isCheckedDelete = false;
    this.isCheckedPrint = false;

  }
  checkAllAddAction() {
    if (this.isCheckedAdd == false) {
      this.data.forEach(function (part, index) {
        this[index].add = true;
      }, this.data);

      this.isCheckedAdd = true;
    }
    else {
      this.data.forEach(function (part, index) {
        this[index].add = false;
      }, this.data);
      this.isCheckedAdd = false;
    }
  }
  checkAllEditAction() {
    if (this.isCheckedEdit == false) {
      this.data.forEach(function (part, index) {
        this[index].edit = true;
      }, this.data);

      this.isCheckedEdit = true;
    }
    else {
      this.data.forEach(function (part, index) {
        this[index].edit = false;
      }, this.data);
      this.isCheckedEdit = false;
    }
  }
  checkAllDeleteAction() {
    if (this.isCheckedDelete == false) {
      this.data.forEach(function (part, index) {
        this[index].delete = true;
      }, this.data);

      this.isCheckedDelete = true;
    }
    else {
      this.data.forEach(function (part, index) {
        this[index].delete = false;
      }, this.data);
      this.isCheckedDelete = false;
    }
  }
  checkAllPrintAction() {
    if (this.isCheckedPrint == false) {
      this.data.forEach(function (part, index) {
        this[index].print = true;
      }, this.data);

      this.isCheckedPrint = true;
    }
    else {
      this.data.forEach(function (part, index) {
        this[index].print = false;
      }, this.data);
      this.isCheckedPrint = false;
    }
  }
  checkAllOpenAction() {
    if (this.isCheckedOpen == false) {
      this.data.forEach(function (part, index) {
        this[index].open = true;
      }, this.data);

      this.isCheckedOpen = true;
    }
    else {
      this.data.forEach(function (part, index) {
        this[index].open = false;
      }, this.data);
      this.isCheckedOpen = false;
    }
  }
  SelectAllPermissions() {
    this.data.forEach(function (part, index) {
      this[index].open = true;
      this[index].add = true;
      this[index].edit = true;
      this[index].delete = true;
      this[index].print = true;
    }, this.data);

  }
  DeselectAllPermssions() {
    this.data.forEach(function (part, index) {
      this[index].open = false;
      this[index].add = false;
      this[index].edit = false;
      this[index].delete = false;
      this[index].print = false;
    }, this.data);
  }
  SaveUserPermission() {
    // this.checkpermissionsservice.CheckPermissions(ScreenActionsEnum.Add, ScreenMenu.UserPermission)
    //   .subscribe(res => {
    //     this.HasPerm = res
    //     if (res == true) {
    //       this.data[0].userId = parseInt(this.userId)
    //       this.appAdminService.createUserPermission(this.data).subscribe(res => {
    //         this.alert.SaveSuccess()
    //       }, err => {
    //         this.alert.SaveFaild()

    //       })
    //     }
    //     else {
    //       this.alert.PermissinsFail()
    //     }
    //   })
  }
}
