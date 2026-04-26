import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { JwtAuthService } from "../services/auth/jwt-auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private jwtAuth: JwtAuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // debugger
     const url = state.url;

    // check if the URL contains "AddCustomerReceiptVoucherH" to go to customer receipt direct from HISP
    if (url.includes('AddCustomerReceiptVoucherH') || url.includes('GetCustomersAccountStatementH')) {
      return true; // allow access even if logged out
    }
    if (this.jwtAuth.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(["/Account/Login"], {
        queryParams: {
          return: state.url
        }
      });
      return false;
    }
  }
}
