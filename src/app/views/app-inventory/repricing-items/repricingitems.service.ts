import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepricingitemsService {

  constructor(
    private http: HttpClient,
    private jwtAuth: JwtAuthService,
  ) { }

  public GetAllRepricingItems(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/RepricingItem/GetAllRepricingItems/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
}

public GetRepricingItemForm(): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/RepricingItem/GetFormRepricingItems/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`)
}

public GetRepricingItemByID(id): Observable<any> {
    return this.http.get(`${environment.apiURL_Main + '/api/RepricingItem/GetRepricingItemByID/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id}`)
}

public GetFilteredRepricingItemsDT(model): Observable<any> {
    return this.http.post(`${environment.apiURL_Main + '/api/RepricingItem/GetFilteredRepricingItemsDT/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, model)
}

public PostRepricingItemsDT(post): Observable<any> {
    return this.http.post<any>(`${environment.apiURL_Main + '/api/RepricingItem/PostRepricingItemsDT/' + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()}`, post)
}
}
