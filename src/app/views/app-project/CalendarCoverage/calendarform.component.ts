import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MonthlyCalendarService, MonthEvent } from './calendar.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { RoutePartsService } from 'app/shared/services/route-parts.service';

interface CalendarDay {
  day?: number;              // optional: empty cells at start of month
  events: MonthEvent[];
}



@Component({
  selector: 'app-calendarform',
  templateUrl: './calendarform.component.html',
  styleUrl: './calendarform.component.scss'
})
export class CalendarformComponent implements OnInit {
  public TitlePage: string;
  year!: number;
  month!: number; // 1-based
  days: CalendarDay[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private service: MonthlyCalendarService, private cdr: ChangeDetectorRef, private title: Title,private translateService: TranslateService,public routePartsService: RoutePartsService,) { }


   ngOnInit(): void {
    const today = new Date();
    this.year = today.getFullYear();
    this.month = today.getMonth() + 1;
    this.SetTitlePage();
    this.buildMonth();
  }

   SetTitlePage() {
    this.TitlePage = this.translateService.instant('Calendarform');
    this.title.setTitle(this.TitlePage);
  }

  private buildMonth(): void {
    const daysInMonth = new Date(this.year, this.month, 0).getDate();
    const firstDayOfWeek = new Date(this.year, this.month - 1, 1).getDay();

    this.service.getMonthEvents(this.year, this.month).subscribe(events => {
      const grouped = this.groupEventsByDay(events);

      const cells: CalendarDay[] = [];

      // Add empty cells for alignment
      for (let i = 0; i < firstDayOfWeek; i++) {
        cells.push({ events: [] });
      }

      // Add actual days with events
      for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ day, events: grouped[day] ?? [] });
      }

      this.days = cells;

      // Trigger change detection for OnPush strategy
      this.cdr.markForCheck();
    });
  }

  private groupEventsByDay(events: MonthEvent[]): Record<number, MonthEvent[]> {
    return events.reduce((acc: Record<number, MonthEvent[]>, e) => {
      const day = new Date(e.eventDateTime).getDate();
      acc[day] = acc[day] || [];
      acc[day].push(e);
      return acc;
    }, {});
  }

  prevMonth(): void {
    if (this.month === 1) {
      this.month = 12;
      this.year--;
    } else {
      this.month--;
    }
    this.buildMonth();
  }

  /** Navigate to next month */
  nextMonth(): void {
    if (this.month === 12) {
      this.month = 1;
      this.year++;
    } else {
      this.month++;
    }
    this.buildMonth();
  }

  openEvent(event: MonthEvent): void {
    this.routePartsService.GuidToEdit = event.id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    const url = `/MediaCoverage/Mediacoverageform?GuidToEdit=${event.id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
    window.open(url, '_blank');
  }
  }
