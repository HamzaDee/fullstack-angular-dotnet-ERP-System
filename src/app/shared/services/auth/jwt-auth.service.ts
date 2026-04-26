import { Injectable } from "@angular/core";
import { LocalStoreService } from "../local-store.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { map, catchError, delay } from "rxjs/operators";
import { User } from "../../models/user.model";
import { BehaviorSubject, throwError, Observable } from "rxjs";
import { environment } from "environments/environment";
import { TranslateService } from "@ngx-translate/core";

// ================= you will get those data from server =======
@Injectable({
  providedIn: "root",
})
export class JwtAuthService {
  token;
  isAuthenticated: Boolean;
  user: User = {};
  user$ = (new BehaviorSubject<User>(this.user));
  signingIn: Boolean;
  return: string;
  JWT_TOKEN = "ADASDSPAuthdasfF";
  RefJWT_TOKEN = "ADASDSPAurefthdasfF";
  APP_USER = "Galaxy_USER";
  CULTRUE = "_Culture";
  UserId = "_dew";
  companyId = "Companyid";
  MediaAttachmentsPath = "MediaAttachmentsPath";
  constructor(
    public translate: TranslateService,
    private ls: LocalStoreService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '/');
  }
  public signin(username, password, companyId) {
    return this.http.post(`${environment.apiURL_Main + '/api/authentication/login'}`, { username, password })
      .pipe(
        delay(1000),
        map((res: any) => {
          if (res.id == 0) {
            return this.signout();
          }
          this.setUserAndToken(res.token, res.refreshToken, res.username, res.id, !!res, companyId);
          this.signingIn = true;
          return res;
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  public checkTokenIsValid(): Observable<string> {
    const AccessToken: any = this.getJwtToken()
    const RefreshToken: any = this.getRefreshJwtToken()
    var changedReq;
    const username: any = this.getUser();
    const password: any = "0";
    const Id: Number = this.getUserId();
    var CompanyId: number = this.getCompanyId();
    return this.http.post(`${environment.apiURL_Main + '/api/authentication/refresh'}`, { username, password, RefreshToken, AccessToken, Id })
      .pipe(
        map((res: any) => {
          this.setUserAndToken(res.token, res.refreshToken, res.user, res.id, !!res, CompanyId);
          if (res.token && res.refreshToken && res.user)
            return this.getJwtToken();
          this.signout();
        }),
        catchError((error) => {
          this.signout();
          return throwError(error);
        })
      );
  }
  public signout() {
    debugger
    document.dir = 'ltr';
    this.setUserAndToken(null, null, null, null, false, 0);
    this.router.navigateByUrl("/Account/Login");
  }
  isLoggedIn(): Boolean {
    return !!this.getJwtToken();
  }
  getJwtToken() {
    return this.ls.getItem(this.JWT_TOKEN);
  }
  getRefreshJwtToken() {
    return this.ls.getItem(this.RefJWT_TOKEN);
  }
  getUser() {
    return this.ls.getItem(this.APP_USER);
  }
  getUserId() {
    
    return this.ls.getItem(this.UserId);
  }
  getLang() {
    if (!(this.ls.getItem(this.CULTRUE))) {
      this.ls.setItem(this.CULTRUE, 'ar');
      return 'ar';
    }
    return this.ls.getItem(this.CULTRUE);
  }
  getCompanyId() {
    return this.ls.getItem(this.companyId);
  }
  getMediaAttachmentsPath() {
    return window.localStorage.getItem(this.MediaAttachmentsPath);
  }
  setLang(code) {
    this.ls.setItem(this.CULTRUE, code);
  }
  setJwtToken(token) {
    this.ls.setItem(this.JWT_TOKEN, token);
  }
  setRefreshToken(token) {
    this.ls.setItem(this.RefJWT_TOKEN, token);
  }
  setUserAndToken(token: String, RefreshToken: string, user: User, id: string, isAuthenticated: Boolean, companyId: number) {
    this.isAuthenticated = isAuthenticated;
    this.token = token;
    this.user = user;
    this.user$.next(user);
    this.ls.setItem(this.JWT_TOKEN, token);
    this.ls.setItem(this.RefJWT_TOKEN, RefreshToken);
    this.ls.setItem(this.APP_USER, user);
    this.ls.setItem(this.UserId, id);
    this.ls.setItem(this.CULTRUE, this.getLang());
    this.ls.setItem(this.companyId, companyId);
    sessionStorage.setItem('UserId', id);
    // To Set Cookie
  }
}
