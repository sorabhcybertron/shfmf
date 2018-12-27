import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppServicesService } from '../app-services.service';
import { SafeHtmlPipe } from '../recipe-details/recipe-details.component';
import { Router, ActivatedRoute } from '@angular/router';

declare var cordova;

@Component({
  selector: 'app-another-users-profile',
  templateUrl: './another-users-profile.component.html',
  styleUrls: ['../my-profile/my-profile.component.css', './another-users-profile.component.css']
})
export class AnotherUsersProfileComponent implements OnInit {
	// public name: any;
	public activeTab: any = 'Board';
	public data: any;
	public sub: any;
	public loaded: boolean = false;
	public error: boolean = false;
	public showNewPostPopOver: boolean = false;
	public editorContent: string = '';
	public inappEventAttached: boolean = false;
	public userProfImage: any = '';
	public postloading: boolean = false;
	public addFriendLoader: boolean = false;
	public blockUserLoader: boolean = false;
	public sendFriendRequestAction: any = 'SEND_REQUEST_FRIEND';	// send request
	public cancelRequestAction: any = 'REMOVE_PENDING';		// delete request (when status is pending yet)
	public unFriendAction: any = 'REMOVE_FRIEND';	// Unfriend
	public blockAction: any = 'BLOCK_USER';
	public unblockAction: any = 'REMOVE_FROM_LIST';
	public viewUserID: any = '';
	public options = {
	    heightMin: 320,
	    toolbarInline: false,
	    charCounterCount: false,
	    toolbarButtons: ['insertImage', 'insertVideo', 'emoticons'],
	    toolbarButtonsMD: ['insertImage', 'insertVideo', 'emoticons'],
	    toolbarButtonsSM: ['insertImage', 'insertVideo', 'emoticons'],
	    toolbarButtonsXS: ['insertImage', 'insertVideo', 'emoticons'],
	    placeholderText: "Your message here...",
	    wordPasteModal: false,
	    imageDefaultAlign: 'left',
	    imageDefaultDisplay: 'block',
	    imageEditButtons: ['imageReplace', 'imageRemove'],
	    imageAllowedTypes: ['jpeg', 'jpg', 'png'],
	    imageTextNear: false,
	    tooltips: false,
	    emoticonsUseImage: false,
	    toolbarBottom: false,
	    videoInsertButtons: ['videoBack', '|', 'videoByURL', 'videoEmbed'],
	    imageInsertButtons: ['imageBack', '|', 'imageUpload', 'imageByURL'],
	    imageUploadURL: "http://muscularstrength.com/upload_image_new_app.php",
	    imageUploadParams: { id: "my_editor" },
	    imageMaxSize: 1024 * 1024 * 10,
	    videoDefaultAlign: "left",
	    toolbarSticky: false,
	    videoDefaultDisplay: "block",
	    videoEditButtons: ["videoResize", "videoRemove"],
	    pluginsEnabled: ['draggable', 'emoticons', 'image', 'link', 'video'],
	    htmlRemoveTags: ['script', 'style', 'base', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'input', 'button']
	};

	constructor(public appService: AppServicesService, private route: ActivatedRoute) { }

	ngOnInit() {
		console.log('another user init');
		let scope = this;
	    // Subscribe to route params
		this.sub = this.route.params.subscribe(params => {
			scope.viewUserID = params['id'];
			// scope.name = this.appService.getUserInfo('First Name') + ' ' + scope.appService.getUserInfo('Last Name');
			scope.appService.postCall('http://muscularstrength.com/profile_viewer_json.php', {action: 'VIEW', mid: scope.appService.getUserInfo('User Id'), viewID: scope.viewUserID}).subscribe(
				res => {
					console.log('My Account res:');
					console.log(res);
					if(res.status){
						scope.data = res.results;
						if(res.results.prof_image.indexOf('http://muscularstrength.com/') == -1)
							res.results.prof_image = 'http://muscularstrength.com/'+res.results.prof_image;
						scope.userProfImage = res.results.prof_image;
						scope.error = false;
						scope.loaded = true;
						setTimeout(function(){
							console.log('scope.activeTab: '+scope.activeTab);
							if(scope.activeTab == 'Board'){
								scope.openInAppBrowser();
								scope.inappEventAttached = true;
							}
						}, 200);
					}else{
						scope.loaded = true;
						scope.error = true;
					}
				},
				err => {
					scope.loaded = true;
					scope.error = true;
					alert('Some error occurred!');
					console.log(err);
				}
			);
		});
	}
	ngOnDestroy(){
		console.log('another user profile Destroyed');
	}

	checkInAppEventAttached(){
		// console.log(this.inappEventAttached);
		let scope = this;
		if(!this.inappEventAttached && this.activeTab == 'Board'){
			setTimeout(function(){
				if(scope.activeTab == 'Board'){
					console.log('ATTACHED---------');
					scope.openInAppBrowser();
					scope.inappEventAttached = true;
				}
			}, 200);
		}
	}

	postComment(){		// POST NEW COMMENT
		console.log(this.editorContent);
		let scope = this;
		let usersIDsArray = [];
		usersIDsArray.push(this.viewUserID);
		this.postloading = true;
		if(this.editorContent.replace(/ /g,'') != ''){	// comment not empty
			this.appService.postCall('http://muscularstrength.com/post_message_new_app_json.php', {action: 'MESSAGE_SEND', mid: this.appService.getUserInfo('User Id'), messageTextContent: this.editorContent, userIDArray: usersIDsArray}).subscribe(
				res => {
					console.log(res);
					if(res.success){		// Comment Posted successfully
						scope.editorContent = '';
						scope.showNewPostPopOver = false;
						console.log('comment posted.....');
					} else
						alert('Some error occurred!');
					scope.postloading = false;
				}, err => {
					alert('Some error occurred!');
					scope.postloading = false;
				});
		}
	}

	openInAppBrowser(){	// for Board links
		let board = document.getElementById('board');
		let ancs = board.getElementsByTagName('a');
		for(var i = 0; i< ancs.length; i++){
			ancs[i].addEventListener('click', function(e){
				console.log('clicked');
				let link = e.srcElement.getAttribute('href');
				console.log(link);
				if(link.trim() != '')
					cordova.InAppBrowser.open(link, '_system');
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
		}
	}
	OpenSocialLinksInAppBrowser(link, base){
		link != '' ? cordova.InAppBrowser.open(base+''+link, '_system') : console.log('empty link');
	}
	addFriend(){
		let self = this;
		if(!this.addFriendLoader) {
			this.addFriendLoader = true;
			this.appService.loadArticles('http://muscularstrength.com/friends_action_json.php?action='+this.sendFriendRequestAction+'&user_id='+this.appService.getUserInfo('User Id')+'&actionUserID='+this.viewUserID).subscribe(
					res => {
						console.log(res);
						if(res.result == 'SUCCESS') {
							self.data.isUserBlocked = res.new_status.isUserBlocked;
							self.data.isUserFriended = res.new_status.isUserFriended;
							self.data.isUserPending = res.new_status.isUserPending;
							self.data.isUserRequest = res.new_status.isUserRequest;
						}
						self.addFriendLoader = false;
					},
					err => {
						console.log(err);
						self.addFriendLoader = false;
						alert('Some error occurred!');
					}
				);
		}
	}
	cancelRequest(){
		let self = this;
		if(!this.addFriendLoader){
			if(self.confirmUnfriendNBlock('cancel friend request sent to')) {
				self.addFriendLoader = true;
				self.appService.loadArticles('http://muscularstrength.com/friends_action_json.php?action='+this.cancelRequestAction+'&user_id='+this.appService.getUserInfo('User Id')+'&actionUserID='+this.viewUserID).subscribe(
						res => {
							console.log(res);
							if(res.result == 'SUCCESS') {
								self.data.isUserBlocked = res.new_status.isUserBlocked;
								self.data.isUserFriended = res.new_status.isUserFriended;
								self.data.isUserPending = res.new_status.isUserPending;
								self.data.isUserRequest = res.new_status.isUserRequest;
							}
							self.addFriendLoader = false;
						},
						err => {
							console.log(err);
							self.addFriendLoader = false;
							alert('Some error occurred!');
						}
					);
			}
		}
	}
	unfriendUser(){
		let self = this;
		if(!this.addFriendLoader){
			if(self.confirmUnfriendNBlock('unfriend')) {
				self.addFriendLoader = true;
				this.appService.loadArticles('http://muscularstrength.com/friends_action_json.php?action='+this.unFriendAction+'&user_id='+this.appService.getUserInfo('User Id')+'&actionUserID='+this.viewUserID).subscribe(
						res => {
							console.log(res);
							if(res.result == 'SUCCESS') {
								self.data.isUserBlocked = res.new_status.isUserBlocked;
								self.data.isUserFriended = res.new_status.isUserFriended;
								self.data.isUserPending = res.new_status.isUserPending;
								self.data.isUserRequest = res.new_status.isUserRequest;
							}
							self.addFriendLoader = false;
						},
						err => {
							console.log(err);
							self.addFriendLoader = false;
							alert('Some error occurred!');
						}
					);
			}
		}
	}
	blockUser(){
		let self = this;
		if(!this.blockUserLoader){
			if(self.confirmUnfriendNBlock('block')) {
				self.blockUserLoader = true;
				self.appService.loadArticles('http://muscularstrength.com/friends_action_json.php?action='+this.blockAction+'&user_id='+this.appService.getUserInfo('User Id')+'&blockID='+this.viewUserID).subscribe(
						res => {
							console.log(res);
							if(res.result == 'SUCCESS') {
								self.data.isUserBlocked = res.new_status.isUserBlocked;
								self.data.isUserFriended = res.new_status.isUserFriended;
								self.data.isUserPending = res.new_status.isUserPending;
								self.data.isUserRequest = res.new_status.isUserRequest;
							}
							self.blockUserLoader = false;
						},
						err => {
							console.log(err);
							self.blockUserLoader = false;
							alert('Some error occurred!');
						}
					);
			}
		}
	}
	unblockUser(){
		let self = this;
		if(!this.blockUserLoader) {
			self.blockUserLoader = true;
			self.appService.loadArticles('http://muscularstrength.com/friends_action_json.php?action='+this.unblockAction+'&user_id='+this.appService.getUserInfo('User Id')+'&removeID='+this.viewUserID+'&filter=BLOCKS').subscribe(
					res => {
						console.log(res);
						if(res.result == 'SUCCESS') {
							self.data.isUserBlocked = res.new_status.isUserBlocked;
							self.data.isUserFriended = res.new_status.isUserFriended;
							self.data.isUserPending = res.new_status.isUserPending;
							self.data.isUserRequest = res.new_status.isUserRequest;
						}
						self.blockUserLoader = false;
					},
					err => {
						console.log(err);
						self.blockUserLoader = false;
						alert('Some error occurred!');
					}
				);
		}
	}
	confirmUnfriendNBlock(msg){
		let self = this;
		var a = confirm('Are you sure you want to '+msg+' this user?');
		console.log(a);
		return a;
	}
	/*goback(){
		window.history.back();
	}*/
}
