const scrolledClass = "shadow-weak",
  header = document.querySelector("#global-nav"),
  headerHeight = header.offsetHeight || 0,
  articleHeight = document.querySelector("article").offsetTop || 0,
  triggerHeight = articleHeight - headerHeight;

function addOrRemoveClass() {
  if (window.scrollY >= triggerHeight) {
    header.classList.add(scrolledClass);
  } else {
    header.classList.remove(scrolledClass);
  }
}

// On scroll and load, add the class specified
window.addEventListener("scroll", addOrRemoveClass);
window.addEventListener("load", addOrRemoveClass);
