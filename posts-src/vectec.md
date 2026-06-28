title: I built a GPU compute language
date: 2026-6-28

Hey guys! Big news today: VecTec is officially working.

If you've been following my blog you know I've been building 
Techlang, my own compiled programming language. 
If you haven't, go check out the previous blog posts first,
this one builds on top of everything I've already built.

---

## What is VecTec?

VecTec is a companion language to Techlang that runs code on 
the GPU instead of the CPU.

Here's what it looks like:
```
// arrays.vtec — runs on the GPU

kernel addArrays(ArrayOf(float) a, ArrayOf(float) b) returns ArrayOf(float) {

int id = threadId();

return a[id] + b[id];

}
```

And calling it from Techlang:
```
// main.tec — runs on the CPU

!import(std.tec) as std;

!import(arrays.vtec) as gpu;
function main() returns none {

ArrayOf(float) a = {1.0, 2.0, 3.0, 4.0};

ArrayOf(float) b = {5.0, 6.0, 7.0, 8.0};
}
```

That's it. No CUDA setup. No memory management. 
No copying data to and from the GPU manually.
Just write a kernel and call it like a normal function.

The compiler handles everything automatically.

---

## Why does this matter?

GPU programming is notoriously painful. 
Here's what the equivalent CUDA code looks like:

```c
// the CUDA equivalent — brace yourself
#include <cuda_runtime.h>
#include <stdio.h>

__global__ void addArrays(float* a, float* b, float* result, int size) {
    int id = blockIdx.x * blockDim.x + threadIdx.x;
    if (id < size) {
        result[id] = a[id] + b[id];
    }
}

int main() {
    int size = 4;
    float a[] = {1.0, 2.0, 3.0, 4.0};
    float b[] = {5.0, 6.0, 7.0, 8.0};
    float result[4];

    float *d_a, *d_b, *d_result;
    cudaMalloc(&d_a, size * sizeof(float));
    cudaMalloc(&d_b, size * sizeof(float));
    cudaMalloc(&d_result, size * sizeof(float));

    cudaMemcpy(d_a, a, size * sizeof(float), cudaMemcpyHostToDevice);
    cudaMemcpy(d_b, b, size * sizeof(float), cudaMemcpyHostToDevice);

    addArrays<<<1, size>>>(d_a, d_b, d_result, size);

    cudaMemcpy(result, d_result, size * sizeof(float), 
               cudaMemcpyDeviceToHost);

    for (int i = 0; i < size; i++) {
        printf("%f\n", result[i]);
    }

    cudaFree(d_a);
    cudaFree(d_b);
    cudaFree(d_result);
    return 0;
}
```

40+ lines of boilerplate vs 15 lines of clean Techlang/VecTec code.
And this is a simple example — real CUDA programs are much more complex.

VecTec eliminates all of that.

---

## How it works under the hood

The magic happens in two stages:

**Stage 1 — VecTec compilation**

When the Techlang compiler sees `!import(arrays.vtec) as gpu`,
it automatically invokes the VecTec compiler on the kernel file.

VecTec uses LLVM's NVPTX backend to compile the kernel to PTX —
NVIDIA's GPU assembly language. 
This is the same approach used by Julia and other 
high-performance languages.

**Stage 2 — Runtime wrapper generation**

The compiler then automatically generates a C wrapper that:
- Embeds the PTX as a string constant
- Declares CUDA functions for memory allocation and kernel launching
- Wraps each kernel in a clean C function

When you call `gpu.addArrays(a, b)` in Techlang, 
the compiler generates calls to this wrapper which handles:
1. Allocating GPU memory
2. Copying data to the GPU
3. Launching the kernel with the right number of threads
4. Waiting for completion
5. Copying results back
6. Freeing GPU memory

All invisible to the programmer.

**Stage 3 — Linking**

The compiled Techlang binary, the GPU wrapper, 
and the standard library all get linked together into 
a single native executable that runs on both CPU and GPU.

---

## The compiler pipeline

arrays.vtec

↓

VecTec compiler (LLVM NVPTX backend)

↓

arrays.ptx (GPU assembly)

↓

Auto-generated C wrapper with embedded PTX

↓

nvcc compiles wrapper → arrays_runtime.o
main.tec

↓

Techlang compiler (LLVM x86 backend)

↓

main.o
main.o + arrays_runtime.o + stdlib.o

↓

gcc links everything

↓

Native binary (runs on CPU + GPU)


Both languages share the same frontend — 
the lexer, parser, and semantic analyzer are identical.
Only the backend differs — x86 for Techlang, NVPTX for VecTec.

---

## Building VecTec

The hardest parts were:

**The NVPTX target setup**

LLVM's NVPTX backend works differently from x86.
Kernels need special metadata annotations to be recognized 
as GPU entry points, and thread ID registers are accessed 
through LLVM intrinsics rather than normal function calls.

**The opaque pointer problem (again)**

Modern LLVM uses opaque pointers which means you can't ask 
a pointer "what type do you point to?" — you have to track 
that information yourself. 
This was tricky for array parameters since the element type 
needs to be known when generating GEP instructions.

**The CUDA API version**

The CUDA driver API changed `cuCtxCreate` to require 4 arguments 
in newer versions instead of 3. 
This caused a confusing compile error that took a while to track down.

**The automatic size inference**

When you call `gpu.addArrays(a, b)`, 
the compiler needs to know how many GPU threads to launch.
It automatically uses the size of the first array parameter —
so if `a` has 4 elements, 4 GPU threads are launched,
one per element.

**The manual array zise parameter**

When calling `gpu.addArrays(a, b)`, under the hood CUDA also wants the sizes for both arrays, the actual call would be `addArrays(a, aSize, b, bSize)`, I had to change the PTX generator to manually put the sizes when generating the function call.

---

## What's next for VecTec?

Right now VecTec supports basic kernels with array inputs and outputs.
The next steps are:

- **Shared memory** — fast per-thread-block memory for more 
  complex algorithms
- **2D and 3D thread grids** — for matrix operations and image processing
- **More built-ins** — `blockId()`, `blockDim()` for advanced kernels
- **Automatic optimization** — let LLVM's GPU optimizer do more work

---

## Try it yourself

Techlang and VecTec are both open source and available on GitHub.
You'll need an NVIDIA GPU and the CUDA toolkit installed.

## GitHub [here](https://github.com/gummyniki/techlang)