import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppServicesService } from '../app-services.service';

@Component({
	selector: 'app-customize-avatar',
	templateUrl: './customize-avatar.component.html',
	styleUrls: ['../../assets/styles/css.css', './customize-avatar.component.css']
})
export class CustomizeAvatarComponent implements OnInit {
	public customizeAvOps: any;
	constructor(public appService: AppServicesService) { }

	ngOnInit() {
		let scope = this;
		let uid = this.appService.getUserInfo('User Id');
		this.appService.loadArticles('http://muscularstrength.com/customize_avatar_json.php?userid=189347').subscribe(res => {
			// console.log('res');
			// console.log(res);
			if(res.result == "SUCCESS"){
				for(var k in res.Items[0])
					res.Items[0][k].visible = false;
				this.customizeAvOps = res.Items[0];
				console.log(this.customizeAvOps);
				setTimeout(scope.adjustEls, 10);
			}
		},
		err => {
			console.log('err');
			console.log(err);
		})
		window.addEventListener('resize', this.adjustEls);
	}
	showOverlay(i){
		setTimeout(function(){
			let opts = document.getElementsByClassName('cat-item') as HTMLCollectionOf<HTMLElement>;
			for(var i=0; i<opts.length; i++)
				opts[i].style.height = Math.floor(opts[i].getBoundingClientRect().width)+'px';
		}, 0);
		this.customizeAvOps[i].visible = !this.customizeAvOps[i].visible;
	}
	adjustEls(){
		console.log('resize');
		let opts = document.getElementsByClassName('option-cat') as HTMLCollectionOf<HTMLElement>;
		for(var i=0; i<opts.length; i++)
			opts[i].style.height = Math.floor(opts[i].getBoundingClientRect().width)+'px';
	}
	ngOnDestroy(){
		window.removeEventListener('resize', this.adjustEls);
	}
}
