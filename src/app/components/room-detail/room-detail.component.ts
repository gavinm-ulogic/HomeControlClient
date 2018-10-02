import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import { HeatingService } from "../../services/heating.service"
import { Room } from "../../models/room"
import { TimedEvent } from "../../models/timed-event"

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.scss']
})
export class RoomDetailComponent implements OnInit, OnChanges {
  @Input() room: Room;
  @Output() onClose = new EventEmitter();

  public roomEvents: TimedEvent[] = null;
  public showEvents: boolean = false;
  public editMode = true;
  public tempTargetDisplay: string;
  public tempMinDisplay: string;
  public tempMaxDisplay: string;
  
  constructor(
    public heatingService: HeatingService
  ) { }

  ngOnInit() {
    LoggerService.log('Room Detail.OnInit');
  }

  ngOnChanges() {
    LoggerService.log('Room Detail.OnChanges');
    if (this.room) {
        this.showEvents = this.room.heaters.length > 0;
        this.tempTargetDisplay = this.room.tempTarget + '°C';
        this.tempMinDisplay = this.room.tempMin + '°C';
        this.tempMaxDisplay = this.room.tempMax + '°C';
    }
  } 

  editRoomBlur() {
    this.heatingService.saveRoom(this.room).subscribe();
  }

  editRoomTempFocus(settingName) {
    this[`temp${settingName}Display`] = this.room[`temp${settingName}`];
  }

  editRoomTempBlur(settingName) {
    this.room[`temp${settingName}`] = this[`temp${settingName}Display`];
    this[`temp${settingName}Display`] = this.room[`temp${settingName}`] + '°C';
    this.heatingService.saveRoom(this.room).subscribe();
  }

  editSensorBlur(sensor) {
    this.heatingService.saveSensor(sensor).subscribe();
  }

  editHeaterBlur(heater) {
    this.heatingService.saveHeater(heater).subscribe();
  }
}
