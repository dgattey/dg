import {Injectable} from 'angular2/core';
import {Http, Headers, Response, HTTP_PROVIDERS} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';

import { Project } from '../models/project.model';

@Injectable()
export class WPService {
	private _endpoint: string;
	private _routes: JSON;
	private _routesReady: boolean;
	constructor(private _http: Http) {
		this._endpoint = 'https://dylangattey.com/wp-json/';
		
		// Sets up route structure - lazily initialized
		let routes: any = {
			'projects': '',
			'pages': '',
			'posts': '',
			'media': ''
		};
		this._routes = <JSON>routes;
		this._routesReady = false;
	}

	///////////////////////////////////////////////////////////
	// Public API
	///////////////////////////////////////////////////////////

	// Simply returns all projects
	getProjects(): Observable<Array<Project>> {
		return this.getRoutes()
		.flatMap(routes => this._http.get(routes['projects']))
		.map((res: Response) => res.json())

		// Take raw project data and create array of projects
		.map(data => {
			let projs: Array<Project> = new Array<Project>();
			for (var i in data){
				projs.push(new Project(data[i]));
			}
			return projs;
		})

		// Error?
		.catch(this.handleError);
	}

	///////////////////////////////////////////////////////////

	// Sets up routes for whole API. As the WP API is self describing,
	// it should tell us about all the possible routes, and we only care
	// about a subset we specified above.
	private getRoutes(): Observable<JSON> {
		// var returnedRoutes = new Observable<JSON>();
		// if (this._routesReady) {
		// 	console.log('Used cached routes');
		// 	return returnedRoutes;
		// }
		// TODO: cached routes

		// Fetch the routes
		return this._http.get(this._endpoint)
			.map(res => res.json())
			.map(json => this.associateRoutes(json['routes']))
			.catch(this.handleError);
	}

	private handleError(error: Response) {
		console.error(error);
		return Observable.throw(error.json().error || 'Server error');
	}

	// For possible routes, it associates them with a matching saved one
	private associateRoutes(possibleRoutes: JSON): JSON {
		var saveRoute = function(path: string, savedRoutes: JSON) {

			// Loop over each saved route and check if this is one of them
			for (var r in savedRoutes) {
				if (savedRoutes[r] != '' || path.indexOf(r) < 0) {
					continue; // keep going to find another
				}

				// Route was one we want
				savedRoutes[r] = possibleRoutes[path]._links['self'];
				return;
			}
		}

		// Loop over possible routes and check them
		for (var path in possibleRoutes) {
			saveRoute(path, this._routes);
		}

		// Callback!
		this._routesReady = true;
		return this._routes;
	}
}
