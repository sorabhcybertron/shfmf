import { Component, OnInit } from '@angular/core';
import { AppServicesService } from '../app-services.service';
import { SafeHtmlPipe } from '../recipe-details/recipe-details.component';

declare var cordova;

@Component({
	selector: 'app-my-account',
	templateUrl: './my-account.component.html',
	styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent implements OnInit {
	public info: any;
	public loading: boolean = true;
	public error: boolean = false;
	public myID: any = this.appService.getUserInfo('User Id');

	/* For updating Email */
	public emailFormVisible: boolean = false;	// update email overlay
	public updatingEmail: boolean = false;	// update email loading
	public emailCallErrMsg: any = '';
	public newEmail: any = {
		mid: this.myID,
		action: 'changeAccountEmail',
		email1: '',
		email2: ''
	};	// new emails
	public emailErrs: any = {
		email1: false,
		email2: false
	};	// new emails

	/* Password Update Code */
	public passFormVisible: boolean = false;	// update password overlay
	public updatingPass: boolean = false;	// update pass loading
	public passCallErrMsg: any = '';
	public passMatchErr: boolean = false;
	public passwordType: any = 'password';
	public newPass: any = {
		mid: this.myID,
		action: 'changePassword',
		currentPassword: '',
		newPassword1: '',
		newPassword2: ''
	};
	public passErrs: any = {
		currentPassword: false,
		newPassword1: false,
		newPassword2: false
	}

	/* Profile Info Update */
	public updatingProfile: boolean = false;
	public profFormVisible: boolean = false;
	public profCallErrMsg: any = '';
	public profInfo: any = {
		mid: this.myID,
		action: 'updateProfileInfo',
		updateFirstName: '',
		updateAddress: '',
		updateZip: '',
		updateLastName: '',
		updateCity: '',
		updateState: '',
		updateCountry: ''
	};
	

	constructor(public appService: AppServicesService){}
	ngOnInit() {
		let self = this;
		this.appService.postCall('http://muscularstrength.com/get_account_info_new_app_json.php', {mid: this.appService.getUserInfo('User Id'), action: 'getProfData'}).subscribe(
			res => {
				console.log('myaccount res');
				console.log(res);
				if(res.success ==  true){
					self.info = res.data;
					self.error = false;
					self.profInfo.updateCountry = res.data.country;
				} else
					alert(res.msg ? res.msg : 'Something went wrong!');
				self.loading = false;
			},
			err => {
				self.loading = false;
				self.error = true;
				console.log('err');
				console.log(err);
			}
		);
	}

	updateEmail() {
		let self = this;
		this.emailCallErrMsg = '';
		if(!this.updatingEmail) {
			console.log(this.newEmail);
			this.emailErrs.email1 = !this.validateEmail(this.newEmail.email1);
			this.emailErrs.email2 = !this.validateEmail(this.newEmail.email2);
			if(!this.emailErrs.email1 && !this.emailErrs.email2){
				self.updatingEmail = true;
				this.appService.postCall('http://muscularstrength.com/get_account_info_new_app_json.php', this.newEmail).subscribe(
						res => {
							console.log(res);
							if(res.success ==  true){
								self.info.email = self.newEmail.email1;
								self.newEmail.email1 = this.newEmail.email2 = '';
								self.emailFormVisible = false;
							} else {
								self.emailCallErrMsg = res.msg ? res.msg : 'Something went wrong';
							}
							self.updatingEmail = false;
						},
						err => {
							console.log(err);
							self.updatingEmail = false;
							alert('Some error occurred!');
						}
					);
			}
		}
	}
	validateEmail(mail) {
		if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
			return true;
		return false;
	}
	validateMe(email) {
		this.emailCallErrMsg != '' ? this.emailCallErrMsg = '' : '';
		console.log(email);
		if(email == 'email2')
			this.emailErrs[email] = (this.validateEmail(this.newEmail[email]) && this.newEmail.email1 == this.newEmail.email2) ? false : true;
		else
			this.emailErrs[email] = !this.validateEmail(this.newEmail[email]);
	}	

	updatePass() {
		let self = this;
		let errs = 0;
		this.passCallErrMsg = '';
		// Display Errors if any
		this.passErrs.currentPassword = this.passErrs.newPassword1 = this.passErrs.newPassword2 = false;
		if(this.newPass.currentPassword == ''){
			this.passErrs.currentPassword = true;
			errs = 1;
		}
		if(this.newPass.newPassword1 == ''){
			this.passErrs.newPassword1 = true;
			errs = 1;
		}
		if(this.newPass.newPassword2 == ''){
			this.passErrs.newPassword2 = true;
			errs = 1;
		}
		// UPdate pass if no errors and if no progress for the same is in progress
		if(!errs && !this.updatingPass) {
			console.log(this.newPass);
			if(this.newPass.newPassword1 == this.newPass.newPassword2) {
				self.updatingPass = true;
				this.appService.simplePostCall('http://muscularstrength.com/get_account_info_new_app_json.php', this.newPass).subscribe(
						res => {
							console.log(res);
							if(res.success == true) {
								self.newPass.newPassword1 = self.newPass.newPassword2 = self.newPass.currentPassword = '';
								self.passFormVisible = false;
							} else
								self.passCallErrMsg = res.msg ? res.msg : 'Something went wrong';
							self.updatingPass = false;
						},
						err => {
							console.log(err);
							self.updatingPass = false;
							self.passCallErrMsg = 'Some error occurred!';
						}
					);
			}
		}
	}
	validatePass(field) {
		this.passCallErrMsg = '';
		if(field == 'newPassword2')
			this.passErrs[field] = (this.newPass.newPassword1 == this.newPass.newPassword2 && this.newPass[field] != '') ? false : true;
		else
			this.passErrs[field] = this.newPass[field] == '' ? true : false;
		if(field == 'newPassword1')
			if(this.newPass.newPassword2 != '')
				this.passErrs.newPassword2 = this.newPass.newPassword1 == this.newPass.newPassword2 ? false : true;
	}
	showPasswords() {
		this.passwordType = this.passwordType == 'text' ? 'password' : 'text';
	}

	updateProfile() {
		let self = this;
		this.profCallErrMsg = '';
		if(!this.updatingProfile) {
			console.log(this.profInfo);
			self.updatingProfile = true;
			this.appService.postCall('http://muscularstrength.com/get_account_info_new_app_json.php', this.profInfo).subscribe(
					res => {
						console.log(res);
						if(res.success ==  true) {
							self.profFormVisible = false;
							// Update local data to update view
							self.info.first_name = self.profInfo.updateFirstName;
							self.info.last_name = self.profInfo.updateLastName;
							self.info.address = self.profInfo.updateAddress;
							self.info.zip = self.profInfo.updateZip;
							self.info.city = self.profInfo.updateCity;
							self.info.state = self.profInfo.updateState;
							self.info.country = self.profInfo.updateCountry;
						} else
							self.profCallErrMsg = res.msg ? res.msg : 'Something went wrong';
						self.updatingProfile = false;
					},
					err => {
						console.log(err);
						self.updatingProfile = false;
						self.profCallErrMsg = 'Some error occurred!';
					}
				);
		}
	}
	loadProfData(){
		this.profInfo.updateFirstName = this.info.first_name;
		this.profInfo.updateLastName = this.info.last_name;
		this.profInfo.updateAddress = this.info.address;
		this.profInfo.updateZip = this.info.zip;
		this.profInfo.updateCity = this.info.city;
		this.profInfo.updateState = this.info.state;
		this.profInfo.updateCountry = this.info.country;
	}
}