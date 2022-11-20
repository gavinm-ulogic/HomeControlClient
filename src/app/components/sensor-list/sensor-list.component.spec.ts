import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SensorListComponent } from './sensor-list.component';

describe('SensorListComponent', () => {
  let component: SensorListComponent;
  let fixture: ComponentFixture<SensorListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
