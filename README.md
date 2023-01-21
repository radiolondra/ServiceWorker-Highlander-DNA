# ServiceWorker-Highlander-DNA
MV3 Extension: Service Worker stays alive forever.
  
### NOTE
For the version that produces the same result but with external intervention of content scripts see [**Service Worker Highlander**](https://github.com/radiolondra/ServiceWorker-Highlander).  
  
### What is this?  
This is a Chromium extension to demonstrate how a service worker can be started in RUNNING status and manages to keep itself active forever (RUNNING state), without any external intervention.  
  
There are no content scripts that activate this service worker. It will do everything by itself.  

The "magic" seems to be due to the activation of listeners on the tabs (Created, Updated and Removed). When the browser is opened, even after a restart of the PC, the service worker will be running and will remain in that state forever, thanks to the usual **Highlander** function.  
  

### IMPORTANT  
> Remember to debug the Service Worker using **chrome://serviceworker-internals** only. Do not use Devtools page or your debug will be not reliable.