import { Component } from 'angular2/core';

@Component({
  selector: 'my-dashboard',
	templateUrl: 'app/dashboard.component.html'
})
export class DashboardComponent {
	name = 'john';
	message = '';

	sayHello() {
		this.message = 'Hello ' + this.name + '!';
	}
}
