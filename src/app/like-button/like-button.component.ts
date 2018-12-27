import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppServicesService } from '../app-services.service';

@Component({
  selector: 'app-like-button',
  templateUrl: './like-button.component.html',
  styleUrls: ['./like-button.component.css']
})
export class LikeButtonComponent {

	@Input() type: string = '';
	@Input() item_id: number = 0;

  constructor(public appService: AppServicesService) { }

  ngOnInit() {
  }

  ngAfterViewInit(){

  }

  likeClicked(){
  		let userID =  this.appService.getUserInfo('User Id');
	  	if(this.type && this.item_id && userID){
	  		let data = {add_fav:'addnew',fav_id:this.item_id,fav_type:this.type,mid:userID}
	  		this.appService.postCall(this.appService.siteBaseUrl+'app_favorite_stuff_json.php',data).subscribe(
				res =>{
					if(res.status){
						this.appService.updateFavorite();
					}
				},
				err=>{
				}

			);;
		}
  }

}
