import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnotherUsersProfileComponent } from './another-users-profile.component';

describe('AnotherUsersProfileComponent', () => {
  let component: AnotherUsersProfileComponent;
  let fixture: ComponentFixture<AnotherUsersProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnotherUsersProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnotherUsersProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
