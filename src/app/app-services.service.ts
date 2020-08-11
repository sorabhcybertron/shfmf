import { Injectable } from '@angular/core';
import { Http, Headers,RequestOptions } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

@Injectable()
export class AppServicesService {
	public siteBaseUrl = "https://muscularstrength.com/";
	public admin_url_array : any = [];
	public loadRecipeId: number;
	public workoutsTab: any = '';
	public isLoggedin: boolean = false;
	public loginChange: Subject<boolean> = new Subject<boolean>();
	public favorites :any = null;
	public newContents :any = null;
	public deviceToken :any = null;
	constructor(public http:Http) {
		this.loginChange.subscribe((value) => {
			console.log('value');
			console.log(value);
            this.isLoggedin = value
        });
        this.updateFavorite();
        this.getNewContents();
	}

	public setLogin(what){	// true for login, false for not
		window.localStorage.setItem('loggedIn', what);
		this.loginChange.next(what);
		if(what){
			this.updateFavorite();  //update Favorites ;
			this.getNewContents();
		}
	}

	public checkLogin(){	// Global check login method to redirect user to login page if not logged in
		this.isLoggedin = window.localStorage.getItem('loggedIn') == 'true' ? true : false;
		return this.isLoggedin;
	}

	public postCall(url, data, map?){
		let toSend = '';
        for(var i in data){
            toSend += toSend == '' ? '' : '&';
			if(typeof data[i] == 'object')
				toSend += i +'='+ JSON.stringify(data[i]);
			else
				toSend += i +'='+ data[i];
        }
        // console.log(toSend);
        url = this.filterulr(url);
        var hdr = new Headers();
        hdr.append('Content-Type', 'application/x-www-form-urlencoded');
        return this.http.post(url, toSend, { headers: hdr }).map(res => res.json());
	}

	public forgetpassword(un){ 
        return this.http.get(this.siteBaseUrl+'app_forget_password.php?frm_get_password=1&frm_email='+un).map(res => res.json());
  } 

  public resetpassword(uname,pass,otp){
	// var headers = new Headers();
    // headers.append("Accept", 'application/json');
    // headers.append('Content-Type', 'application/json' );
    // const requestOptions = new RequestOptions({ headers: headers });
  	 let data = {frm_set_password :1, frm_email : uname, new_password: pass, otp:otp};
      return this.http.post(this.siteBaseUrl+'app_forget_password.php', data).map(res => res.json());
  }

	public getCall(url: string){
		url = this.filterulr(url);
		return this.http.get(url).map( res => res.json());
	}

	public loginUser(un,ps){	// Login call
		// un = encodeURI(un);
		// ps = encodeURI(ps);
		// let data = {user : un, pass : ps, app:1, action:'appLogin'}
		// return this.postCall(this.siteBaseUrl+'checkUser.php',data);
		// return this.http.get(this.siteBaseUrl+'checkUser.php?user='+un+'&pass='+ps+'&app=1').map(res => res.json());
		un = un;
        ps = ''+ps;
        let data = {user : un, pass : ps, app:1, action:'appLogin'}
        return this.http.post(this.siteBaseUrl+'checkUser.php', data).map(res => res.json());
	}

	public appExit(currentUrl){
		if(currentUrl == '/Login' && !this.checkLogin()){}
	}

	public loadArticles(url){	// loads Articles, Recipes
		url = this.filterulr(url);
		return this.http.get(url).map(res => res.json());
	}
	public loadArticlesPost(url, data){    // loads Articles, Recipes
        url = this.filterulr(url);
        return this.http.post(url, data).map(res => res.json());
    }
    
	public filterulr(url){
		return url.replace('http://muscularstrength.com',this.siteBaseUrl);
	}
	public getUserInfo(req_param){
		let strdItem = JSON.parse(window.localStorage.getItem('userInfo'));
		if(strdItem !== null && strdItem[req_param])
			return strdItem[req_param];
		else
			return '';
	}
	public activeWorkoutsTab(set?, val?){
		if(set)
			this.workoutsTab = val;
		else
			return this.workoutsTab;
	}

	public getAuthorUrl(){
		return window.localStorage.getItem('authorback');
	}

	public setAuthorUrl(urlElementarray){
		let authorback = "";
		urlElementarray.forEach(element => {
				authorback += element.path+"/";
			});
		authorback=authorback.substring(0,authorback.length-1);
		window.localStorage.setItem('authorback',authorback);
		this.admin_url_array = [];
	}
	public  ChangeuserCommentLinks(texts){
		let newText = texts.replace(/(@\S+)/gi,"<a href='/$1'>$1</a>");
		newText = newText.replace(/(\/@)/gi,"/");
		console.log(newText,texts);
		return newText;
	}

	updateFavorite(page = 1, display = 10){
		if(this.checkLogin()){
			let userID =  this.getUserInfo('User Id');
			if(userID){
				let data = { view_fav : 'view', mid : userID ,page:page,display:display}
				this.postCall(this.siteBaseUrl+'app_favorite_stuff_json.php',data).subscribe(
					res => {
						if(res.status) this.favorites  = res.data;
						else this.favorites = null;
					},
					err => {
						this.favorites = null;
					}
				);;
			}
		}else{
			this.favorites = null;
		}
	}

	checkIfFavorite(type,id){
		if(this.checkLogin()){
			let userID =  this.getUserInfo('User Id');
			if(userID){
				if(this.favorites){
					let item : any ; 
					if(type=='recipes'){
						item = this.favorites.recipes.find(x => { return x.fav_item_id == id ? x : false; });
						return item;
					}else if(type=='article'){
						item = this.favorites.article.find(x => { return x.fav_item_id == id ? x : false; });
						return item;
					}else if(type=='routines'){
						item = this.favorites.routines.find(x => { return x.fav_item_id == id ? x : false; });
						return item;
						
					}else if(type=='exercises'){
						item = this.favorites.exercises.find(x => { return x.fav_item_id == id ? x : false; });
						return item;
					}else if(type=='programs'){
						item = this.favorites.programs.find(x => { return x.fav_item_id == id ? x : false; });
						return item;
					}
				}else return false;
			}else return false
		}else{
			return false;
		}
	}

	getNewContents(){
		if(this.checkLogin()){
			let userID =  this.getUserInfo('User Id');
			if(userID){
				let data = {mid : userID}
				this.postCall(this.siteBaseUrl+'app_new_content_check.php',data).subscribe(
					res =>{
						if(res.status){
							this.newContents  = res.data;
						} 
						else this.newContents = null;
					},
					err=>{
						this.newContents = null;
					}
				);
			}
		}else{
			this.newContents = null;
		}
	}

	checkIfNewContents(type,id){
		if(this.checkLogin()){
			let userID =  this.getUserInfo('User Id');
			if(userID){
				if(this.newContents){
					let item : any ; 
					if(type=='recipes'){
						item = this.newContents.recipes.find(x => { return x[0] == id ? x : false; });
						return item;
					}else if(type=='articles'){
						item = this.newContents.articles.find(x => { return x[0] == id ? x : false; });
						return item;
					}else if(type=='workouts'){
						item = this.newContents.workouts.find(x => { return x[0] == id ? x : false; });
						return item;
						
					}else if(type=='programs'){
						item = this.newContents.programs.find(x => { return x[0] == id ? x : false; });
						return item;
					}
				}else return false;
			}else return false
		}else{
			return false;
		}
	}

	GetAllCountOfNewContents(){
		if(this.checkLogin()){
			let userID =  this.getUserInfo('User Id');
			if(userID){
				if(this.newContents){
					let count  = 0;
					count += this.newContents.recipes.length;
					count += this.newContents.articles.length;
					count += this.newContents.workouts.length;
					count += this.newContents.programs.length;
					return count;
				}else return 0;
			}else return 0
		}else{
			return 0;
		}
	}

	MarkNewContentsViewded(type,id){
		if(this.checkLogin()){
			let userID =  this.getUserInfo('User Id');
			if(userID){
				let data = {mid : userID,update_record:'update',type:type,id:id}
				this.postCall(this.siteBaseUrl+'app_new_content_check.php',data).subscribe(
					res =>{
						this.getNewContents();
					},
					err=>{
					}
				);
			}else return false
		}else{
			return false;
		}
	}

	//FCM

	addTokenId(id){
	    if(id && this.deviceToken){
	      let data = {
	          update_record: 'update',
	          deviceID : this.deviceToken,
	          userID : id
	      };
	      
	      this.postCall(this.siteBaseUrl+'SHFadmin/app_update_device_token.php',data).subscribe(
	      	res=>{
	      		if(res.status){
	      			let strdItem = JSON.parse(window.localStorage.getItem('userInfo'));
					if(strdItem !== null){
						strdItem['device_ids'] =  res.data.device_id;
						window.localStorage.setItem('userInfo', JSON.stringify(strdItem));
					}
	      		}
	      	}	
	      );
	    }
	}

	removeToken(id){
		if(id && this.deviceToken){
	      let data = {
	          update_record: 'delete',
	          deviceID : this.deviceToken,
	          userID : id
	      };

	      this.postCall(this.siteBaseUrl+'SHFadmin/app_update_device_token.php',data).subscribe(
	      );
	    }
	}

	simplePostCall(url, data, map?){
       url = this.filterulr(url);
       return this.http.post(url, data).map(res => res.json());
    }


}
