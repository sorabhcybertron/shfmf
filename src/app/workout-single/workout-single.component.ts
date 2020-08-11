import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppServicesService } from '../app-services.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ConsultationComponent } from '../consultation/consultation.component';

declare var cordova;

@Component({
	selector: 'app-workout-single',
	templateUrl: './workout-single.component.html',
	styleUrls: [
		'../../assets/styles/css.css',
		'../recipe-details/recipe-details.component.css',
		'../programs-inner/programs-inner.component.css',
		'../routine-single/routine-single.component.css',
		'../common_styles/newcomment_style.css'
	]
})
export class WorkoutSingleComponent implements OnInit {
	public baseUrl: any = 'http://muscularstrength.com/m_routines_json.php?';
	public videourl : any = '';
	public VideoExerciseIcon : string = '';
	public rouType :  any = null;
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
	public commentTo: String = '';
	public CommentPopupOpen: boolean = false;
	public showyoutubeVideo: any = false;
	public replyToID: any;
	public routineID: any = '';
  public myId: any = '';
  public backUrl: string;
  public authorURL: string;
  public fromFav:  string = ''; 

	/* FOR LIKING A COMMENT */
	public likeOnTheWay: boolean = false;

	constructor(private location: Location, public router:Router, public appService: AppServicesService, private route: ActivatedRoute, public sanitizer: DomSanitizer/*, public winRef: WindowRef*/) {
	}
	navigateTopage(){
		if(this.fromFav == 'fav'){
			this.router.navigate(['/MyProfile']);
		}else if(this.fromFav == 'newNotify'){
			this.router.navigate(['/newcontent']);
		}
	}

	ngOnInit() {
    this.backUrl = window.localStorage.getItem('backPath');
		// window.localStorage.removeItem('backPath');
		console.clear();
		this.appService.setAuthorUrl(this.route.url["_value"]);
		let self = this;
		this.myId = this.appService.getUserInfo('User Id');
		this.sub = this.route.params.subscribe(params => {
			self.routineID = params['id'];
			this.appService.MarkNewContentsViewded('workouts',self.routineID);
			self.baseUrl += 'rid='+params['id']+'&mid='+self.appService.getUserInfo('User Id');
			if(params['type'] && params['type'] == "exercise"){
				this.rouType = "exercise";
			}
			if(params['from'] && params['from'] != ""){
				this.fromFav = params['from'];
			}
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

					if(self.routine.video){
						this.videourl = '';
					}else{
						this.videourl = self.routine.exerciseCustomVideo+'';
						this.VideoExerciseIcon = self.routine.exerciseIcon;
					}
					
					this.chnageYoutube(true);

					if(self.routine.downloadable_resources.calendar.link != '')
						self.calendarLink = self.routine.downloadable_resources.calendar.link;
					else if(self.routine.description && self.routine.description != '' && self.routine.description.indexOf('specialDownload') != -1)
						self.calendarLink = self.routine.description.split('specialDownload')[1].split('href="')[1].split('"')[0];
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
			let rType =  this.rouType == "exercise" ?  '&tb=SHFcommentsExercisesLikes' : '';
			this.appService.loadArticles(link+'?userid='+this.appService.getUserInfo('User Id')+'&commentid='+commentID+rType).subscribe(
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
		let rType =  this.rouType == "exercise" ?  'SHFcommentsExercises' : '';
		//this.CommentText = this.CommentText.replace("@"+this.commentTo,"<a href='https://muscularstrength.com/"+this.commentTo+"'>@"+this.commentTo+"</a>");
		let text = this.appService.ChangeuserCommentLinks(this.CommentText);
		if(text != '') {
			// ?userid=' + this.appService.getUserInfo('User Id') + 
			// '&content=' + this.CommentText + '&articleid=' + this.routineID +
			 // '&commentid=' + this.replyToID+rType
			let dt = {
				userid: this.appService.getUserInfo('User Id'),
				content: text,
				articleid: this.routineID,
				commentid: this.replyToID,
				tb: rType
			};

			// console.log('reply to called'+ this.appService.getUserInfo('User Id'));
			this.appService.postCall('http://muscularstrength.com/routine_reply_json.php',dt).subscribe(
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
		window.history.back();
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
		/*let container = document.getElementsByClassName('routine-details') as HTMLCollectionOf<HTMLDivElement>;
		container[0].addEventListener('click', function(e){
			console.log('clicked');
			console.log(e);
			console.log('tag', e.srcElement.tagName.toLowerCase());
			if(e.srcElement.tagName.toLowerCase() == 'a'){
				console.log('is link');
				e.preventDefault();
				let link = e.srcElement.getAttribute('href');
				console.log('prevented');
				console.log('link: '+link);
				if(link != '#' && link != ''){
					console.log('opening url');
					cordova.InAppBrowser.open(link, '_system');
				}
				return false;
			}
		}, false);*/
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
		cordova.InAppBrowser.open(link, '_system');
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
	}
}	
