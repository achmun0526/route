/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SitesService } from './sites.service';

describe('SitesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SitesService]
    });
  });

  it('should ...', inject([SitesService], (service: SitesService) => {
    expect(service).toBeTruthy();
  }));
});
