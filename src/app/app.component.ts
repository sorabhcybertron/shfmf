import { Component, OnInit, ViewEncapsulation, NgZone, Renderer } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AppServicesService } from './app-services.service';
import 'rxjs/add/operator/switchMap';

declare var window: any; 
declare var cordova : any;
declare var FirebasePlugin : any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit{
  loadingText = 'Getting things ready...';
  // route: ActivatedRoute;
  public login: any;
  public loginChangeSubscription: any;
  public borderColor: any;
  // change header border color for diff pages
  public headerBorderColor: any = [
    { color: 'green' , path: ['Dashboard', 'Recipes'] },
    { color: 'blue'  , path: ['Community', 'MyAccount'] },
    { color: 'indigo', path: ['Programs', 'ProgramsDetail', 'Routine', 'UpgradeMembership'] },
    { color: 'yellow', path: ['Workouts'] },
    { color: 'orange', path: ['Exclusives'] },
    { color: 'red'   , path: ['Articles'] },
    { color: 'purple', path: ['MealPlan'] },
    { color: 'green', path: ['Authors'] }
  ];

  constructor(public router: Router, public appService: AppServicesService, public zone: NgZone, private renderer: Renderer){
    let scope = this;
    this.renderer.listenGlobal('document', 'deviceready', () => {
      this.doTokenThings();
    });
    this.login = this.appService.checkLogin();
    
    this.appService.loginChange.subscribe(value => {
      this.zone.run(() => {
        scope.login = value;
        console.log('detecting....');
        console.log(scope.login);
        /*setTimeout(function(){
          console.log('scope.login');
          console.log(scope.login);
          console.log('value');
          console.log(value);
        }, 2000);*/
        // return value;
      });
    });
    // this.headerShow();
    if(this.login){
      this.router.navigate(['/Dashboard']);
      // this.router.navigate(['/Authors/0/Scott_Herman']);
      // this.router.navigate(['/MyAccount']);
      // this.router.navigate(['/Programs/push_pull_legs_json/3/SHFcommentsPushLeg']);
      // this.router.navigate(['/Articles/398']);
      // this.router.navigate(['/Articles/472']);
    }
    else
      this.router.navigate(['/Login']);
  }

  /*headerShow(){
    this.login = window.localStorage.getItem('login') == 'true' ? true : false;
  }*/

  ngOnInit(){
  }

  ngDoCheck() {
    let scope = this;
    // this.headerShow();
    for(let i in this.headerBorderColor)
      if(this.headerBorderColor[i].path.includes(this.router.url.split('/')[1]))
          scope.borderColor = scope.headerBorderColor[i].color;
  }

  doTokenThings(){
    let scope = this;
    if(cordova){
      FirebasePlugin.getToken((token) => {
        console.log(token);
          scope.appService.deviceToken = token;
          console.log(scope.appService.deviceToken);
      }, (error) => {
          console.error(error);
      });

      FirebasePlugin.onTokenRefresh((token) => {
        console.log(token);
        scope.appService.deviceToken = token;
      }, (error) => {
          alert(error);
      });

      FirebasePlugin.onNotificationOpen((notification) => {
          console.log(JSON.stringify(notification));
          alert("The notification is open!");
      }, (error) => {
          console.error(error);
      }); 
    }
  }
}