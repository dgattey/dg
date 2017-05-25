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
	As an intern at LinkedIn, I worked on the newest iteration of LI Groups for iOS. We had no existing solution for navigating and posting to groups inside a native app, so we built one. The team was small but focused, which meant I could accomplish many things as an intern. Though I started out brand new to Swift, I was mentored well by the more senior developers.
</p>

When I arrived, the app was partially built, so I explored what I could most effectively help with. Ultimately, I was most drawn towards interface "delights". Over the course of the summer, I built a lot of animators for transitions, as well as custom UI components that could be reused inside LinkedIn.

To help usability, I integrated just-released Apple APIs like `UIViewControllerInteractiveTransitioning` and `UIViewControllerAnimatedTransitioning` to make sure our transitions were polished, delightful, and interactive. When you scroll to the top of a page, you can actually pull the whole window down, for example. Today, apps like Facebook and Slack have these standard interactions, but it was brand new to LI. Another favorite: the compose button radiates outward when you tap on it to uncover the compose screen hiding "underneath" the button.

Along with that, I created standardized, reusable UI components to be used across the LinkedIn iOS ecosystem. There's a lot of LI apps that feel off-brand because they use Apple's UI components or the wrong colors and animation timings. This was a solution so no app needed to reimplement that styling. My favorite part was an exact API replacement for `UIAlertController` to style and brand interestingly. Building an exact replica of a `UIControl` was definitely not easy. Good insight for me though! Another fun favorite was a loading spinner that was also interactive to replace Apple's standard. It had wicked cool animations, but it was never shipped.

A brilliant approach suggested by my manager ensured that the code would stick around until today. He suggested bundling up the transition animators and UI components into shared libraries for all LinkedIn iOS apps to use via Cocoapods. And it worked; `LIDelight` is still used to this day! If you open up the main flagship consumer LinkedIn app, most dialogs use a `LIAlertController` rather than Apple's.

Overall, my summer of animations and view components left me hungry for more Swift and in need of more things to animate. And I joined LinkedIn fulltime.

// TODO: @dgattey insert GIFs or imgs throughout of the UI and transitions!

Check out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
