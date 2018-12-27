/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AppServicesService } from './app-services.service';

describe('AppServicesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppServicesService]
    });
  });

  it('should ...', inject([AppServicesService], (service: AppServicesService) => {
    expect(service).toBeTruthy();
  }));
});
