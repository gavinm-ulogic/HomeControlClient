import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTimerComponent } from './day-timer.component';

describe('DayTimerComponent', () => {
  let component: DayTimerComponent;
  let fixture: ComponentFixture<DayTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
