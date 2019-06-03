import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router} from '@angular/router';
import { AppServicesService } from '../app-services.service';

declare global {
    interface Window { compScope: any; }	// for component scope binding
}
window.compScope = window.compScope || {};

@Component({
	selector: 'app-articles',
	templateUrl: './articles.component.html',
	styleUrls: ['../../assets/styles/css.css', './articles.component.css']
})
export class ArticlesComponent implements OnInit, OnDestroy {
	public articlesLoaded: any = 0;
	public pagesLoaded: any = 0;
	public displayCount: any = 10;
	public isLoading: boolean = false;
	public containerHgt: any;
	public articles: any;
	public allArticlesLoaded: boolean = false;
	public searchArticle: any = '';
	public showSearchInput: boolean = false;
	public loadCallSubscribe: any;
	public noResults: any = '';
	public searched: number = 0;

	constructor(router: Router, public appService: AppServicesService, private zone: NgZone) {
		this.articles = [];
		if(!appService.checkLogin())
			router.navigate(['Login']);
	}

	public loadMoreArticle($event, page, displayCount){	// Loads Articles
	  	console.log('loading more articles');
		/*console.log($event);
		console.log(page);
		console.log(displayCount);*/
		let self = this;
		this.noResults = '';
	  	self.isLoading = true;	// set Loading to true to avoid loading again on scroll when already loading
	  	let cont = document.querySelector('.wrap.crimson'); // To fetch articles container height when done loading articles
	  	// let contHgt = cont.getBoundingClientRect().height;
	  	let urlToCall = '';
	  	if(this.searchArticle != '')
	  		urlToCall = 'http://muscularstrength.com/article_listing_new_json.php?page='+page+'&display='+displayCount+'&search='+this.searchArticle;
	  	else
	  		urlToCall = 'http://muscularstrength.com/article_listing_new_json.php?page='+page+'&display='+displayCount;
	  	this.loadCallSubscribe = self.appService.loadArticles(urlToCall).subscribe(res => {
	  		self.zone.run(() => {
		  		console.log(res);
		  		if(res.result === "SUCCESS"){
		  			this.pagesLoaded++;	// Increment PageNumber
		  			for(var i in res.data.articles){
		  				let tmp = res.data.articles[i].image;
		  				res.data.articles[i].image = tmp.split('">')[1].split('</a>')[0];
		  				res.data.articles[i].description = res.data.articles[i].description.replace(new RegExp('&rsquo;','g'), "'").replace(new RegExp('&nbsp;','g'), " ").replace(new RegExp('&#39;','g'), "'").replace(new RegExp('&amp;','g'), '&').replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').replace(new RegExp('&ldquo;','g'), '"').replace(new RegExp('&rdquo;','g'), '"');
		  				self.articles.push(res.data.articles[i]);
		  				self.articlesLoaded++;
		  			}
		  			console.log(self.articles);
		  			setTimeout(function(){
		  				let cont = document.querySelector('.wrap.crimson');
		  				self.containerHgt = cont.getBoundingClientRect().height;	// Update container height
		  			},100);
		  			if(res.data.total_articles == self.articlesLoaded)
		  				self.allArticlesLoaded = true;
		  			setTimeout(function(){
			  			window.addEventListener('scroll', self.loadArticlesScrollMethod);
		  			}, 100);
		  		}
		  		if(res.result == "FAILURE")
		  			this.noResults = 'No results found';
		  		self.isLoading = false;	// loading finsihed
	  		})
	  	},
	  	err => {
	  		self.zone.run(() => {
	  			self.isLoading = false;	// loading finsihed
	  		});
	  	});
	}

	public loadArticlesScrollMethod($event){	// Detects Scroll and calls method to load more articles
	  	var self = this;
	    console.log(window.compScope.isLoading);
	    // console.log((window.scrollY + window.innerHeight)+', '+window.compScope.containerHgt);
		if(window.compScope.isLoading == false && window.compScope.allArticlesLoaded == false){
			if(window.compScope.searchArticle != '' || window.compScope.searched){	// search is active
				if((window.scrollY + window.innerHeight) >= window.compScope.containerHgt - (!window.compScope.showSearchInput ? 45 : 0)){	// time to load some more articles
					window.compScope.loadMoreArticle('', window.compScope.pagesLoaded + 1, window.compScope.displayCount);
				}
			}else	// search not active
				if((window.scrollY + window.innerHeight) >= window.compScope.containerHgt)	// time to load some more articles
					window.compScope.loadMoreArticle('', window.compScope.pagesLoaded + 1, window.compScope.displayCount);
		}
	}

	articlesSearch($event){
		console.log($event);
		this.articlesLoaded = 0;
		this.pagesLoaded = 0;
		this.searched = 1;
		this.isLoading = true;
		this.articles = [];
		this.allArticlesLoaded = false;
		window.removeEventListener('scroll', this.loadArticlesScrollMethod);
		this.loadCallSubscribe.unsubscribe();	// drop previos ajax calls if any
		this.loadMoreArticle('', this.pagesLoaded + 1, this.displayCount);
	}

	toggleSearchInput(){
		this.showSearchInput = !this.showSearchInput;
	}

	ngOnInit() {
	  	window.compScope = this;
	  	let cont = document.querySelector('.wrap.crimson');
	  	this.containerHgt = cont.getBoundingClientRect().height;
	  	
	  	// Load articles initially
	  	this.loadMoreArticle('', this.pagesLoaded+1, this.displayCount);	// Load 25 articles

	  	// Bind function on scroll for infinite loading of articles
	  	window.addEventListener('scroll', this.loadArticlesScrollMethod);
	}

	ngOnDestroy(){
		console.log('articles comp destroyed');
		window.removeEventListener('scroll', this.loadArticlesScrollMethod);
	}
}