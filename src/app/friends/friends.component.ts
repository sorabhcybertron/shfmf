import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppServicesService } from '../app-services.service';
// import { fadeInAnimation } from '../animation/fade-in-transition';

@Component({
	selector: 'app-friends',
	templateUrl: './friends.component.html',
	styleUrls: ['../../assets/styles/css.css', '../my-profile/my-profile.component.css', './friends.component.css']/*,
   	animations: [fadeInAnimation.fadeInAnimate],
   	host: { '[@fadeInAnimation]': '' }*/
})
export class FriendsComponent implements OnInit {
	public friends: any = {
		FRIENDS: [],
		REQUESTS: [],
		PENDINGS: [],
		BLOCKS: []
	};
	public loaded: boolean = false;
	public error: boolean = false;
	public activeTab: any = 'FRIENDS';
	public unfriendLoader: boolean = false;
	public cancelReqLoader: boolean = false;
	public unblockUserLoader: boolean = false;
	public acceptDenyLoader: boolean = false;
	public myID: any = this.appService.getUserInfo('User Id');
	public unFriendAction: any = 'REMOVE_FRIEND';	// Unfriend
	public cancelRequestAction: any = 'REMOVE_PENDING';		// delete request (when status is pending yet)
	public unblockAction: any = 'REMOVE_FROM_LIST';
	public loadActions: any = ['FRIENDS', 'REQUESTS', 'PENDINGS', 'BLOCKS'];	// all friend actions
	public loadings: any = {
		FRIENDS: true,
		REQUESTS: true,
		PENDINGS: true,
		BLOCKS: true
	};
	public errors: any = {
		FRIENDS: false,
		REQUESTS: false,
		PENDINGS: false,
		BLOCKS: false
	};
	public currentlyShowing = this.friends.FRIENDS;
	public currentLoading = this.loadings.FRIENDS;

	constructor(public appService: AppServicesService) { }

	ngOnInit() {
		let self = this;
		/*this.appService.loadArticles('http://muscularstrength.com/friends_json.php?userid='+this.appService.getUserInfo('User Id')).subscribe(
			res => {
				console.log('res', res);
				if(res.result == "SUCCESS"){
					self.friends = res.data.friend;
					console.log('res.data');
					console.log(self.friends);
				} else
					self.error = true;
				self.loaded = true;
			},
			err => {
				self.loaded = true;
				self.error = true;
				console.log(err);
			}
		);*/
		console.clear();
		console.log('friends inittt');
		for(var i = 0; i < self.loadActions.length; i++){
			let whichEl = self.loadActions[i];
			self.appService.postCall('http://muscularstrength.com/friends_listing_new_app_json.php', {mid: self.myID, action: 'SEARCH_FRIEND', filter: self.loadActions[i]}).subscribe(
				res => {
					// console.log('res', res);
					console.log('whichEl', whichEl);
					if(res.result == "SUCCESS") {
						if(self.friends.hasOwnProperty(res.filter)) {
							self.friends[res.filter] = res.friends;
							if(self.loadings.hasOwnProperty(res.filter))
								self.loadings[res.filter] = false;
							self.currentlyShowing 	= self.friends[self.activeTab];
							self.currentLoading 	= self.loadings[self.activeTab];
						}
						console.log('self.friends[res.filter]');
						console.log(self.friends[res.filter]);
						console.log('res.friends');
						console.log(self.friends);
					} else
						self.error = true;
					self.loaded = true;
				},
				err => {
					self.loaded = true;
					self.error = true;
					console.log(err);
				}
			);
		}
	}
	changeViewTo(to){
		this.currentlyShowing = this.friends[to];
		this.currentLoading = this.loadings[to];
		// console.clear();
		console.log(this.currentlyShowing);
		for(var i in this.currentlyShowing)
			console.log(i, this.currentlyShowing[i]);
	}
	ngOnDestroy(){
		console.log('friends Destroyed');
	}
	unfriendUser(tab, unfriendID, letter, index) {
		let self = this;
		/*console.log('tab', tab);
		console.log('letter', letter);
		console.log('unfriendID', unfriendID);
		console.log('index', index);
		console.log(self.friends);*/
		if(!this.unfriendLoader){
			if(self.confirmUnfriendNBlock('unfriend')) {
				self.unfriendLoader = true;
				self.appService.loadArticles('http://muscularstrength.com/friends_action_json.php?action='+self.unFriendAction+'&user_id='+self.myID+'&actionUserID='+unfriendID).subscribe(
						res => {
							console.log(res);
							if(res.result == 'SUCCESS') {
								// Remove member from the List (locally - quick)
								self.removeMemberFromLocalList(tab, letter, index);
								console.log('self.friends');
								console.log(self.friends);
							} else
								alert('Some error occurred!')
							self.unfriendLoader = false;
						},
						err => {
							console.log(err);
							self.unfriendLoader = false;
							alert('Some error occurred!');
						}
					);
			}
		}
		/*if(!this.unfriendLoader){
			if(self.confirmUnfriendNBlock('unfriend')) {
				self.unfriendLoader = true;
				self.appService.loadArticles('http://muscularstrength.com/friends_action_json.php?action='+self.unFriendAction+'&user_id='+self.myID+'&actionUserID='+unfriendID).subscribe(
						res => {
							console.log(res);
							if(res.result == 'SUCCESS') {
								let newList = [];
								for(var i = 0; i < self.friends.length; i++)
									if(i != index)
										newList.push(self.friends[i]);
								self.friends = newList;
								newList = null;
								console.log('self.friends');
								console.log(self.friends);
							} else
								alert('Some error occurred!')
							self.unfriendLoader = false;
						},
						err => {
							console.log(err);
							self.unfriendLoader = false;
							alert('Some error occurred!');
						}
					);
			}
		}*/
	}
	cancelRequest(tab, mIDToCancelReq, letter, index){
		console.log('mIDToCancelReq', mIDToCancelReq);
		let self = this;
		if(!this.cancelReqLoader){
			if(self.confirmUnfriendNBlock('cancel friend request sent to')) {
				self.cancelReqLoader = true;
				self.appService.loadArticles('http://muscularstrength.com/friends_action_json.php?action='+this.cancelRequestAction+'&user_id='+this.myID+'&actionUserID='+mIDToCancelReq).subscribe(
						res => {
							console.log(res);
							if(res.result == 'SUCCESS') {
								// Remove member from the List (locally - quick)
								self.removeMemberFromLocalList(tab, letter, index);
							}
							self.cancelReqLoader = false;
						},
						err => {
							console.log(err);
							self.cancelReqLoader = false;
							alert('Some error occurred!');
						}
					);
			}
		}
	}
	unblockUser(tab, mIDToUnblock, letter, index){
		let self = this;
		if(!this.unblockUserLoader) {
			self.unblockUserLoader = true;
			self.appService.loadArticles('http://muscularstrength.com/friends_action_json.php?action='+this.unblockAction+'&user_id='+this.myID+'&removeID='+mIDToUnblock+'&filter=BLOCKS').subscribe(
					res => {
						console.log(res);
						if(res.result == 'SUCCESS') {
							// Remove member from the List (locally - quick)
							self.removeMemberFromLocalList(tab, letter, index);
						}
						self.unblockUserLoader = false;
					},
					err => {
						console.log(err);
						self.unblockUserLoader = false;
						alert('Some error occurred!');
					}
				);
		}
	}
	acceptDeny(tab, mIDTOAccDeny, letter, index, whatToDo) {
		let self = this;
		if(!this.acceptDenyLoader) {
			let proceed = true;
			let confirm = 0;
			if(whatToDo == 'DENY')
				confirm = 1;
			if(confirm){
				proceed = self.confirmUnfriendNBlock('deny friend request sent by');
			}
			if(proceed) {
				self.acceptDenyLoader = true;
				self.appService.loadArticles('http://muscularstrength.com/friends_process_json.php?action='+whatToDo+'&user_id='+self.myID+'&actionUserID='+mIDTOAccDeny).subscribe(
						res => {
							console.log(res);
							if(res.result == 'SUCCESS') {
								self.removeMemberFromLocalList(tab, letter, index);
								if(whatToDo == 'ACCEPT'){	// Remove member from the List (locally - quick)
									self.removeMemberFromLocalList(tab, letter, index);
									self.appService.postCall('http://muscularstrength.com/friends_listing_new_app_json.php', {mid: self.myID, action: 'SEARCH_FRIEND', filter: 'FRIENDS'}).subscribe(
										newlist => {
											// console.log('newlist', newlist);
											if(newlist.result == "SUCCESS") {
												if(self.friends.hasOwnProperty(newlist.filter)) {
													self.friends[newlist.filter] = newlist.friends;
													if(self.loadings.hasOwnProperty(newlist.filter))
														self.loadings[newlist.filter] = false;
													self.currentlyShowing 	= self.friends[self.activeTab];
													self.currentLoading 	= self.loadings[self.activeTab];
												}
												console.log('New Friends List------');
												console.log(self.friends[newlist.filter]);
												console.log('newlist.friends');
												console.log(self.friends);
											}/* else
												self.error = true;
											self.loaded = true;*/
										},
										err => {
											self.loaded = true;
											self.error = true;
											console.log(err);
										}
									);
								}
							}
							self.acceptDenyLoader = false;
						},
						err => {
							console.log(err);
							self.acceptDenyLoader = false;
							alert('Some error occurred!');
						}
					);
			}
		}
	}
	removeMemberFromLocalList(tab, letter, index){	// Removes a member from list
		let self = this;
		let newList = [];
		for(var i = 0; i < self.friends[tab].length; i++)
			if(self.friends[tab][i].l == letter) {
				for(var j = 0; j < self.friends[tab][i].d.length; j++){
					if(j != index)
						newList.push(self.friends[tab][i].d[j]);
				}
				self.friends[tab][i].d = newList;
				newList = null;
				return false;
			}
	}
	confirmUnfriendNBlock(msg){
		let self = this;
		var a = confirm('Are you sure you want to '+msg+' this user?');
		console.log(a);
		return a;
	}

}
