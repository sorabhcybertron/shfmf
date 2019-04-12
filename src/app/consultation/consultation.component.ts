import { Component, OnInit } from '@angular/core';
import { AppServicesService } from '../app-services.service';

declare var cordova;

@Component({
	selector: 'consultation',
	templateUrl: './consultation.component.html',
	styleUrls: ['./consultation.component.css']
})
export class ConsultationComponent implements OnInit {
	cons_link:any = 'http://muscularstrength.com/consultation_scott_herman_json.php';
	consultation: any;

	constructor(public appService: AppServicesService) {}

	ngOnInit() {
		this.appService.loadArticles(this.cons_link).subscribe(
			res => {
				console.log(res);
				if(res.success){
					this.consultation = res.content;
					setTimeout(function(){
						let skype_link = document.getElementsByClassName('mc-cons-btn-dwn')[0];
						skype_link.addEventListener('click', function(e){
							e.preventDefault();
							cordova.InAppBrowser.open('https://itunes.apple.com/us/app/skype-for-iphone/id304878510?mt=8', '_system');
							// cordova.InAppBrowser.open(e.srcElement.getAttribute('href'), '_system');
							return false;
						}, false);
					},200);
				}
			},
			err => {
				console.log('err');
				console.log(err);
			}
		);
	}
}