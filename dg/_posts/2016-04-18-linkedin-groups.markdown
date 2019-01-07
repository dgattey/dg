---
layout: post
title:  "LinkedIn Groups"
identifier: "groups"
type: "iOS App"
description: "An iOS app for LinkedIn Groups with interface delights"
thumb: groups.jpg
---
<section>
	{% asset header/groups-ios.png class="leading-image" @pic %}
</section>
<section>
	<p>As an intern at LinkedIn, I helped craft the newest iteration of LinkedIn Groups for iOS. When I arrived, the app was partially built, so I explored what I could most effectively finish as a new hire new to Swift. I worked on interface "delights" to make Groups top of the line. Over the course of the summer, I polished up some slick transition animators and built custom UI components to be styled & reused inside LinkedIn's iOS app sphere.</p>
</section>

<section class="colorized">
	<h2>Transforming those transitions</h2>
	<p>Our transitions were a bit of a mess. Sometimes screens popped up vertically, other times we shoved things in from the right. Groups had cards, pages, navigation controllers, and more. We needed standards. A consistent experience would guarantee better usability for our users, and less work developing/designing.</p>
	<p>I worked extensively with just-released Apple APIs like <code>UIViewControllerInteractiveTransitioning</code> and <code>UIViewControllerAnimatedTransitioning</code>to make it so. A key part of these "delightful" transitions were also making them interactive. I introduced hierarchies of layers, so the top-most view "pops back" to present a new page. Other less emphasized pages disappear into the ether.</p>
	<p>The interactivity made it so that when you scrolled to the top, you could actually pull the whole page down and dismiss it. Easier to use bigger phones without having to reach into the corners to hit the buttons. Another favorite: the compose button radiates outward when you tap on it to uncover the compose screen hiding "underneath" the button.</p>
</section>

<section>
	<h2>Modular Components</h2>
	<p>Along with that, I created standardized, reusable UI components to be used across the LinkedIn iOS ecosystem. At the time, there were a lot of LinkedIn apps that felt off-brand because they used Apple's standard UI components or the wrong colors and animation timings. My framework was a solution so no app needed to reimplement that styling. My favorite part was an exact API replacement for <code>UIAlertController</code> to style and brand interestingly. Building an exact replica of a <code>UIControl</code> was definitely not easy. Another fun favorite was a loading spinner that was also interactive to replace Apple's standard. It had wicked cool animations, but it was never shipped.</p>
	<p>As I bundled the transition animators and UI components into a shared Cocoapods library, all LinkedIn iOS apps could more easily include it in their code. <code>LIDelight</code> is still used to this day. If you open up the main flagship consumer LinkedIn app, most dialogs use a <code>LIAlertController</code> rather than Apple's.</p>
</section>

<section>
Overall, my summer of animations and view components left me hungry for more Swift and in need of more things to animate. And I joined LinkedIn fulltime.
</section>

// TODO: @dgattey remove the html tags somehow (and make code work with ``)
// TODO: @dgattey insert GIFs or imgs throughout of the UI and transitions! URL previews below with their syntax.

Check out the [Jekyll docs][jekyll-docs] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll’s GitHub repo][jekyll-gh]. If you have questions, you can ask them on [Jekyll Talk][jekyll-talk].

[jekyll-docs]: http://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
