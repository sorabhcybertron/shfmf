import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { JoinComponent } from './join/join.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ArticlesComponent } from './articles/articles.component';
import { CommunityComponent } from './community/community.component';
import { ExclusivesComponent } from './exclusives/exclusives.component';
import { ProgramsComponent } from './programs/programs.component';
import { RecipesComponent } from './recipes/recipes.component';
import { WorkoutsComponent } from './workouts/workouts.component';
import { WorkoutsDetailComponent } from './workouts-detail/workouts-detail.component';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ProgramsDetailComponent } from './programs-detail/programs-detail.component';
import { AppServicesService } from './app-services.service';
import { RecipeDetailsComponent } from './recipe-details/recipe-details.component';
import { SafeHtmlPipe } from './recipe-details/recipe-details.component';
import { SafeUrlPipe } from './recipe-details/recipe-details.component';
import { ArticleDetailsComponent } from './article-details/article-details.component';

import { ProgramsInnerComponent } from './programs-inner/programs-inner.component';
import { RoutineSingleComponent } from './routine-single/routine-single.component';
import { ConsultationComponent } from './consultation/consultation.component';

import { MealPlanComponent } from './meal-plan/meal-plan.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { WorkoutSingleComponent } from './workout-single/workout-single.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './custom_route_reuse_strategy';
import { UpgradeMembershipComponent } from './upgrade-membership/upgrade-membership.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { WorkoutExercisesComponent } from './workout-exercises/workout-exercises.component';
import { WorkoutRoutinesComponent } from './workout-routines/workout-routines.component';
import { AnotherUsersProfileComponent } from './another-users-profile/another-users-profile.component';
import { CustomizeAvatarComponent } from './customize-avatar/customize-avatar.component';
import { LiftsComponent } from './lifts/lifts.component';
import { FriendsComponent } from './friends/friends.component';
import { AboutAuthorComponent } from './about-author/about-author.component';
import { AuthorDetailComponent } from './author-detail/author-detail.component';
import { ViewPhotoAlbumComponent } from './view-photo-album/view-photo-album.component';
import { ViewVideoAlbumComponent } from './view-video-album/view-video-album.component';
import { LikeButtonComponent } from './like-button/like-button.component';
import { NewContentBadgeComponent } from './new-content-badge/new-content-badge.component';

const appRoutes: Routes = [
   { path: 'Login', component: LoginComponent }, 
   { path: 'Register', component: JoinComponent },
   { path: 'Dashboard', component: DashboardComponent },
   { path: 'Articles', component: ArticlesComponent },
   { path: 'Articles/:id', component: ArticleDetailsComponent },
   { path: 'Articles/:id/:from', component: ArticleDetailsComponent },
   { path: 'Community', component: CommunityComponent },
   { path: 'Exclusives', component: ExclusivesComponent },
   { path: 'Programs', component: ProgramsComponent },
   { path: 'Programs/:link/:recordLink/:dbTable', component: ProgramsInnerComponent },
   { path: 'Programs/:link/:recordLink/:dbTable/:programid', component: ProgramsInnerComponent },
   { path: 'Programs/:link/:recordLink/:dbTable/:from', component: ProgramsInnerComponent },
   { path: 'Programs/:link/:recordLink/:dbTable/:programid/:from', component: ProgramsInnerComponent },
   { path: 'Routine/:id', component: RoutineSingleComponent },  // load Routine, linked to programs listing page
   { path: 'Routine/:id/:programid', component: RoutineSingleComponent },  // load Routine, linked to programs listing page
   { path: 'ProgramsDetail', component: ProgramsDetailComponent },
   { path: 'Recipes', component: RecipesComponent },
   { path: 'Recipes/:id', component: RecipeDetailsComponent },
   { path: 'Recipes/:id/:from', component: RecipeDetailsComponent },
   { path: 'Workouts', component: WorkoutsComponent },
   { path: 'Workouts/:id', component: WorkoutSingleComponent },
   { path: 'Workouts/:id/:type', component: WorkoutSingleComponent },
   { path: 'Workouts/:id/:type/:from', component: WorkoutSingleComponent },
   { path: 'WorkoutsDetail', component: WorkoutsDetailComponent },
   /*{ path: 'CustomizeAvatar', component: CustomizeAvatarComponent },
   { path: 'Lifts', component: LiftsComponent },*/
   { path: 'MealPlan', component: MealPlanComponent },
   { path: 'MyAccount', component: MyAccountComponent },
   { path: 'MyProfile', component: MyProfileComponent },
   { path: 'Authors/:id', component: AuthorDetailComponent },
   { path: 'Authors/:id/:uname', component: AuthorDetailComponent },
   // { path: 'AnotherUser/:id', component: AnotherUsersProfileComponent },
   { path: 'UpgradeMembership', component: UpgradeMembershipComponent },
   { path: 'UpgradeMembership/:showGold', component: UpgradeMembershipComponent },
   { path: 'AboutAuthor/:url', component: AboutAuthorComponent },
   { path: 'view-album/photos/:id/:profileid', component: ViewPhotoAlbumComponent },
   { path: 'view-album/videos/:id/:profileid', component: ViewVideoAlbumComponent }
   // { path: 'Friends', component: FriendsComponent },
   // { path:'', redirectTo: '/Dashboard', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    JoinComponent,
    DashboardComponent,
    ArticlesComponent,
    CommunityComponent,
    ExclusivesComponent,
    ProgramsComponent,
    RecipesComponent,
    RecipeDetailsComponent,
    WorkoutsComponent,
    WorkoutsDetailComponent,
    HeaderComponent,
    ProgramsDetailComponent,
    ArticleDetailsComponent,
    SafeHtmlPipe,
    SafeUrlPipe,
    ProgramsInnerComponent,
    RoutineSingleComponent,
    ConsultationComponent,
    MealPlanComponent,
    MyAccountComponent,
    WorkoutSingleComponent,
    UpgradeMembershipComponent,
    MyProfileComponent,
    WorkoutExercisesComponent,
    WorkoutRoutinesComponent,
    AnotherUsersProfileComponent,
    CustomizeAvatarComponent,
    LiftsComponent,
    FriendsComponent,
    AboutAuthorComponent,
    AuthorDetailComponent,
    ViewPhotoAlbumComponent,
    ViewVideoAlbumComponent,
    LikeButtonComponent,
    NewContentBadgeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  providers: [
    AppServicesService,
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
