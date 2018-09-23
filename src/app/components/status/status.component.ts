import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeatingService } from '../../services/heating.service';
import { Status } from '../../models/status';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  private REFRESHTIME = 9000;
  private timer;

  public status: Status;

  constructor(private heatingService: HeatingService) { }

  ngOnInit() {
    let self = this;
    self.loadStatus();
    self.timer = setInterval(function(){
        self.loadStatus();
      }, self.REFRESHTIME
    )
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    } 
  }

  public loadStatus(): void {
    this.heatingService.getStatus().subscribe(
      res => {
        this.status = res;
      }
    )
  }

}
