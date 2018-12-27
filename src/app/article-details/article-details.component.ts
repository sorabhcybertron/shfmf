import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppServicesService } from '../app-services.service';
import { SafeHtmlPipe } from '../recipe-details/recipe-details.component';
import { ConsultationComponent } from '../consultation/consultation.component';

declare var cordova: any;

@Component({
	selector: 'app-article-details',
	templateUrl: './article-details.component.html',
	styleUrls: ['./article-details.component.css', '../common_styles/newcomment_style.css'],
    encapsulation: ViewEncapsulation.None
})
export class ArticleDetailsComponent implements OnInit {
	public isLoaded: boolean;
	public articleDetails: any;
	public sub: any;
	public coachingpopup: boolean = false;
	public commentsArray: any = [];
	public fbCounter: any;
	public CommentText: any = '';
	public CommentPopupOpen: boolean = false;
	public commentTo: String = '';
	public replyToID: any;
	public articleID: any;
	public myId: any = '';
	public author_id : any = 0;
	public fromFav : boolean = false;
	/* FOR LIKING A COMMENT */
	/*public dbTable: any = 'LIKE_COMMENT';
	public commentLikeAction: any = 'LIKE_COMMENT';
	public commentUnlikeAction: any = 'UNLIKE_COMMENT';*/
	public likeOnTheWay: boolean = false;

	constructor(public appService: AppServicesService,public router:Router, private route: ActivatedRoute) {
		this.isLoaded = false;
		this.appService.setAuthorUrl(this.route.url["_value"]);

	}

	loadAuthor(id){
		console.log('author to load: '+id);
	}

	viewAllReplies(i){
		// console.log(i);
		this.commentsArray[i].open = !this.commentsArray[i].open;
		// console.log(this.commentsArray[i]);
	}
	replyTo(Action, commentID, table, ArticleID, message) {
		let self = this;
		//this.CommentText = this.CommentText.replace("@"+this.commentTo,"<a href='https://muscularstrength.com/"+this.commentTo+"'>@"+this.commentTo+"</a>");
        let text = this.appService.ChangeuserCommentLinks(this.CommentText);
        if(text != '') {
	        console.log('reply to called'+ this.appService.getUserInfo('User Id'));
	        this.appService.postCall('http://muscularstrength.com/article_like_new_json.php', {mid: this.appService.getUserInfo('User Id'), action: Action, commentID: this.replyToID, dbTable: table, recordID: ArticleID, contentText:text}).subscribe(
	            res => {
	                console.log(res);
	                if(res.status){
	                    self.appService.loadArticles('http://muscularstrength.com/article_viewer_json.php?rID='+self.articleID).subscribe(res => {
	                        if(res.result === "SUCCESS"){
	                            console.log(res);
								var commentsLatest = [];
								for(var i in res.data['Member Comments']){
									// Accordion
									commentsLatest.push({
										open: false,
										hasLiked: false,
										hasChildComments: (res.data['Member Comments'][i]['childcomment'] && res.data['Member Comments'][i]['childcomment'].length > 0) ? true : false
									});
									// Check if user has liked comment - Root comment
									res.data['Member Comments'][i]['userHasLiked'] = (res.data['Member Comments'][i]['alluserslike'] && res.data['Member Comments'][i]['alluserslike'].length > 0) ? self.checkIfLiked(res.data['Member Comments'][i]['alluserslike']) : false;
									// Check if user has liked comment - Child comments
									if(res.data['Member Comments'][i]['childcomment'])
										for (var j in res.data['Member Comments'][i]['childcomment'])
											res.data['Member Comments'][i]['childcomment'][j]['userHasLiked'] = (res.data['Member Comments'][i]['childcomment'][j]['allchilduserslike'] && res.data['Member Comments'][i]['childcomment'][j]['allchilduserslike'].length > 0) ? self.checkIfLiked(res.data['Member Comments'][i]['childcomment'][j]['allchilduserslike'], true) : false;
								}
								self.commentsArray = commentsLatest;
								// console.clear();
								/*console.log('self.commentsArray');
								console.log(self.commentsArray);*/
								console.log("res.data['Member Comments']");
								console.log(res.data['Member Comments']);
	                            self.articleDetails['Member Comments'] = res.data['Member Comments'];
								setTimeout(function(){
									self.bindLinkClicks();
								}, 200);
	                            // Get FB count
	                            self.getFBCounts(res.data.share_this_link);
	                        }
	                    },
	                    err => {
	                        console.log('some error occurred!');
	                        console.log(err);
	                    });
	                    self.CommentText = '';
	                    self.CommentPopupOpen = false;
	                    // alert('success!');
	                }else
	                    alert('Some error occurred!');
	            },
	            err => {
	                alert('Something went wrong!');
	            }
	        );
	    }
    }

	ngOnInit() {
		let self = this;
		this.myId = this.appService.getUserInfo('User Id');
	    // Subscribe to route params
		this.sub = this.route.params.subscribe(params => {
            self.articleID = params['id'];
            this.appService.MarkNewContentsViewded('articles',self.articleID);
            if(params['from'] && params['from'] == "fav"){
				this.fromFav = true;
			}
			self.appService.loadArticles('http://muscularstrength.com/article_viewer_json.php?rID='+params['id']).subscribe(res => {
				if(res.result === "SUCCESS"){
					console.clear();
					console.log(res);
					res.data.description = res.data.description.replace(new RegExp('src="//www.youtube.com', 'g'), 'src="https://www.youtube.com');
					/*console.log('Profileimage');
					console.log(res.data['About Author'].Profileimage);*/
					if(res.data['About Author'].Profileimage.indexOf('http://muscularstrength.com/') == -1){
						if(res.data['About Author'].Profileimage.indexOf('includes/') == 0)
							res.data['About Author'].Profileimage = res.data['About Author'].Profileimage.replace('includes/', 'http://muscularstrength.com/includes/');
						if(res.data['About Author'].Profileimage.indexOf('/includes/') == 0)
							res.data['About Author'].Profileimage = res.data['About Author'].Profileimage.replace('/includes/', 'http://muscularstrength.com/includes/');
						this.author_id = res.data['authorid'];
					}
					for(var i in res.data['Member Comments']){
						// Accordion
						self.commentsArray.push({
							open: false,
							hasLiked: false,
							hasChildComments: (res.data['Member Comments'][i]['childcomment'] && res.data['Member Comments'][i]['childcomment'].length > 0) ? true : false
						});
						// Check if user has liked comment - Root comment
						res.data['Member Comments'][i]['userHasLiked'] = (res.data['Member Comments'][i]['alluserslike'] && res.data['Member Comments'][i]['alluserslike'].length > 0) ? self.checkIfLiked(res.data['Member Comments'][i]['alluserslike']) : false;
						// Check if user has liked comment - Child comments
						if(res.data['Member Comments'][i]['childcomment'])
							for (var j in res.data['Member Comments'][i]['childcomment'])
								res.data['Member Comments'][i]['childcomment'][j]['userHasLiked'] = (res.data['Member Comments'][i]['childcomment'][j]['allchilduserslike'] && res.data['Member Comments'][i]['childcomment'][j]['allchilduserslike'].length > 0) ? self.checkIfLiked(res.data['Member Comments'][i]['childcomment'][j]['allchilduserslike'], true) : false;
					}
					console.log('self.commentsArray');
					console.log(self.commentsArray);
					console.log("res.data['Member Comments']");
					console.log(res.data['Member Comments']);
					self.articleDetails = res.data;
					self.isLoaded = true;
					// Get FB count
					self.getFBCounts(res.data.share_this_link);
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
						var allDetailAnc = document.querySelectorAll('.article-details a');
						for(var i = 0; i < allDetailAnc.length; i++){
							allDetailAnc[i].addEventListener('click', function(e){
								console.log('clicked me');
								e.stopPropagation();
								e.preventDefault();
								let link = e.srcElement.getAttribute('href');
								console.log('link: '+link);
								if(link != '#' && link != ''){
									console.log('opening url');
									if(link.indexOf('http') == -1){
										link = 'http://muscularstrength.com/' + link;
										console.log('updated link: '+link);
									}
									cordova.InAppBrowser.open(link, '_system');
								}
								return false;
							});
						}
						self.bindLinkClicks();
					}, 200);
					setTimeout(self.adjustIframes, 200);
				}
			},
			err => {
				console.log('some error occurred!');
				console.log(err);
			});
		});
		window.addEventListener('resize', self.adjustIframes);
	}
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

	likeComment(commentID, what, child?, rootCommentID?) {
		if(!this.likeOnTheWay){
			console.log('like called');
			let scope = this;
			// let act = what == 'LIKE' ? this.commentLikeAction : this.commentUnlikeAction;
			this.likeOnTheWay = true;
			// this.appService.postCall('http://muscularstrength.com/article_like_json.php', {action: act, mid: this.appService.getUserInfo('User Id'), commentID: commentID, dbTable: this.dbTable }).subscribe(
			let link = what == 'LIKE' ? 'http://muscularstrength.com/article_like_json.php' : 'http://muscularstrength.com/article_unlike_json.php';
			this.appService.loadArticles(link+'?userid='+this.appService.getUserInfo('User Id')+'&commentid='+commentID).subscribe(
				res => {
					// console.log('comment like');
					// console.log(res);
					if(res.result == 'SUCCESS'){
						if(!child) {
							for(var i in scope.articleDetails['Member Comments'])
								if(scope.articleDetails['Member Comments'][i].commentid == commentID){
									scope.articleDetails['Member Comments'][i]['userHasLiked'] = what == 'LIKE' ? true : false;
									scope.articleDetails['Member Comments'][i]['like'] = (what == 'LIKE') ? scope.articleDetails['Member Comments'][i]['like']+1 : scope.articleDetails['Member Comments'][i]['like']-1;
									break;
								}
						} else {
							for(var i in scope.articleDetails['Member Comments'])
								if(scope.articleDetails['Member Comments'][i].commentid == rootCommentID)
									for(var j in scope.articleDetails['Member Comments'][i]['childcomment'])
										if(scope.articleDetails['Member Comments'][i]['childcomment'][j]['childcommentid'] == commentID){
											scope.articleDetails['Member Comments'][i]['childcomment'][j]['userHasLiked'] = what == 'LIKE' ? true : false;
											scope.articleDetails['Member Comments'][i]['childcomment'][j]['childlike'] = (what == 'LIKE') ? scope.articleDetails['Member Comments'][i]['childcomment'][j]['childlike']+1 : scope.articleDetails['Member Comments'][i]['childcomment'][j]['childlike']-1;
											break;
										}
						}
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
	adjustIframes(){
	    let iframes = document.getElementsByTagName('iframe') as HTMLCollectionOf<HTMLIFrameElement>;
	    console.log('working on adjusting iframe height...');
	    for (var i = 0; i < iframes.length; i++){
	    	let width = iframes[i].getBoundingClientRect().width / 1.784;
	        iframes[i].style.height = width+'px';
	    }
	}
	getFBCounts(link){
		let self = this;
		link = this.appService.filterulr(link);
		link = encodeURIComponent(link);
		console.log(link);
		this.appService.loadArticles('https://graph.facebook.com/?id='+link+'&fields=id,share,og_object{engagement}').subscribe(
			res => {
				console.log(res);
				if(res.og_object){
					self.fbCounter = res.og_object.engagement.count;
					console.log(self.fbCounter);
				}
			},
			err => {
				console.log('social counter retrieval failed!');
			}
		);
	}
	shareArticle(where){
		let shareLink = this.appService.filterulr(this.articleDetails.share_this_link);
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
	hideCoachingOverlay(){
		this.coachingpopup = false;
	}
	ngOnDestroy(){
	    this.sub.unsubscribe();	// Clean sub to avoid memory leak
		window.removeEventListener('resize', this.adjustIframes);
	}

	bindLinkClicks(){
		let currnt = this;
		var allMsgAnc = document.querySelectorAll('.member-comments .msg-block a');
		for(var i = 0; i < allMsgAnc.length; i++){
			allMsgAnc[i].addEventListener('click', function(e){
				console.log('clicked me');
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
	shareMe(link){
		if(link != '')
			cordova.InAppBrowser.open(link, '_system');
		else
			alert('No link available!');
	}
	openAboutAuthor(){
		cordova.InAppBrowser.open(this.articleDetails['About Author'].link, '_blank')
	}
}
