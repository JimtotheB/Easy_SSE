(function(){
  var source;

  var clientCount = document.getElementById('clientCount');
  var triggerCount = document.getElementById('triggeredEvents');
  var triggerButton = document.getElementById('triggerEvent');
  var HeapT = document.getElementById('HeapT');
  var HeapU = document.getElementById('HeapU');
  var RSS = document.getElementById('RSS');

  /*
   * Modern browsers, just like everything else cool.
   */
  if(!!window.EventSource){
    source = new EventSource('event-stream')
  }

  /*
   * Add event listener for the 'incoming' event setup on the server.
   * The inclusion of the event parameter in the server side event
   * makes it pretty easy to put multiple handlers into one event stream url
   * from your server.
   */

  source.addEventListener('incoming', function(evt){
    var data = JSON.parse(evt.data);
    clientCount.innerHTML = '  ' + data.clientCount + '  ';
    triggerCount.innerHTML = '  ' + data.triggerCount + '  ';
    HeapT.innerHTML = '  ' + formatMemory(data.memUsage.heapTotal) + ' ';
    HeapU.innerHTML = '  ' + formatMemory(data.memUsage.heapUsed) + ' ';
    RSS.innerHTML   = '  ' + formatMemory(data.memUsage.rss) + ' ';
  }, false)

  source.addEventListener('open', function(evt){
    console.log(evt)
  }, false)

  triggerButton.addEventListener('click', function(evt){
    var req = new XMLHttpRequest();
    req.open('GET', '/trigger', true);
    req.send();
  })

})();

function formatMemory(bytes) {
  var thresh, u, units;
  thresh = 1000;
  if (bytes < thresh) {
    return bytes + " B";
  }
  units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  u = -1;
  while (true) {
    bytes /= thresh;
    ++u;
    if (!(bytes >= thresh)) {
      break;
    }
  }
  return bytes.toFixed(1) + " " + units[u];
};