import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppServicesService } from '../app-services.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-upgrade-membership',
    templateUrl: './upgrade-membership.component.html',
    styleUrls: ['../../assets/styles/css.css', './upgrade-membership.component.css']
})

export class UpgradeMembershipComponent implements OnInit {
    public sub: any;
    public errorToShow = "";
    public showErrors  :  boolean = false;
    public successToShow = "";
    public success :boolean =  false;
    isLoaded: boolean = true;
    memberships: any = [];
    public showGold: boolean = false;
    public updateMembershipLink: string = 'http://muscularstrength.com/membership_json.php';

    form: any = {
        action: 'CHANGE_MEMEBERSHIP',
        mid: this.appService.getUserInfo('User Id'),
        membershipChange: '',
        changeFirstName: '',
        changeLastName: '',
        chanceAddress: '',
        changeCity: '',
        changeZip: '',
        changeCC: '',
        changeExpire: '',
        changeCCV: '',
        changePromo:'',
    };

    constructor(public appService: AppServicesService,public router :Router, private route: ActivatedRoute) {}

    ngOnInit() {
        console.log('upgrade init');
        let scope = this;
        // Subscribe to route params
        this.sub = this.route.params.subscribe(params => {
            scope.showGold = (params['showGold'] && params['showGold'] == 'yes') ? true : false;
        });
        // get membership types
        this.appService.postCall('http://muscularstrength.com/membership_json.php', {mid: this.appService.getUserInfo('User Id'), action: 'GET_MEMEBERSHIPS'}).subscribe(
            res => {
                console.log('res');
                console.log(res);
                if(res.status)
                    for(var i in res.membership_list)
                        if(res.membership_list[i].name == 'Platinum' || (scope.showGold && res.membership_list[i].name == 'Gold'))
                            scope.memberships.push(res.membership_list[i]);
            },
            err => {
                console.log('err');
                console.log(err);
            }
        );
    }
    ngOnDestroy(){
        this.sub.unsubscribe();    // Clean sub to avoid memory leak
    }
    goback(){
        // window.history.back();
        this.router.navigate(['/MyAccount']);
    }
    infoSameAsPersonal(e){
        if(e.target.checked){
            this.form.changeFirstName = this.appService.getUserInfo('First Name');
            this.form.changeLastName = this.appService.getUserInfo('Last Name');
            this.form.chanceAddress = this.appService.getUserInfo('Address');
            this.form.changeCity = this.appService.getUserInfo('City');
            this.form.changeZip = this.appService.getUserInfo('Zip');
        }else{
            this.form.changeFirstName = '';
            this.form.changeLastName = '';
            this.form.chanceAddress = '';
            this.form.changeCity = '';
            this.form.changeZip = '';
        }
    }
    submitForm(){
          if(this.validate_form()){
              this.showErrors = false;
            let scope = this;
            console.clear();
            console.log(this.form);
            this.appService.postCall(this.updateMembershipLink, this.form).subscribe(
                res => {
                    console.log('Update Membership res');
                    console.log(res);
                    if(res.status){
                        this.success = true;
                        this.successToShow = res.message_code ? res.message_code : 'Updated Successfull';
                        let uInfo = JSON.parse(window.localStorage.getItem('userInfo'));
                        for (var i in scope.memberships){
                            if(scope.memberships[i].membershipID == scope.form.membershipChange) {
                                uInfo['account type'] = scope.memberships[i].name;
                                window.localStorage.setItem('userInfo', JSON.stringify(uInfo));
                                break;
                            }
                        }
                        // window.history.back();
                    }else{
                        if(res.message_code && res.message_code != ''){
                            this.errorToShow  = res.message_code; 
                            // alert(res.message_code);
                        }else{
                            this.errorToShow  = "Some error occurred! Try Again";
                        }
                    }
                },
                err => {
                    console.log(err);
                    this.errorToShow  = "Some error occurred!";
                }
            );
          }else{
              //Error 
          }
    }

    havevalue(id){
        if(this.showErrors){
            if(this.form[id].trim() == ""){ 
                return true;
            }else{
                if(id == 'changeZip' || id == 'changeCC' || id == 'changeCCV'){
                    if(this.validNumber(this.form[id])){ 
                        return false;
                    }else{ 
                        return true;
                    }
                }else if(id == 'changeExpire'){
                    if(this.validDate(this.form[id])){ 
                        return false;
                    }else{ 
                        return true;
                    }
                }else return false;
            }
        }else{ return false;}
    }

    validate_form(){
        this.showErrors = true;
        if(this.form.membershipChange.trim() !== '' && this.form.membershipChange.trim() == 20){
            this.errorToShow = '';
            this.form.changeFirstName = '';
            this.form.changeLastName = '';
            this.form.chanceAddress = '';
            this.form.changeCity = '';
            this.form.changeZip = '';
            this.form.changeCC = '';
            this.form.changeExpire = '';
            this.form.changeCCV = '';
            return true;
        }else{
            if( this.form.membershipChange.trim() == ""  
                || this.form.changeFirstName.trim() == ""  
                || this.form.changeLastName.trim() == ""  
                || this.form.chanceAddress.trim() == ""  
                || this.form.changeCity.trim() == ""  
                || this.form.changeZip.trim() == "" 
                || this.form.changeZip.trim() == ""  
                || this.form.changeCC.trim() == ""  
                || this.form.changeExpire.trim() == ""  
                || this.form.changeCCV.trim() == "")
            {
                this.errorToShow = "Oops! you have missed some fields.";
                return false;

            }else if(!this.validNumber(this.form.changeCC) || !this.validNumber(this.form.changeCCV)){
                this.errorToShow = "Card/CVC field must be number.";
                return false;
            }else if(!this.validDate(this.form.changeExpire)){
                this.errorToShow = "Expiry date is invalid.";
                return false;
            }else{
                this.errorToShow = '';
                return true;
            }
        }
    }

    validNumber(num){
        var ptrn = /^-?(0|[1-9]\d*)?$/;
        return ptrn.test(num);
    }
    validDate(num){
        var ptrn = /^(?:(0[1-9]|1[012])[\/.](19|20)[0-9]{2})$/;
        return ptrn.test(num);
    }
}