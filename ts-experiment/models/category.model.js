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
    var Category;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            Category = (function () {
                // Used to create a Category from JSON data
                function Category(data) {
                    this.id = data['id'];
                    this.name = data['name'];
                    this.slug = data['slug'];
                    this.count = data['count'];
                    this.links = data['_links'];
                }
                // Gives back the link that will give all projects that
                // have this particular category
                Category.prototype.getProjectsLink = function () {
                    return this.links['https://api.w.org/post_type']['href'];
                };
                Category = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [Object])
                ], Category);
                return Category;
            }());
            exports_1("Category", Category);
        }
    }
});
//# sourceMappingURL=category.model.js.map