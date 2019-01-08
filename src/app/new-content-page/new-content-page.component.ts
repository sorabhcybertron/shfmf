import { Component, OnInit } from '@angular/core';
import { AppServicesService } from '../app-services.service';
import { SafeHtmlPipe } from '../recipe-details/recipe-details.component';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-new-content-page',
  templateUrl: './new-content-page.component.html',
  styleUrls: ['./new-content-page.component.css']
})
export class NewContentPageComponent implements OnInit {
  public  userinfo : any ;
  constructor(public appService: AppServicesService) { 
  	this.userinfo = JSON.parse(window.localStorage.getItem('userInfo'));
  }

  ngOnInit() {
  }

  getuserPlatinum(){
		if(this.userinfo && this.userinfo['account type'] == 'Platinum'){
			return true;
		}else{
			return false;
		}
	}
}
