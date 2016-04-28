import { Component } from 'angular2/core';

@Component({
	selector: 'dummy-placeholder',
	templateUrl: 'app/static/dummy.component.html'
})
export class DummyComponent {
	name = 'john';
	message = '';
	sayHello() {
		this.message = 'Hello ' + this.name + '!';
	}
}