import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizeAvatarComponent } from './customize-avatar.component';

describe('CustomizeAvatarComponent', () => {
  let component: CustomizeAvatarComponent;
  let fixture: ComponentFixture<CustomizeAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomizeAvatarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizeAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
