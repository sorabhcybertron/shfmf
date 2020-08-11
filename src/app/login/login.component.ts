import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { AppServicesService } from "../app-services.service";
// import {PlatformLocation } from '@angular/common';

declare var device: any;
declare var cordova: any;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../../assets/styles/css.css", "./login.component.css"]
})
export class LoginComponent implements OnInit {
  /*constructor(platformLocation: PlatformLocation) {
    console.log(platformLocation);
  }*/
  public un: string;
  public ps: string;
  public showUnameError: string;
  public showPassError: string;
  public loginSuccess: any;
  public userFBID: any;

  constructor(
    public router: Router,
    public appService: AppServicesService /*, platformLocation: PlatformLocation*/
  ) {
    // console.log(platformLocation);
    this.un = "";
    this.ps = "";
    this.loginSuccess = "";

    if (appService.checkLogin()) {
      this.router.navigate(["/Dashboard"]);
    }
  }

  loginHandler() {
    this.loginSuccess = ""; // Hide Login Fail msg if visible
    let self = this;
    this.showPassError = this.showUnameError = "";
    if (this.un != "" && this.ps != "") {
      this.appService.loginUser(this.un, this.ps).subscribe(data => {
        console.log("data");
        console.log(data);
        if (data.Status === "Active") {
          window.localStorage.setItem("userInfo", JSON.stringify(data));
          self.loginSuccess = true;
          window.localStorage.setItem("key1", btoa(this.un));
          window.localStorage.setItem("key2", btoa(this.ps));
          this.checkToken(data);
          // setTimeout(function () {
          // window.localStorage.setItem('login', 'true');
          self.appService.setLogin(true);
          self.router.navigate(["/Dashboard"]);
          // }, 1000);
        } else {
          window.localStorage.setItem("userInfo", "");
          // window.localStorage.setItem('login', '');
          self.appService.setLogin(false);
          self.loginSuccess = false;
          setTimeout(function() {
            self.loginSuccess = "";
          }, 2000);
        }
      });
    } else {
      this.showUnameError = this.un == "" ? "fielderror" : "";
      this.showPassError = this.ps == "" ? "fielderror" : "";
    }
  }

  ngOnInit() {
    /*let currentUrl = this.router.url;
    console.log(currentUrl);
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
      console.log(device.platform);
    }*/
  }

  checkToken(data) {
    if (this.appService.deviceToken) {
      if (data.device_ids && data.device_ids.length > 0) {
        let found = false;
        var i;
        for (i == 0; i < data.device_ids.length; i++) {
          if (data.device_ids[i] == this.appService.deviceToken) {
            found = true;
          }
        }
        if (!found) {
          this.appService.addTokenId(data["User Id"]);
        }
      } else {
        this.appService.addTokenId(data["User Id"]);
      }
    }
  }
}
