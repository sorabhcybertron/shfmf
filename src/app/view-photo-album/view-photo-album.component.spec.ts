import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPhotoAlbumComponent } from './view-photo-album.component';

describe('ViewPhotoAlbumComponent', () => {
  let component: ViewPhotoAlbumComponent;
  let fixture: ComponentFixture<ViewPhotoAlbumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPhotoAlbumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPhotoAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
