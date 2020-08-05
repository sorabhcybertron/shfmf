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
  constructor(public router: Router, public appService: AppServicesService) { 
  	this.userinfo = JSON.parse(window.localStorage.getItem('userInfo'));
  }

  ngOnInit() {
  }

  getuserPlatinum(){
		if(this.userinfo && (this.userinfo['account type'] == 'Platinum' || this.userinfo['account type'] == 'Platinum Plus')){
			return true;
		}else{
			return false;
		}
	}

  markeAllViewed(){
    let userID =  this.appService.getUserInfo('User Id');
    if(userID){
      let data = {mid : userID, update_record : 'all'};
      this.appService.postCall(this.appService.siteBaseUrl+'app_new_content_check.php',data).subscribe(
        res =>{
          this.appService.getNewContents();
        },
        err=>{
        }
      );
    }
  }
}
