import {Component, OnInit, Pipe, PipeTransform} from 'angular2/core';
import {Router } from 'angular2/router';

import {Project} from '../models/project.model';
import {WPService} from '../services/wp.service';
import {ProjectCardComponent} from './project-card.component';

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
			for (var i = 0; i < 5; ++i) {
				this.projects.push(projects[0])
				this.projects.push(projects[0])
				this.projects.push(projects[1])
			}
			console.log('Loaded Projects!', this.projects);
		});
	}

	highlight(project: Project) {
		console.log('Highlighted project!', project);
	}
}
