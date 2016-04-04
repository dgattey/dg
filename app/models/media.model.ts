import { Injectable } from 'angular2/core';

@Injectable()
export class Media {
	id: number;
	title: string;
	date: Date;
	content: Object;
	
	// Used to create a Media from JSON data
	constructor(data: JSON) {
		this.id = data['id'];
		this.title = data['title']['rendered'];
		this.date = new Date(data['date']);
		this.content = data['media_details'];
	}

	// Given a valid size, gives back the source URL for it
	get(size: string): string {
		return this.content['sizes'][size]['source_url'];
	}
}