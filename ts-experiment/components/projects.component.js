System.register(['angular2/core', '../services/wp.service', './project-card.component'], function(exports_1, context_1) {
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
    var core_1, wp_service_1, project_card_component_1;
    var ProjectsComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (wp_service_1_1) {
                wp_service_1 = wp_service_1_1;
            },
            function (project_card_component_1_1) {
                project_card_component_1 = project_card_component_1_1;
            }],
        execute: function() {
            ProjectsComponent = (function () {
                function ProjectsComponent(wp) {
                    this.wp = wp;
                }
                ProjectsComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    // TODO: Cache, check cache instead of loading
                    this.wp.getProjects().subscribe(function (projects) {
                        _this.projects = projects;
                        // Fake adding more
                        for (var i = 0; i < 5; ++i) {
                            _this.projects.push(projects[0]);
                            _this.projects.push(projects[0]);
                            _this.projects.push(projects[1]);
                        }
                        console.log('Loaded Projects!', _this.projects);
                    });
                };
                ProjectsComponent.prototype.highlight = function (project) {
                    console.log('Highlighted project!', project);
                };
                ProjectsComponent = __decorate([
                    core_1.Component({
                        selector: 'projects',
                        templateUrl: 'app/static/projects.component.html',
                        directives: [project_card_component_1.ProjectCardComponent]
                    }), 
                    __metadata('design:paramtypes', [wp_service_1.WPService])
                ], ProjectsComponent);
                return ProjectsComponent;
            }());
            exports_1("ProjectsComponent", ProjectsComponent);
        }
    }
});
//# sourceMappingURL=projects.component.js.map