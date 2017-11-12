import { Component, ViewChild, OnInit } from '@angular/core';
import { Room } from './models/room';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  @ViewChild('appdiv') appDiv;

  public showList = true;
  public showDetail = false;
  public viewMode = 'dual';
  public viewState = 'list';

  public currentRoom: Room;

  ngOnInit() {
    this.handleResize(null);
  }

  handleResize($event) {
    let clientRect = this.appDiv.nativeElement.getBoundingClientRect();
    if (clientRect.width > 1000) {
      this.viewMode = 'dual';
    } else {
      this.viewMode = 'single';
    }
    this.refreshState();
  }

  private refreshState() {
    if (this.viewMode === 'dual') {
      this.showList = true;
      this.showDetail = true;
    } else {
      if (this.viewState === 'detail') {
        this.showList = false;
        this.showDetail = true;
      } else {
        this.showList = true;
        this.showDetail = false;        
      }
    }
  }

  handleRoomSelected(room: Room) {
    this.currentRoom = room;
    this.viewState = 'detail';
    this.refreshState();
  }

  handleBack() {
    this.viewState = 'list';
    this.refreshState();
  }  
}
