import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectplanadvancedsearchComponent } from './projectplanadvancedsearch.component';

describe('ProjectplanadvancedsearchComponent', () => {
  let component: ProjectplanadvancedsearchComponent;
  let fixture: ComponentFixture<ProjectplanadvancedsearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectplanadvancedsearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectplanadvancedsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
