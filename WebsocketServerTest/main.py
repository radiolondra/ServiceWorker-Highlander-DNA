from threading import Thread
from time import sleep
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer

clients = []
debug = False
lport = 8000

class WebsocketBroadcasterHandler(WebSocket):

    def handleMessage(self):
        #if debug:
        #    self.sendMessage(self.data)
        for client in clients:
            client.sendMessage(self.address[0] + u' - ' + self.data)

    def handleConnected(self):
        #if debug:
        print (self.address, 'connected')
        clients.append(self)

    def handleClose(self):
        #if debug:
        print (self.address, 'closed')
        clients.remove(self)


class BroadcasterWebsocketServer(Thread):

    def __init__(self, host, port, debugInfo=False):
        Thread.__init__(self)
        self.server = SimpleWebSocketServer(host, port, WebsocketBroadcasterHandler)
        self._isClosed = False
        global debug
        debug = debugInfo
        #self.setDaemon(True)

    def start(self):
        super(BroadcasterWebsocketServer, self).start()

    def run(self):
        #if debug:
        print ('starting server listening on port:', lport)
        self.server.serveforever()

    def stop(self):
        #if debug:
        print ('closing server')
        self.server.close()
        self._isClosed = True

    def waitForIt(self):
        try:
            while self._isClosed is False:
                sleep(0.1)
        except KeyboardInterrupt:
            pass

    def broadcast(self, msg):
        if isinstance(msg, str):
            msg = str(str.encode(msg), "utf-8")
        for client in clients:
            client.sendMessage(msg)
            while client.sendq:
                opcode, payload = client.sendq.popleft()
                remaining = client._sendBuffer(payload)
                if remaining is not None:
                    client.sendq.appendleft((opcode, remaining))
                    break

server = BroadcasterWebsocketServer('', lport, False)
server.start()