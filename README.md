[![Code Climate](https://codeclimate.com/github/dgattey/dg/badges/gpa.svg?style=flat)](https://codeclimate.com/github/dgattey/dg) [![Issue Count](https://codeclimate.com/github/dgattey/dg/badges/issue_count.svg?style=flat)](https://codeclimate.com/github/dgattey/dg) [![Dependency Status](https://gemnasium.com/badges/github.com/dgattey/dg.svg?style=flat)](https://gemnasium.com/github.com/dgattey/dg) 

# Dylan Gattey

I'm redesigning my site to use [Angular 2](https://angular.io/) and the [Wordpress JSON API](http://v2.wp-api.org/) rather than a slow, non-customizable Wordpress theme. Currently very much a work in progress, but I'm having fun and teaching myself [Typescript](https://www.typescriptlang.org/) in the process! It's meant to be a simpler version of the site with much of the same content, but updated for 2k16 instead of 2013 (when I last did anything significant design-wise on my site). Cleaner, sparser layout with larger, clearer font + more professional images, an updated logo, and more of my own voice in the writing.

### Development
To start up a development server, run `npm start` for a concurrent run of everything. You can also run `npm run compile` to watch and compile TS to JS and SCSS to CSS, and `npm run serve` to run a server on http://localhost:3000 with the content. It'll be fancy and auto-watch/reload for you whenever you make file changes. I recommend using Sublime 2 with the Typescript package and it'll act like an IDE and autocomplete variables for you, and compile Typescript before you even save the file. Magic, I tell you.

### Status
There are lots of todos left. There's a public Trello board with my progress and ideas at https://trello.com/b/MJdtje7y/dylangattey-com. Currently, loading data from WP-API works, and I have nice methods for media & projects, & `Observables` to support asynchronicity. Working on finalizing the design for project grid, and starting to do the project detail pages.
