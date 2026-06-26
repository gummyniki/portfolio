title: I built a Programming Language
date: 2026-6-26

Hey guys! As promised, here's the compiler blog.
If you haven't read the previous blog, go check it out first,
this one is going to be a long one.

---

## What is Techlang?

Techlang is a compiled, statically typed programming language 
with a C-like syntax and modern features.
It compiles directly to native binaries using LLVM, 
the same compiler infrastructure used by languages like Rust, 
Swift, and Clang.

Here's what a basic Techlang program looks like:

```techlang
!import(std.tec) as std;

struct person = {
    int age;
    string name;
}

function greet(person p) returns none {
    std.print_string(p.name);
}

function main() returns none {
    person p;
    p.age = 25;
    p.name = "Alice";
    greet(p);
}
```

The language supports:
- Basic types (int, float, double, char, string, bool)
- Arrays and pointers
- Structs and enums
- Functions with parameters and return types
- If/else, while, and for loops
- A module system with file imports
- A standard library

---

## Why did I build this?

A while back I had an idea: what if two programming languages 
could talk to each other natively, with zero overhead?
Not through some painful FFI system, but as a first class feature.

I wanted to build two languages that shared the same type system 
and could call each other's functions directly.
That idea stuck with me, and eventually I decided to just start building.

The first step was making one language that actually works.
So that's what this blog is about.

---

## How a compiler works

Before getting into the details, here's a quick overview of 
what a compiler actually does.

When you write source code and compile it, it goes through 
several stages:

**1. Lexing** — The source code (raw text) gets broken into tokens.
`int x = 5 + 3;` becomes:
`[KW_INT] [IDENTIFIER: x] [EQUALS] [INT_LITERAL: 5] [PLUS] [INT_LITERAL: 3] [SEMICOLON]`

**2. Parsing** — The tokens get turned into an Abstract Syntax Tree (AST),
a tree structure that represents the program's structure.

**3. Semantic Analysis** — The AST gets checked for logical errors —
type mismatches, undefined variables, wrong number of arguments, etc.

**4. IR Generation** — The AST gets lowered to LLVM IR,
a portable assembly-like language that LLVM can optimize and 
compile to any target.

**5. Code Generation** — LLVM takes the IR and produces a native binary.

I built all of these from scratch in C++.

---

## Building the Lexer

The lexer was the first thing I built, and honestly the most 
straightforward part.

The idea is simple, walk through the source code character by 
character and group them into tokens. 
Keywords like `int` and `function`, identifiers like variable names, 
literals like `42` and `"hello"`, and operators like `+` and `==`.

The trickiest part was two-character operators like `==`, `+=`, `!=`.
You need to look one character ahead before deciding what token 
you're making — otherwise you'd emit `=` and then `=` separately 
instead of `==`.

---

## Building the Parser

The parser takes the flat list of tokens and turns them into a tree.

I used a **recursive descent parser**, one function per language 
construct, each calling the others recursively.
For example, `parseStatement()` calls `parseIfStatement()`, 
which calls `parseExpression()`, which calls `parseAddSub()`, 
which calls `parseMulDiv()`, and so on.

The most interesting part of the parser is **operator precedence**.
Making sure `2 + 3 * 4` evaluates as `2 + (3 * 4)` and not 
`(2 + 3) * 4` requires splitting expression parsing into multiple 
layers, one per precedence level.
Higher precedence operators get parsed deeper in the call chain, 
which naturally makes them bind tighter.

---

## The Semantic Analyzer

Once I had an AST, I needed to check that the program actually 
made sense, not just syntactically, but logically.

The semantic analyzer walks the AST and checks things like:
- Is this variable declared before it's used?
- Does this function call have the right number of arguments?
- Are you trying to assign a string to an int?
- Is this variable marked const but being reassigned?

The core data structure is a **symbol table**, a scoped stack 
of maps that tracks every declared variable and function.
When you enter a block, you push a new scope.
When you leave, you pop it.
Looking up a variable searches from the innermost scope outward,
which is how variable shadowing works.

---

## LLVM IR Generation

This is where things get really interesting.

LLVM IR is a typed, portable assembly language. 
Instead of targeting x86 or ARM directly, I lower my AST to LLVM IR 
and let LLVM handle the rest — optimization, register allocation, 
machine code generation for any target architecture.

For example, this Techlang function:
```techlang
function add(int a, int b) returns int {
    return a + b;
}
```

Becomes this LLVM IR:
```llvm
define i32 @add(i32 %a, i32 %b) {
entry:
    %a.addr = alloca i32
    %b.addr = alloca i32
    store i32 %a, i32* %a.addr
    store i32 %b, i32* %b.addr
    %a.val = load i32, i32* %a.addr
    %b.val = load i32, i32* %b.addr
    %addtmp = add i32 %a.val, %b.val
    ret i32 %addtmp
}
```

Which then compiles to a native binary that runs directly on your CPU.

The trickiest part of IR generation was control flow: 
if statements, while loops, and for loops all require creating 
multiple **basic blocks** and branching between them.
A basic block is a straight-line sequence of instructions 
with no branches in the middle — every block must end with 
either a return or a branch to another block.

One bug that took me a while to track down: 
if a function has an early return inside an if block, 
the `ret` instruction acts as the block terminator.
But my code was then trying to add a `br` instruction 
to jump to the merge block — which is invalid because 
you can't have two terminators in the same block.
The fix was to check `getTerminator()` before adding any branch.

---

## The Standard Library

Techlang has a standard library (`std.tec`) that provides 
basic functions like printing, reading input, math, and casting.

The implementation was interesting, the standard library is 
written in C (`std.c`), compiled to an object file (`stdlib.o`), 
and linked with the compiled Techlang program at the end.

Techlang functions can map to C implementations using the 
`extern` keyword:
```techlang
function print_int(int x) returns none extern "tec_print_int" {}
```

This tells the compiler to call `tec_print_int` from the C 
standard library when `std.print_int()` is called in Techlang.

---

## The Module System

One of my favourite features is the import system.
You can split code across multiple `.tec` files and import them:

```techlang
!import(math.tec) as math;

int result = math.add(3, 4);
```

When the compiler sees an import, it lexes and parses the 
imported file, extracts its declarations, prefixes them with 
the alias (`math.add`, `math.multiply`, etc), 
and injects them into the current program before compilation.

Since everything ends up in the same LLVM module, 
cross-file function calls have zero overhead.

---

## Hardest Bugs

A few bugs that gave me real trouble:

**The opaque pointer problem** — LLVM 17+ removed typed pointers.
In older LLVM you could ask a pointer "what type do you point to?"
In newer LLVM, a pointer is just a pointer with no type info attached.
I had to build a separate `pointerTypeScopes` system to track 
pointee types manually throughout compilation.

**The fallthrough bug** — I had two `case` statements in a switch 
with missing `break` statements. 
When an enum declaration was generated, it fell through into 
struct instance generation and crashed.
Classic C++ gotcha that cost me way more time than it should have.

**The array parameter type mismatch** — When passing arrays to 
functions, LLVM sees a `[5 x i32]` (fixed size) at the call site 
but the function signature expects `[0 x i32]` (unknown size).
The fix was to treat array parameters as pointers to the element 
type, which is exactly how C handles it under the hood.

**The std library implementation issue** — At first All std functions were hardcoded
in the IR generator, which worked for a bit but then started giving a lot of errors, 
functions like `print` being declared multiple times, parameter type missmatches,
and eventually I decided to completely rewrite the std library implementation to use a
.tec file with all the definitions that connects to a C implementation.

---

## What's next for Techlang?

Techlang is just getting started.
The immediate roadmap includes a VS Code extension for syntax 
highlighting, more standard library functions, and a package manager.

But the big one, the reason I started this project in the first 
place, is still coming.

I'm planning a **companion GPU compute language** that integrates 
directly with Techlang.
The idea is that you write your main logic in Techlang and your 
parallel compute kernels in the companion language, 
and they can call each other natively with zero overhead since 
they both compile to LLVM IR.

I haven't seen anyone else do this, and I think it could be 
genuinely exciting.
More on that in a future blog.

---

That's about it! This was by far the most complex project I've 
ever built, and also the most rewarding.
If you're interested in compilers I highly recommend trying to 
build one — even a tiny one.
You'll learn more about how programming languages actually work 
than any book or course can teach you.

## Techlang GitHub page [here](https://github.com/gummyniki/techlang)