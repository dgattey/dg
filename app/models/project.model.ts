import { Injectable } from 'angular2/core';

interface ProjectType {
	id: number;
	title: string;
	location: string;
	links: Object;
	date: Date;
	content: string;
	// TODO: media or media links
}

@Injectable()
export class Project implements ProjectType {
	id: number;
	title: string;
	location: string;
	links: Object;
	date: Date;
	content: string;
	// TODO: media or media links
	
	// Used to create a Project from JSON data
	constructor(data: JSON) {
		this.id = data['id'];
		this.title = data['title']['rendered'];
		this.location = data['link'];
		this.links = data['_links'];
		this.date = new Date(data['date']);
		this.content = data['content']['rendered'];
	}
}