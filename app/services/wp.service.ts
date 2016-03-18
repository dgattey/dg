import { Injectable } from 'angular2/core';
import { Http, Headers, HTTP_PROVIDERS } from 'angular2/http';
import 'rxjs/add/operator/map';

@Injectable()
export class WPService {
	private data: Object;

	// Will be populated by associateRoutes()
	private routes: Object;

	// Creates routes for use later by connecting to the main endpoint
	constructor(private _http: Http) {
		this.routes = {
			'projects': '',
			'pages': '',
			'posts': ''
		}

		// Get true routes
		this._http.get('https://dylangattey.com/wp-json/') // TODO: move to variable
		.map(res => res.json())
		.subscribe(
			data => this.associateRoutes(data.routes),
			err => console.error(err),
			() => console.log("Associated Routes!")
		);
	}

	// Sets up routes for whole API. As the WP API is self describing,
	// it should tell us about all the possible routes, and we only care
	// about a subset we specified above.
	associateRoutes(possibleRoutes: Object) {
		var saveRoute = function(path: string, savedRoutes: Object) {
			// Loop over each route we want to save and check if this is one of them
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
			saveRoute(path, this.routes);
		}
	}

	getProjects() {
		return this._http.get(this.routes['projects'])
		.map(res => res.json())
	}
}
