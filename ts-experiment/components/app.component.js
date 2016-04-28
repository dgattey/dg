System.register(['angular2/core', 'angular2/http', 'angular2/router', './projects.component', './dummy.component', './intro.component', '../services/wp.service'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, http_1, router_1, projects_component_1, dummy_component_1, intro_component_1, wp_service_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (projects_component_1_1) {
                projects_component_1 = projects_component_1_1;
            },
            function (dummy_component_1_1) {
                dummy_component_1 = dummy_component_1_1;
            },
            function (intro_component_1_1) {
                intro_component_1 = intro_component_1_1;
            },
            function (wp_service_1_1) {
                wp_service_1 = wp_service_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent() {
                }
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'dg-app',
                        templateUrl: 'app/static/nav.component.html',
                        directives: [router_1.ROUTER_DIRECTIVES, intro_component_1.IntroComponent],
                        providers: [http_1.HTTP_PROVIDERS, router_1.ROUTER_PROVIDERS, wp_service_1.WPService]
                    }),
                    router_1.RouteConfig([
                        { path: '/code', as: 'Code', component: projects_component_1.ProjectsComponent, useAsDefault: true },
                        { path: '/graphics', as: 'Graphics', component: dummy_component_1.DummyComponent },
                        { path: '/about', as: 'About', component: dummy_component_1.DummyComponent },
                        { path: '/contact', as: 'Contact', component: dummy_component_1.DummyComponent }
                    ]), 
                    __metadata('design:paramtypes', [])
                ], AppComponent);
                return AppComponent;
            }());
            exports_1("AppComponent", AppComponent);
        }
    }
});
//# sourceMappingURL=app.component.js.map