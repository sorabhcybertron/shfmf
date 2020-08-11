import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AppServicesService } from '../app-services.service';

@Component({
	selector: 'app-programs',
	templateUrl: './programs.component.html',
	styleUrls: ['../../assets/styles/css.css','./programs.component.css']
})
export class ProgramsComponent implements OnInit {
	allData: any;
	noResults: any;
	allLoadedPrograms: any;
	allCats: any[];
	isLoading: boolean;

	constructor(router: Router, public appService: AppServicesService, public zone: NgZone) {
		if(!appService.checkLogin())
			router.navigate(['Login']);
	}

	catChange(val){
		for(var i in this.allData){
			if(this.allData[i]['term'] == val){
				this.allLoadedPrograms = this.allData[i]['data'];
				break;
			}
			console.log(this.allData);
		}
	}

	ngOnInit() {
		this.isLoading = true;
		this.noResults = '';
		let scope = this;
		this.appService.postCall(
			// 'http://localhost/muscular_new_calls/programs_listing_json.php',	// link	local
			'http://muscularstrength.com/programs_listing_json.php',	// link
			{'postAction': 'GET_FULL_WORKOUTS'}	// data
		).subscribe(
			res => {
				scope.zone.run(() => {
					console.log(res);
					if(res.success){
						if(res.has_data){
							scope.allData = res.workouts;
							scope.allCats = res.allCats;
							scope.allCats.reverse();
							for(var i in res.workouts){
								if(res.workouts[i].has_data){
									scope.allLoadedPrograms = res.workouts[i].data;
									console.log('allLoadedPrograms');
									console.log(scope.allLoadedPrograms);
									break;
								}
							}
						}
						for(var i in this.allData){
							if(this.allData[i]['term'] == 'Muscle_Gain'){
								this.allLoadedPrograms = this.allData[i]['data'];
								break;
							}
							console.log(this.allData);
						}
					}else
						scope.noResults = res.msg;
					scope.isLoading = false;
				});
			},
			err => {
				scope.zone.run(()=>{
					console.log('error');
					console.log(err);
					scope.isLoading = false;
					scope.noResults = 'Some error occured!';
				});
			}
		);
	}
}
