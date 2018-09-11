import { Component, OnInit, Input } from '@angular/core';
import { Sensor } from '../../models/sensor';

@Component({
  selector: 'app-sensor-list',
  templateUrl: './sensor-list.component.html',
  styleUrls: ['./sensor-list.component.scss']
})
export class SensorListComponent implements OnInit {
  @Input() sensors: Sensor[];

  constructor() { }

  ngOnInit() {
  }

}
