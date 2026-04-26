import { Component, OnInit, AfterViewInit, ViewChild, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { 
  Router, 
  NavigationEnd, 
  RouteConfigLoadStart, 
  RouteConfigLoadEnd, 
  ResolveStart, 
  ResolveEnd 
} from '@angular/router';
import { Subscription } from "rxjs";
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../services/theme.service';
import { LayoutService } from '../../../services/layout.service';
import { filter } from 'rxjs/operators';
import { JwtAuthService } from '../../../services/auth/jwt-auth.service';
import { RoutePartsService } from "app/shared/services/route-parts.service";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChangeUserPasswordFormComponent } from 'app/views/general/app-user/change-user-password-form/change-user-password-form.component';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.template.html',
})
export class AdminLayoutComponent implements OnInit, AfterViewInit {
  public isModuleLoading: Boolean = false;
  private moduleLoaderSub: Subscription;
  private layoutConfSub: Subscription;
  private routerEventSub: Subscription;

  public  scrollConfig = {}
  public layoutConf: any = {};
  public adminContainerClasses: any = {};
  
  constructor(
    private router: Router,
    public translate: TranslateService,
    public themeService: ThemeService,
    private layout: LayoutService,
    private cdr: ChangeDetectorRef,
    public jwtAuth: JwtAuthService,
    private routePartsService: RoutePartsService,
    private renderer: Renderer2,
    private dialog: MatDialog,
  ) {
    // Check Auth Token is valid
  // this.jwtAuth.checkTokenIsValid().subscribe();
    // Close sidenav after route change in mobile
    this.routerEventSub = router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((routeChange: NavigationEnd) => {
      this.layout.adjustLayout({ route: routeChange.url });
      this.scrollToTop();
    });
    
    // Translator init
    const browserLang: string = this.jwtAuth.getLang();
    translate.use(this.jwtAuth.getLang().match(/ar|en/) ? this.jwtAuth.getLang() : 'en');

  }


  addJsToElement(src: string): HTMLScriptElement {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    this.renderer.appendChild(document.body, script);
    return script;
  }


  ngOnInit() {

   
    // this.layoutConf = this.layout.layoutConf;
    this.layoutConfSub = this.layout.layoutConf$.subscribe((layoutConf) => {
        this.layoutConf = layoutConf;
        // console.log(this.layoutConf);
       

        this.adminContainerClasses = this.updateAdminContainerClasses(this.layoutConf);
        this.cdr.markForCheck();

       

    });

    // FOR MODULE LOADER FLAG
    this.moduleLoaderSub = this.router.events.subscribe(event => {
     
      if(event instanceof RouteConfigLoadStart || event instanceof ResolveStart) {
        this.isModuleLoading = true;
      }
      if(event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
        this.isModuleLoading = false;
        
      }
    });
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.layout.adjustLayout(event);
  }
  
  ngAfterViewInit() {

  }
  
  scrollToTop() {
    if(document) {
      setTimeout(() => {
        let element;
        if(this.layoutConf.topbarFixed) {
          element = <HTMLElement>document.querySelector('#rightside-content-hold');
        } else {
          element = <HTMLElement>document.querySelector('#main-content-wrap');
        }
        element.scrollTop = 0;
      })
    }
  }
  ngOnDestroy() {
    if(this.moduleLoaderSub) {
      this.moduleLoaderSub.unsubscribe();
    }
    if(this.layoutConfSub) {
      this.layoutConfSub.unsubscribe();
      
    }
    if(this.routerEventSub) {
      this.routerEventSub.unsubscribe();
      
    }
  }
  closeSidebar() {
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    })
  }

  sidebarMouseenter(e) {
    // console.log(this.layoutConf);
    if(this.layoutConf.sidebarStyle === 'compact') {
        this.layout.publishLayoutChange({sidebarStyle: 'full'}, {transitionClass: true});
    }
  }

  sidebarMouseleave(e) {
    // console.log(this.layoutConf);
    if (
        this.layoutConf.sidebarStyle === 'full' &&
        this.layoutConf.sidebarCompactToggle
    ) {
        this.layout.publishLayoutChange({sidebarStyle: 'compact'}, {transitionClass: true});
    }
  }

  updateAdminContainerClasses(layoutConf) {
    return {
      'navigation-top': layoutConf.navigationPos === 'top',
      'sidebar-full': layoutConf.sidebarStyle === 'full',
      'sidebar-compact': layoutConf.sidebarStyle === 'compact' && layoutConf.navigationPos === 'side',
      'compact-toggle-active': layoutConf.sidebarCompactToggle,
      'sidebar-compact-big': layoutConf.sidebarStyle === 'compact-big' && layoutConf.navigationPos === 'side',
      'sidebar-opened': layoutConf.sidebarStyle !== 'closed' && layoutConf.navigationPos === 'side',
      'sidebar-closed': layoutConf.sidebarStyle === 'closed',
      'fixed-topbar': layoutConf.topbarFixed && layoutConf.navigationPos === 'side'
    }
  }
  
  EditUserPersonalInfo() {
    
    this.routePartsService.GuidToEdit = this.jwtAuth.getUserId();
    if(this.routePartsService.GuidToEdit == -1){
    this.router.navigate(['admin/UserDefinitionForm']);
    }
    else{
      this.router.navigate(['admin/UserProfile']);
    }
}

PopupChangePasswordForm() {
  let title = this.translate.instant('CHANGEPASSWORD');
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
}