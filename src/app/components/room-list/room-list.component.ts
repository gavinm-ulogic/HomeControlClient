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

    private loadRoomList = function() {
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

    // public getTempClass = function(room: Room) {
    //     if (room.tempCurrent === -999) { return ''; }
    //     let iPos = Math.min(25, Math.max(4, Math.floor(room.tempCurrent)));
    //     return 'temperature-' + iPos;
    // };

    public onSelect = function(room: Room) {
        LoggerService.log('RoomList, Room selected: ' + room.name);
        this.onRoomSelected.emit(room);
    };

    public onSelectStatus = function() {
        this.onRoomSelected.emit(null);
    }
}
