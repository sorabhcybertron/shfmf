import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppServicesService } from '../app-services.service';

@Component({
	selector: 'workout-exercises',
	templateUrl: './workout-exercises.component.html',
	styleUrls: ['../../assets/styles/css.css', '../workouts/workouts.component.css', './workout-exercises.component.css']
})
export class WorkoutExercisesComponent implements OnInit {
	public workoutsLoaded: any = 0;
	public pagesLoaded: any = 0;
	public displayCount: any = 10;
	public isLoading: boolean = false;
	public routineCats: any = [];
	public routineCatsLink: any = 'routines_cats_new_app_json.php?action=getExerciseCats';
	public containerHgt: any;
	public workouts: any;
	public allWorkoutsLoaded: boolean = false;
	public showFilters: boolean = false;
	public loadError: any = '';
	public loadErrorMsg: any = '';
	public showFilterSectionUl : any = [];
	public dt: any = {
		serializedData: [],
		mid: this.appService.getUserInfo('User Id')
	};
	public workoutsFiltered: boolean = false;	// to change URL if filtered even once
  public isUserPlatinum: any = false;
  public thisRoute: string = "";

	constructor(router: Router, public appService: AppServicesService, public zone: NgZone, public route: ActivatedRoute) {
		this.routineCatsLink = this.appService.siteBaseUrl+this.routineCatsLink;
		this.showFilterSectionUl['body_part'] = false;
		this.showFilterSectionUl['workout_goal'] = false;
		if(!appService.checkLogin())
	  		router.navigate(['Login']);
	  	this.workouts = [];
	}
	showfilterlist(toshow){
		this.showFilterSectionUl[toshow] = (this.showFilterSectionUl[toshow]) ? false : true;
	}
	public loadMoreWorkouts($event, page, displayCount){	// Loads Workouts
	  	let self = this;
	  	self.isLoading = true;	// set Loading to true to avoid loading again on scroll when already loading
	  	console.log('loading more workouts');
	  	let cont = document.querySelector('.wrap.yellow');
	  	let contHgt = cont.getBoundingClientRect().height;
	  	if(self.workoutsFiltered){
	  		// Post call to load filtered articles
	  		this.appService.postCall(this.appService.siteBaseUrl+'exercise_filter_json.php?page='+page+'&display='+self.displayCount, this.dt/*, true*/).subscribe(
	  			res => {
	  				self.zone.run(() => {
						console.log(res);
						self.displayFetchedWorkouts(res);
					});
				},
				err => {
					console.log(err);
				}
	  		);
	  	} else {
		  	// Get Call Initially to load all articles
		  	self.appService.loadArticles(this.appService.siteBaseUrl+'exercise_json.php?exercOrRoutine=exercise&user_id='+self.appService.getUserInfo('User Id')+'&page='+page+'&display='+self.displayCount).subscribe(res => {
		  		self.zone.run(() => {
		  			console.log(res);
		  			self.displayFetchedWorkouts(res);
			  	});
		  	},
		  	err => {
		  		self.zone.run(() => {
			  		self.isLoading = false;	// loading finsihed
			  	});
		  	});
	  	}
	}

	displayFetchedWorkouts(res){
		let self = this;
		if(res.status == true){
			self.loadError = '';
			self.loadErrorMsg = '';
			this.pagesLoaded++;	// Increment PageNumber
			for(var i in res.results){
				self.workouts.push(res.results[i]);
				self.workoutsLoaded++;
			}
			console.log(self.workouts);
			setTimeout(function(){
				let cont = document.querySelector('.wrap.yellow');
				self.containerHgt = cont.getBoundingClientRect().height;	// Update container height
			},100);
			if(res.total_workouts == self.workoutsLoaded)
				self.allWorkoutsLoaded = true;
		} else {
			if(res.status == false){
				self.loadError = true;
				self.loadErrorMsg = res.message;
			}
		}
		self.isLoading = false;	// loading finsihed
	}
	public loadWorkoutsScrollMethod($event){	// Detects Scroll and calls method to load more workouts
		var self = this;
	    console.log(window.compScope.isLoading);
		if(window.compScope.isLoading == false && window.compScope.allWorkoutsLoaded == false && window.compScope.showFilters == false){
			if((window.scrollY + window.innerHeight) >= window.compScope.containerHgt){	// time to load somw more workouts
				console.log('yes');
				window.compScope.loadMoreWorkouts('', window.compScope.pagesLoaded + 1, window.compScope.displayCount);
			}
		}
	}

	ngOnInit() {
    this.route.url.subscribe(url=>{
			url.forEach(element => {
				this.thisRoute += element.path+"/";
      });
      this.thisRoute=this.thisRoute.substring(0,this.thisRoute.length-1);
			window.localStorage.setItem('backPath',this.thisRoute);
		});
		let self = this;
		console.log('workouts init');
		this.isUserPlatinum = this.appService.getUserInfo('account type');
		window.compScope = this;
	  	let cont = document.querySelector('.wrap.yellow');
	  	this.containerHgt = cont.getBoundingClientRect().height;

	  	this.appService.loadArticles(this.routineCatsLink).subscribe(
	  		res => {
	  			if(res.success)
	  				self.routineCats = res.cats;
	  		},
	  		err => {
	  			console.log(err);
	  			alert('Some error occurred loading routine categories for filters!');
	  		}
	  	);
	  	// Load workouts initially
	  	this.loadMoreWorkouts('', this.pagesLoaded+1, this.displayCount);	// Load 25 workouts

	  	// Bind function on scroll for infinite lloading of workouts
	  	window.addEventListener('scroll', this.loadWorkoutsScrollMethod);
	}

	ngOnDestroy(){
		console.log('workouts comp destroyed');
		window.removeEventListener('scroll', this.loadWorkoutsScrollMethod);
	}

	filterWorkouts(){
		let self = this;
		let inps = document.querySelectorAll('.filters input') as HTMLCollectionOf<HTMLInputElement>;
		console.clear();
		let ob = {};
		let filtersSelected = false;
		for(var i = 0; i < inps.length; i++) {
			let nm = inps[i].getAttribute('name');
			ob[nm] = inps[i].checked ? 1 : 0;
			filtersSelected = true;
		}
		if(filtersSelected) {	// if any filter is selected
			self.dt.serializedData = [];
			self.pagesLoaded = 0;
			self.workoutsLoaded = 0;
			self.allWorkoutsLoaded = false;
			self.workoutsFiltered = true;
			self.workouts = [];			// Empty the existing data
	  		self.isLoading = true;		// Show Loader
	  		self.showFilters = false;	// Close filters
			self.dt.serializedData.push(ob);	// all inputs data at once to keep just one object in serializedData
			console.log(self.dt);
			this.appService.postCall(this.appService.siteBaseUrl+'/exercise_filter_json.php', self.dt/*, true*/).subscribe(
				res => {
					console.log(res);
					if(res.status){
						self.loadError = '';
			  			self.loadErrorMsg = '';
						this.pagesLoaded++;	// Increment PageNumber
						let newWorkouts = [];
						for (var i in res.results) {
							self.workouts.push(res.results[i]);
		  					self.workoutsLoaded++;
						}
			  			console.log(self.workouts);
			  			if(res.total_workouts == self.workoutsLoaded)
			  				self.allWorkoutsLoaded = true;
			  			setTimeout(function(){
			  				let cont = document.querySelector('.wrap.yellow');
			  				self.containerHgt = cont.getBoundingClientRect().height;	// Update container height
			  			},200);
						self.isLoading = false;	// loading finsihed
					} else {
						if(res.status == false){
							self.loadError = true;
							self.loadErrorMsg = res.message_code;
							self.isLoading = false;	// loading finsihed
						}
					}
				},
				err => {
					console.log(err);
					self.zone.run(() => {
						self.loadError = true;
						self.loadErrorMsg = 'Something went wrong!';
						self.isLoading = false;	// loading finsihed
					});
				}
			);
		}else{
			alert('No filter selected');
		}
	}

}
