All shared UI that's not app-screen-specific (i.e. a nav component or a stack component), plus all theming for MUI goes here.

1. Icons should eventually house all icons so no fortawesome or lucide imports are needed elsewhere (maybe on the lucide)
2. Core should have only MUI dependent stuff
3. Dependent either needs API or Next as a dependency and that needs to be separated out for better dependency management later
