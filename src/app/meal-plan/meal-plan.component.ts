import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { SafeUrlPipe } from '../recipe-details/recipe-details.component';


declare var cordova;

@Component({
	selector: 'app-meal-plan',
	templateUrl: './meal-plan.component.html',
	styleUrls: ['../../assets/styles/css.css', './meal-plan.component.css']
})

export class MealPlanComponent implements OnInit {
	userinfo : any;
	un: string;
	ps: string;
	showIframe: boolean = false;
	iFrameBaseSource: any;
	iFrameSource: string = '';
	finalSrc: string = (this.iFrameSource != '') ? this.iFrameSource : this.iFrameBaseSource;
	height = window.innerHeight;
	constructor(private sanitixer: DomSanitizer) {
		console.log("opening meal plan component");
		this.un = atob(window.localStorage.getItem("key1"));
    this.ps = atob(window.localStorage.getItem("key2"));
		this.iFrameBaseSource = this.sanitixer.bypassSecurityTrustResourceUrl(
      "https://secure.rocketos.com/members/login/?username=" +
      this.un +
      "&password=" +
      this.ps +
      "&referer=%2Fmembers%2Fos.php%3Ff_id%3D52%23f_id%3D52%26ph%3D0JjyQf");
	}


	onLoadFunc(myIframe) {
		let ifSrc = myIframe.contentWindow.location.href;
		if(ifSrc.indexOf('http') != -1) {
			this.iFrameSource = this.iFrameBaseSource ;
			this.finalSrc = (this.iFrameSource != '') ? this.iFrameSource : this.iFrameBaseSource;
		}
	}

	ngOnInit(){

	}
	
	getuserPlatinum(){
		this.userinfo = JSON.parse(window.localStorage.getItem('userInfo'));
		if(this.userinfo['account type'] == 'Platinum'){
			return true;
		}else{
			return false;
		}
	}
}