import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { NotificationsService } from './notifications.service'; 
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  @Input() notificPanel;
  @ViewChild('bellIcon') bellIcon!: ElementRef;

  notifications: any[] = [];
  dropdownOpen = false;
  refreshSubscription!: Subscription;

  constructor(private router: Router, private notificationsService: NotificationsService) {}

  ngOnInit() {
    this.loadNotifications();

    this.refreshSubscription = interval(60000).subscribe(() => {
      this.checkForNewNotifications();
    });
  }

  clearAll(e) {
    e.preventDefault();
    this.notifications = [];
  }

   loadNotifications(): void {
    this.notificationsService.getNotifications().subscribe(data => {
      this.notifications = data;
    });
  }

  checkForNewNotifications() {
    this.notificationsService.getNotifications().subscribe(res => {
      if (res.length > this.notifications.length) {
        // 🔔 تشغيل اهتزاز الجرس
        this.triggerBellAnimation();

        // يمكن أيضًا تشغيل صوت هنا إن أردت
        // this.playNotificationSound();
      }
      this.notifications = res;
    });
  }

  triggerBellAnimation() {
    if (this.bellIcon) {
      const bell = this.bellIcon.nativeElement;
      bell.classList.add('bell-shake');
      setTimeout(() => bell.classList.remove('bell-shake'), 1000);
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  markAsRead(notificationId: number): void {
    debugger
    this.notificationsService.markAsRead(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      // this.notifications = this.notifications.map(n => 
      //   n.id === notificationId ? { ...n, isRead: true } : n
      // );
    });
  }

  selectedNotification: any = null; // استخدم any بدلاً من NotificationModel
  displayDialog = false;

  openDetails(notification: any) {
    this.selectedNotification = notification;
    this.displayDialog = true;

    this.markAsRead(notification.id);
  }
}
