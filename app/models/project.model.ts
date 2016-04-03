import { Injectable } from 'angular2/core';

import { Media } from '../models/media.model';

@Injectable()
	export class Project {
	id: number;
	title: string;
	location: string;
	mediaLink: string;
	externalLink: string;
	content: string;
	date: Date;
	media: Array<Media>;
	
	// Used to create a Project from JSON data
	constructor(data: JSON) {
		this.id = data['id'];
		this.title = data['title']['rendered'];
		this.location = data['link'];
		this.date = new Date(data['date']);
		this.content = data['content']['rendered'];

		// Has external linK?
		if (data['project_external_site'][0] != '') {
			this.externalLink = data['project_external_site'][0];
		}

		// Has media attached?
		if (data['featured_media'] != 0) { 
			this.mediaLink = data['_links']['https://api.w.org/attachment'][0]['href'];
		}
	}
}