import {Component} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';

import {ProjectsComponent} from './projects.component';
import {DummyComponent} from './dummy.component';
import {WPService} from '../services/wp.service';

@Component({
  selector: 'dg-app',
  templateUrl: 'app/static/nav.component.html',
  directives: [ROUTER_DIRECTIVES],
  providers: [HTTP_PROVIDERS, ROUTER_PROVIDERS, WPService]
})
@RouteConfig([
  { path: '/code', as:'Code', component: ProjectsComponent, useAsDefault: true },
  { path: '/graphics', as: 'Graphics', component: DummyComponent },
  { path: '/about', as: 'About', component: DummyComponent },
  { path: '/contact', as: 'Contact', component: DummyComponent }
])
export class AppComponent { }