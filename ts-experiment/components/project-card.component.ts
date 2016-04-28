import {Component, Pipe, PipeTransform} from 'angular2/core';
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