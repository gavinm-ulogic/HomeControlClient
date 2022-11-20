import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoomDetailComponent } from './room-detail.component';

describe('RoomDetailComponent', () => {
  let component: RoomDetailComponent;
  let fixture: ComponentFixture<RoomDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
