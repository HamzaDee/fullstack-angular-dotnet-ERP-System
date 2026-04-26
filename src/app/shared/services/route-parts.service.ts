import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, ActivatedRouteSnapshot, Params, PRIMARY_OUTLET } from "@angular/router";

interface IRoutePart {
  title: string,
  breadcrumb: string,
  params?: Params,
  url: string,
  urlSegments: any[]
}

@Injectable()
export class RoutePartsService {
  public routeParts: IRoutePart[];
  constructor(private router: Router) {}

  private Guid;
  private Guid2;
  private Guid3;
  private Guid4;
  private Guid5;

  set GuidToEdit(Guid) {
    this.Guid = Guid;
  }

  get GuidToEdit() {
    return this.Guid;
  }

  set Guid2ToEdit(Guid2) {
    this.Guid2 = Guid2;
  }

  get Guid2ToEdit() {
    return this.Guid2;
  }
  set Guid3ToEdit(Guid3) {
    this.Guid3 = Guid3;
  }

  get Guid3ToEdit() {
    return this.Guid3;
  }
  set Guid4ToEdit(Guid4) {
    this.Guid4 = Guid4;
  }

  get Guid4ToEdit() {
    return this.Guid4;
  }
  set Guid5ToEdit(Guid5) {
    this.Guid5 = Guid5;
  }

  get Guid5ToEdit() {
    return this.Guid5;
  }
  generateRouteParts(snapshot: ActivatedRouteSnapshot): IRoutePart[] {
    var routeParts = <IRoutePart[]>[];
    if (snapshot) {
      if (snapshot.firstChild) {
        routeParts = routeParts.concat(this.generateRouteParts(snapshot.firstChild));
      }
      if (snapshot.data['title'] && snapshot.url.length) {
        // console.log(snapshot.data['title'], snapshot.url)
        routeParts.push({
          title: snapshot.data['title'], 
          breadcrumb: snapshot.data['breadcrumb'], 
          url: snapshot.url[0].path,
          urlSegments: snapshot.url,
          params: snapshot.params
        });
      }
    }
    return routeParts;
  }
}