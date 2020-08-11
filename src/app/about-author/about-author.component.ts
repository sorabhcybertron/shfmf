import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-about-author',
  templateUrl: './about-author.component.html',
  styleUrls: ['./about-author.component.css']
})
export class AboutAuthorComponent implements OnInit {
  url: string;
  user: string;
  iFrameUrl: any;
  height: any;
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {
    this.height = window.innerHeight;
    this.route.params.subscribe(params=>{
      this.url = params['url'];
      console.log(this.url);
      this.iFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    });
   }

  ngOnInit() {
  }

}
