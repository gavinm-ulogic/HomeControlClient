import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DatePipe } from '@angular/common';

import { AppComponent } from './app.component';
import { RoomListComponent } from './components/room-list/room-list.component';
import { RoomDetailComponent } from './components/room-detail/room-detail.component';

import { HeatingService } from './services/heating.service';
import { DayTimerComponent } from './components/day-timer/day-timer.component';
import { WeekTimerComponent } from './components/week-timer/week-timer.component';
import { StatusComponent } from './components/status/status.component';
import { SensorListComponent } from './components/sensor-list/sensor-list.component';
import { LiveEventsComponent } from './components/live-events/live-events.component';

@NgModule({
  declarations: [
    AppComponent,
    RoomListComponent,
    RoomDetailComponent,
    DayTimerComponent,
    WeekTimerComponent,
    StatusComponent,
    SensorListComponent,
    LiveEventsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [HeatingService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
