import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {AppServicesService} from '../app-services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['../../assets/styles/css.css','./forgetpassword.component.css']
})
export class ForgetpasswordComponent implements OnInit {
 // public forgetstate : any;
  public uname : string;
  public nouser = false;
 // public showUnameError :string;
  public ForgetForm: FormGroup;
  public submitted = false;
  constructor(public router: Router, public appService: AppServicesService, private formBuilder: FormBuilder) { 
 // this.forgetstate = '';
  }

  ngOnInit() {
  	this.ForgetForm = this.formBuilder.group({
            uname: ['',[Validators.required, Validators.minLength(3)]],
            
        });
  }
 get f() { return this.ForgetForm.controls; }

 onSubmit(){
        this.nouser = false;
  	   this.submitted = true;
        if (!this.ForgetForm.invalid) {
            const uname=this.ForgetForm.get('uname').value;
         this.appService.forgetpassword(uname).subscribe(data => {if(data.status){
         this.router.navigate(['/restpassword',uname]);
         }
         else{
          this.nouser = true;
         }
       });
        }
     }
}
