import { Component } from '@angular/core';
import { NotificationsService } from 'app/shared/components/notifications/notifications.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.scss'
})
export class NotificationsListComponent {
  notifications: any[] = [];

constructor(private notificationsService: NotificationsService) {}

ngOnInit() {
  this.loadNotifications();
  // this.router.events.subscribe((routeChange) => {
  //     if (routeChange instanceof NavigationEnd) {
  //       this.notificPanel.close();
  //     }
  // });
}

clearAll(e) {
  e.preventDefault();
  this.notifications = [];
}

 loadNotifications(): void {
  this.notificationsService.getAllNotifications().subscribe(data => {
    this.notifications = data;
  });
}

}
