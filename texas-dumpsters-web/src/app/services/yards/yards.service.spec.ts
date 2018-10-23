/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { YardsService } from './yards.service';

describe('YardsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YardsService]
    });
  });

  it('should ...', inject([YardsService], (service: YardsService) => {
    expect(service).toBeTruthy();
  }));
});
