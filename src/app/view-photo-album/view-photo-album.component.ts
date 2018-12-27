import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppServicesService } from '../app-services.service';

declare var cordova;

@Component({
  selector: 'app-view-photo-album',
  templateUrl: './view-photo-album.component.html',
  styleUrls: ['./view-photo-album.component.css']
})
export class ViewPhotoAlbumComponent implements OnInit {
  pageUrl : string = "http://muscularstrength.com/view_images_videos_json.php";
	profileID : any = null;
	myId : any = null;
	albumID : any = null;
	isLoading: boolean = false;
	noResult: boolean = false;
	loaded : boolean = false;
	albumData : any = [];
	commentsArray : any = [];
  likeOnTheWay : boolean = false;
  CommentText : any = "";
  replyToID : any = 0;
  posting : boolean = false;
  CommentPopupOpen : boolean = false;
  error : string = "";
  constructor(public router: Router,private route: ActivatedRoute, public appService: AppServicesService) { 
  	console.log("Hello there! Phot wale");
  	this.myId = this.appService.getUserInfo('User Id');
  	console.log(this.route.params["_value"]);
  	if(this.route.params["_value"].id && this.route.params["_value"].profileid){
	  	this.profileID = this.route.params["_value"].profileid;
	  	this.albumID = this.route.params["_value"].id;
	  	this.loadData();
  	}else{
  		console.log("ids not found");
  	}
  }

  ngOnInit() {
  }

  loadData(){
  	let data = {
  		action 	   : "POST_VIEW_IMAGES",
  		mid    	   : this.appService.getUserInfo('User Id'),
  		albumID	   : this.albumID,
  		viewUserId : this.profileID
  	};
  	this.isLoading = true;
  	this.appService.postCall(this.pageUrl,data).subscribe(
  		res =>{
  			console.log(res);
  			if(res.status){
	  			for(var i in res['data']['comments']){
  					this.commentsArray.push({
  						open: false,
  						hasLiked: false,
  						hasChildComments: (res['data']['comments'][i]['childcomment'] && res['data']['comments'][i]['childcomment'].length > 0) ? true : false,
  						childCommentsLikes: []
  					});
  					// Check if user has liked comment - Root comment
  					res['data']['comments'][i]['userHasLiked'] = this.checkIfLiked(res['data']['comments'][i]['alluserslike']);
  					// Check if user has liked comment - Child comments
  					if(res['data']['comments'][i]['childcomment'])
  						for (var j = 0; j < res['data']['comments'][i]['childcomment'].length; j++)
  							res['data']['comments'][i]['childcomment'][j]['userHasLiked'] = this.checkIfLiked(res['data']['comments'][i]['childcomment'][j]['allchilduserslike'], true);
				  }

          this.albumData = res;
	  			this.loaded = true;
          let self = this;
          setTimeout(function(){
            self.bindLinkClicks();
          }, 200);

  			}
  			this.isLoading = false;
  		},
  		error =>{
  			console.log(error);
  			this.isLoading = false;
  		}
  	);
  }

  checkIfLiked(allLikes, child?){
	for(var i in allLikes)
		if(allLikes[i].likeuserid == this.myId)
			return true;
	return false;
  }

  viewAllReplies(i){
		this.commentsArray[i].open = !this.commentsArray[i].open;
	}
	
  likeComment(commentID, what, child?, rootCommentID?) {
    let Likedata = {
      action:'POST_LIKE',
      mid:this.myId,
      postID:commentID,
      postType:'SHFcommentsPhotoAlbum',
      profileID:this.profileID,
      doWhat:what 
    }
    if(!this.likeOnTheWay){
      let scope = this;
      this.likeOnTheWay = true;
      this.appService.postCall('http://muscularstrength.com/view_images_videos_json.php', Likedata).subscribe(
        res => {
          console.log(res);
          if(res.status){
            if(!child){
              for(var i in scope.albumData['data']['comments'])
                if(scope.albumData['data']['comments'][i].commentid == commentID){
                  scope.albumData['data']['comments'][i]['userHasLiked'] = what == 'LIKE' ? true : false;
                  scope.albumData['data']['comments'][i]['like'] = (what == 'LIKE') ? scope.albumData['data']['comments'][i]['like']+1 : scope.albumData['data']['comments'][i]['like']-1;
                  break;
                }
            } else {
              for(var i in scope.albumData['data']['comments'])
                if(scope.albumData['data']['comments'][i].commentid == rootCommentID)
                  for(var j in scope.albumData['data']['comments'][i]['childcomment'])
                    if(scope.albumData['data']['comments'][i]['childcomment'][j]['childcommentid'] == commentID){
                      scope.albumData['data']['comments'][i]['childcomment'][j]['userHasLiked'] = what == 'LIKE' ? true : false;
                      scope.albumData['data']['comments'][i]['childcomment'][j]['childlike'] = (what == 'LIKE') ? scope.albumData['data']['comments'][i]['childcomment'][j]['childlike']+1 : scope.albumData['data']['comments'][i]['childcomment'][j]['childlike']-1;
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

  addCommentOrReply(){
    if(this.CommentText != '') {
      this.posting = true;
      let dt = {
        action: 'POST_COMMENT_REPLY',
        mid: this.myId,
        parentPostOwner:this.profileID,
        postType: 'SHFcommentsPhotoAlbum',
        parentPostID: this.albumID,
        sectionID: this.albumID,
        postText: this.appService.ChangeuserCommentLinks(this.CommentText),
        parentID: this.replyToID
      };
      console.log(dt);
      this.appService.postCall(this.pageUrl, dt).subscribe(
        res => {
          this.posting = false;
          this.CommentPopupOpen = false;
          console.log('Comment Posted!!');
          console.log(res);
          if(res.status){
            this.CommentText = '';
            this.refreshMessages();
          } else
            alert('Some error occurred!');
          this.posting = false;
        },
        err => {
          this.posting = false;
          alert('Some error occurred!');
          console.log(err);
        }
      );
    }
  }

  refreshMessages(){
    let data = {
      action      : "POST_VIEW_IMAGES",
      mid         : this.appService.getUserInfo('User Id'),
      albumID     : this.albumID,
      viewUserId : this.profileID
    };
    this.appService.postCall(this.pageUrl,data).subscribe(
      res => {
        if(res.status){
          let newcommentsArray : any =  [];
          for(var i in res['data']['comments']){
            newcommentsArray.push({
              open: false,
              hasLiked: false,
              hasChildComments: (res['data']['comments'][i]['childcomment'] && res['data']['comments'][i]['childcomment'].length > 0) ? true : false,
              childCommentsLikes: []
            });
            // Check if user has liked comment - Root comment
            res['data']['comments'][i]['userHasLiked'] = this.checkIfLiked(res['data']['comments'][i]['alluserslike']);
            // Check if user has liked comment - Child comments
            if(res['data']['comments'][i]['childcomment'])
              for (var j = 0; j < res['data']['comments'][i]['childcomment'].length; j++)
                res['data']['comments'][i]['childcomment'][j]['userHasLiked'] = this.checkIfLiked(res['data']['comments'][i]['childcomment'][j]['allchilduserslike'], true);
          }
          this.commentsArray = newcommentsArray;
          this.albumData['data']['comments'] = res['data']['comments'];
        }
        let self = this;
        setTimeout(function(){
          self.bindLinkClicks();
        }, 200);
      },
      err => {
        console.log('err');
        console.log(err);
        this.error = 'Something went wrong!';
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

}