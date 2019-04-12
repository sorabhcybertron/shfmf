import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewContentBadgeComponent } from './new-content-badge.component';

describe('NewContentBadgeComponent', () => {
  let component: NewContentBadgeComponent;
  let fixture: ComponentFixture<NewContentBadgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewContentBadgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewContentBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
