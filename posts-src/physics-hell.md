title: Physics engine hell
date: 2026-4-28

Hello everyone! Welcome back to my second devlog! Today I will talk about Physics Engines, how im *currently* trying to implement one and the issues I'm having.

---

So At first I had to choose a physics engine to use, since I do **not** want to make one myself. 
My 2 main choices were:
* [Jolt Physics](https://github.com/jrouwe/JoltPhysics)
* [PhysX](https://en.wikipedia.org/wiki/PhysX)

I decided on [Jolt Physics](https://github.com/jrouwe/JoltPhysics), because while [PhysX](https://en.wikipedia.org/wiki/PhysX) has more advanced features and is a much bigger and advanced project, I found Jolt's design and ease of use much better which eventually decided on using it.

---

I spent around 1-2 hours trying to add Jolt into my project since cmake was being really annoying and Jolt's build tutorial wasn't of much help.

I eventually got it working and started working on integrating it into my project. It was actually much simpler than I thought! The API was very elegant and easy to use, and I got the base Physics Engine working in about 1 hour.

The next step was integrating the Physics Engine into my current renderer, and this is when things started getting a bit tricky.

Alright so in case you don't know, a Physics Engine and a Renderer are 2 completely different things.
* **The Physics Engine** is in charge of doing all physics calculations, like gravity, collisions, soft body physics, etc.
* **The Renderer** takes in the positions and rotations from the physics engine and renders the meshes using those positions.

In about *2* hours i got a falling cube and an invisible floor in my engine, but something was wrong. My cube was falling sideways instead of downwards.

It took a while to realize what was going on, but I found out it was because Jolt and my engine used different coordinate systems.

Jolt's coordinate system is Y-up, which is very common, it means the Y coordinate of the position sets the vertical position of my mesh.

On the other hand, my engine for **some reason** uses a Z-up coordinate system. I have no idea when or why I did this, but it was too late to change it now.
I simply made all returned Jolt positions be turned into my coordinate system before being used in my renderer, and it works.

I made a rigidbody component and allowed different shapes for the colliders, like a capsule, cube and sphere. And got started on making complex collisions for procedural generation. And this was a real pain.

I actually still don't have it fully working, but I kinda left it there for another time since I have some bigger issues. The way I got it *almost* working is by feeding the noise values generated for my procedurally generated mesh into a Jolt function which would generate a shape with the correct collider using that noise. The thing is the collision is not on the mesh, it's either much lower than the mesh or a bit higher, and I couldn't find any pattern to it. 
It **also** seemed to have a horizontal offset, but I also couldn't figure that out.

---

After around 2 days I gave up on trying to fix this issue and moved on to the next: the fact that Jolt's physics basically took complete control over the object position. Which means that if a mesh was being affected by physics, I couldn't manually change the object's position using code.

I had to somehow add the offset made manually using code to the position that Jolt used for physics simulation.

I started working on it around a week ago but I didn't have much time to actually work on it, so overall I spent around *3-4 hours* trying to solve it, but to no avail. I am getting closer though.

---

Yeah so that was what I spent my last week doing, I know it's not much, but hopefully I'll step up the pace and get this done in the following weekend.

---

Also, this engine is **slowly coming to an end**, not because it's completely done, but because I think after finishing the physics engine it'll be in a good place to *end* development.

This isn't necesarily saying that I won't work on it anymore, but definetly not as much.

---

I will do a follow-up post regarding the future of this engine, but until then, take care!

---


## Engine Github page [here](https://github.com/gummyniki/Liminal)