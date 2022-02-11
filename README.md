# ICARUS Terminal

_ICARUS Terminal is an immersive, context-sensitive second screen interface for the game [Elite Dangerous](https://www.elitedangerous.com/)._

**ICARUS Terminal is currently in early access.**

**[Download the latest preview release.](https://github.com/iaincollins/icarus/releases/latest)**

![Screenshot](https://user-images.githubusercontent.com/595695/153534956-03f6d8fd-5a5c-4db2-aac4-a15d483a5cba.png)

## About ICARUS Terminal

* ICARUS Terminal is currently in early access and is incomplete.
* You can run ICARUS Terminal in a single window, in multiple windows or connect remotely from another computer, tablet or other device with a browser (or any combination of those) and the information displayed will update in real time.
* The application checks for new releases when it starts and will give you the option to install the update.
* The application includes integrations with services like [EDSM](https://www.edsm.net), [EDDB](https://eddb.io/) and [INARA](https://inara.cz/). Data such as your current in-game location will be provided to them order to render information in the interface, but does not include information about you (e.g. your commander name or ship name) or any personally identifiable information.
* Windows 10 or newer is required. Builds are not currently signed with a code signing certificate.

----

## Overview

_This documentation is intended for developers._

ICARUS is a Windows (Win32) application built primarily in JavaScript, using Node.js + WebSockets and Go with a fork of custom [Edge/WebView2 abstraction in C/C++](https://github.com/iaincollins/webview).

The self-contained installer is around 20 MB and has no dependancies. If you are running an older but supported release of Windows, any missing run time dependancies will be automatically and transparently installed by the bundled Microsft installer.

## Getting Started

The codebase is split up into three parts:

* `src/app` — "ICARUS Terminal.exe", a Win32 application written in Go
* `src/service` — "ICARUS Service.exe", a Win32 application written in Node.js
* `src/web` — A web based interface developed in Next.js/React

### ICARUS Terminal.exe

"ICARUS Terminal.exe" serves as both a launcher and a shell to render the graphical interface. It creates new terminal windows by spawing itself with the `--terminal` and `--port` flags). All terminal processes exit when the launcher terminates. 

"ICARUS Terminal.exe" uses [a fork of a webview wrapper for Go/C++](https://github.com/iaincollins/webview) which uses the Microsoft Edge/Chromium engine included in Windows to render the interface. This library has been manually bundled with this project in `resources/dll`, along with a suitable loader from Microsoft. This project does not install it's own webview rendering engine and uses the one built into Windows.

There can be multiple instances of "ICARUS Terminal.exe" running. ICARUS Terminal is designed to allow you to pin multiple windows to a single screen, or run multiple windows across different screens. The first instance will be designated as the "launcher" window. The launcher will have a different interface to the terminal windows and is responsible for starting and stopping the background service, for checking for updates and for shutting down terminal windows when the main window (the launcher) is closed.

### ICARUS Service.exe

"ICARUS Service.exe" is a self contained service, websocket server and a static webserver. The service interfaces with the game, broadcasts events to terminals (using a two way socket based API) and allows the graphical interface to be accessed remotely from computers, tablets and phones. ICARUS Service is invoked automatically by "ICARUS Terminal.exe" and is stopped when "ICARUS Terminal.exe" is quit.

The user interface is written in Next.js/React and is statically exported and the assets bundled inside "ICARUS Service.exe", making it an entirely self contained service that can be used without "ICARUS Terminal.exe", by connecting to the service via a web browser - an approach which makes the codebase highly portable, as it leaves "ICARUS Terminal.exe" to handle interactions with native OS APIs for things like window management and software updates.

All terminals (and any web clients) connect to the same single instance of service which receives and broadcasts messages to all of them using a websocket interface. There should only ever one instance of "ICARUS Service.exe" running at a time. It defaults to runnning on port 3300, although this is configurable at run time using command line flags.

## Building

### Requirements

To build the entire application you need to be running Microsoft Windows and have the following dependencies installed:

* [Go Lang](https://golang.org/) to build the Win32 app (ICARUS Terminal)
* [Node.js](https://nodejs.org/en/download/)  to build the socket service (ICARUS Service) and React UI
* [NSIS (Nullsoft Scriptable Install System)](https://nsis.sourceforge.io/) to build the Windows installer (can install with `winget install NSIS.NSIS`)

You may also need the following dependancies, depending on the build steps you wish to run (e.g. if you are building assets):

* [Python 3](https://www.python.org/downloads/) for building assets and binaries
* [Visual Studio](https://visualstudio.microsoft.com/downloads/) or MS Build Tools with "Desktop development with C++" for working with Windows APIs

Currently Elite Dangerous is only offically supported on Windows (and consoles) however you can build and run the core cross platform on Windows, Mac and Linux. ICARUS Terminal does not currently support integration with console platforms (XBox and PlayStation) as they use a different implementation of the API.

### Building on Windows

With the required build tools and dependencies installed (`npm install`) you can build the application in a single step:

* `npm run build`

This will output a standalone installer "ICARUS Setup.exe" in `dist/` directory.

Intermediate builds can be found in `build/` directory. See `build/bin` for the final binaries, these can be run in place without having to run the installer. If you run "ICARUS Terminal.exe" it will start the "ICARUS Service.exe" automatically in the background (and shut it down again when the main Terminal window is closed).

You can also run each build step independently:

* `npm run build:app` builds only the GUI app (ICARUS Terminal.exe)
* `npm run build:service` builds only the service (ICARUS Service.exe)
* `npm run build:package` builds only the Windows installer (ICARUS Setup.exe)
* `npm run build:web` builds only the web interface; required to build the service as is an embedded resource
* `npm run build:assets` builds assets (icons, fonts, etc) - e.g. used to update the icon font
* `npm run build:clean` resets the build environment

You can also generate fast, unoptimized builds to test executables without building an installable package:

* `npm run build:debug` build ICARUS Terminal.exe and ICARUS Service.exe with debug output and no optimization
* `npm run build:debug:app` build ICARUS Terminal.exe with debug output and no optimization
* `npm run build:debug:service` build ICARUS Service.exe with debug output and no optimization

A debug build displays debug information on the console and builds very quickly (1-2 seconds). The functionality should be the same, however builds may be slower and binary sizes are significantly larger.

Note:

"ICARUS Terminal.exe" depends on "ICARUS Service.exe" being in the same directory to run, or it will exit on startup with a message indicating unable to start the ICARUS Terminal Service, so you must build the service at least once before you can launch "ICARUS Terminal.exe" directly.

### Building cross platform (Win/Mac/Linux)

The only requirement for building the core service is [Node.js](https://nodejs.org/en/download/).

You can easily build a native standalone binary for Windows, Mac and Linux with:

* `npm install`
* `npm run build:standalone`

This will create a binary for the platform you are running in `dist/icarus-terminal-service`.

For usage information run `icarus-terminal-service` with `--help`.

Notes:

* The standalone binary does not feature auto-update notifications.
* The standalone binary does not have a native UI, you must connect via a browser.
* Features that depend on native UI (e.g. always on top, borderless) are not supported.

As the game itself is not supported by the developers on Mac or Linux I do not plan to aim for feature parity on these platforms.

## Development (cross platform)

You can run ICARUS Terminal in development mode by starting the service with the web interface alongside it. Both must be running at the same time for the interface to be accessible. You should start the web inteface first to avoid the service halting because it cannot find the web UI.

All you need installed is Node.js and ideally have configured a `.env` file to point to some save game data.

* `npm run dev:web` start the web interface (has hot reloading)
* `npm run dev:service` start the service (does not have hot reloading)
* You can access the UI via http://localhost:3300

## Contributing / Feedback

Please feel free to ask questions or float ideas in Discussions. 

I'm not currently taking code contributions, looking for bug reports or able to provide support. 

It's helpful to raise issues if there are problems actually running the software, however I'm not looking for bug reports relating to game data or application state. This software is still in early access and as such as there are many known issues as lots of functionality is incomplete.

You are free to fork this codebase and use it to make your own app. See the LICENSE file for details. Please do not raise pull requests against this repo.

## Credits

_ICARUS Terminal would not be possible without work from dozens of enthusiasts and hundreds of open source contributors._

The name ICARUS was suggested by [SpaceNinjaBear](https://www.reddit.com/user/SpaceNinjaBear) on Reddit.

Loading animation by James Panter (http://codepen.io/jpanter/pen/PWWQXK).

Includes origional icons, icons inspired by those found in Elite Dangerous and icons based on those from https://edassets.org (see https://github.com/SpyTec/EDAssets for contributors).

Uses stellar cartography data from the wonderful [EDSM API](https://www.edsm.net).

Includes game data collated and provided by [EDCD](https://github.com/EDCD/FDevIDs).

The [Jura font](https://fonts.google.com/specimen/Jura#glyphs) is included under the Open Font License.

Thank you to [Serge Zaitsev](https://github.com/zserge) for his work on the WebView library.

ICARUS Terminal uses imagery from Elite Dangerous, which copyright Frontier Developments plc. This software is not endorsed by nor reflects the views or opinions of Frontier Developments and no employee of Frontier Developments was involved in the making of it.

Thank you to all those who have created and supported libraries on which this software depends.
