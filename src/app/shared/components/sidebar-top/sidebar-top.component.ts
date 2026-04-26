import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
// import PerfectScrollbar from 'perfect-scrollbar';
import { NavigationService } from "../../../shared/services/navigation.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-sidebar-top',
  templateUrl: './sidebar-top.component.html'
})
export class SidebarTopComponent implements OnInit, OnDestroy, AfterViewInit {
  // private sidebarPS: PerfectScrollbar;
  public menuItems: any[];
  private menuItemsSub: Subscription;
  constructor(
    private navService: NavigationService
  ) { }

  ngOnInit() {
    this.menuItemsSub = this.navService.menuItems$.subscribe(menuItem => {
      this.menuItems = menuItem.filter(item => item.parentId ==0);
    });
  }
  ngAfterViewInit() {
  }
  ngOnDestroy() {
    if( this.menuItemsSub ) {
      this.menuItemsSub.unsubscribe()
    }
  }

}
