import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {AppServicesService} from '../app-services.service';
// import {PlatformLocation } from '@angular/common';

declare var device: any;
declare var cordova: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../../assets/styles/css.css', './login.component.css']
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
  
  constructor(public router: Router, public appService: AppServicesService/*, platformLocation: PlatformLocation*/) {
    // console.log(platformLocation);
    this.un = '';
    this.ps = '';
    this.loginSuccess = '';

    if(appService.checkLogin()){
      this.router.navigate(['/Dashboard']);
    }
  }
  
  loginHandler(){
    this.loginSuccess = '';  // Hide Login Fail msg if visible
    let self = this;
    this.showPassError = this.showUnameError = '';
    if(this.un !='' && this.ps != ''){
      this.appService.loginUser(this.un, this.ps).subscribe(data => {
        console.log('data');
        console.log(data);
        if(data.Status === "Active"){
          window.localStorage.setItem('userInfo', JSON.stringify(data));
          self.loginSuccess = true;
          window.localStorage.setItem('key1',btoa(this.un));
          window.localStorage.setItem('key2',btoa(this.ps));
          this.checkToken(data);
          // setTimeout(function () {
            // window.localStorage.setItem('login', 'true');
            self.appService.setLogin(true);
            self.router.navigate(['/Dashboard']);
          // }, 1000);
        } else{
          window.localStorage.setItem('userInfo', '');
          // window.localStorage.setItem('login', '');
          self.appService.setLogin(false);
          self.loginSuccess = false;
          setTimeout(function () {
            self.loginSuccess = '';
          }, 2000);
        }
      });
    } else {
      this.showUnameError = this.un == '' ? 'fielderror' : '';
      this.showPassError = this.ps == '' ? 'fielderror' : '';
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

  FBPugin(){
    let scope = this;
    console.log('scopeee');
    console.log(scope);
    cordova.facebookConnectPlugin.login(["public_profile","email"], function(res){
      console.log('fb res');
      console.log(res);
      if(res.status && res.status == "connected" && res.authResponse && res.authResponse.userID != '')
        if(res.authResponse){
          // this.userFBID = res.authResponse.userID;
          cordova.facebookConnectPlugin.api(res.authResponse.userID+"/?fields=id,email,first_name", ["public_profile"],//, "user_birthday"
            function onSuccess (result) {
              console.log("Result: ", result);
              if(result.email && result.email != ''){
                console.log('SCOPE');
                console.log(scope);
                console.log('before login call');
                scope.appService.postCall('http://muscularstrength.com/checkUser.php', {action: 'fblogin', email: result.email}).subscribe(
                    res => {
                      console.log('login call DATA------');
                      console.log(res);
                      if(res.status){
                        window.localStorage.setItem('userInfo', JSON.stringify(res));
                        scope.loginSuccess = true;
                        // window.localStorage.setItem('login', 'true');
                        window.localStorage.setItem
                        scope.appService.setLogin(true);
                        scope.checkToken(res);
                        scope.router.navigate(['/Dashboard']);
                      } else{
                        window.localStorage.setItem('userInfo', '');
                        // window.localStorage.setItem('login', '');
                        scope.appService.setLogin(false);
                        scope.loginSuccess = false;
                        setTimeout(function () {
                          scope.loginSuccess = '';
                        }, 2000);
                      }
                    },
                    err => {
                      console.log('fb login call err');
                    }
                  );
                console.log('after login call');
              }
              console.log(result);
              /* logs: {
                "id": "000000123456789",
                "email": "myemail@example.com"
              } */
              setTimeout(function(){
                cordova.facebookConnectPlugin.logout(
                  function(){
                    console.log('logout seccess');
                    document.getElementById('muscularLogo').click();
                  },
                  function(){
                    console.log('logout failed');
                  }
                );
              }, 5000);
            }, function onError (error) {
              console.log(error);
            }
          );
        }
    }, this.fbFailure);  //, "user_birthday"
  }

  fbFailure(err){
    console.log('err');
    console.log(err);
  }
  
  checkToken(data){
    if(this.appService.deviceToken){
      if(data.device_ids && data.device_ids.length > 0){
        let found = false;
        var i;
        for(i == 0; i < data.device_ids.length; i++){
           if( data.device_ids[i] == this.appService.deviceToken){
             found = true;
           } 
        }
        if(!found){
          this.appService.addTokenId(data['User Id']);
        }
      }else{
        this.appService.addTokenId(data['User Id']);
      }
    }
  }
}
