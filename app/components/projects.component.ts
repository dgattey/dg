import {Component, OnInit, Pipe, PipeTransform} from 'angular2/core';
import {Router } from 'angular2/router';

import {Project} from '../models/project.model';
import {WPService} from '../services/wp.service';

@Pipe({name: 'escapeP', pure: false})
class EscapePPipe implements PipeTransform {
	transform(value: any, args: any[] = []) {
		// Remove surrounding <p> tags
		if(value.indexOf('<p>') != -1) {
			return value.replace('<p>', '').replace('<\/p>', '');
		}
	}
}

@Component({
	selector: 'projects',
	templateUrl: 'app/static/projects.component.html',
	styleUrls: ['app/styles/projects.component.css'],
	pipes: [EscapePPipe]
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
