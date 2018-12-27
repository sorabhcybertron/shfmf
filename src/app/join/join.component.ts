import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AppServicesService} from '../app-services.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['../../assets/styles/css.css', './join.component.css']
})
export class JoinComponent implements OnInit {
  public login: boolean;
  public signingup: boolean = false;
  public form: any = {
    frmSubmitRegisterApp: true,
    email: '',
    user: '',
    pass: '',
    first_name: '',
    last_name: ''
  };
  constructor(public router: Router, public appService: AppServicesService){
    this.login = this.appService.checkLogin();
    if(this.login){
      this.router.navigate(['/Dashboard']);
    }
  }
  ngOnInit(){
  }
  ngDoCheck() {
    this.login = this.appService.checkLogin();
  }
  RegisterUser() {
    let url = 'http://muscularstrength.com/join_new_app_json.php';
    let self = this;
    if(!self.signingup && this.form.frmSubmitRegisterApp && this.form.user != '' && this.form.email != '' && this.form.pass != '' && this.form.first_name != '' && this.form.last_name != '') {
      self.signingup = true;
      this.appService.postCall(url, this.form).subscribe(
        res => {
          console.log(res);
          if(res.success){  // Signup Success, login user
            self.appService.loginUser(self.form.user, self.form.pass).subscribe(
             data => {
                if(data.Status === "Active") {  //  Success
                  window.localStorage.setItem('userInfo', JSON.stringify(data));
                  self.appService.setLogin(true);
                  self.router.navigate(['/Dashboard']);
                } else {                        // Failed
                  window.localStorage.setItem('userInfo', '');
                  self.appService.setLogin(false);
                }
                self.signingup = false;
              },
              err => {
                console.log(err);
                alert('Singup Successful but something went wrong while logging you in! You can try logging in now...');
                self.router.navigate(['/Login']);
                self.signingup = false;
              }
            );
          } else {
            let errMsg = ""
            res.errs.forEach(err => {
              errMsg += err;
            });
            alert(errMsg);
            self.signingup = false;
          }
        },
        err => {
          alert('Some error occurred!');
          console.log(err);
          self.signingup = false;
        }
      );
    } else
      alert('All input fields are required!');
  }
 }