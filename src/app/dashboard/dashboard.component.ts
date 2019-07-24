import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppServicesService } from "../app-services.service";
// import { fadeInAnimation } from '../_animations/index';
// import {HeaderComponent} from '../header/header.component';

declare var cordova;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  // animations: [fadeInAnimation],
  // host: { '[@fadeInAnimation]': '' },
  styleUrls: ["../../assets/styles/css.css", "./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  un: string;
  ps: string;
  showIframe: boolean = false;
  iFrameBaseSource: string;
  menuOpen = false;
  whatsNewContent: string = '';
  counts : any = {  workouts : 0, articles : 0, recipes : 0, programs : 0};
  constructor(router: Router,public appService: AppServicesService) {
    if (!appService.checkLogin()) router.navigate(["Login"]);
    this.un = atob(window.localStorage.getItem("key1"));
    this.ps = atob(window.localStorage.getItem("key2"));
    let urlString : string = appService.siteBaseUrl+'whats_new_app_json.php';
    console.log(urlString);
    appService.loadArticles(urlString).subscribe(res => {
          if(res.status){
              this.whatsNewContent = res.result.contents;
          }else{
              this.whatsNewContent = '<p></p>';
          }
        },
        err => {
            this.whatsNewContent = '<p></p>';
        }
    );
  }

  ngOnInit() {
    
  }
  OpenInAppBrowser() {
    this.iFrameBaseSource =
      "https://secure.rocketos.com/members/login/?username=" +
      this.un +
      "&password=" +
      this.ps +
      "&referer=%2Fmembers%2Fos.php%3Ff_id%3D52";
    cordova.InAppBrowser.open(this.iFrameBaseSource, "_system");
  }

  getCount(type){
    if(type && this.appService.newContents){
        let count = 0;
        switch (type) {
          case "recipes":
              count = this.appService.newContents.recipes.length;
            break;
          case "articles":
              count = this.appService.newContents.articles.length;
              break;
          case "workouts":
              count = this.appService.newContents.workouts.length;
              break;
          case "programs":
              count = this.appService.newContents.programs.length;
              break;
        }
        return count;
    }
    return 0;
  }
}
