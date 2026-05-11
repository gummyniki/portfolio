title: Journey's end
date: 2026-5-11

Hello everyone, today will be my **last devlog** about my game engine. I will talk about how I fixed the remaining bugs in my engine, why I think this is a good place to end it off and what my next project will be. Let's get started

---

Starting with the bugs, I had **2 remaining issues**:
1. **A rendering and physics position mismatch**
2. **Wrong terrain collision detection**

**Physics Position Mismatch**

The physics position mismatch basically meant that i couldn't update the object's position manually using code and the physics engine had *full* control, which screwed up my debug editor.

The solution was pretty straightforward, instead of manually setting the position of my model's transform, i had to set the physics' engine transform instead using **Jolt's** own interface: 
```c++
  bodyInterface.SetPosition(...);
  bodyInterface.SetRotation(...);
```

> Actually pretty easy, but it took a bit to figure out.

And that was it for the first bug.

---

The second one with the terrain collision isn't completely fixed, **but I actually do not have the energy to work** on it anymore since I've been trying to fix it for more than 2 weeks.

I've gotten it in a decently good spot, the collision is *almost* correct, but there's a weird offset applied to the collisions' position, making it not exactly on the terrain mesh. I've honestly tried everything and I could not get it to work.

> **If anyone has experience with this**, I'd greatly appreciate it if you would look in the code and perhaps find the issue, im very curious what's causing it!

---


Well, that's about it for the engine *this week, and probably for a long time*. This will be my last blog about the game engine, for reasons stated in my last blog.

It has been my biggest project yet and I've learnt a **lot** about: 
*  **Graphics programming**
*  **C++ (memory management, performance)**
* **Engine arhitecture**

And this begs the question:
>  `What will be my next project?`

### A compiler!

I have a few reasons for this:
 * I want to learn how compilers work under the hood
 * I think it's really cool to make your own custom programming language
 * It'll be a good addition to my portfolio

I'll be writing it in **C**, one of my favourite languages and a nice breath of fresh air after all that **C++**.

I'll go more in-depth about the compiler next blog, when I will also start writing code for it, stay tuned!

It's a little bittersweet to move on after all this time, but I know it's the right call. And for the last time:

## Engine Github page [here](https://github.com/gummyniki/Liminal)

---

*Goodbye everyone, see you next week.*