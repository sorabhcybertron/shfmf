import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppServicesService } from "../app-services.service";

declare var cordova;

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["../../assets/styles/css.css","./header.component.css"]
})
export class HeaderComponent implements OnInit {
  un: string;
  ps: string;
  showIframe: boolean = false;
  iFrameBaseSource: string;
  menuOpen = false;
  username: any = "";
  constructor(
    public appService: AppServicesService,
    public router: Router,
  ) {
    
  }

  ngOnInit() {
    this.username = this.appService.getUserInfo("First Name");
    this.un = atob(window.localStorage.getItem("key1"));
    this.ps = atob(window.localStorage.getItem("key2"));
  }
  toggleMenu() {
    this.menuOpen = true;
  }
  closeMenu() {
    this.menuOpen = false;
  }
  logoutUser() {
    this.menuOpen = false;
    let userID = this.appService.getUserInfo('User Id');
    this.appService.removeToken(userID);
    this.appService.setLogin(false);
    window.localStorage.removeItem("userInfo");
    window.localStorage.removeItem("nm");
    window.localStorage.removeItem("ps");
    this.router.navigate(["/Login"]);
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
