import { Component, OnInit, Input } from '@angular/core';
import { LiveEvent } from '../../models/live-event';

@Component({
  selector: 'app-live-events',
  templateUrl: './live-events.component.html',
  styleUrls: ['./live-events.component.scss']
})
export class LiveEventsComponent implements OnInit {

  @Input() events: LiveEvent[];
  @Input() showState = false;

  constructor() { }

  ngOnInit() {
  }

}
