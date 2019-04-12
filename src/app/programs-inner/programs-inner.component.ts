import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppServicesService } from '../app-services.service';
import { ConsultationComponent } from '../consultation/consultation.component';

declare var cordova;
@Component({
	selector: 'app-programs-inner',
	templateUrl: './programs-inner.component.html',
	styleUrls: ['../../assets/styles/css.css', '../recipe-details/recipe-details.component.css', './programs-inner.component.css', '../common_styles/newcomment_style.css']
})
export class ProgramsInnerComponent implements OnInit {
	public fromFav :  string = '';
	public sub: any;
	public linkToLoad: any = '';
	public error: any = '';
	public loading: any;
	public data: any = {};
	public coachingpopup: boolean = false;
	public showDesc: boolean = false;
	public commentsArray: any = [];
	public isUserPlatium: any = false;
	public myId: any = '';
	public commentTo: String = '';
	public fbCounter: any = 0;
	public gplusCounter: any = 0;

	/* FOR ADDING COMMENTS */
	public commentAction: any = 'ADD_NEW_COMMENT';
	public CommentPopupOpen: any = false;	// Add comment Popup (Closed by default)
	public recordLinkID: any = '';			// Nav Param from categories page call
	public dbTable: any = '';				// Nav Param from categories page call
	public CommentText: any = '';			// user comment
	public replyToID: any = '';				// for replying to a comment
	public posting: boolean = false;		// loading while posting comment

	/* FOR LIKING A COMMENT */
	public commentLikeAction: any = 'LIKE_COMMENT';
	public commentUnlikeAction: any = 'UNLIKE_COMMENT';
  public likeOnTheWay: boolean = false;
  public programID : number = 0;

  public thisRoute: string = "";

	constructor(public appService: AppServicesService,public router :Router, private route: ActivatedRoute) { }

	viewAllReplies(i){
		this.commentsArray[i].open = !this.commentsArray[i].open;
	}

	navigateTopage(){
		if(this.fromFav == 'fav'){
			this.router.navigate(['/MyProfile']);
		}else if(this.fromFav == 'newNotify'){
			this.router.navigate(['/newcontent']);
		}
	}

	ngOnInit() {
		this.appService.setAuthorUrl(this.route.url["_value"]);
		let self = this;
		this.myId = this.appService.getUserInfo('User Id');
		this.loading = true;
    this.isUserPlatium = this.appService.getUserInfo('account type');
    this.route.url.subscribe(url=>{
			url.forEach(element => {
				this.thisRoute += element.path+"/";
			});
			this.thisRoute=this.thisRoute.substring(0,this.thisRoute.length-1);
			window.localStorage.setItem('backPath',this.thisRoute);
		});
		this.sub = this.route.params.subscribe(params => {
			self.linkToLoad = params['link'];
			self.recordLinkID = params['recordLink'];
			self.dbTable = params['dbTable'];
			if(params['programid']){
				self.programID = params['programid'];
				this.appService.MarkNewContentsViewded('programs',self.programID );
			}
			if(params['from'] && params['from'] != ""){
				self.fromFav = params['from'];
			}
			self.appService.postCall('http://muscularstrength.com/'+self.linkToLoad+'.php', {mid: self.appService.getUserInfo('User Id')}).subscribe(
				res => {
					console.log(res);
					for(var i in res['Member Comments']){
						self.commentsArray.push({
							open: false,
							hasLiked: false,
							hasChildComments: (res['Member Comments'][i]['childcomment'] && res['Member Comments'][i]['childcomment'].length > 0) ? true : false,
							childCommentsLikes: []
						});
						// Check if user has liked comment - Root comment
						res['Member Comments'][i]['userHasLiked'] = self.checkIfLiked(res['Member Comments'][i]['alluserslike']);
						// Check if user has liked comment - Child comments
						if(res['Member Comments'][i]['childcomment'])
							for (var j = 0; j < res['Member Comments'][i]['childcomment'].length; j++)
								res['Member Comments'][i]['childcomment'][j]['userHasLiked'] = self.checkIfLiked(res['Member Comments'][i]['childcomment'][j]['allchilduserslike'], true);
						// res = self.detectCommentLikes(res);
					}

					console.log('updated res');
					console.log("result is", res);
					self.data = res;
					console.log('This is the data',this.data);
					setTimeout(function(){
						let coaching_cont = document.getElementsByClassName('online-coaching')[0];
						let coaching_links = coaching_cont.getElementsByTagName('a');
						for (var i = 0 ; i < coaching_links.length; i++) {
							coaching_links[i].addEventListener('click', function(e){
								e.stopPropagation();
								e.preventDefault();
								self.coachingpopup = true;
								return false;
							}, false);
						}
						self.bindLinkClicks();
					}, 200);
					self.loading = false;
					self.appService.getCall("https://graph.facebook.com/?id="+this.appService.filterulr(self.data.share_this_link)+"&fields=og_object{engagement}").subscribe(
						data => {
							console.log("fbcounts",data);
							this.fbCounter = 2*data.og_object.engagement.count;
						},
						err => console.log("fbcountererr",err)
					);

					self.appService.getCall("https://www.googleapis.com/plus/v1/activities?query="+self.data.share_this_link+"&key=AIzaSyBNcdtyEANFgzAzmvoiTb7IvjwqFDGKkB4").subscribe(res => {
						self.gplusCounter = res.items.length;
					});
				},
				err => {
					console.log('err');
					console.log(err);
					self.loading = false;
					self.error = 'Something went wrong!';
				}
			);
		});

	}

	download12WeeksWorkout(link){
		cordova.InAppBrowser.open(link, '_system');
	}

	hideOverlay(){
		this.coachingpopup = false;
	}

	shareMe(link){
		cordova.InAppBrowser.open(link, '_system');
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	likeComment(commentID, what, child?, rootCommentID?) {
		if(!this.likeOnTheWay){
			console.log('like called');
			let scope = this;
			let act = what == 'LIKE' ? this.commentLikeAction : this.commentUnlikeAction;
			this.likeOnTheWay = true;
			this.appService.postCall('http://muscularstrength.com/program_comments_json.php', {action: act, mid: this.appService.getUserInfo('User Id'), commentID: commentID, dbTable: this.dbTable }).subscribe(
				res => {
					console.log('comment like');
					console.log(res);
					if(res.status){
						if(!child){
							for(var i in scope.data['Member Comments'])
								if(scope.data['Member Comments'][i].commentid == commentID){
									scope.data['Member Comments'][i]['userHasLiked'] = what == 'LIKE' ? true : false;
									scope.data['Member Comments'][i]['like'] = (what == 'LIKE') ? scope.data['Member Comments'][i]['like']+1 : scope.data['Member Comments'][i]['like']-1;
									/*if(what == 'LIKE'){
										// Inc like count
										if(!scope.data['Member Comments'][i].alluserslike)
											scope.data['Member Comments'][i].alluserslike = [];
										scope.data['Member Comments'][i]['alluserslike'].push({likeuserid: scope.myId});
									} else {
										// Dec like count
										for (var lp = 0; lp < scope.data['Member Comments'][i]['alluserslike'].length; lp++) {
											if(scope.data['Member Comments'][i]['alluserslike'][lp].likeuserid == scope.myId){
												scope.data['Member Comments'][i]['alluserslike'].push({likeuserid: scope.myId});
												break;
											}
										}
									}*/
									break;
								}
						} else {
							for(var i in scope.data['Member Comments'])
								if(scope.data['Member Comments'][i].commentid == rootCommentID)
									for(var j in scope.data['Member Comments'][i]['childcomment'])
										if(scope.data['Member Comments'][i]['childcomment'][j]['childcommentid'] == commentID){
											scope.data['Member Comments'][i]['childcomment'][j]['userHasLiked'] = what == 'LIKE' ? true : false;
											scope.data['Member Comments'][i]['childcomment'][j]['childlike'] = (what == 'LIKE') ? scope.data['Member Comments'][i]['childcomment'][j]['childlike']+1 : scope.data['Member Comments'][i]['childcomment'][j]['childlike']-1;
											break;
										}
						}
						// scope.refreshMessages();
					}
					scope.likeOnTheWay = false;
				},
				err => {
					alert('Some error occurred!');
					console.log(err);
					scope.likeOnTheWay = false;
				}
			);
		}
	}
	addCommentOrReply(){
		let scope = this;
		if(this.CommentText != '') {
			scope.posting = true;
			//this.CommentText = this.CommentText.replace("@"+this.commentTo,"<a href='https://muscularstrength.com/"+this.commentTo+"'>@"+this.commentTo+"</a>");
			let text = this.appService.ChangeuserCommentLinks(this.CommentText);
			let dt = {
				action: scope.commentAction,
				mid: scope.appService.getUserInfo('User Id'),
				dbTable: scope.dbTable,
				recordLinkID: scope.recordLinkID,
				contentText: text,
				commentID: scope.replyToID
			};
			console.log('data');
			console.log(dt);
			scope.appService.postCall('http://muscularstrength.com/program_comments_json.php', dt).subscribe(
				res => {
					scope.posting = false;
					scope.CommentPopupOpen = false;
					console.log('Comment Posted!!');
					console.log(res);
					if(res.status){
						scope.CommentText = '';
						scope.refreshMessages();
					} else
						alert('Some error occurred!');
					scope.posting = false;
				},
				err => {
					scope.posting = false;
					alert('Some error occurred!');
					console.log(err);
				}
			);
		}
	}

	/*detectCommentLikes(res){
		let self = this;
		// Root comment
		res['Member Comments'][i]['userHasLiked'] = self.checkIfLiked(res['Member Comments'][i]['alluserslike']);
		// Child comments
		if(res['Member Comments'][i]['childcomment'])
			for (var j = 0; j < res['Member Comments'][i]['childcomment'].length; j++)
				res['Member Comments'][i]['childcomment'][j]['userHasLiked'] = self.checkIfLiked(res['Member Comments'][i]['childcomment'][j]['allchilduserslike'], true);
		return res;
	}*/
	checkIfLiked(allLikes, child?){
		for(var i in allLikes)
			/*if(child){
				console.log('allLikes[i]');
				console.log(allLikes[i]);
			}*/
			if(allLikes[i].likeuserid == this.myId)
				return true;
		return false;
	}
	refreshMessages(){
		let self = this;
		self.appService.postCall('http://muscularstrength.com/'+self.linkToLoad+'.php', {mid: self.appService.getUserInfo('User Id')}).subscribe(
			res => {
				console.log(res);
				var commentsLatest = [];
				for(var i in res['Member Comments']){
					commentsLatest.push({
						open: false,
						hasLiked: false,
						hasChildComments: (res['Member Comments'][i]['childcomment'] && res['Member Comments'][i]['childcomment'].length > 0) ? true : false,
						childCommentsLikes: []
					});
					// Check if user has liked comment - Root comment
					res['Member Comments'][i]['userHasLiked'] = self.checkIfLiked(res['Member Comments'][i]['alluserslike']);
					// Check if user has liked comment - Child comments
					if(res['Member Comments'][i]['childcomment'])
						for (var j = 0; j < res['Member Comments'][i]['childcomment'].length; j++)
							res['Member Comments'][i]['childcomment'][j]['userHasLiked'] = self.checkIfLiked(res['Member Comments'][i]['childcomment'][j]['allchilduserslike'], true);
				}
				self.commentsArray = commentsLatest;
				commentsLatest = null;
				console.log('self.commentsArray.length');
				console.log(self.commentsArray.length);
				// res = scope.detectCommentLikes(res);
				console.log('+++++++++++++++++++++++++');
				self.data['Member Comments'] = res['Member Comments'];

				console.log('-------------------------');
				setTimeout(function(){
					/*let coaching_cont = document.getElementsByClassName('online-coaching')[0];
					let coaching_links = coaching_cont.getElementsByTagName('a');
					for (var i = 0 ; i < coaching_links.length; i++) {
						coaching_links[i].addEventListener('click', function(e){
							e.stopPropagation();
							e.preventDefault();
							self.coachingpopup = true;
							return false;
						}, false);
					}*/
					self.bindLinkClicks();
				}, 200);
			},
			err => {
				console.log('err');
				console.log(err);
				self.error = 'Something went wrong!';
			}
		);
	}

	bindLinkClicks(){
		let currnt = this;
		var allMsgAnc = document.querySelectorAll('.member-comments .msg-block a');
		for(var i = 0; i < allMsgAnc.length; i++){
			allMsgAnc[i].addEventListener('click', function(e){
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
						if(link.indexOf('http') == -1){
							link = 'http://muscularstrength.com/' + link;
							console.log('updated link: '+link);
						}
							cordova.InAppBrowser.open(link, '_system');
					}
				}
				return false;
			});
		}
	}
	shareArticle(where){
		let shareLink = this.appService.filterulr(this.data.share_this_link);
		// To get FB share counts:
		// https://graph.facebook.com/?id=http%3A%2F%2Fmuscularstrength.com%2Farticle%2FBack-Workout-Hack-Bigger-Lats&fields=og_object{engagement}
		// https://graph.facebook.com/?id=http%3A%2F%2Fmuscularstrength.com%2Farticle%2FAdd-Inch-Your-Arms-Bigger-Biceps&fields=id,share,og_object{engagement}
		if(where == 'fb'){
			console.log('fb: '+shareLink);
			cordova.socialsharing.shareViaFacebook(shareLink, null, shareLink, this.sharingSuccess, this.sharingFailed);
		}
		if(where == 'tw'){
			console.log('tw: '+shareLink);
			cordova.socialsharing.shareViaTwitter(null, null, shareLink, this.sharingSuccess, this.sharingFailed);
		}
		if(where == 'email'){
			console.log('email: '+shareLink);
			cordova.socialsharing.shareViaEmail(shareLink, 'Muscular Strength', null, null, null, null, this.sharingSuccess, this.sharingFailed);
		}
		if(where == 'gp'){
			console.log('gp: '+shareLink);
			cordova.socialsharing.shareVia('com.google.android.apps.plus', 'Muscular Strength', null/*mesage*/, null/*files*/, shareLink, function(s){console.log('s');console.log(s);}, function(e){console.log(e);console.log('e');alert('Some error occurred!');});
		}
		if(where == 'insta'){
			console.log('instagram: '+shareLink);
			cordova.socialsharing.shareViaInstagram(shareLink, null, this.sharingSuccess, this.sharingFailed);
		}
		if(where == 'wts'){
			console.log('whatsapp: '+shareLink);
			cordova.socialsharing.shareViaWhatsApp(shareLink, null, shareLink, this.sharingSuccess, this.sharingFailed);
		}
	}
	sharingSuccess(res){
		console.log('sharing success');
		console.log(res);
	}
	sharingFailed(err){
		console.log('sharing err');
		console.log(err);
		// alert('Some error occurred!');
	}
	openAboutAuthor(){
		cordova.InAppBrowser.open(this.data['About Author'].link, '_blank')
	}
}
