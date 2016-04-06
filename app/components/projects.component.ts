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
	selector: 'project-card',
	templateUrl: 'app/static/projectCard.component.html',
	inputs: ['model'],
	pipes: [EscapePPipe]
})
export class ProjectCardComponent {
	model: Project;
}

@Component({
	selector: 'projects',
	templateUrl: 'app/static/projects.component.html',
	directives: [ProjectCardComponent]
})
export class ProjectsComponent implements OnInit {
	projects: Array<Project>;

	constructor(private wp: WPService) { }

	ngOnInit() {
		// TODO: Cache, check cache instead of loading
		this.wp.getProjects().subscribe(projects => {
			this.projects = projects;

			// Fake adding more
			this.projects.push(projects[0])
			this.projects.push(projects[1])
			this.projects.push(projects[1])
			console.log('Loaded Projects!', this.projects);
		});
	}
}
