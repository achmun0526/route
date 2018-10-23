/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SMSService } from './sms.service';

describe('CsvService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SMSService]
    });
  });

  it('should ...', inject([SMSService], (service: SMSService) => {
    expect(service).toBeTruthy();
  }));
});
