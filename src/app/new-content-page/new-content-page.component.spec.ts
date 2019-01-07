import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewContentPageComponent } from './new-content-page.component';

describe('NewContentPageComponent', () => {
  let component: NewContentPageComponent;
  let fixture: ComponentFixture<NewContentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewContentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewContentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
