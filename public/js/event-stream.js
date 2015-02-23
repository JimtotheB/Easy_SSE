// Belt and suspenders.
(function($){
  $(function() {
    var source;

    var triggerButton = $('#triggerEvent');

    var clientCount = $('#clientCount');
    var triggerCount = $('#triggeredEvents');
    var HeapT = $('#HeapT');
    var HeapU = $('#HeapU');
    var RSS = $('#RSS');

    var complexButton = $('#complexEvent');
    var clearButton = $('#clearComplex');
    var requestUrl = $('#requestUrl')
    var redditContainer = $('#reddit');
    var redditList = $('#redditData');
    redditContainer.hide()

    //
    // Modern browsers, just like everything else cool.
    // Should probably bail here if it isn't available.
    //

    if(!!window.EventSource) {
      source = new EventSource('event-stream')
    }

    //
    // Add event listener for the 'incoming' event setup on the server.
    // The inclusion of the event parameter in the server side event
    // makes it pretty easy to put multiple handlers into one event stream url
    // from your server.
    //
    // This fires on page load, and on triggerEvent button click.
    //

    source.addEventListener('incoming', function(evt) {
      var data = JSON.parse(evt.data);
      console.log(data)
      clientCount.html('  ' + data.clientCount + '  ');
      triggerCount.html('  ' + data.triggerCount + '  ');
      HeapT.html('  ' + formatMemory(data.memUsage.heapTotal) + ' ');
      HeapU.html('  ' + formatMemory(data.memUsage.heapUsed) + ' ');
      RSS.html('  ' + formatMemory(data.memUsage.rss) + ' ');
    }, false)

    //
    // This fires on complexEvent button click. Contains reddit json data, fetched from
    // reddit by the server, and passed to our event stream via eventEmitter.
    //

    source.addEventListener('complex', function(evt) {
      var data = JSON.parse(evt.data)
      redditList.empty()
      redditContainer.show()

      //Quick little lodash template string for reddit data

      var red = '<li>'
      red += '<h3><%= title %> </h3>'
      red += '<p><%- selftext %></p>'
      red += '<p><a href="<%- permalink %>">Comments</a></p>'
      red += '<p><a href="<%- url %>">Link</a></p>'
      red += '</li>'

      var template = _.template(red)
      requestUrl.html(' ' + data.url + ' ')

      // This isn't the best way to do this, but its a demo after all.
      //Just trying to show a bunch of data moving in and out.
      _.each(data.posts.data.children, function(v) {
        redditList.append(template({
          title: v.data.title,
          selftext: v.data.selftext,
          permalink: 'https://www.reddit.com' + v.data.permalink,
          url: v.data.url
        }))
      });
    }, false);

    source.addEventListener('open', function(evt) {
      console.log("Opened Event stream.")
    }, false);

    source.addEventListener('error', function(evt) {
      console.log('There was an error in the event-stream.');
      console.log(evt)
    }, false);

    //
    // Please ignore the mixed use of vanilla js and jQuery here and elsewhere. I only added it
    // once I decided to style the page with bootstrap.
    //
    triggerButton.on('click', function(evt) {
      console.log('click')
      var req = new XMLHttpRequest();
      req.open('GET', '/trigger', true);
      req.send();
    });

    complexButton.on('click', function(evt) {
      var req = new XMLHttpRequest();
      req.open('GET', '/complex', true);
      req.send();
    });

    clearButton.on('click', function(evt) {
      redditContainer.hide()
      redditList.empty()

    });
  });
})(jQuery);

//
// Nicely formatted memory numbers.
//

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