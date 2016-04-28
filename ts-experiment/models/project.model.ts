import { Injectable } from 'angular2/core';

import { Media } from '../models/media.model';
import { Category } from '../models/category.model';

@Injectable()
export class Project {
	id: number;
	title: string;
	excerpt: string;
	content: string;
	date: Date;
	links: Object;
	featuredMedia: number; // 0 if none

	// Filled if links exist
	terms: Array<Category>;
	media: Array<Media>;
	
	// Used to create a Project from JSON data
	constructor(data: JSON) {
		this.id = data['id'];
		this.title = data['title']['rendered'];
		this.excerpt = data['excerpt']['rendered'];
		this.date = new Date(data['date']);
		this.content = data['content']['rendered'];
		this.featuredMedia = data['featured_media'];
		this.links = data['_links'];

		// Has external linK?
		let ext = data['external_site']
		if (ext && ext[0] != '') {
			this.links['external'] = new Array<Object>(new Object());
			this.links['external'][0]['href'] = ext[0];
		}
	}

	// Checks if this project has media
	hasMedia(): boolean {
		return this.featuredMedia != 0;
	}

	// Convenience for getting a specific media type
	getMedia(i: number, type: string): string {
		if (!this.media) return null;
		return this.media[i].get(type);
	}

	// Gives link to get all media items
	mediaLink(): string {
		if (!this.hasMedia()) {
			return null;
		}
		return this.link('wp:attachment');
	}

	// Gives link to get all categories
	termsLink(): string {
		return this.link('wp:term');
	}

	// Gives link to external site
	externLink(): string {
		return this.link('external');
	}

	// Helps with getting a link for a given type, since
	// there are lots of nested types
	private link(type: string): string {
		if (!this.links[type]) {
			return null;
		}
		return this.links[type][0]['href'];
	}
}