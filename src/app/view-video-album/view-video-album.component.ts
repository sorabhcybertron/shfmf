import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-video-album',
  templateUrl: './view-video-album.component.html',
  styleUrls: ['./view-video-album.component.css']
})
export class ViewVideoAlbumComponent implements OnInit {

  constructor() { 
  	console.log("Hello there! Phot wale");
  }

  ngOnInit() {
  }

}
