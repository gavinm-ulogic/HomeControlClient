import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {

  constructor() { }

  static log(msg: any)   { console.log(msg); }
  static error(msg: any) { console.error(msg); }
  static warn(msg: any)  { console.warn(msg); }
 
}
