---
title: "Writing a Virtual Camera: DirectShow vs v4l2loopback"
date: "2026-08-08"
category: "Systems"
tags: ["C++", "Windows", "Linux", "ViewCam"]
excerpt: "To make Zoom believe your app is a webcam, you have to convince two very different operating systems. One asks for a COM object registered in the registry. The other asks you to politely write frames into a file. Guess which one took a week."
---

Building ViewCam meant solving a problem most app developers never touch: making the operating system believe a camera exists when there is no camera. Every video app, Zoom, Meet, OBS, Discord, asks the OS for a list of capture devices. Your job is to be on that list and to serve frames when picked. Windows and Linux solve this in ways so different they're barely the same problem.

![Same feature, two worlds: a kernel module and three syscalls, or a COM object living inside zoom.exe](/images/VirtualCameraPaths.webp)

## Linux: v4l2loopback, the civilized option

On Linux there's a kernel module called v4l2loopback that creates a virtual Video4Linux device. You load it, you get `/dev/video2`, and any V4L2 frame you write into it comes out the other side in every app that enumerates cameras.

Your entire job on the application side:

```cpp
int fd = open("/dev/video2", O_WRONLY);
// negotiate format once with VIDIOC_S_FMT (e.g. YUYV, 1280x720)
write(fd, frameData, frameSize);   // one frame in, one frame out
```

Set the pixel format with one ioctl, then write frames. That's the core of it. There are real details around format negotiation and what each consumer app tolerates, but the architecture is a pipe with a costume on. I had a working Linux virtual camera in an afternoon and spent the rest of the week thinking something must be wrong because it couldn't be this easy.

The honest downsides: it's an out-of-tree kernel module, so users must install it, and every kernel update is a small opportunity for adventure. Packaging that experience nicely is most of the actual work.

## Windows: DirectShow, the archaeology dig

Windows has no "just write frames here" device. To be a camera, you implement a DirectShow source filter: a COM object, in C++, implementing interfaces designed in the late nineties, registered system-wide in the registry under the video input device category. Zoom asks DirectShow for cameras, DirectShow reads the registry, finds your CLSID, instantiates your DLL inside the calling process, and starts pulling frames from your output pin.

Read that again: your code runs inside Zoom's process. Every consumer app becomes a host for your filter, with its own quirks about which resolutions it accepts, which pixel formats it prefers, and how it negotiates media types. When something breaks, it breaks inside someone else's executable, and your debugging story starts with attaching to Zoom.

The rites of passage, in the order they will hurt you:

- COM reference counting by hand. Get `AddRef`/`Release` wrong and you leak forever or crash on exit, and the crash is in the host app, hours later.
- Media type negotiation. You offer formats, the app picks one, except some apps ask for the list in a different order and some just take the first thing offered. Offer plain formats first. Exotic first impressions get you a black rectangle.
- Registration. `regsvr32`, admin rights, 32 and 64 bit registry views. Half of "the camera doesn't show up" reports trace back to registration, which is why the installer matters as much as the filter.

There's a newer path on Windows 11, Media Foundation virtual cameras, with an actual supported API. It's genuinely better, and the moment your minimum OS is Windows 11 you should use it. ViewCam still ships DirectShow because users on Windows 10 exist in large numbers and they also have meetings.

## What this taught me

The same feature, a virtual webcam, is one honest afternoon on Linux and a week of COM archaeology on Windows. Neither platform is wrong, exactly. Linux trusts you with a kernel module and lets userspace be simple. Windows keeps the kernel far away and pushes the complexity into a 25 year old plugin model instead.

If you're building anything similar: do Linux first. Not because it ships first, but because it lets you validate the whole pipeline, capture, encode, transport, decode, while the virtual camera part is trivially simple. Then port the last mile to Windows when everything else already works, so that when the black rectangle appears, and it will, you at least know which layer is lying to you.
