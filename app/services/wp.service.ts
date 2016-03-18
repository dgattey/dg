import { Injectable } from 'angular2/core';
import { Http, Headers, HTTP_PROVIDERS } from 'angular2/http';
import 'rxjs/add/operator/map';

@Injectable()
export class WPService {
	private _endpoint: string;
	private _routes: Object;
	private _routesReady: boolean;
	constructor(private _http: Http) {
		this._endpoint = 'https://dylangattey.com/wp-json/';
		this._routes = {
			'projects': '',
			'pages': '',
			'posts': ''
		}

		// Fetches routes
		this._routesReady = false;
		this.getRoutes(() => void{});
	}

	// Simply returns all projects
	// TODO: Make project type in another file and map each array to a Project
	getProjects(callback: (proj: JSON) => void) {
		var me = this;
		this.getRoutes(function(routes: Object) {
			me._http.get(routes['projects'])
			.map(res => res.json())
			.subscribe(
				data => callback(data), 
				err => console.error(err)
			);
		});
	}

	///////////////////////////////////////////////////////////////////////////
	
	// Sets up routes for whole API. As the WP API is self describing,
	// it should tell us about all the possible routes, and we only care
	// about a subset we specified above.
	private getRoutes(callback: (routes: Object) => void) {
		if (this._routesReady) {
			console.log('Used cached routes');
			callback(this._routes);
			return;
		}

		// Fetch the routes
		this._http.get(this._endpoint)
		.map(res => res.json())
		.subscribe(
			data => this.associateRoutes(data.routes, callback),
			err => console.error(err),
			() => console.log('Done associating routes!')
		);
	}

	// For possible routes, it associates them with a matching saved one
	private associateRoutes(possibleRoutes: Object, callback: (routes: Object) => void) {
		var saveRoute = function(path: string, savedRoutes: Object) {

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
		callback(this._routes);
	}
}
