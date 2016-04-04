import { Injectable } from 'angular2/core';

@Injectable()
export class Category {
	id: number;
	name: string;
	slug: string;
	count: number;
	links: Object;
	
	// Used to create a Category from JSON data
	constructor(data: JSON) {
		this.id = data['id'];
		this.name = data['name'];
		this.slug = data['slug'];
		this.count = data['count'];
		this.links = data['_links'];
	}

	// Gives back the link that will give all projects that
	// have this particular category
	getProjectsLink(): string {
		return this.links['https://api.w.org/post_type']['href'];
	}
}