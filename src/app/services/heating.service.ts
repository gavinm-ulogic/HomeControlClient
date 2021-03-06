import { Observable, throwError, Subscriber } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
// import { Http, Response, Headers, RequestOptions, HttpErrorResponse } from '@angular/http';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Environment } from '../app.environment';

import { Status } from '../models/status';
import { Room } from '../models/room';
import { Sensor } from '../models/sensor';
import { Heater } from '../models/heater';
import { TimedEvent, TimedEventPeriod } from '../models/timed-event';

import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';


@Injectable()
export class HeatingService {
  public theRooms: Room[] = [];
  public theEvents: TimedEvent[] = [];

  constructor(private http: HttpClient) {
    LoggerService.log('HeatingService');
  }

  public refreshData = function () {
    let self = this;
    // return self.refreshAllData();
  };

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  // private handleError(error: Response | any): Observable<any> {

  //   let errMsg: string;
  //   if (error instanceof Response) {
  //     let body: any;
  //     try {
  //       body = error || '';
  //     } catch (newErr) {
  //       body = error.statusText;
  //     }
  //     const err = body.error || JSON.stringify(body);
  //     errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
  //   } else {
  //     errMsg = error.message ? error.message : error.toString();
  //   }
  //   LoggerService.error(errMsg);
  //   return Observable.throw(errMsg);
  // }

  private getStatusFromServer(dataProcessor: Function) {
    let self = this;
    return self.http.get(Environment.API_BASE + 'status').pipe(
      map((res: Response) => {
        let status = res;
        if (dataProcessor) { dataProcessor.call(self, status); }
        return status || {}
      }))
      // .catch(error => self.handleError(error));
  };

  private getObjectListFromServer(objectList: any[], url: string, dataProcessor: Function = null) {
    let self = this;
    return self.http.get(Environment.API_BASE + url).pipe(
      map((res: Response) => {
        let theList = res;
        objectList.length = 0;
        objectList.push.apply(objectList, theList);
        if (dataProcessor) { dataProcessor.call(self, objectList); }
        return objectList || {};
      }))
      // .catch(error => self.handleError(error));
  };

  private getEventListFromServer(dataProcessor: Function = null): Observable<TimedEvent[]> {
    let self = this;
    return self.http.get(Environment.API_BASE + 'events').pipe(
      map((res: TimedEvent[]) => {
        self.theEvents = TimedEvent.mapMany(res);
        if (dataProcessor) { dataProcessor.call(self, self.theEvents); }
        return self.theEvents || [];
      }))
      // .catch(error => self.handleError(error));
  };

  private getRoomListFromServer(roomList: Room[], dataProcessor: Function = null): Observable<Room[]> {
    let self = this;
    return self.http.get(Environment.API_BASE + 'rooms').pipe(
      map((res: Response) => {
        let theList = res;
        roomList = Room.mapMany(theList);
        // roomList.length = 0;
        // roomList.push.apply(roomList, theList);
        if (dataProcessor) { dataProcessor.call(self, roomList); }
        return roomList || [];
      }))
      // .catch(error => self.handleError(error));
  };

  private processRoomData(roomList: Room[]): Room[] {
    if (!roomList) { return null; }
    for (let room of roomList) {
      let temp = -999;
      if (!room.sensors) { room.sensors = []; }
      for (let sensor of room.sensors) {
        temp = (sensor === room.sensors[0]) ? sensor.reading : temp + sensor.reading;
      }
      if (room.sensors.length > 1) { temp = temp / room.sensors.length; }
      room.tempCurrent = temp;
      room.summary = (room.tempCurrent === -999) ? '' : room.tempCurrent + '°C';
    }
    return roomList;
  };

  private processEventData(eventList: TimedEvent[]): TimedEvent[] {
    if (!eventList) { return null; }
    for (let timedEvent of eventList) {
      timedEvent.periodObj = new TimedEventPeriod(timedEvent.period);
    }
    return eventList;
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
          retVal = diff + ' sec';
        } else if (diff < 120) {
          retVal = '1 min';
        } else if (diff < 3600) {
          retVal = Math.floor(diff / 60) + ' min';
        } else if (diff < 7200) {
          retVal = '1 hr';
        } else if (diff < 86400) {
          retVal = Math.floor(diff / 3600) + ' hrs';
        } else if (diff < 172800) {
          retVal = '1 day';
        } else {
          retVal = Math.floor(diff / 86400) + ' days';
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
    return <Observable<Status>>this.getStatusFromServer(this.processStatusData);
  };

  public getRooms(): Observable<Room[]> {
    return this.getRoomListFromServer(this.theRooms, this.processRoomData);
  };

  public getEvents(): Observable<TimedEvent[]> {
    return this.getEventListFromServer(this.processEventData);
  };


  private filterSubjectEvents(subjectId: number) {
    let retArray: TimedEvent[] = [];
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
      return this.getEvents().pipe(
        map((res: Response) => {
          return this.filterSubjectEvents(subjectId);
        }))
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
    return this.saveObject(room, 'rooms');
  };

  public saveSensor = function (sensor: Sensor) {
    return this.saveObject(sensor, 'sensors');
  };

  public saveHeater = function (heater: Heater) {
    return this.saveObject(heater, 'heaters');
  };

  public getEvent = function (eventId: number, noChache: boolean) {
    return this.getObject(this.getEvents, this.theEvents, eventId, noChache);
  };

  private saveObject(object: any, url: string) {
    if (!object) { return null; }
    let self = this;

    // let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    // let options = new RequestOptions({ headers: headers }); // Create a request option
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };


    if (object.id > 0) {
      return self.http.put(Environment.API_BASE + url + '/' + object.id, object, httpOptions).pipe(
        map((res: Response) => {
          object = res;
          return object || {};
        }),
        catchError(self.handleError))
        // .catch(error => self.handleError(error));
    } else {
      return this.http.post(Environment.API_BASE + url, object, httpOptions).pipe(
        map((res: Response) => {
          object = res;
          return object;
        }),
        catchError(self.handleError))
        // , function (error: any) {
        //   LoggerService.log(error);
        // });
    }
  };

  private deleteObject(objectId: number, url: string) {
    let self = this;
    if (!objectId) { return null; }
    return this.http.delete(Environment.API_BASE + url + '/' + objectId).pipe(
      map((res: Response) => {
        return;
      }),
      catchError(self.handleError))
      // .catch(error => self.handleError(error));
  };

  public saveEvent = function (eventObj: any) {
    return this.saveObject(eventObj, 'events');
  };

  public deleteEvent = function (eventObj: any) {
    return this.deleteObject(eventObj.id, 'events');
  };
}
