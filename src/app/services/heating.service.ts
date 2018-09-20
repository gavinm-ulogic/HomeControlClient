import { Observable, Subscriber } from 'rxjs/Rx';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Environment } from '../app.environment';

import { Status } from '../models/status';
import { Room } from '../models/room';
import { Sensor } from '../models/sensor';
import { Heater } from '../models/heater';
import { TimedEvent } from '../models/timed-event';

import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable()
export class HeatingService {
  public theRooms: Room[] = [];
  public theEvents: TimedEvent[] = [];

  constructor(private http: Http) {
    LoggerService.log('HeatingService');
  }

  public refreshData = function () {
    let self = this;
    // return self.refreshAllData();
  };

  private handleError(error: Response | any): Observable<any> {

    let errMsg: string;
    if (error instanceof Response) {
      let body: any;
      try {
        body = error.json() || '';
      } catch (newErr) {
        body = error.statusText;
      }
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    LoggerService.error(errMsg);
    return Observable.throw(errMsg);
  }

  private getStatusFromServer(dataProcessor: Function): Observable<Status> {
    let self = this;
    return self.http.get(Environment.API_BASE + 'status')
      .map((res: Response) => {
        let status = res.json();
        if (dataProcessor) { dataProcessor.call(self, status); }
        return status || {};
      })
      .catch(error => self.handleError(error));
  };

  private getObjectListFromServer(objectList: any[], url: string, dataProcessor: Function = null) {
    let self = this;
    return self.http.get(Environment.API_BASE + url)
      .map((res: Response) => {
        let theList = res.json();
        objectList.length = 0;
        objectList.push.apply(objectList, theList);
        if (dataProcessor) { dataProcessor.call(self, objectList); }
        return objectList || {};
      })
      .catch(error => self.handleError(error));
  };

  private getRoomListFromServer(roomList: Room[], dataProcessor: Function = null): Observable<Room[]> {
    let self = this;
    return self.http.get(Environment.API_BASE + 'rooms')
      .map((res: Response) => {
        let theList = res.json();
        roomList = Room.mapMany(theList);
        // roomList.length = 0;
        // roomList.push.apply(roomList, theList);
        if (dataProcessor) { dataProcessor.call(self, roomList); }
        return roomList || [];
      })
      .catch(error => self.handleError(error));
  };

  private processRoomData(roomList: Room[]): Room[] {
    if (!roomList) { return null; }
    for (let room of roomList) {
      let temp = -999;
      let cnt = 0;
      for (let sensor of room.sensors) {
        temp = (cnt === 0) ? sensor.reading : temp + sensor.reading;
        cnt++;
      }
      if (cnt > 0) { temp = temp / cnt; }
      room.tempCurrent = room.sensors[0].reading;
      room.summary = (room.tempCurrent === -999) ? '' : room.tempCurrent + '°C';
    }
    return roomList;
  };

  private processStatusData(status: Status): Status {
    function _ago(testDate: Date): string {
      let retVal = '';
      if (!testDate) {
        retVal = 'never';
      } else {
        let lrd = new Date(testDate);
        let now = new Date();
        let diff = Math.round((now.getTime() - lrd.getTime()) / 1000);
        if (diff < 60) {
          retVal = diff + ' seconds ago';
        } else if (diff < 120) {
          retVal = '1 minute ago';
        } else if (diff < 3600) {
          retVal = Math.floor(diff / 60) + ' minutes ago';
        } else if (diff < 7200) {
          retVal = '1 hour ago';
        } else if (diff < 86400) {
          retVal = Math.floor(diff / 3600) + ' hours ago';
        } else if (diff < 172800) {
          retVal = '1 day ago';
        } else {
          retVal = Math.floor(diff / 86400) + ' days ago';
        }
      }
      return retVal;
    }

    // Remove floor sensors & set time strings
    for (let i = status.sensors.length-1; i>=0; i--) {
      if (status.sensors[i].name.indexOf(' floor ') >= 0) {
        status.sensors.splice(i, 1);
      }
      else {
        status.sensors[i].lastReadStr = _ago(status.sensors[i].lastRead);
        if (status.sensors[i].lastChange == status.sensors[i].lastRead) {
          status.sensors[i].lastChangeStr = 'never';
        } else {
          status.sensors[i].lastChangeStr = _ago(status.sensors[i].lastChange);
        }
      }
    }
    return status;
  }

  public getStatus(): Observable<Status> {
    return this.getStatusFromServer(this.processStatusData);
  };

  public getRooms(): Observable<Room[]> {
    return this.getRoomListFromServer(this.theRooms, this.processRoomData);
  };

  public getEvents(): Observable<Room[]> {
    return this.getObjectListFromServer(this.theEvents, 'events');
  };


  private filterSubjectEvents = function (subjectId: number) {
    let retArray: Event[] = [];
    for (let event of this.theEvents) {
      if (event.subjectId === subjectId) {
        retArray.push(event);
      }
    }
    return retArray || {};
  };

  public getSubjectEvents = function (subjectId: number, noCache: boolean): Observable<TimedEvent[]> {
    if (!noCache && this.theEvents && this.theEvents.length > 0) {
      let retOb = new Observable<TimedEvent[]>((subscriber: Subscriber<TimedEvent[]>) => {
        subscriber.next(this.filterSubjectEvents(subjectId));
        subscriber.complete();
      });
      return retOb;
    } else {
      return this.getEvents()
        .map((res: Response) => {
          return this.filterSubjectEvents(subjectId);
        })
        .catch(this.handleError);
    }
  };

  private getObjectFromList = function (objectList: any, objectId: number) {
    if (!objectList) { return null; }
    for (let i = 0; i < objectList.length; i++) {
      if (objectList[i].id === objectId) {
        return objectList[i];
      }
    }
    return null;
  };

  private getObject = function (objectGetter: any, objectList: any[], objectId: number, noCache: boolean) {
    if (!objectId) { return null; }

    let self = this;
    if (!noCache && objectList && objectList.length > 0) {      // should be a better test for unused list
      let retOb = new Observable<any[]>((subscriber: Subscriber<any[]>) => {
        LoggerService.log('HeatingService getObject: got from cache: ' + objectId);
        subscriber.next(this.getObjectFromList(objectList, objectId));
        subscriber.complete();
      });
      return retOb;
    } else {
      return objectGetter.apply(self)
        .map((res: Response) => {
          LoggerService.log('HeatingService getObject: got from server: ' + objectId);
          return this.getObjectFromList(objectList, objectId);
        })
        .catch(self.handleError);
    }
  };

  public getRoom = function (roomId: number, noChache: boolean) {
    return this.getObject(this.getRooms, this.theRooms, roomId, noChache);
  };

  public saveRoom = function (room: Room) {
    return this.saveObject(room, 'Rooms');
  };

  public saveSensor = function (sensor: Sensor) {
    return this.saveObject(sensor, 'Sensors');
  };

  public saveHeater = function (heater: Heater) {
    return this.saveObject(heater, 'Heaters');
  };

  public getEvent = function (eventId: number, noChache: boolean) {
    return this.getObject(this.getEvents, this.theEvents, eventId, noChache);
  };

  private saveObject(object: any, url: string) {
    if (!object) { return null; }
    let self = this;

    let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    let options = new RequestOptions({ headers: headers }); // Create a request option

    if (object.id > 0) {
      return self.http.put(Environment.API_BASE + url + '/' + object.id, object, options)
        .map((res: Response) => {
          object = res.json();
          return object || {};
        })
        .catch(error => self.handleError(error));
    } else {
      return this.http.post(Environment.API_BASE + url, object, options)
        .map((res: Response) => {
          object = res.json();
          return object;
        }, function (error: any) {
          LoggerService.log(error);
        });
    }
  };

  private deleteObject(objectId: number, url: string) {
    let self = this;
    if (!objectId) { return null; }
    return this.http.delete(Environment.API_BASE + url + '/' + objectId)
      .map((res: Response) => {
        return;
      }).catch(error => self.handleError(error));
  };

  public saveEvent = function (eventObj: any) {
    return this.saveObject(eventObj, 'events');
  };

  public deleteEvent = function (eventObj: any) {
    return this.deleteObject(eventObj.id, 'events');
  };
}
