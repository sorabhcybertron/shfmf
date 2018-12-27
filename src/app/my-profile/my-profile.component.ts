import { Component, OnInit } from '@angular/core';
import { AppServicesService } from '../app-services.service';
import { SafeHtmlPipe } from '../recipe-details/recipe-details.component';
import { Router, ActivatedRoute } from '@angular/router';

declare var cordova;

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
	public name: any;
	public activeTab: any = 'Board';
	public data: any;
	public loaded: boolean = false;
	public error: boolean = false;
	public showNewPostPopOver: boolean = false;
	public editorContent: string = '';
	public inappEventAttached: boolean = false;
	public userProfImage: any = '';
	public postloading: boolean = false;
	public CommentPopupOpen: boolean = false;
	public posting: boolean = false;
	public CommentText: any = '';
	public postId: any;
	public options = {
	    heightMin: 320,
	    toolbarInline: false,
	    charCounterCount: false,
	    toolbarButtons: ['insertImage', 'insertVideo', 'emoticons'],
	    toolbarButtonsMD: ['insertImage', 'insertVideo', 'emoticons'],
	    toolbarButtonsSM: ['insertImage', 'insertVideo', 'emoticons'],
	    toolbarButtonsXS: ['insertImage', 'insertVideo', 'emoticons'],
	    placeholderText: "What is on your mind?",
	    wordPasteModal: false,
	    imageDefaultAlign: 'left',
	    imageDefaultDisplay: 'block',
	    imageEditButtons: ['imageReplace', 'imageRemove'],
	    imageTextNear: false,
	    tooltips: false,
	    emoticonsUseImage: false,
	    toolbarBottom: false,
	    videoInsertButtons: ['videoBack', '|', 'videoByURL', 'videoEmbed'],
	    imageInsertButtons: ['imageBack', '|', 'imageUpload', 'imageByURL'],
	    imageUploadURL: "https://muscularstrength.com/upload_image_new_app.php",
	    imageUploadParams: { id: "my_editor" },
	    imageMaxSize: 1024 * 1024 * 10,
	    videoDefaultAlign: "left",
	    toolbarSticky: false,
	    videoDefaultDisplay: "block",
	    videoEditButtons: ["videoResize", "videoRemove"],
	    pluginsEnabled: ['draggable', 'emoticons', 'image', 'link', 'video'],
		htmlRemoveTags: ['script', 'style', 'base', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'input', 'button'],
	};
	public replyTo: any;
	public commentsArray: any = [];

	constructor(public appService: AppServicesService,public router :Router,public route:ActivatedRoute) { 
		this.appService.setAuthorUrl(this.route.url["_value"]);
	}

	ngOnInit() {
		console.log('myaccount init');
		let scope = this;
		this.name = this.appService.getUserInfo('First Name') + ' ' + this.appService.getUserInfo('Last Name');
		this.appService.postCall('https://muscularstrength.com/get_member_info.php', {mid: this.appService.getUserInfo('User Id')}).subscribe(
			res => {
				console.log('My Account res:');
				// console.log(res);
				if(res.status){
					scope.data = res.results;
					this.modifyHref();
					console.log(this.data);
					for(let i in scope.data.board.data){
						this.commentsArray.push({
							open: false,
							hasLiked: false,
							hasChildComments: (scope.data.board.data[i].childcomment && scope.data.board.data[i].childcomment.length > 0) ? true : false
						});
						// Check if user has liked comment - Root comment
						scope.data.board.data[i]['userHasLiked'] = (scope.data.board.data[i]['alluserslike'] && scope.data.board.data[i]['alluserslike'].length > 0) ? scope.checkIfLiked(scope.data.board.data[i]['alluserslike']) : false;
						// Check if user has liked comment - Child comments
						if(scope.data.board.data[i]['childcomment'])
							for (var j in scope.data.board.data[i]['childcomment'])
								scope.data.board.data[i]['childcomment'][j]['userHasLiked'] = (scope.data.board.data[i]['childcomment'][j]['allchilduserslike'] && scope.data.board.data[i]['childcomment'][j]['allchilduserslike'].length > 0) ? scope.checkIfLiked(scope.data.board.data[i]['childcomment'][j]['allchilduserslike'], true) : false;

					}
					console.log("Comments Array", this.commentsArray);
					if(res.results.prof_image.indexOf('https://muscularstrength.com/') == -1)
						res.results.prof_image = 'https://muscularstrength.com/'+res.results.prof_image;
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
				}else
					scope.error = true;
			},
			err => {
				alert('Some error occurred!');
				console.log(err);
			}
		);
	}

	checkIfLiked(allLikes, child?){
		let user_id = this.appService.getUserInfo('User Id');
		for(var i in allLikes)
			if(allLikes[i].likeuserid == user_id)
				return true;
		return false;
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
	cancelPost(){
		this.showNewPostPopOver=false ;
		this.editorContent = "";
	}
	postComment(){		// POST NEW COMMENT
		console.log(this.editorContent);
		let text = this.appService.ChangeuserCommentLinks(this.editorContent);
		let scope = this;
		this.postloading = true;
		if(this.editorContent.replace(/ /g,'') != ''){	// comment not empty
			this.appService.postCall('https://muscularstrength.com/get_member_info.php', {action: 'POST', mid: this.appService.getUserInfo('User Id'), comment: text}).subscribe(
				res => {
					console.log(res);
					if(res.status){		// Comment Posted successfully
						scope.editorContent = '';
						scope.showNewPostPopOver = false;
						console.log('comment posted.....');
						this.appService.postCall('https://muscularstrength.com/get_member_info.php', {mid: this.appService.getUserInfo('User Id')}).subscribe(
							res => {		// Refresh BOARD POSTS
								console.log('My Account res:');
								console.log(res);
								if(res.status){
									scope.data.board = res.results.board;
									this.commentsArray= [];
									for(let i in scope.data.board.data){
										this.commentsArray.push({
											open: false,
											hasLiked: false,
											hasChildComments: (scope.data.board.data[i].childcomment && scope.data.board.data[i].childcomment.length > 0) ? true : false
										});

										// Check if user has liked comment - Root comment
										scope.data.board.data[i]['userHasLiked'] = (scope.data.board.data[i]['alluserslike'] && scope.data.board.data[i]['alluserslike'].length > 0) ? scope.checkIfLiked(scope.data.board.data[i]['alluserslike']) : false;
										// Check if user has liked comment - Child comments
										if(scope.data.board.data[i]['childcomment'])
											for (var j in scope.data.board.data[i]['childcomment'])
												scope.data.board.data[i]['childcomment'][j]['userHasLiked'] = (scope.data.board.data[i]['childcomment'][j]['allchilduserslike'] && scope.data.board.data[i]['childcomment'][j]['allchilduserslike'].length > 0) ? scope.checkIfLiked(scope.data.board.data[i]['childcomment'][j]['allchilduserslike'], true) : false;
									}
									scope.error = false;
									scope.loaded = true;
									setTimeout(function(){
										console.log('scope.activeTab: '+scope.activeTab);
										if(scope.activeTab == 'Board'){
											scope.openInAppBrowser();
											scope.inappEventAttached = true;
										}
									}, 200);
								}else
									scope.error = true;
							},
							err => {
								// alert('Some error occurred!');
								console.log(err);
							}
						);
					} else
						alert('Some error occurred!');
					scope.postloading = false;
				}, err => {
					alert('Some error occurred!');
					scope.postloading = false;
				});
		}
	}

	postCommentReply(){		// POST NEW COMMENT
		console.log(this.CommentText);
		let scope = this;
		// this.CommentText = this.CommentText.replace("@"+this.replyTo,"<span (click)='openInApp(\'https://muscularstrength.com/"+this.replyTo+"\')'>@"+this.replyTo+"</span>");
		this.postloading = true;
		if(this.CommentText != ''){	// comment not empty
			let text = this.appService.ChangeuserCommentLinks(this.CommentText); 
			this.appService.postCall('https://muscularstrength.com/get_member_info.php', {action: 'POST', mid: this.appService.getUserInfo('User Id'), comment: text , postId2: this.postId }).subscribe(
				res => {
					console.log(res);
					if(res.status){		// Comment Posted successfully
						scope.CommentText = '';
						scope.CommentPopupOpen = false;
						console.log('comment posted.....');
						this.appService.postCall('https://muscularstrength.com/get_member_info.php', {mid: this.appService.getUserInfo('User Id')}).subscribe(
							res => {		// Refresh BOARD POSTS
								console.log('My Account res:');
								console.log(res);
								if(res.status){
									scope.data.board = res.results.board;
									scope.error = false;
									scope.loaded = true;
									setTimeout(function(){
										console.log('scope.activeTab: '+scope.activeTab);
										if(scope.activeTab == 'Board'){
											scope.openInAppBrowser();
											scope.inappEventAttached = true;
										}
									}, 200);
								}else
									scope.error = true;
							},
							err => {
								// alert('Some error occurred!');
								console.log(err);
							}
						);
					} else
						alert('Some error occurred!');
					scope.postloading = false;
				}, err => {
					alert('Some error occurred!');
					scope.postloading = false;
				});
		}
		console.log(this.CommentText);
	}

	openInAppBrowser(){	// for Board links
		this.link_me();

		// let board = document.getElementById('board');
		// let ancs = board.getElementsByTagName('a');
		// for(var i = 0; i< ancs.length; i++){
		// 	ancs[i].addEventListener('click', function(e){
		// 		console.log('clicked');
		// 		let link = e.srcElement.getAttribute('href');
		// 		console.log(link);
		// 		if(link.trim() != '')
		// 			cordova.InAppBrowser.open(link, '_system');
		// 		e.preventDefault();
		// 		e.stopPropagation();
		// 		return false;
		// 	});
		// }
	}

	likeComment(commentID, what, child?, rootCommentID?){
		console.log(commentID, what);
		if(child){
			console.log( child, rootCommentID);
		}
		if(commentID){
			let scope = this;
			let link = 'https://muscularstrength.com/get_member_info_view_json.php';
			this.appService.postCall(link,{action:'POST_LIKE',dowhat:what,post_id:commentID,mid:this.appService.getUserInfo('User Id')}).subscribe(
				res => {
					// console.log('comment like');
					console.log(res);
					if(res.status){
						if(!child) {
							for(var i in scope.data.board.data)
								if(scope.data.board.data[i].postid == commentID){
									console.log(scope.data.board.data[i].postid,commentID);
									scope.data.board.data[i]['userHasLiked'] = what == 'LIKE' ? true : false;
									scope.data.board.data[i]['like'] = (what == 'LIKE') ? scope.data.board.data[i]['like']+1 : scope.data.board.data[i]['like']-1;
									break;
								}
						} else {
							for(var i in scope.data.board.data)
								if(scope.data.board.data[i].postid == rootCommentID)
									for(var j in scope.data.board.data[i]['childcomment'])
										if(scope.data.board.data[i]['childcomment'][j]['commentid'] == commentID){
											console.log(scope.data.board.data[i].postid,commentID);
											scope.data.board.data[i]['childcomment'][j]['userHasLiked'] = what == 'LIKE' ? true : false;
											scope.data.board.data[i]['childcomment'][j]['like'] = (what == 'LIKE') ? scope.data.board.data[i]['childcomment'][j]['like']+1 : scope.data.board.data[i]['childcomment'][j]['like']-1;
											break;
										}
						}
					}
				},
				err => {
					alert('Some error occurred!');
					console.log(err);
				}
			);
		}
	}


	link_me(){

		let currnt = this;
		let boardlinks =  document.querySelectorAll("#board .tb-content  a");
		for(var i = 0; i < boardlinks.length; i++){
			boardlinks[i].removeEventListener('click',function(e){ console.log('remove');});
			boardlinks[i].addEventListener('click', function(e){
				console.log('clicked me',e.srcElement.textContent,e.srcElement.textContent.startsWith('@'));
				e.stopPropagation();
				e.preventDefault();
				let link = e.srcElement.getAttribute('href');
				console.log('link: '+link);
				if(link != '#' && link != ''){
					if(e.srcElement.textContent.startsWith('@')){
						let md = '/Authors/0/'+link.replace('/','');
						// console.log(currnt.router);
						currnt.router.navigate([md]);
					}else{
						console.log('opening url');
						if(link.indexOf('http') == -1){
							link = 'https://muscularstrength.com/' + link;
							console.log('updated link: '+link);
						}
						cordova.InAppBrowser.open(link, '_system');
					}
				}
				return false;
			});
		}
	}

	OpenSocialLinksInAppBrowser(link, base){
		link != '' ? cordova.InAppBrowser.open(base+''+link, '_system') : console.log('empty link');
	}

	openCommentBox(postId, replyTo){
		console.log("postId",postId);
		this.postId = postId;
		this.replyTo = replyTo;
		this.CommentText = '@'+replyTo+' ';
		this.CommentPopupOpen = true;
	}
	openInaApp(link){
		cordova.InAppBrowser.open(link, '_self');
	}

	modifyHref(){
		this.data.board.data.forEach(comment => {
			if(comment.childcomment){
				comment.childcomment.forEach(ccomment => {
					ccomment.commentText.replace("href","");
				});	
			}		
		});
	}

	getuserPlatinum(){
		let userinfo = JSON.parse(window.localStorage.getItem('userInfo'));
		if(userinfo['account type'] == 'Platinum'){
			return true;
		}else{
			return false;
		}
	}

	
}