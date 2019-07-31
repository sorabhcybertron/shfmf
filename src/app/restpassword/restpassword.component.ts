import { Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AppServicesService} from '../app-services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import { PasswordValidation } from '../password-validation';
@Component({
  selector: 'app-restpassword',
  templateUrl: './restpassword.component.html',
  styleUrls: ['../../assets/styles/css.css','./restpassword.component.css']
})
export class RestpasswordComponent implements OnInit {

  public uname : string;
  nouser = false;
 // public showUnameError :string;
  public ResetForm: FormGroup;
  public submitted = false;
  constructor(public router: Router, private route: ActivatedRoute, public appService: AppServicesService, private formBuilder: FormBuilder) {
   console.log(this.route.params["uname"]); 
     console.log(this.route.snapshot.paramMap.get('uname'));
   this.uname = this.route.snapshot.paramMap.get('uname');
  }

  ngOnInit() {
  	this.ResetForm = this.formBuilder.group({
            pass1: ['',[Validators.required, Validators.minLength(3)]],
            pass2: ['',[Validators.required]],
            otp: ['',[Validators.required,Validators.minLength(3)]],
        },{validator: this.checkPasswords });
        // PasswordValidation.MatchPassword
  }
 get f() { return this.ResetForm.controls; }

 checkPasswords(group: FormGroup) { // here we have the 'passwords' group
  let pass = group.controls.pass1.value;
  let confirmPass = group.controls.pass2.value;

  return pass === confirmPass ? null : { notSame: true }     
}

 onSubmit(){
        this.nouser = false;
  	   this.submitted = true;
        if (!this.ResetForm.invalid){
        	const pas1=this.ResetForm.get('pass1').value;
          const otp=this.ResetForm.get('otp').value;
       //  this.appService.resetpassword(this.uname,pas1,otp).subscribe(data => {if(data.status){
        let data = {frm_set_password :1, frm_email : this.uname, new_password: pas1, otp:otp};
        this.appService.postCall('http://muscularstrength.com/app_forget_password.php', data).subscribe(data => {if(data.status){
         this.router.navigate(['/Login']);
         }else{
          this.nouser = true;
         }
       });
        }

        return;
     }

}
