# ServiceWorker-Highlander-DNA

MV3 Extension: **Service Worker stays alive forever**.

### NOTE

For the version that produces the same result but with external intervention of content scripts see [**Service Worker Highlander**](https://github.com/radiolondra/ServiceWorker-Highlander).  

### What is this?

This is a Chromium extension to demonstrate how a service worker can be started in *RUNNING* status and manages to keep itself active forever, without any external intervention.  

There are no content scripts that activate this service worker. It will do everything by itself.  

 

When the browser is opened, even after a restart of the PC, the service worker, and all the running activities, will start/continue running and will remain in that state forever, thanks to the usual **Highlander** function.

#### WebSocket Test

A simple WebSocket client was added to demonstrate how communications with the remote/local (echo) web socket server remains active forever thanks to **Highlander**. The included WebSocket Test client simply sends a message to a connected server every 30 seconds. The server simply echoes the received message back.

You can use 2 different websocket servers, and the choice has to be done in the extension's code:

in *websockettest.js*, you can enable the remote websocket server:

`var endpoint = "wss://ws.ifelse.io";`

or the local one, provided in this repository, which echoes any received message back to all the connected clients (broadcast) and must be run before to open the extension's host browser:

`var endpoint = "ws://localhost:8000";`

The local web socket server is provided as a *PyCharm* project. You can open it in PyCharm and build the final executable (for Windows OS) by using the provided *pyinstaller .spec file* or download an already built .exe file from Releases. To build the executable for other OSes you'll have to modify the pyinstaller .spec file.

#### Always-on browser extensions

Thanks to **Highlander**,  the service worker of an extension can remain active forever even after the host browser is closed. 

All activities handled by the service worker (e.g., the accompanying WebSocket Test) will also continue to run forever.
To do this, just comment out a few lines of code and you are done. **Read the comments in the *serviceworker.js* code for more details.**

#### Debugging Highlander and Websocket Test

You can debug: 

- using *chrome://serviceworker-internals* page (or *edge://serviceworker-internals* depending by where the extension is installed). 

- running the provided *local websocket server* (`endpoint = "ws://localhost:8000"`) and then opening (and connecting) the provided *websocket.html page* in a browser different than the one hosting the extension. Using this way, you can close the extension's host browser and see the debug results in the websocket.html page directly  (remember to click the provided "*Connect*" button in the page).  Using the local web socket server is especially useful when the extension is configured to survive even after the host browser is closed (see the section *Always-on browser extensions* above)