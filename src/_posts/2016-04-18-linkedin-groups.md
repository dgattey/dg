---
layout: post
type: iOS App
description: Connecting and empowering the world's professionals
class: background-red5
project_layout: vertical
thumbnail:
  src: groups-thumb
  filetype: png
  container_class: "margin-top-5-tablet-overhang margin-bottom-5-tablet-overhang margin-vertical-0"
  class: "fill-parent"
---

# LinkedIn Groups

As an intern at LinkedIn, I helped craft LinkedIn Groups
2.0 for iOS. Interface "delights" to make Groups smooth and attractive were
my main focus. From slick transition animators to custom UI components, I
created UI to be styled & reused inside all of LinkedIn's iOS apps.
{: .font-size-4 }

## Transformations

Our transitions were a bit of a mess. Sometimes screens popped up vertically,
other times we shoved things in from the right. Groups had cards, pages,
navigation controllers, and more. A consistent experience would guarantee
better usability for our users, and less work developing/designing.

I worked extensively with just-released Apple APIs like
`UIViewControllerInteractiveTransitioning` and
`UIViewControllerAnimatedTransitioning` to make it so. A key part of these
delightful transitions were also making them interactive. I introduced
hierarchies of layers, so the top-most view "pops back" to present a new page.

When you scrolled to the top of the page, you could actually pull the whole
page down and dismiss it. Easier to use bigger phones without having to reach
into the corners to hit the buttons. Another favorite: the compose button
radiates outward when you tap on it to uncover the compose screen hiding
"underneath" the button.

## Modular Components

My second focus was creating standardized, reusable UI components through
an Objective-C framework. At the time, there was no one library of components
to use when creating a new iOS app. There were a lot of LinkedIn apps that felt
off-brand because they used Apple's standard UI components or the wrong colors
and animation timings. My favorite part was an exact API replacement for
`UIAlertController` to style and brand more interestingly. Building an exact
replica of a `UIControl` was definitely not easy. Another fun favorite was a
loading spinner that was also interactive to replace Apple's standard. It had
slick animations, but it was never shipped.

As I bundled the transition animators and UI components into a shared Cocoapods
library, all LinkedIn iOS apps could more easily include it in their code. The
framework, `LIDelight`, is still used to this day. If you open up the main
flagship consumer LinkedIn app, most dialogs use a `LIAlertController` rather
than Apple's.
