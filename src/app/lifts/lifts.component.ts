import { Component, OnInit, NgZone } from '@angular/core';
import { AppServicesService } from '../app-services.service';

@Component({
	selector: 'app-lifts',
	templateUrl: './lifts.component.html',
	styleUrls: ['../../assets/styles/css.css', './lifts.component.css']
})

export class LiftsComponent implements OnInit {
	public loading: boolean = true;
	public lifts: any = [];
	public error: boolean = false;
	public popupVisible: boolean = false;
	public errorMsg: any;
	public currentYear: number = new Date().getFullYear();
	public Years: any = [];
	public Months: any = [];
	public Dates: any = [];
	public Units: any = ['lbs', 'in', 'kg', 'st'];
	/* For form data in Popup */
	public liftWeight:any;
	public liftMonth:any;
	public liftDate:any;
	public liftYear:any;
	public liftUnit:any;
	public liftID:any;
	public liftType:any;
	public liftYTID:any;
	/* Saving lift data */
	public savingLift:any = false;
	public saveCallMsg:any = '';
	public notify:any = false;
	public LiftInd:any;
	public saveSuccess:any;

	constructor(public appService: AppServicesService, public zone: NgZone) {
		let baseYear = 1926;
		let total_years = this.currentYear - baseYear;
		for(var i=0; i<=total_years; i++){
			this.Years.push(baseYear);
			baseYear++;
		}
		for(var i=1; i<=12; i++)
			this.Months.push(i);
		for(var i=1; i<=31; i++)
			this.Dates.push(i);
	}

	showHidePopup(ind?){
		if(!this.savingLift){	// prevent popup interactions when saving any lift's data
			this.popupVisible = !this.popupVisible;			// Show Hide Popup
			let selData = this.lifts[ind];
			this.liftID = selData.id;
			this.liftType = selData.lift_type;
			this.liftWeight = selData.lift_weight;	// Weight
			this.liftUnit = selData.lift_weight_unit == 'lb' ? 'lbs' : selData.lift_weight_unit;
			let date = new Date(selData.lift_date);
			this.liftMonth = date.getMonth() + 1;			// Month
			this.liftDate = date.getDate();					// Date
			this.liftYear = date.getFullYear();				// Year
			this.liftYTID = selData.youtube_id;
			this.LiftInd = ind;
		}
	}

	UpdateLift(){
		this.savingLift = true;
		let self = this;
		let url = 'http://muscularstrength.com/user_lifts.php?';
		let data = 'user_id=' + this.appService.getUserInfo('User Id') +
			'&lift_id=' + this.liftID +
			'&lift_type=' + this.liftType +
			'&lift_date=' + this.liftMonth+'/' + this.liftDate + '/' + this.liftYear +
			'&lift_weight=' + (this.liftWeight == '' ? 0 : this.liftWeight) +
			'&lift_weight_unit=' + this.liftUnit +
			'&youtube_id=' + this.liftYTID;
		// console.log(url+data);
		this.appService.loadArticles(url+data).subscribe(
			res => {
				console.log(res);
				this.savingLift = false;
				if(res.status){
					this.lifts[this.LiftInd].lift_date = this.liftMonth+'/' + this.liftDate + '/' + this.liftYear;
					this.lifts[this.LiftInd].lift_weight = this.liftWeight;
					this.lifts[this.LiftInd].lift_weight_unit = this.liftUnit;
					this.lifts[this.LiftInd].youtube_id = this.liftYTID;
					this.successNotification();
				}else
					this.FailureNotification();
			},
			err => {
				this.savingLift = false;
				console.log(err);
				this.FailureNotification();
			}
		);
	}

	successNotification(){
		/* Notify User */
		let self = this;
		self.saveCallMsg = 'Data Updated!';
		self.saveSuccess = true;
		self.notify = true;
		self.savingLift = false;
		setTimeout(function(){
			self.notify = false;
		}, 1500);
	}
	FailureNotification(){
		let self = this;
		self.saveCallMsg = 'Some error occurred!';
		self.saveSuccess = false;
		self.notify = true;
		setTimeout(function(){
			self.notify = false;
		}, 1500);
	}
	ngOnInit() {
		this.appService.loadArticles('http://muscularstrength.com/user_lifts.php?user_id='+this.appService.getUserInfo('User Id')).subscribe(
			res => {
				this.zone.run(() => {
					console.log('lifts');
					console.log(res);
					if(res.status){
						if(res.total_result > 0)
							this.lifts = res.results;
						else{
							this.error = true;
							this.errorMsg = res.message;
						}
					}else{
						this.error = true;
						this.errorMsg = res.message;
					}
					this.loading = false;
				});
			}, err => {
				this.zone.run(() => {
					this.error = true;
					this.loading = false;
					this.errorMsg = 'Some error occured.';
				});
			}
		);
	}
}