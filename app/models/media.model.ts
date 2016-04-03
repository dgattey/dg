import { Injectable } from 'angular2/core';

@Injectable()
export class Media {
	id: number;
	title: string;
	location: string;
	date: Date;
	content: Object;
	
	// Used to create a Media from JSON data
	constructor(data: JSON) {
		this.id = data['id'];
		this.title = data['title']['rendered'];
		this.location = data['link'];
		this.date = new Date(data['date']);
		this.content = data['media_details'];
	}
}