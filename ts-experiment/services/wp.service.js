System.register(['angular2/core', 'angular2/http', 'rxjs/add/operator/map', 'rxjs/add/operator/mergeMap', 'rxjs/add/operator/catch', '../models/project.model', '../models/media.model', '../models/category.model'], function(exports_1, context_1) {
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
    var core_1, http_1, project_model_1, media_model_1, category_model_1;
    var WPService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (_1) {},
            function (_2) {},
            function (_3) {},
            function (project_model_1_1) {
                project_model_1 = project_model_1_1;
            },
            function (media_model_1_1) {
                media_model_1 = media_model_1_1;
            },
            function (category_model_1_1) {
                category_model_1 = category_model_1_1;
            }],
        execute: function() {
            WPService = (function () {
                function WPService(_http) {
                    this._http = _http;
                    this._endpoint = 'https://dylangattey.com/backend/wp-json/';
                    // Sets up route structure - lazily initialized
                    var routes = {
                        'projects': '',
                        'media': ''
                    };
                    this._routes = routes;
                    this._routesReady = false;
                }
                ///////////////////////////////////////////////////////////
                // Public API
                ///////////////////////////////////////////////////////////
                // Simply returns all projects
                WPService.prototype.getProjects = function () {
                    var _this = this;
                    return this.getRoutes()
                        .flatMap(function (routes) { return _this._http.get(routes['projects']); })
                        .map(function (res) { return res.json(); })
                        .map(function (data) {
                        var projs = new Array();
                        for (var i in data) {
                            projs.push(_this.createProject(data[i]));
                        }
                        return projs;
                    });
                };
                // Grabs media for a given project
                WPService.prototype.getMedia = function (proj) {
                    return this._http.get(proj.mediaLink())
                        .map(function (res) { return res.json(); })
                        .map(function (data) {
                        var medias = new Array();
                        for (var i in data) {
                            medias.push(new media_model_1.Media(data[i]));
                        }
                        return medias;
                    });
                };
                // Grabs categories for a given project
                WPService.prototype.getTerms = function (proj) {
                    return this._http.get(proj.termsLink())
                        .map(function (res) { return res.json(); })
                        .map(function (data) {
                        var terms = new Array();
                        for (var i in data) {
                            terms.push(new category_model_1.Category(data[i]));
                        }
                        return terms;
                    });
                };
                ///////////////////////////////////////////////////////////
                // Sets up routes for whole API. As the WP API is self describing,
                // it should tell us about all the possible routes, and we only care
                // about a subset we specified above.
                WPService.prototype.getRoutes = function () {
                    // var returnedRoutes = new Observable<JSON>();
                    // if (this._routesReady) {
                    // 	console.log('Used cached routes');
                    // 	return returnedRoutes;
                    // }
                    // TODO: cached routes
                    var _this = this;
                    // Fetch the routes
                    return this._http.get(this._endpoint)
                        .map(function (res) { return res.json(); })
                        .map(function (json) { return _this.associateRoutes(json['routes']); });
                };
                // For possible routes, it associates them with a matching saved one
                WPService.prototype.associateRoutes = function (possibleRoutes) {
                    var saveRoute = function (path, savedRoutes) {
                        // Loop over each saved route and check if this is one of them
                        for (var r in savedRoutes) {
                            if (savedRoutes[r] != '' || path.indexOf(r) < 0) {
                                continue; // keep going to find another
                            }
                            // Route was one we want
                            savedRoutes[r] = possibleRoutes[path]._links['self'];
                            return;
                        }
                    };
                    // Loop over possible routes and check them
                    for (var path in possibleRoutes) {
                        saveRoute(path, this._routes);
                    }
                    // Callback!
                    this._routesReady = true;
                    return this._routes;
                };
                // Helper to create a project and associate media 
                // and terms with it
                WPService.prototype.createProject = function (data) {
                    var proj = new project_model_1.Project(data);
                    // Load media async if has it
                    if (proj.hasMedia()) {
                        this.getMedia(proj).subscribe(function (medias) {
                            proj.media = medias;
                        });
                    }
                    // Load terms
                    this.getTerms(proj).subscribe(function (terms) {
                        if (terms.length > 0) {
                            proj.terms = terms;
                        }
                    });
                    return proj;
                };
                WPService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [http_1.Http])
                ], WPService);
                return WPService;
            }());
            exports_1("WPService", WPService);
        }
    }
});
//# sourceMappingURL=wp.service.js.map