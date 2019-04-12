import { Component, OnInit, OnDestroy, Pipe, PipeTransform, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppServicesService } from '../app-services.service';
import { DomSanitizer } from '@angular/platform-browser';

declare var cordova: any;

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
	constructor(private sanitized: DomSanitizer) {}
	transform(value) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}
}

@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}
	transform(url) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}
}

@Component({
	selector: 'app-recipe-details',
	templateUrl: './recipe-details.component.html',
	styleUrls: ['./recipe-details.component.css', '../common_styles/newcomment_style.css'],
    encapsulation: ViewEncapsulation.None
})
export class RecipeDetailsComponent implements OnInit {
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
	public fromFav: string = '';

	/* FOR LIKING A COMMENT */
	public likeOnTheWay: boolean = false;

	constructor(public appService: AppServicesService, public router:Router,private route: ActivatedRoute) {
		this.isLoaded = false;
		this.appService.setAuthorUrl(this.route.url["_value"]);
	}

	loadAuthor(id){
		console.log('author to load: '+id);
	}

	viewAllReplies(i){
		this.commentsArray[i].open = !this.commentsArray[i].open;
	}

	replyTo(Action, commentID, table, ArticleID, message) {
		let self = this;
		//this.CommentText = this.CommentText.replace("@"+this.commentTo,"<a href='https://muscularstrength.com/"+this.commentTo+"'>@"+this.commentTo+"</a>");
		let text = this.appService.ChangeuserCommentLinks(this.CommentText);
		if(text != '') {
			console.log('reply to called'+ this.appService.getUserInfo('User Id'));
			this.appService.loadArticles('http://muscularstrength.com/recipes_reply_json.php?userid=' + this.appService.getUserInfo('User Id') + '&content=' + text + '&articleid=' + this.articleID + '&commentid=' + this.replyToID).subscribe(
				res => {
					console.log(res);
					if(res.result == "SUCCESS"){
						self.appService.loadArticles('http://muscularstrength.com/recipes_viewer_json.php?rID='+self.articleID).subscribe(res => {
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

	navigateTopage(){
		if(this.fromFav == 'fav'){
			this.router.navigate(['/MyProfile']);
		}else if(this.fromFav == 'newNotify'){
			this.router.navigate(['/newcontent']);
		}
	}


	ngOnInit() {
		let self = this;
		this.myId = this.appService.getUserInfo('User Id');
	    // Subscribe to route params
		this.sub = this.route.params.subscribe(params => {
			if(params['from'] && params['from'] != ""){
				this.fromFav = params['from'];
			}
			self.articleID = params['id'];
			this.appService.MarkNewContentsViewded('recipes',self.articleID);
			
			self.appService.loadArticles('http://muscularstrength.com/recipes_viewer_json.php?rID='+params['id']).subscribe(res => {
				if(res.result === "SUCCESS"){
					res.data.content = res.data.content.replace(new RegExp('src="//www.youtube.com', 'g'), 'src="https://www.youtube.com');
					// Get FB count
					self.getFBCounts(res.data.share_this_link);
					console.log(self.articleDetails);
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
					self.articleDetails = res.data;
					self.isLoaded = true;
					setTimeout(function(){
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
			let link = what == 'LIKE' ? 'http://muscularstrength.com/recipe_like_json.php' : 'http://muscularstrength.com/recipe_unlike_json.php';
			this.appService.loadArticles(link+'?userid='+this.appService.getUserInfo('User Id')+'&commentid='+commentID).subscribe(
				res => {
					console.log('comment like');
					console.log(res);
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
			res => {console.log(res);
				if(res.og_object){
					self.fbCounter = 2*res.og_object.engagement.count;
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
	ngOnDestroy(){
	    this.sub.unsubscribe();	// Clean sub to avoid memory leak
        window.removeEventListener('resize', this.adjustIframes);
	}
	openAboutAuthor(){
		cordova.InAppBrowser.open(this.articleDetails.author[0].author_url, '_blank')
	}


	bindLinkClicks(){
		let currnt = this;
		var allMsgAnc = document.querySelectorAll('.member-comments .msg-block a');
		console.log(allMsgAnc);
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
}
