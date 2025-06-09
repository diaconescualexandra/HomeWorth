import { TestBed } from '@angular/core/testing';

import { PropertyViewsService } from './property-views.service';

describe('PropertyViewsService', () => {
  let service: PropertyViewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyViewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
