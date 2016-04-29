import {Injectable} from 'angular2/core';
import {Http, Headers, Response, HTTP_PROVIDERS} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';

import { Project } from '../models/project.model';
import { Media } from '../models/media.model';
import { Category } from '../models/category.model';

@Injectable()
export class WPService {
	private _endpoint: string;
	private _routes: JSON;
	private _routesReady: boolean;
	constructor(private _http: Http) {
		this._endpoint = 'https://dylangattey.com/backend/wp-json/';
		
		// Sets up route structure - lazily initialized
		let routes: any = {
			'projects': '',
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
				projs.push(this.createProject(data[i]));
			}
			return projs;
		});
	}

	// Grabs media for a given project
	getMedia(proj: Project): Observable<Array<Media>> {
		return this._http.get(proj.mediaLink())
		.map((res: Response) => res.json())

		// Take raw media data and create array of medias
		.map(data => {
			let medias: Array<Media> = new Array<Media>();
			for (var i in data){
				medias.push(new Media(data[i]));
			}
			return medias;
		});
	}

	// Grabs categories for a given project
	getTerms(proj: Project): Observable<Array<Category>> {
		return this._http.get(proj.termsLink())
		.map((res: Response) => res.json())
		
		// Take raw category data and create array of medias
		.map(data => {
			let terms: Array<Category> = new Array<Category>();
			for (var i in data){
				terms.push(new Category(data[i]));
			}
			return terms;
		});
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
			.map(json => this.associateRoutes(json['routes']));
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

	// Helper to create a project and associate media 
	// and terms with it
	private createProject(data: JSON): Project {
		let proj = new Project(data);

		// Load media async if has it
		if (proj.hasMedia()) {
			this.getMedia(proj).subscribe(medias => {
				proj.media = medias;
			});
		}

		// Load terms
		this.getTerms(proj).subscribe(terms => {
			if (terms.length > 0) {
				proj.terms = terms;
			}
		});

		return proj;
	}
}