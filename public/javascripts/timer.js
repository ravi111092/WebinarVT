var day;
var sec;
var ticker;

function getSeconds() {
	let now 			= new Date();
	let days 			= 3;
	let next			= new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0 , 0);
	
	let current 	= now.getTime();
	let nextTime	= next.getTime();
	let diff			= parseInt((nextTime - current)/1000);
	
	if (diff > 0) { 
		day = days - now.getDay();
	} else {
		day = days - now.getDay() - 1;
	}
	
	if (day < 0) {
		day += 7;
	}
	
	if (diff <= 0) {
		diff += (86400 * 7)
	}
	
	startTimer (diff);
}

function startTimer(secs) {
	sec = parseInt(secs);
	ticker = setInterval("tick()", 1000);
	tick();
}

function tick() {
	let secs = sec;
	
	if (secs > 0) {
		sec--;
	} else {
		clearInterval(ticker);
		getSeconds();
	}
	
	let days = Math.floor(secs/86400);
	secs %= 86400;
	let hours = Math.floor(secs/3600);
	secs %= 3600;
	let mins = Math.floor(secs/60);
	secs %= 60;
	
	$('#days').text('0' + day);
	$('#hours').text(((hours < 10) ? '0' : '') + hours);
	$('#minutes').text(((mins < 10) ? '0' : '') + mins);
	$('#seconds').text(((secs < 10) ? '0' : '') + secs);
}

$(document).ready(function() {
	getSeconds();
})