/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IncidentsService } from './incidents.service';

describe('FacilitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IncidentsService]
    });
  });

  it('should ...', inject([IncidentsService], (service: IncidentsService) => {
    expect(service).toBeTruthy();
  }));
});
