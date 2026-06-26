title: Software Rendering
date: 2026-6-26

Hey guys! It's been a while hasn't it? about 3 weeks. There has been a lot of stuff in the works, but this blog is primarily focused on my software renderer I announced last blog.

---

## The software renderer

I announced last blog that I wanted to make a software renderer, and I did, in a couple of days. it's not super advanced but for a couple of days i think its good.
I used *C* as the language of choice and *SDL* for windowing and rendering.

---

The renderer has 3d rendering, transformations, rotations, scaling, and a camera system.
Sadly it doesnt support textures, as I didnt have time and the last week I wasn't at home.

### Now let me get a bit more technical

---

In case you don't know, *software rendering* is a rendering technique that doesn't need a GPU, and instead manually fills pixels on a framebuffer that then gets presented to the screen.
That means no shaders, no Graphics API, just an array of pixels.

---

At first I started with trying to get a pixel on the screen, which was pretty easy, I then tried getting a line on the screen using [Bresenham's line algorithm](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm)

After that I added transformations. At first manually coded the matrices but then I realized that's not a good idea and used [cglm](https://github.com/recp/cglm).

---

After around 2 days I got a rotating line.
I then started just making shapes so I implemented triangle rendering (which was easy, it's just 3 lines), and a circle algorithm.

Then I wrote some cube vertices and indices and rotated it using cglm. Slowly but surely i started having a 3d renderer.

Of course it still looked 3D since I didn't have a view matrix, so that's what I worked on next.
Once again, it was pretty easy since I had cglm. In a few hours I had an actual camera in 3D space that I could move around.

---


The next step was 3D model rendering. I downloaded [tinyobjloader](https://github.com/tinyobjloader/tinyobjloader) and a tea cup model.

Using tinyobjloader I was able to load in the vertices from the .obj file into my program and use my renderer to show them to the screen. I had object laoding!
But there was still an issue, everything was still a wireframe. So I had to implement an algorithm to fill the triangle.
This took a while, maybe a whole day but eventually I got it working.

I was pretty tired but I decided to do one more thing, **depth**. I made a depth buffer in around 2 hours and that was it.

---



I know, it's not a lot but I spent like 4 days on it and I think I learned most things about software rendering.
There were a few reasons why I stopped working on this project:
1. I had to go on vacation so I didn't have time to work
2. I kinda didn't want to work on the project anymore, it was starting to get kinda boring after doing *just* rendering for so long
3. There was a new project I was starting to think of..

You might be wondering what that new project is, and I actually talked about before on an older blog.

---

## A compiler

Yup, that's right. A compiler.

I wanted to do it around a month about it if you remember, but I cancelled the idea and did a software renderer. But I'm ready to get back to it.
In fact, I already have. The past few days I've worked on a compiler for my own programming language, and it's ready for it's first release.

The next blog (which will be releasing in a couple of hours!!) will be talking about this compiler and how I built it.

---

That was about it. Make sure to check out the software renderer github and the compiler later today!


## Renderer Github page [here](https://github.com/gummyniki/software_renderer)

