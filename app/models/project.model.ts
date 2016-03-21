import { Injectable } from 'angular2/core';

@Injectable()
export class Project {
	id: number;
	title: string;
	location: string;
	externalLink: string;
	wpLinks: Object;
	date: Date;
	content: string;
	media: Array<string>;
	
	// Used to create a Project from JSON data
	constructor(data: JSON) {
		this.id = data['id'];
		this.title = data['title']['rendered'];
		this.location = data['link'];
		this.externalLink = data['external_website_link'];
		this.wpLinks = data['_links'];
		this.date = new Date(data['date']);
		this.content = data['content']['rendered'];
		this.media = new Array<string>();
		for (var i = 1; i <= 10; i++) {
			var images = data['image_' + i];
			if (images.length > 0 && images[0] != '') {
				this.media.push(images[0]);
			}
		}
	}
}