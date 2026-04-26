import { Component, OnInit, AfterViewInit, Renderer2, NgModule, Pipe, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from './shared/services/auth/jwt-auth.service';
import { CookieService } from 'ngx-cookie-service';

import { RoutePartsService } from './shared/services/route-parts.service';

import { filter } from 'rxjs/operators';
import { UILibIconService } from './shared/services/ui-lib-icon.service';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutService } from './shared/services/layout.service';
import { ThemeService } from './shared/services/theme.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewInit {
  appTitle = '';
  pageTitle = '';
  
  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    // Allow Enter key for textarea and inputs with specific conditions
    if (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target.getAttribute('type') === 'text')) {
      return;
    }
    // Disable form submission via Enter key
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent Enter key behavior
    }

    // Disable arrow keys for number inputs
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'number') {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault(); // Block arrow key actions
      }
    }

    // Add additional global keydown handling logic here if needed
  }
  
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
  public layoutConf: any;
  public egretThemes;

  constructor(
    public title: Title,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private routePartsService: RoutePartsService,
    private iconService: UILibIconService,
    private translateService: TranslateService,
    public layout: LayoutService,
    public jwtAuth: JwtAuthService,
    private cookieService: CookieService,
    private themeService: ThemeService,
  ) {
    iconService.init()
  }
  ngOnInit() {
    this.changePageTitle();
    this.translateService.use(this.jwtAuth.getLang().match(/ar|en/) ? this.jwtAuth.getLang() : 'en');
    document.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' && target.getAttribute('type') === 'number') {
          event.preventDefault();
        }
      },
      { passive: false } // Ensure event.preventDefault() works
    );
  }
  ngAfterViewInit() {
  }
  setTitle(newTitle: string) {
    this.title.setTitle(newTitle);
  }
  changePageTitle() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((routeChange) => {
      const routeParts = this.routePartsService.generateRouteParts(this.activeRoute.snapshot);
      if (!routeParts.length) {
        return this.title.setTitle(this.appTitle);
      }
      // Extract title from parts;
      this.pageTitle = routeParts
        .reverse()
        .map((part) => part.title)
        .reduce((partA, partI) => { return `${partA} > ${partI}` });
      this.pageTitle += ` | ${this.appTitle}`;
      this.title.setTitle('');
    });
  }
}
