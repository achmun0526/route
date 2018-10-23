/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AttachmentsService } from './attachments.service';

describe('AttachmentsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AttachmentsService]
    });
  });

  it('should ...', inject([AttachmentsService], (service: AttachmentsService) => {
    expect(service).toBeTruthy();
  }));
});
