var resize, QRresult, QRprogress, videoEnabled;  
var video, canvasElement, canvas, loadingMessage;

$(function() {
	video = document.createElement("video");
	canvasElement = document.getElementById("canvas");
	canvas = canvasElement.getContext("2d");
	loadingMessage = document.getElementById("loadingMessage");

	QRresult = false;
  
	initQR();          

	$('#formChequeReg input[name=upload]').on('change', function(event) {
		$('a[href="#tabPhoto"]').tab('show');
		loadQR();
	});  
  

	$('a[href="#tabPhoto"]').on('show.bs.tab', function (e) {
		QRresult = false;
	});
  
	$('a[href="#tabVideo"]').on('show.bs.tab', function (e) {
	  
		QRresult = false;
	  
		if (typeof videoEnabled == 'undefined')
		{
			// Use facingMode: environment to attemt to get the front camera on phones
			navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
				if ("srcObject" in video) {
					video.srcObject = stream;
				} else {
					// Avoid using this in new browsers, as it is going away.
					video.src = window.URL.createObjectURL(stream);
				}								
				video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
				videoEnabled = true;
				video.play();
				requestAnimationFrame(tick);
			}, function() {
				$('a[href="#tabVideo"]').addClass('disabled');
				$('a[href="#tabPhoto"]').tab('show');
			});
		}
		else 
		{
			videoEnabled = true;
			video.play();
			if (!QRresult)
				requestAnimationFrame(tick);
		}
	});
  
	$('a[href="#tabVideo"]').on('hide.bs.tab', function (e) {
		video.pause();
		videoEnabled = false;
	});
  
	if (navigator.mediaDevices === undefined) 
	{
		navigator.mediaDevices = {};
	}
	
	// Some browsers partially implement mediaDevices. We can't just assign an object
	// with getUserMedia as it would overwrite existing properties.
	// Here, we will just add the getUserMedia property if it's missing.
	if (navigator.mediaDevices.getUserMedia === undefined) 
	{
		navigator.mediaDevices.getUserMedia = function(constraints) {

			// First get ahold of the legacy getUserMedia, if present
			var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			// Some browsers just don't implement it - return a rejected promise with an error
			// to keep a consistent interface
			if (!getUserMedia) {
				$('a[href="#tabVideo"]').addClass('disabled');          
				return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
			}

			// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
			return new Promise(function(resolve, reject) {
				getUserMedia.call(navigator, constraints, resolve, reject);
			});
		}
	}
});

function initQR()
{
	QRprogress = false;
  
	el = document.getElementById('resizer');

	resize = new Croppie(el, {
		viewport: { width: 220, height: 220},
		boundary: { width: 230, height: 230},
		showZoomer: true,
		enableResize: true,
		enableOrientation: true,
		mouseWheelZoom: 'ctrl'       
	});

	el.addEventListener('update', function(ev) 
	{
		points = resize.get().points;
		if (parseFloat(points[0]) > 0 && !QRresult && !QRprogress)
			checkQR();
	});         
}

function loadQR()
{
	clearQR();
  
	reader = new FileReader();    
	reader.onload = function(e) {
		resize.bind({
			url: e.target.result
		});
	};

	reader.readAsDataURL($('#formChequeReg input[name=upload]')[0].files[0]);
}

function clearQR()
{    
	$('#formChequeReg input.validate').val('').trigger('change');
	resize.destroy();
	QRresult = false;
	initQR();
}

function checkQR() 
{
	QRprogress = true;
	$('#formChequeReg input[name=stepPhoto]').val(parseInt($('#formChequeReg input[name=stepPhoto]').val()) + 1 );
	  
	resize.result({
		type: 'rawcanvas',
		size: 'original'
	}).then(function (canvas) {
		canvasContext = canvas.getContext('2d');
		canvasData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
	  
		var code = jsQR(canvasData.data, canvasData.width, canvasData.height, { inversionAttempts: "dontInvert" });
		  
		if (code)
		{ 
			points = resize.get().points;
			begin = {x: code.location.topLeftCorner.x + parseFloat(points[0]), y: code.location.topLeftCorner.y + parseFloat(points[1])};
			drawLine(
				resize.elements.canvas.getContext('2d'), 
				{x: code.location.topLeftCorner.x + parseFloat(points[0]), y: code.location.topLeftCorner.y + parseFloat(points[1])},
				{x: code.location.topRightCorner.x + parseFloat(points[0]), y: code.location.topRightCorner.y + parseFloat(points[1])},
				"#FF3B58"
			);
			drawLine(
				resize.elements.canvas.getContext('2d'), 
				{x: code.location.topRightCorner.x + parseFloat(points[0]), y: code.location.topRightCorner.y + parseFloat(points[1])},
				{x: code.location.bottomRightCorner.x + parseFloat(points[0]), y: code.location.bottomRightCorner.y + parseFloat(points[1])},
				"#FF3B58"
			);
			drawLine(
				resize.elements.canvas.getContext('2d'), 
				{x: code.location.bottomRightCorner.x + parseFloat(points[0]), y: code.location.bottomRightCorner.y + parseFloat(points[1])},
				{x: code.location.bottomLeftCorner.x + parseFloat(points[0]), y: code.location.bottomLeftCorner.y + parseFloat(points[1])},
				"#FF3B58"
			);
			drawLine(
				resize.elements.canvas.getContext('2d'), 
				{x: code.location.bottomLeftCorner.x + parseFloat(points[0]), y: code.location.bottomLeftCorner.y + parseFloat(points[1])},
				{x: code.location.topLeftCorner.x + parseFloat(points[0]), y: code.location.topLeftCorner.y + parseFloat(points[1])},
				"#FF3B58"
			);
		 
			checkQRCode(code);              
		}
		else 
			QRprogress = false;
	});  
  
	return false;
}

function checkQRCode(code)
{
	re = /^t=(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2,4})&s=([\d.]+)&fn=(\d{16})&i=(\d+)&fp=(\d+)&n=\d$/i;                
	result = code.data.match(re);
			
	if (result)
	{
		QRresult = true;

		$('#formChequeReg input[name=fn]').val(result[7]);
		$('#formChequeReg input[name=fd]').val(result[8]);
		$('#formChequeReg input[name=fpd]').val(result[9]);
		$('#formChequeReg input[name=sum]').val(result[6]);
		$('#formChequeReg input[name=time]').val(result[4] + ':' + result[5].substr(0,2));
		$('#formChequeReg input[name=date]').val(result[3] + '.' + result[2] + '.' + result[1]);

		$('#formChequeReg input.validate').trigger('change');
			  
		bootbox.alert('QR код распознан!', function() { QRprogress = false; });
		
		$('#formChequeReg input[name=mode]').val('auto' + $('a[href="#tabPhoto"].active,a[href="#tabVideo"].active').attr('href').substr(4) );		
	}
	else
		bootbox.alert('QR код распознан, но не похож на данные чека!', function() { QRprogress = false; if (videoEnabled) requestAnimationFrame(tick);});  
}

function drawLine(canvas, begin, end, color) {
	canvas.beginPath();
	canvas.moveTo(begin.x, begin.y);
	canvas.lineTo(end.x, end.y);
	canvas.lineWidth = 4;
	canvas.strokeStyle = color;
	canvas.stroke();
}

function tick() {
	if (!videoEnabled) return;
	if (QRprogress) return;
	
	loadingMessage.innerText = "⌛ Loading video..."
	if (video.readyState === video.HAVE_ENOUGH_DATA) {
		
		$('#formChequeReg input[name=stepVideo]').val(parseInt($('#formChequeReg input[name=stepVideo]').val()) + 1);
		
		loadingMessage.hidden = true;
		canvasElement.hidden = false;

		canvasElement.height = video.videoHeight;
		canvasElement.width = video.videoWidth;
		canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
		var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
	
		if (!QRresult)
		{
			QRprogress = true;
		  
			var code = jsQR(imageData.data, imageData.width, imageData.height, {
				inversionAttempts: "dontInvert",
			});
	
			if (code) {
				drawLine(canvas, code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
				drawLine(canvas, code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
				drawLine(canvas, code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
				drawLine(canvas, code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
	  
				checkQRCode(code);
			}
			else 
				QRprogress = false;
		}
	}
  
	if (!QRresult)
		requestAnimationFrame(tick);
}