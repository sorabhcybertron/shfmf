import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppServicesService } from '../app-services.service';

declare global {
    interface Window { compScope: any; }	// for component scope binding
}
window.compScope = window.compScope || {};

@Component({
	selector: 'app-recipes',
	templateUrl: './recipes.component.html',
	styleUrls: ['../../assets/styles/css.css', './recipes.component.css']
})
export class RecipesComponent implements OnInit {
	public recipesLoaded: any = 0;
	public pagesLoaded: any = 0;
	public displayCount: any = 10;
	public isLoading: boolean = false;
	public containerHgt: any;
	public recipes: any;
	public allRecipesLoaded: boolean = false;
	public searchArticle: any = '';
	public showSearchInput: boolean = false;
	public loadCallSubscribe: any;
	public noResults: any = '';
	public searched: number = 0;

	constructor(public router: Router, public appService: AppServicesService, private zone: NgZone) {
		if(!appService.checkLogin())
			router.navigate(['Login']);
		this.recipes = [];
	}

	public loadMoreRecipes($event, page, displayCount){	// Loads Recipes
	  	let self = this;
		this.noResults = '';
	  	self.isLoading = true;	// set Loading to true to avoid loading again on scroll when already loading
	  	console.log('loading more recipes');
	  	let cont = document.querySelector('.wrap.green');
	  	let contHgt = cont.getBoundingClientRect().height;
	  	let urlToCall = '';
	  	if(this.searchArticle != '')
	  		urlToCall = 'http://muscularstrength.com/recipes_json.php?page='+page+'&display='+displayCount+'&search='+this.searchArticle;
	  	else
	  		urlToCall = 'http://muscularstrength.com/recipes_json.php?page='+page+'&display='+displayCount;
	  	this.loadCallSubscribe = self.appService.loadArticles(urlToCall /*'http://muscularstrength.com/recipes_json.php?page='+page+'&display='+self.displayCount*/).subscribe(res => {
	  		self.zone.run(() => {
		  		console.log(res);
		  		if(res.result === "SUCCESS"){
		  			this.pagesLoaded++;	// Increment PageNumber
		  			for(var i in res.data.recipes){
		  				let tmp = res.data.recipes[i].image;
		  				res.data.recipes[i].image = tmp.split('">')[1].split('</a>')[0];
		  				res.data.recipes[i].description = res.data.recipes[i].description.replace(new RegExp('&rsquo;','g'), "'").replace(new RegExp('&nbsp;','g'), " ").replace(new RegExp('&#39;','g'), "'").replace(new RegExp('&amp;','g'), '&').replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').replace(new RegExp('&ldquo;','g'), '"').replace(new RegExp('&rdquo;','g'), '"');
		  				self.recipes.push(res.data.recipes[i]);
		  				self.recipesLoaded++;
		  			}
		  			console.log(self.recipes);
		  			setTimeout(function(){
		  				let cont = document.querySelector('.wrap.green');
		  				self.containerHgt = cont.getBoundingClientRect().height;	// Update container height
		  			},100);
		  			if(res.data.total_recipes == self.recipesLoaded)
		  				self.allRecipesLoaded = true;
		  			setTimeout(function(){
			  			window.addEventListener('scroll', self.loadRecipesScrollMethod);
		  			}, 100);
		  		}
		  		if(res.result == "FAILURE")
		  			this.noResults = 'No results found';
		  		self.isLoading = false;	// loading finsihed
		  	});
	  	},
	  	err => {
	  		self.zone.run(() => {
	  			self.isLoading = false;	// loading finsihed
	  		});
	  	});
	}

	public loadRecipesScrollMethod($event){	// Detects Scroll and calls method to load more recipes
		var self = this;
	    /*console.log(window.compScope.isLoading);
	    console.log((window.scrollY + window.innerHeight)+', '+window.compScope.containerHgt);*/
		if(window.compScope.isLoading == false && window.compScope.allRecipesLoaded == false){
			if(window.compScope.searchArticle != '' || window.compScope.searched){	// search is active
				if((window.scrollY + window.innerHeight) >= window.compScope.containerHgt - (!window.compScope.showSearchInput ? 45 : 0)){	// time to load somw more recipes
					console.log('yes');
					window.compScope.loadMoreRecipes('', window.compScope.pagesLoaded + 1, window.compScope.displayCount);
				}
			}else	// search not active
				if((window.scrollY + window.innerHeight) >= window.compScope.containerHgt)	// time to load some more articles
					window.compScope.loadMoreRecipes('', window.compScope.pagesLoaded + 1, window.compScope.displayCount);
		}
	}

	articlesSearch($event){
		console.log($event);
		this.recipesLoaded = 0;
		this.pagesLoaded = 0;
		this.searched = 1;
		this.isLoading = true;
		this.recipes = [];
		this.allRecipesLoaded = false;
		window.removeEventListener('scroll', this.loadRecipesScrollMethod);
		this.loadCallSubscribe.unsubscribe();	// drop previos ajax calls if any
		this.loadMoreRecipes('', this.pagesLoaded + 1, this.displayCount);
	}

	toggleSearchInput(){
		this.showSearchInput = !this.showSearchInput;
	}

	ngOnInit() {
		window.compScope = this;
	  	let cont = document.querySelector('.wrap.green');
	  	this.containerHgt = cont.getBoundingClientRect().height;
	  	
	  	// Load recipes initially
	  	this.loadMoreRecipes('', this.pagesLoaded+1, this.displayCount);	// Load 25 recipes

	  	// Bind function on scroll for infinite lloading of recipes
	  	window.addEventListener('scroll', this.loadRecipesScrollMethod);
	}

	ngOnDestroy(){
		console.log('recipes comp destroyed');
		window.removeEventListener('scroll', this.loadRecipesScrollMethod);
	}


}
