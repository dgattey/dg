System.register(['angular2/core'], function(exports_1, context_1) {
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
    var core_1;
    var Project;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            Project = (function () {
                // Used to create a Project from JSON data
                function Project(data) {
                    this.id = data['id'];
                    this.title = data['title']['rendered'];
                    this.excerpt = data['excerpt']['rendered'];
                    this.date = new Date(data['date']);
                    this.content = data['content']['rendered'];
                    this.featuredMedia = data['featured_media'];
                    this.links = data['_links'];
                    // Has external linK?
                    var ext = data['external_site'];
                    if (ext && ext[0] != '') {
                        this.links['external'] = new Array(new Object());
                        this.links['external'][0]['href'] = ext[0];
                    }
                }
                // Checks if this project has media
                Project.prototype.hasMedia = function () {
                    return this.featuredMedia != 0;
                };
                // Convenience for getting a specific media type
                Project.prototype.getMedia = function (i, type) {
                    if (!this.media)
                        return null;
                    return this.media[i].get(type);
                };
                // Gives link to get all media items
                Project.prototype.mediaLink = function () {
                    if (!this.hasMedia()) {
                        return null;
                    }
                    return this.link('wp:attachment');
                };
                // Gives link to get all categories
                Project.prototype.termsLink = function () {
                    return this.link('wp:term');
                };
                // Gives link to external site
                Project.prototype.externLink = function () {
                    return this.link('external');
                };
                // Helps with getting a link for a given type, since
                // there are lots of nested types
                Project.prototype.link = function (type) {
                    if (!this.links[type]) {
                        return null;
                    }
                    return this.links[type][0]['href'];
                };
                Project = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [Object])
                ], Project);
                return Project;
            }());
            exports_1("Project", Project);
        }
    }
});
//# sourceMappingURL=project.model.js.map