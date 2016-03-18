import { Component, OnInit } from 'angular2/core';
import { Router } from 'angular2/router';

import { Character, CharacterService } from '../services/character.service';
import { Project } from '../models/project.model';
import { WPService } from '../services/wp.service';

@Component({
	selector: 'my-characters',
	templateUrl: 'app/static/characters.component.html',
	styleUrls: ['app/styles/characters.component.css']
})
export class CharactersComponent implements OnInit {
	characters: Character[];
	currentCharacter: Character;

	constructor(private _characterService: CharacterService, private _wpService: WPService) { }

	ngOnInit() {
		this.characters = this.getCharacters();
		this._wpService.getProjects(function(proj: Array<Project>) {
			console.log(proj);
		});
	}

	onSelect(character: Character) {
		this._characterService.getCharacter(character.id)
		.subscribe(character => this.currentCharacter = character);
	}

	/////////////////

	getCharacters() {
		this.currentCharacter = undefined;
		this.characters = [];

		this._characterService.getCharacters()
		.subscribe(characters => this.characters = characters);

		return this.characters;
	}
}
