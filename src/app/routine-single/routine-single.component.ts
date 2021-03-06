import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppServicesService } from '../app-services.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ConsultationComponent } from '../consultation/consultation.component';
// import { WindowRef } from '../WindowRef';

declare var cordova;

@Component({
	selector: 'app-routine-single',
	templateUrl: './routine-single.component.html',
	styleUrls: ['../../assets/styles/css.css', '../recipe-details/recipe-details.component.css', '../programs-inner/programs-inner.component.css', './routine-single.component.css', '../common_styles/newcomment_style.css']
})
export class RoutineSingleComponent implements OnInit {
	public baseUrl: any = 'http://muscularstrength.com/m_routines_json.php?';
	public videourl : any = '';
	public VideoExerciseIcon : string = '';
	public sub: any;
	public routine: any;
	public error: any = '';
	public loading: any = true;
	public commentsArray: any = [];
	public imgoverlayActive: boolean = false;
	public imgSrc: string = '';
	public calendarLink: string = '';
	public coachingpopup: boolean = false;
	public CommentText: any = '';
	public CommentPopupOpen: boolean = false;
	public showyoutubeVideo: any = false;
	public replyToID: any;
	public routineID: any = '';
  public myId: any = '';
  public backUrl: string;
  public authorURL: string;
  public programID : number = 0;

	/* FOR LIKING A COMMENT */
	public likeOnTheWay: boolean = false;

	constructor(public appService: AppServicesService,public router : Router, private route: ActivatedRoute, public sanitizer: DomSanitizer, public location: Location/*, public winRef: WindowRef*/) {}

	ngOnInit() {
    console.clear();
    this.appService.setAuthorUrl(this.route.url["_value"]);
    this.backUrl = window.localStorage.getItem('backPath');
		// window.localStorage.removeItem('backPath');
		let self = this;
		this.myId = this.appService.getUserInfo('User Id');
		this.sub = this.route.params.subscribe(params => {
			self.routineID = params['id'];
			if(params['programid']){
				self.programID = params['programid'];
			}
			self.baseUrl += 'rid='+params['id']+'&mid='+self.appService.getUserInfo('User Id');
			self.appService.loadArticles(self.baseUrl).subscribe(res => {
				console.log(res);
				if(res.status){
					console.log('calendarLink');
					console.log(self.calendarLink);
					for(var i in res.comments) {
						self.commentsArray.push({
							open: false,
							hasLiked: false,
							hasChildComments: (res.comments[i]['childcomment'] && res.comments[i]['childcomment'].length > 0) ? true : false
						});
						// Check if user has liked comment - Root comment
						res.comments[i]['userHasLiked'] = (res.comments[i]['alluserslike'] && res.comments[i]['alluserslike'].length > 0) ? self.checkIfLiked(res.comments[i]['alluserslike']) : false;
						// Check if user has liked comment - Child comments
						if(res.comments[i]['childcomment'])
							for (var j in res.comments[i]['childcomment'])
								res.comments[i]['childcomment'][j]['userHasLiked'] = (res.comments[i]['childcomment'][j]['allchilduserslike'] && res.comments[i]['childcomment'][j]['allchilduserslike'].length > 0) ? self.checkIfLiked(res.comments[i]['childcomment'][j]['allchilduserslike'], true) : false;
					}
					self.routine = res;
					console.log(this.routine);
					if(this.routine.video){
						this.videourl = this.routine.video;
					}else{
						this.videourl = this.routine.exerciseCustomVideo+'';
						this.VideoExerciseIcon = self.routine.exerciseIcon;
					}

					this.chnageYoutube(true);
					// if(self.routine.description && self.routine.description != '' && self.routine.description.indexOf('specialDownload') != -1)
					if(self.routine.downloadable_resources)
						self.calendarLink = self.routine.downloadable_resources.calendar.link;
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
						self.adjustIframes();
						self.bindLinkClicks();
					}, 200);
					window.addEventListener('resize', self.adjustIframes);
				}else
					self.error = 'Some error occurred!';
				self.loading = false;
				this.authorURL = 'https://muscularstrength.com/'+this.routine.posted_by.name;
			},
			err => {
				console.log('err');
				console.log(err);
				self.error = "Something went wrong!";
			});
		});
	}
	
	goBackto(){
    	this.location.back();
  	}


	likeComment(commentID, what, child?, rootCommentID?) {
		if(!this.likeOnTheWay){
			console.log('like called');
			this.likeOnTheWay = true;
			let scope = this;
			let link = what == 'LIKE' ? 'http://muscularstrength.com/routine_like_json.php' : 'http://muscularstrength.com/routine_unlike_json.php';
			this.appService.loadArticles(link+'?userid='+this.appService.getUserInfo('User Id')+'&commentid='+commentID).subscribe(
				res => {
					// console.log('comment like');
					// console.log(res);
					if(res.result == 'SUCCESS'){
						if(!child) {
							for(var i in scope.routine.comments)
								if(scope.routine.comments[i].commentid == commentID){
									scope.routine.comments[i]['userHasLiked'] = what == 'LIKE' ? true : false;
									scope.routine.comments[i]['like'] = (what == 'LIKE') ? scope.routine.comments[i]['like']+1 : scope.routine.comments[i]['like']-1;
									break;
								}
						} else {
							for(var i in scope.routine.comments)
								if(scope.routine.comments[i].commentid == rootCommentID)
									for(var j in scope.routine.comments[i]['childcomment'])
										if(scope.routine.comments[i]['childcomment'][j]['childcommentid'] == commentID){
											scope.routine.comments[i]['childcomment'][j]['userHasLiked'] = what == 'LIKE' ? true : false;
											scope.routine.comments[i]['childcomment'][j]['childlike'] = (what == 'LIKE') ? scope.routine.comments[i]['childcomment'][j]['childlike']+1 : scope.routine.comments[i]['childcomment'][j]['childlike']-1;
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

	replyTo() {
		let self = this;
        if(this.CommentText != '') {
        	let text  =  this.appService.ChangeuserCommentLinks(this.CommentText);
			// console.log('reply to called'+ this.appService.getUserInfo('User Id'));
			this.appService.loadArticles('http://muscularstrength.com/routine_reply_json.php?userid=' + this.appService.getUserInfo('User Id') + '&content=' + text + '&articleid=' + this.routineID + '&commentid=' + this.replyToID).subscribe(
				res => {
					console.clear();
					console.log(res);
					if(res.result == "SUCCESS"){
						console.log('refreshing comments...');
						self.appService.loadArticles(self.baseUrl).subscribe(res => {
							console.log('ressss');
							console.log(res);
							if(res.status){
								var commentsLatest = [];
								for(var i in res.comments){
									// Accordion
									commentsLatest.push({
										open: false,
										hasLiked: false,
										hasChildComments: (res.comments[i]['childcomment'] && res.comments[i]['childcomment'].length > 0) ? true : false
									});
									// Check if user has liked comment - Root comment
									res.comments[i]['userHasLiked'] = (res.comments[i]['alluserslike'] && res.comments[i]['alluserslike'].length > 0) ? self.checkIfLiked(res.comments[i]['alluserslike']) : false;
									// Check if user has liked comment - Child comments
									if(res.comments[i]['childcomment'])
										for (var j in res.comments[i]['childcomment'])
											res.comments[i]['childcomment'][j]['userHasLiked'] = (res.comments[i]['childcomment'][j]['allchilduserslike'] && res.comments[i]['childcomment'][j]['allchilduserslike'].length > 0) ? self.checkIfLiked(res.comments[i]['childcomment'][j]['allchilduserslike'], true) : false;
								}
								self.commentsArray = commentsLatest;
								// console.clear();
								/*console.log('self.commentsArray');
								console.log(self.commentsArray);*/
								console.log("res.comments");
								console.log(res.comments);
								self.routine.comments = res.comments;
								setTimeout(function(){
									self.bindLinkClicks();
								}, 200);
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

	downloadResource(link){
		cordova.InAppBrowser.open(link, '_system');
	}

	shareRoutine(where){
		console.log('cordova');
		console.log(cordova);
		switch(where){
			case 'FB':
				break;
			case 'FB':
				break;
			case 'FB':
				break;
			case 'FB':
				break;
		}
	}

	viewAllReplies(i){
		this.commentsArray[i].open = !this.commentsArray[i].open;
		// console.log(this.commentsArray[i]);
	}

	showOverlay(i){
		this.imgSrc = this.routine.images[i].large;
		this.imgoverlayActive = true;
	}

	cleanURL(l){
		return this.sanitizer.bypassSecurityTrustResourceUrl(l);
	}

	hideOverlay(){
		this.imgoverlayActive = false;
	}

	hideCoachingOverlay(){
		this.coachingpopup = false;
	}

	goBack(){
		this.location.back();
		return false;
	}

	adjustIframes(){
	    let iframes = document.getElementsByTagName('iframe') as HTMLCollectionOf<HTMLIFrameElement>;
	    console.log('working on adjusting iframe height...');
	    for (var i = 0; i < iframes.length; i++){
	    	let width = iframes[i].getBoundingClientRect().width / 1.784;
	        iframes[i].style.height = width+'px';
	    }
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

	ngOnDestroy() {
		window.removeEventListener('resize', this.adjustIframes);
		this.sub.unsubscribe();
	}
	openAboutAuthor(){
		cordova.InAppBrowser.open('https://muscularstrength.com/'+this.routine.posted_by.name, '_blank')
	}

	chnageYoutube(t){
		if(t==true){
			this.showyoutubeVideo = '<iframe src="'+this.routine.video+'"></iframe>';
		}else{
			this.showyoutubeVideo = '';
		}

		console.log(this.showyoutubeVideo);
	}
}
