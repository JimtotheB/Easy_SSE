### Server Sent events with Express 

One way event streams made easy.

### How can I test this out?

``` shell
 $ git clone https://github.com/PaperElectron/Easy_SSE.git
 $ npm install
 $ npm start
```
Open localhost:8080/ in a few browser windows and
start clicking some buttons. The code comments and documentation load with the demo server.

### Why not just use Socket.io?

Socket.io is complex, has pretty touch proxy requirements, and is pretty hard to add to an application.

This is pretty old hat by now, but over at [MVP Innovation](http://mvp-innovation.com/) we were in need of a solid, low overhead, low disruption-to-codebase technology to push realtime data to our customers browsers. Obviously Socket.io right...? Well, that is pretty hard to stomach when you have a large, complex existing API that already does everything you need. 

In a soft realtime situation the better option may just be SSE, which is a fairly well supported HTML5 API (IE available with a polyfill). We don't need super instant responses, and we have a complex hosting solution that makes Socket.io pretty much a no go.  

* Endless data streams and updates from the server in real time.

* Easily bind multiple server side data streams from one endpoint.

* Demo uses event emitter, send events from anywhere inside your app.

* Vastly simpler than websockets/socket.io if realtime two way streams aren't needed.

* Arguably simpler than socket.io even for two way streams. Just send data back to your existing API endpoints and emit events.


### More info?
 
[Can I use that?](http://caniuse.com/#search=eventsource)

[But there is a polyfill for IE right?](https://github.com/Yaffle/EventSource/)

[Where can I learn more about this?](https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events)