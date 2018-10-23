/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FacilitiesService } from './facilities.service';

describe('FacilitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FacilitiesService]
    });
  });

  it('should ...', inject([FacilitiesService], (service: FacilitiesService) => {
    expect(service).toBeTruthy();
  }));
});
