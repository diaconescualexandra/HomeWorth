import { TestBed } from '@angular/core/testing';

import { EstimatePriceService } from './estimate-price.service';

describe('EstimatePriceService', () => {
  let service: EstimatePriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstimatePriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
