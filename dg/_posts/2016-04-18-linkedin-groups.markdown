---
layout: post
title:  "Groups"
tags:
- ios
- interaction
thumb: groups.jpg
header-img: groups-ios.png
desc: "An iOS app for LinkedIn Groups with interface delights"
background: "#0077B5"
foreground: light
featured: true
---
<p class="leading-paragraph">
	As an intern at LinkedIn, I helped craft the newest iteration of LI Groups for iOS. When I arrived, the app was partially built, so I explored what I could most effectively *finish* as a new hire new to Swift. The flashier the better when it comes to intern projects, so I settled on interface "delights" to make Groups top of the line. Over the course of the summer, I polished up some slick transition animators and built custom UI components to be styled & reused inside LinkedIn's iOS app sphere.
</p>


### Transforming those transitions
Our transitions were a bit of a mess. Sometimes screens popped up vertically, other times we shoved things in from the right. Groups had cards, pages, navigation controllers, and more. We needed #standards. A consistent experience would guarantee better usability for our users, and less work developing/designing.

I worked extensively with just-released Apple APIs like `UIViewControllerInteractiveTransitioning` and `UIViewControllerAnimatedTransitioning` to make it so. A key part of these "delightful" transitions were also making them interactive. Without interactivity, there was no point in making the transitions so polished. I introduced hierarchies of layers (before all the cool design frameworks had that!), so the top-most view "pops back" to present a new page. Other less emphasized pages disappear into the ether.

The interactivity made it so that when you scrolled to the top, you could actually pull the whole page down and dismiss it. Easier to use bigger phones without having to reach into the corners to hit the buttons! Today, apps like Facebook and Slack have these pretty standard, but it was pretty innovative at the time. Another favorite: the compose button radiates outward when you tap on it to uncover the compose screen hiding "underneath" the button. We timed it so it felt like your touch on the button caused that.

### Modular Components
Along with that, I created standardized, reusable UI components to be used across the LinkedIn iOS ecosystem. There's a lot of LI apps that feel off-brand because they use Apple's UI components or the wrong colors and animation timings. This was a solution so no app needed to reimplement that styling. My favorite part was an exact API replacement for `UIAlertController` to style and brand interestingly. Building an exact replica of a `UIControl` was definitely not easy. Good insight for me though! Another fun favorite was a loading spinner that was also interactive to replace Apple's standard. It had wicked cool animations, but it was never shipped.

A brilliant approach suggested by my manager ensured that the code would stick around until today. He suggested bundling up the transition animators and UI components into shared libraries for all LinkedIn iOS apps to use via Cocoapods. And it worked; `LIDelight` is still used to this day! If you open up the main flagship consumer LinkedIn app, most dialogs use a `LIAlertController` rather than Apple's.

Overall, my summer of animations and view components left me hungry for more Swift and in need of more things to animate. And I joined LinkedIn fulltime.

// TODO: @dgattey remove the html tags somehow (and make code work with ``)
// TODO: @dgattey insert GIFs or imgs throughout of the UI and transitions! URL previews below with their syntax.

Check out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
