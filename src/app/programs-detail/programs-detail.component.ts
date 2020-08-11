import { Component, OnInit } from '@angular/core';
import {DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {AppServicesService} from '../app-services.service';

@Component({
	selector: 'app-programs-detail',
	templateUrl: './programs-detail.component.html',
	styleUrls: ['../../assets/styles/css.css']
})
export class ProgramsDetailComponent implements OnInit {
	public data: any;
	public dataAccordionOpen: Array<boolean> = [];
	public nullAnchor: SafeUrl;
	constructor(private appService: AppServicesService, private sanitizer: DomSanitizer, router: Router) {
	  	if(!appService.checkLogin())
	  		router.navigate(['Login']);
		this.nullAnchor = sanitizer.bypassSecurityTrustUrl('javascript:void(0);');
		// appService.postCall('','');
	  	this.data = [
	  	{
	  		heading: 'Warm-ups',
	  		day: 'Day One',
	  		workoutData:{
		  		head: {exercise: 'Excercise', sets: 'Sets', reps: 'Reps', video: 'Video'},
		  		wdata: [
		  			{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor}
			  	]
		  	}
		},{
	  		heading: 'Stretching',
	  		day: 'Day One',
	  		workoutData:{
		  		head: {exercise: 'Excercise', sets: 'Sets', reps: 'Reps', video: 'Video'},
		  		wdata: [
		  			{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor}
			  	]
		  	}
		},{
	  		heading: 'Strength',
	  		day: 'Day One',
	  		workoutData:{
		  		head: {exercise: 'Excercise', sets: 'Sets', reps: 'Reps', video: 'Video'},
		  		wdata: [
		  			{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor}
			  	]
		  	}
		},{
	  		heading: 'The Big 3',
	  		day: 'Day One',
	  		workoutData:{
		  		head: {exercise: 'Excercise', sets: 'Sets', reps: 'Reps', video: 'Video'},
		  		wdata: [
		  			{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor}
			  	]
		  	}
		},{
	  		heading: 'Strong',
	  		day: 'Day One',
	  		workoutData:{
		  		head: {exercise: 'Excercise', sets: 'Sets', reps: 'Reps', video: 'Video'},
		  		wdata: [
		  			{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor}
			  	]
		  	}
		},{
	  		heading: 'Condition',
	  		day: 'Day One',
	  		workoutData:{
		  		head: {exercise: 'Excercise', sets: 'Sets', reps: 'Reps', video: 'Video'},
		  		wdata: [
		  			{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor}
			  	]
		  	}
		},{
	  		heading: 'Cool Down',
	  		day: 'Day One',
	  		workoutData:{
		  		head: {exercise: 'Excercise', sets: 'Sets', reps: 'Reps', video: 'Video'},
		  		wdata: [
		  			{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-10', video: this.nullAnchor},
			  		{exercise: 'Barbell Back Squat', sets: '3', reps: '5-11', video: this.nullAnchor}
			  	]
		  	}
		}
		];
		/*this.commentspart = this.comments.filter(element => {
	       return element.postId == id;
	    });*/
		this.data.forEach(index => {
			this.dataAccordionOpen.push(false);
		});
	}

	ngOnInit() {
	}
  	accordion(index){
	  	if(this.dataAccordionOpen[index])
	  		this.dataAccordionOpen[index] = !this.dataAccordionOpen[index];
	  	else{
			for(let i in this.dataAccordionOpen){
				i == index ? this.dataAccordionOpen[i] = true : this.dataAccordionOpen[i] = false;
			}
	  	}
  	}
}