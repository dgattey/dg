import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';

import { CharactersComponent } from './characters.component';
import { DashboardComponent } from './dashboard.component';
import { CharacterService } from './character.service';

@Component({
  selector: 'my-app',
  template: `
    <a [routerLink]="['Dashboard']">Dashboard</a>
    <a [routerLink]="['Characters']">Characters</a>
    <router-outlet></router-outlet>
    `,
  directives: [ROUTER_DIRECTIVES],
  providers: [HTTP_PROVIDERS, ROUTER_PROVIDERS, CharacterService]
})
@RouteConfig([
  { path: '/dashboard', as: 'Dashboard', component: DashboardComponent, useAsDefault: true },
  { path: '/characters', as: 'Characters', component: CharactersComponent }
])
export class AppComponent { }
