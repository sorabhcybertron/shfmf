import { RouteReuseStrategy, DetachedRouteHandle, ActivatedRouteSnapshot } from '@angular/router';
import { MealPlanComponent } from './meal-plan/meal-plan.component';
import { LoginComponent } from './login/login.component';

export class CustomReuseStrategy implements RouteReuseStrategy {

    handlers: {[key: string]: DetachedRouteHandle} = {};

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        if (route.component == MealPlanComponent) {
            // return !!route.routeConfig && !!this.handlers[route.routeConfig.path];
            return true;
        }else
            return false;
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        // console.debug('CustomReuseStrategy:store', route, handle);
        if (route.component == MealPlanComponent) {
            this.handlers[route.routeConfig.path] = handle;
        }
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        /*console.log('route.component');
        console.log(route.component);*/
        if (route.component == LoginComponent) {
            this.handlers = {};
            return false;
        }else{
            if (route.component == MealPlanComponent) {
                return !!route.routeConfig && !!this.handlers[route.routeConfig.path];
            }
        }
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        // console.debug('CustomReuseStrategy:retrieve', route);
        if (!route.routeConfig) return null;
        if (route.component == MealPlanComponent) {
            return this.handlers[route.routeConfig.path];
        }
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        /*console.debug('CustomReuseStrategy:shouldReuseRoute', future, curr);
        console.log('future');
        console.log(future);
        console.log('curr');
        console.log(curr);*/
        if (future.component == MealPlanComponent) {
            return future.routeConfig === curr.routeConfig;
        }
        /*if(future.routeConfig !== curr.routeConfig) {
            return false;
        } else if(Object.keys(future.params).length !== Object.keys(curr.params).length ||
        Object.keys(future.queryParams).length !== Object.keys(curr.queryParams).length) {
            return false;
        } else {
        return Object.keys(future.params).every(k => future.params[k] === curr.params[k]) &&
            Object.keys(future.queryParams).every(k => future.queryParams[k] === curr.queryParams[k]);
        }*/
    }

}