import { Component, OnInit, Input, OnDestroy, Renderer2 } from '@angular/core';
import { NavigationService } from "../../../shared/services/navigation.service";
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../shared/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { A } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-header-top',
  templateUrl: './header-top.component.html'
})
export class HeaderTopComponent implements OnInit, OnDestroy {
  layoutConf: any;
  menuItems: any;
  public UserName: any;
  menuItemSub: Subscription;
  egretThemes: any[] = [];
  
  availableLangs = [{
    name: 'English',
    code: 'en',
    themeDir: 'ltr'
  }, {
    name: 'jordan',
    code: 'ar',
    themeDir: 'rtl'
  }]
  currentLang = (this.jwtAuth.getLang() == "ar") ? this.availableLangs[1] : this.availableLangs[0];

  @Input() notificPanel;
  constructor(
    private layout: LayoutService,
    private navService: NavigationService,
    public themeService: ThemeService,
    public translate: TranslateService,
    private renderer: Renderer2,
    public jwtAuth: JwtAuthService
  ) { }

  ngOnInit() {
    this.UserName =this.jwtAuth.getUser()
    this.layoutConf = this.layout.layoutConf;
    this.egretThemes = this.themeService.egretThemes;

    this.layout.publishLayoutChange({ dir: this.currentLang.themeDir });
    document.dir = this.currentLang.themeDir;
    document.querySelector("html").lang = this.currentLang.code;
  }
  ngOnDestroy() {
    if (this.menuItemSub) {
      this.menuItemSub.unsubscribe()
    }
    
  }
  

  setLang(lng) {

    window.location.reload();
    this.translate.use(lng);
    this.currentLang = lng;
    this.jwtAuth.setLang(lng);
    document.querySelector("html").lang = lng;
  }
  changeTheme(theme) {
    this.layout.publishLayoutChange({ matTheme: theme.name })
  }
  toggleNotific() {
    this.notificPanel.toggle();
  }
  toggleSidenav() {
    if (this.layoutConf.sidebarStyle === 'closed') {
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full'
      })
    }
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    })
  }
}
