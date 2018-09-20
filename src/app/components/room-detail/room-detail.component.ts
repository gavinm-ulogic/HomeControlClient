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
    }
  } 

  editRoomBlur() {
    this.heatingService.saveRoom(this.room).subscribe();
  }

  editSensorBlur(sensor) {
    this.heatingService.saveSensor(sensor).subscribe();
  }

  editHeaterBlur(heater) {
    this.heatingService.saveHeater(heater).subscribe();
  }
}
