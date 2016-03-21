import {Component, OnInit} from 'angular2/core';
import {Router } from 'angular2/router';

import {Project} from '../models/project.model';
import {WPService} from '../services/wp.service';

@Component({
	selector: 'my-characters',
	templateUrl: 'app/static/characters.component.html',
	styleUrls: ['app/styles/characters.component.css']
})
export class CharactersComponent implements OnInit {

	constructor(private _wpService: WPService) { }

	ngOnInit() {
		this._wpService.getProjects()
		.subscribe(projects => console.log(projects));
	}
}
