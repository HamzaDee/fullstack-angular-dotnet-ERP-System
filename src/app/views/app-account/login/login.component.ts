import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { finalize, Subject } from 'rxjs';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { JwtAuthService } from '../../../shared/services/auth/jwt-auth.service';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { CompanyService } from 'app/views/general/app-company/company.service';
import { AppEntryvouchersService } from '../app-entryvouchers/app-entryvouchers.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: egretAnimations
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  companiesList: any;
  selectedCompany: number = 0;
  signinForm: FormGroup;
  errorMsg = '';
  showErrorMessage = false;
  // return: string;
  private _unsubscribeAll: Subject<any>;
  text: string;
  results: string[];
  search(event) {

  }
  constructor(
    private jwtAuth: JwtAuthService,
    private routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private companyService: CompanyService,
    private translateService: TranslateService,
    private title: Title,
    private router: Router,
    private ser :AppEntryvouchersService,

  ) {
    this._unsubscribeAll = new Subject();
    const browserLang: string = this.jwtAuth.getLang();
    translateService.use(browserLang.match(/ar|en/) ? browserLang : 'en');
  }

  availableLangs = [{
    name: 'English',
    code: 'en',
    themeDir:'ltr'
  }, {
    name: 'jordan',
    code: 'ar',
    themeDir:'rtl'
  }];
  currentLang = (this.jwtAuth.getLang() == "ar") ? this.availableLangs[1] : this.availableLangs[0];
  
  ngOnInit() {
    $( ".mat-checkbox-input" ).removeClass( "cdk-visually-hidden" );
    this.title.setTitle('Al Shamel ERP');
    this.InitialLoginForm();
    this.GetCompaniesDropDownList();


    this.currentLang = (this.jwtAuth.getLang() == "ar") ? this.availableLangs[1] : this.availableLangs[0];

    document.querySelector("html").lang = this.currentLang.code;

    $("body").removeClass("egret-navy app div_all");
    $("body").addClass("login login_align");


  }

  InitialLoginForm() {
    this.signinForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      companyID: new FormControl(0, [Validators.required, Validators.min(1)]),
      rememberMe: new FormControl(false)
    });
  }

  ngAfterViewInit() {
    // this.autoSignIn();
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // signin() {
  //   this.showErrorMessage = false;
  //   const signinData = this.signinForm.value
  //   debugger
  //   this.jwtAuth.signin(signinData.username, signinData.password, signinData.companyID)
  //     .subscribe(response => {
  //       this.egretLoader.open(this.translateService.instant('Enter'));
       
  //       setTimeout(() => {
         
  //         this.egretLoader.close()
  //         debugger
  //         this.ser.GetCompName().subscribe(res =>
  //           {
  //             debugger
  //             window.localStorage.setItem('companyName', res.companyName);
  //             if(res.companyName == "Billa"){
  //               location.href = '/GetMainDashboredForm/GetMainDashboredForm';
  //              }
  //              else{
  //               location.href = '/dashboard';
  //              }
  //           })                          
  //       }, 1500);
  //     }, err => {
  //       this.showErrorMessage = true;
  //       this.submitButton.disabled = false;
  //       this.progressBar.mode = 'determinate';
  //       this.errorMsg = err.message;
  //     })
  // }

  signin() {
    this.showErrorMessage = false;
    const signinData = this.signinForm.value;

    this.jwtAuth.signin(signinData.username, signinData.password, signinData.companyID)
      .subscribe({
        next: () => {
          // إظهار اللودر بعد تسجيل الدخول
          this.egretLoader.open(this.translateService.instant('Enter'));

          this.ser.GetCompName()
            .pipe(
              finalize(() => {
                // إغلاق اللودر بعد انتهاء الطلب
                this.egretLoader.close();
              })
            )
            .subscribe({
              next: (res) => {
                // تخزين اسم الشركة
                window.localStorage.setItem('companyName', res.companyName);
                window.localStorage.setItem('MediaAttachmentsPath', res.mediaAttachmentsPath);

                // التوجيه بناءً على اسم الشركة
                if (res.companyName === "Billa") {
                  location.href = '/GetMainDashboredForm/GetMainDashboredForm';
                } else {
                  location.href = '/dashboard';
                }
              },
              error: () => {
                this.showErrorMessage = true;
                this.errorMsg = this.translateService.instant('ErrorLoadingCompany');
              }
            });
        },
        error: (err) => {
          this.showErrorMessage = true;
          this.submitButton.disabled = false;
          this.progressBar.mode = 'determinate';
          this.errorMsg = err.message;
        }
      });
  }


  autoSignIn() {
    if (this.jwtAuth.return === '/') {
      return
    }
    this.egretLoader.open('Enter....');
   
    setTimeout(() => {
      this.signin();
      console.log('autoSignIn');
      this.egretLoader.close()
    }, 2000);
  }

  NotSelectedCompany() {
    return false;
  }

  GetCompaniesDropDownList() {
    this.showErrorMessage = false;
    const signinData = this.signinForm.value
    if (signinData.username == undefined || signinData.password == undefined ||
      signinData.username == null || signinData.password == null ||
      signinData.username == '' || signinData.password == '') {
      this.companyService.getCompaniesDropDownListByUser("0", "0").subscribe(results => {
        if(results.length > 1){
          this.companiesList = results;
        }
        else{
          this.companiesList = results;
          this.showErrorMessage = true;
        }
        
      })
    }
    else {
      this.companyService.getCompaniesDropDownListByUser(signinData.username, signinData.password).subscribe(results => {
        if(results.length > 1){
          this.companiesList = results;
        }
        else{
          this.companiesList = results;
          this.showErrorMessage = true;
        }
      })
    }

  }
}
