import { TestBed } from '@angular/core/testing';

import { GeohashService } from './geohash.service';

describe('GeohashService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GeohashService = TestBed.get(GeohashService);
    expect(service).toBeTruthy();
  });
});
