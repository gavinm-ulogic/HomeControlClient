import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {  } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import { HeatingService } from '../../services/heating.service';
import { Room } from '../../models/room';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {
    @Output() onRoomSelected = new EventEmitter<any>();

    public roomList: Room[];

    private loadRoomList() {
        this.heatingService.getRooms()
            .subscribe(
                (rooms: Room[]) => this.roomList = rooms,
                (err: any) => {
                    LoggerService.log(err);
                });
    };

    constructor(
        public heatingService: HeatingService
    ) {}

    ngOnInit() {
        LoggerService.log('Room List');

        this.loadRoomList();
    }

    public onSelect(room: Room) {
        LoggerService.log('RoomList, Room selected: ' + room.name);
        this.onRoomSelected.emit(room);
    };

    public onSelectStatus() {
        this.onRoomSelected.emit(null);
    }
}
