import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WeekTimerComponent } from './week-timer.component';

describe('WeekTimerComponent', () => {
  let component: WeekTimerComponent;
  let fixture: ComponentFixture<WeekTimerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
