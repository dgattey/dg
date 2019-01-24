const header = document.querySelector(".header-nav")
const headerHeight = header.offsetHeight
const scrolledClass = "shadow-weak"

// On scroll, add the class specified
window.addEventListener('scroll', function() {
  if (window.scrollY >= headerHeight) {
    header.classList.add(scrolledClass)
  } else {
    header.classList.remove(scrolledClass)
  }
})