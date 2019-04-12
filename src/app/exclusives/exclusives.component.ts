import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AppServicesService} from '../app-services.service';

@Component({
  selector: 'app-exclusives',
  templateUrl: './exclusives.component.html',
  styleUrls: ['../../assets/styles/css.css']
})
export class ExclusivesComponent implements OnInit {

  constructor(router: Router, appService: AppServicesService) {
  	if(!appService.checkLogin())
  		router.navigate(['Login']);
  }
  
  ngOnInit() {
  }

}
