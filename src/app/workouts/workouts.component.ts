import { Component, OnInit, OnDestroy, NgZone/*, ViewEncapsulation*/ } from '@angular/core';
import { Router } from '@angular/router';
import { AppServicesService } from '../app-services.service';
import { WorkoutRoutinesComponent } from '../workout-routines/workout-routines.component';
import { WorkoutExercisesComponent } from '../workout-exercises/workout-exercises.component';

@Component({
	selector: 'app-workouts',
	templateUrl: './workouts.component.html',
	styleUrls: ['../../assets/styles/css.css', './workouts.component.css']/*,
	encapsulation: ViewEncapsulation.None*/
})
export class WorkoutsComponent implements OnInit {
	public whichToShow: any = this.appService.activeWorkoutsTab() ? this.appService.activeWorkoutsTab() : 'exercises';

	constructor(router: Router, public appService: AppServicesService, public zone: NgZone) {
	  	if(!appService.checkLogin())
	  		router.navigate(['Login']);
	}
	catChange(val){
		this.appService.activeWorkoutsTab(true, val);
	}
	ngOnInit(){}
}