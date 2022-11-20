import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LiveEventsComponent } from './live-events.component';

describe('LiveEventsComponent', () => {
  let component: LiveEventsComponent;
  let fixture: ComponentFixture<LiveEventsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
