import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVideoAlbumComponent } from './view-video-album.component';

describe('ViewVideoAlbumComponent', () => {
  let component: ViewVideoAlbumComponent;
  let fixture: ComponentFixture<ViewVideoAlbumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewVideoAlbumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewVideoAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
