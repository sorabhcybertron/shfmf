import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppServicesService } from '../app-services.service';

@Component({
  selector: 'app-new-content-badge',
  templateUrl: './new-content-badge.component.html',
  styleUrls: ['./new-content-badge.component.css']
})
export class NewContentBadgeComponent {
	@Input() type: string = '';
	@Input() item_id: number = 0;
	@Input() colorName : string = 'blue';

  constructor(public appService: AppServicesService) { }

getClass(){
	return this.colorName;
}
}
