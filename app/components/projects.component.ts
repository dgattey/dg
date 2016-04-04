import {Component, OnInit} from 'angular2/core';
import {Router } from 'angular2/router';

import {Project} from '../models/project.model';
import {WPService} from '../services/wp.service';

@Component({
	selector: 'projects',
	templateUrl: 'app/static/projects.component.html',
	styleUrls: ['app/styles/projects.component.css']
})
export class ProjectsComponent implements OnInit {
	projects: Array<Project>;

	constructor(private wp: WPService) { }

	ngOnInit() {
		// TODO: Cache, check cache instead of loading
		this.wp.getProjects()
		.subscribe(projects => {
			this.projects = projects;
			console.log('Loaded Projects!', this.projects);
		});
	}
}
