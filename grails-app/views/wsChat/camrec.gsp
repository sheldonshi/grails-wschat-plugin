<!DOCTYPE html>
<html>
<head>

<g:if test="${enduser?.verifyAppVersion().equals('assets')}">
	<g:render template="/assets"/>
</g:if>
<g:else>
	<g:render template="/resources"/>
</g:else>
    
   <title>${chatTitle }</title>
</head>
<body>

<g:javascript>
  if (!window.WebSocket) {
		var msg = "Your browser does not have WebSocket support";
		$("#pageHeader").html(msg);
	}
	var	webSocketCam = new WebSocket("ws://${hostname}/${meta(name:'app.name')}/WsCamEndpoint/${user}/${chatuser}");

	webSocketCam.onmessage = function(msg) {
		var target = document.getElementById("target");
		url = window.URL.createObjectURL(msg.data);
		target.onload = function() {
			window.URL.revokeObjectURL(url);
		};
		target.src = url;
	}
	
	window.onbeforeunload = function() {
		webSocketCam.send("DISCO:-");
		webSocketCam.onclose = function() { }
		webSocketCam.close();
	}
	
	
</g:javascript>

 <div id="pageHeader"></div>
       <div  style="visibility: hidden; width: 0; height: 0;">
              <canvas width="320" id="canvas" height="240"></canvas>
       </div>

       <div>
              <img id="target" style="display: inline;" />
       </div>
      

</body>
</html>