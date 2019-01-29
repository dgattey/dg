const header = document.querySelector(".header-nav")
const headerHeight = header.offsetHeight
const scrolledClass = "shadow-weak"

var addOrRemoveClass = function() {
	if (window.scrollY >= headerHeight) {
		header.classList.add(scrolledClass)
	} else {
		header.classList.remove(scrolledClass)
	}
}
// On scroll and load, add the class specified
window.addEventListener('scroll', addOrRemoveClass());
window.addEventListener('load', addOrRemoveClass());