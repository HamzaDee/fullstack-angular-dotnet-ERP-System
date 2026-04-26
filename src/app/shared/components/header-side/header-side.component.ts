import { Component, OnInit, EventEmitter, Input, ViewChildren, Output, Renderer2 } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { LayoutService } from '../../services/layout.service';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from '../../services/auth/jwt-auth.service';
import { EgretNotifications2Component } from '../egret-notifications2/egret-notifications2.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationService } from 'app/shared/services/navigation.service';
import { ChangeUserPasswordFormComponent } from 'app/views/general/app-user/change-user-password-form/change-user-password-form.component';
@Component({
  selector: 'app-header-side',
  templateUrl: './header-side.template.html'
})
export class HeaderSideComponent implements OnInit {
  @Input() notificPanel;
  @ViewChildren(EgretNotifications2Component) noti;
  public availableLangs = [{
    name: 'EN',
    code: 'en',
    flag: 'flag-icon-us',
    themeDir: 'ltr'
  }, {
    name: 'jor',
    code: 'ar',
    flag: 'flag-icon-jo',
    themeDir: 'rtl'
  }];
  currentLang = (this.jwtAuth.getLang() == "ar") ? this.availableLangs[1] : this.availableLangs[0];
  public egretThemes;
  public layoutConf: any;
  public UserName: any;

  constructor(
    private themeService: ThemeService,
    private layout: LayoutService,
    public translate: TranslateService,
    private renderer: Renderer2,
    public jwtAuth: JwtAuthService,
    public navigationService: NavigationService,
    private translateService: TranslateService,
    private dialog: MatDialog,
  ) { }
  ngOnInit() {
    this.UserName = this.jwtAuth.getUser()
    this.egretThemes = this.themeService.egretThemes;
    this.layoutConf = this.layout.layoutConf;
    this.translate.use(this.currentLang.code);
    this.layout.publishLayoutChange({ dir: this.currentLang.themeDir });
    document.dir = this.currentLang.themeDir;

  }
  setLang(lng) {
    window.location.reload();
    this.translate.use(lng.code);
    this.currentLang = lng;

    //this.layout.publishLayoutChange({ dir: lng.themeDir });
    this.jwtAuth.setLang(lng.code);

  }
  changeTheme(theme) {
    // this.themeService.changeTheme(theme);
  }
  toggleNotific() {
    this.notificPanel.toggle();
  }
  toggleSidenav() {
    if (this.layoutConf.sidebarStyle === 'closed') {
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full'
      });
    }
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    });
  }

  toggleCollapse() {
    // compact --> full
    if (this.layoutConf.sidebarStyle === 'compact') {
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full',
        sidebarCompactToggle: false
      }, { transitionClass: true });
    }

    // * --> compact
    this.layout.publishLayoutChange({
      sidebarStyle: 'compact',
      sidebarCompactToggle: true
    }, { transitionClass: true });

  }
  PopupChangePasswordForm() {
    let title = this.translateService.instant('CHANGEPASSWORD');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ChangeUserPasswordFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: this.jwtAuth.getUserId(),
        GetCityListFromParent: () => { }
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }
  onSearch(e) {
    //   console.log(e)
  }
}
