var map,xid;

var startDate, endDate;

var curlat, curlon;


var tripAdvisorId;
function initialize() {
	var mapOptions = {
		zoom: 5,
		center: new google.maps.LatLng(1.3000, 103.8000),
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById('google-map-canvas'),
		mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);


window.onload = function(){
	initListeners();

	$('#enter_email').keyup(function(e){
		if(e.keyCode == 13){
			transitionView('end_view', "99% Complete!", 'end_view1', function(){});
		}
	})
	$('recommendation_results').css('height', '620px');
	var nativeGeoloation = window.navigator.geolocation;
	nativeGeoloation.getCurrentPosition(function (x){ 
		curlat = x.coords.latitude;
		curlon = x.coords.longitude;
	});

	$('#submit_trip').click(function(){
		document.getElementById('google-map-canvas').style.width = "100%";
		document.getElementById('google-map-canvas').style.left = "0px";

		transitionView('planning_view', "Time for hotels!", "hotel_view", function(){
			var tmp = Handlebars.compile(hotel_template);
			$.ajax('/hotels?loc_id='+tripAdvisorId, {
				success:function(data){
					for(var i in data.data){
						var currentHotel = data.data[i];
						var r = document.createElement('div');
						r.className = "search_result";
						r.setAttribute('data-img', currentHotel.image_url);
						r.setAttribute('data-loc-id', currentHotel.id);
						r.setAttribute('data-url', currentHotel.web_url);
						r.innerHTML = tmp({name:currentHotel.name, imageUrl : currentHotel.rating_image_url});
						$(r).click(function(){
							$('#hotel_view').fadeOut(200);
							transitionView('hotel_view', "Cool! Almost Done!", 'end_view', function(){

							});
						});
						$(r).hover(function(){
							ximg = document.createElement('img');
							ximg.src = this.getAttribute('data-img');
							ximg.style.width = "300px";
							ximg.style.height = "auto";
							ximg.style.right = "0px";
							ximg.style.position = "absolute";
							ximg.style.bottom = "20px";
							ximg.onclick = function(){
								this.parentNode.removeChild(this);
							};
							document.body.appendChild(ximg);
						}, function(){
							if(ximg !== undefined)
								document.body.removeChild(ximg);
						})
						document.getElementById('hotel_search_results').appendChild(r);
					}
				}
			})
});
})
}


var timeout = 20;

function transitionView(currentViewID, transitionText, nextViewID, cb){
	$('#loader').css('display','block');
	document.getElementById('transition_text').innerText = transitionText;
	$('#'+currentViewID).fadeOut(600, function(){
		$('#transition_view').fadeIn(600, function(){
			setTimeout(function(callback){
				$('#transition_view').fadeOut(600, function(){
					$('#'+nextViewID).fadeIn(600, function(){
						$('#loader').css('display','none');
						if(callback !== undefined){
							callback();
						}
					});
				});
			},1500,cb);
		});
	})
}

function initListeners(){
	search_result_template = Handlebars.compile(search_result_template);
	$('#datepicker').datepicker({
		format: "yyyy-mm-dd"
	});


	$('#submit_date').click(function(e){
		e.preventDefault();
		if($('#startDate').val() == "" || $('#endDate').val() == ""){
			document.getElementById('date_label').innerText = "Woops! Something's missing!";
			setTimeout(function(){
				document.getElementById('date_label').innerText = "Hey, When do we fly?";
			},1000);
			return;
		}
		startDate = $('#startDate').val();
		endDate = $('#endDate').val();
		transitionView('date_view', 'Great, Now where are we going?', 'search_view', function(){
			document.getElementById('search').focus();
		});

	});

	var ximg;
	$('#search').keyup(function(e){
		e.preventDefault();
		if((this.value == "" || this.value == undefined)) {
			$('#search_bar_holder').animate({'padding-top':'250px'},200);
			document.getElementById('search_results').innerHTML = "";
		} else {
			$('#search_bar_holder').animate({'padding-top':'40px'},200);
			if(this.value == "440"){
				$.ajax('/destinations?o_lat='+curlat+'&o_lon='+curlon+'&budget=440&start_date='+startDate+'&end_date='+endDate, {
					success:function(data){
						var destinations = data.data;
						for(var i in destinations){
							var currentDestination = destinations[i];
							new function(currentDestination){
								searchDestinations(currentDestination.destination.replace(' ','_').replace(' ','_'), function(id,data){
									var currentResult = data[0];
									currentResultCoords = data[0].coords.split(',');
									if(currentDestination.booking_link){
										data[0].name = "<img style = 'width:20px; height:auto;' src = 'http://images.gofreedownload.net/emirates-airlines-96815.jpg'><a href = '"+currentDestination.booking_link+"' target= '_blank'>"+data[0].name+"</a>"
									}
									var resultHTML = search_result_template({name:data[0].name + ' (Starting from SGD' + currentDestination.price +')'});
									var r = document.createElement('div');
									r.className = "search_result";
									r.setAttribute('data-loc-id', data[0].id);
									r.setAttribute('data-lat', currentResultCoords[0]);
									r.setAttribute('data-lon', currentResultCoords[1]);
									r.innerHTML = resultHTML;
									r.style.marginTop = '2000px';
									$(r).hover(function(){
										map.panTo(new google.maps.LatLng(parseFloat(this.getAttribute('data-lat')), parseFloat(this.getAttribute('data-lon'))));

									}, function(){
									})
									$(r).click(function(){
										tripAdvisorId = this.getAttribute('data-loc-id');
										transitionView('search_view', "Awesome! Let's get planning!", 'planning_view', function(){
											startPlanning();
											document.getElementById('google-map-canvas').style.width = "70%";
											document.getElementById('google-map-canvas').style.left = "30%";
										});
									});
									document.getElementById('search_results').appendChild(r);
									setTimeout(function(x){
										$(x).animate({'margin-top':'10px'});
										timeout = timeout+200;
									},timeout, r);
								});
}(currentDestination);
}
}
})
return;
} else {
	searchDestinations(this.value.replace(' ','_'), function(id, data){
		if(id != xid || data == []){return;}
		document.getElementById('search_results').innerHTML = ""
		timeout = 20;
		$('#loader').css('display','none');
		for(var i in data){
			var currentResult = data[i];
			currentResultCoords = data[i].coords.split(',');
			var resultHTML = search_result_template({name:data[i].name});
			var r = document.createElement('div');
			r.className = "search_result";
			r.setAttribute('data-loc-id', data[i].id);
			r.setAttribute('data-lat', currentResultCoords[0]);
			r.setAttribute('data-lon', currentResultCoords[1]);
			r.innerHTML = resultHTML;
			r.style.marginTop = '2000px';
			$(r).hover(function(){
				map.panTo(new google.maps.LatLng(parseFloat(this.getAttribute('data-lat')), parseFloat(this.getAttribute('data-lon'))));
			}, function(){})
			$(r).click(function(){
				tripAdvisorId = this.getAttribute('data-loc-id');
				transitionView('search_view', "Awesome! Let's get planning!", 'planning_view', function(){
					startPlanning();
					document.getElementById('google-map-canvas').style.width = "70%";
					document.getElementById('google-map-canvas').style.left = "30%";
				});
			});
			document.getElementById('search_results').appendChild(r);
			setTimeout(function(x){
				$(x).animate({'margin-top':'10px'});
				timeout = timeout+200;
			},timeout, r);
		}
	});
}
}
});
}

var currentRecommendations = [];

var markers = [];

function remove_all_markers_in_list(markers_list) {
	for (var i = 0; i < markers_list.length; i++) {
		list_marker = markers_list[i];
		list_marker.setMap(null);
		markers_list.splice(i, 1);
		i--;
	}
}

function renderRecommendations(results){
	remove_all_markers_in_list(markers);
	document.getElementById('recommendation_results').innerHTML = "";
	recommendation_templatex = Handlebars.compile(recommendation_template);
	var llarr = [];
	for(var i = 0; i<=results.length-1; i++){
		var currentResult = results[i];
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(parseFloat(currentResult.lat),parseFloat(currentResult.lon)),
			map: map,
			title: currentResult.name
		});
		markers.push(marker);
		llarr.push(new google.maps.LatLng(parseFloat(currentResult.lat),parseFloat(currentResult.lon)));
		var recoHTML = recommendation_templatex({name:currentResult.name, type:currentResult.cat});
		var r = document.createElement('div');
		r.setAttribute('data-tr-url', currentResult.web_url);
		r.setAttribute('data-lat', currentResult.lat);
		r.setAttribute('data-lon', currentResult.lon);
		r.setAttribute("data-arr", i);
		r.setAttribute('data-img', currentResult.image_url)
		r.innerHTML = recoHTML;
		$(r).hover(function(){
			map.panTo(new google.maps.LatLng(parseFloat(this.getAttribute('data-lat')), parseFloat(this.getAttribute('data-lon'))));
			ximg = document.createElement('img');
			ximg.src = this.getAttribute('data-img');
			ximg.style.width = "300px";
			ximg.style.height = "auto";
			ximg.style.right = "0px";
			ximg.style.position = "absolute";
			ximg.style.bottom = "20px";
			ximg.onclick = function(){
				this.parentNode.removeChild(this);
			};
			document.body.appendChild(ximg);
		}, function(){
			if(ximg !== undefined)
				document.body.removeChild(ximg);
		});

		$(r).dblclick(function(e){
			window.open(this.getAttribute('data-tr-url'));
		})

		$(r).bind('mouseheld', function(e) {
			if(ximg !== undefined)
				document.body.removeChild(ximg);
			$(this).css('-webkit-filter','blur(5px)');
			if(this.getAttribute('data-arr') == "1" || this.getAttribute('data-arr') == "4"){
				new function(r){
					generateRecommendationRestaurant(undefined,function(x,y){
						if(!y.cat){
							y.cat = "Food (" + y.cuisine + ")";
						}
						currentRecommendations[parseInt(r.getAttribute('data-arr'))] = y;
						renderRecommendations(currentRecommendations);
					});
				}(this);
			} else {
				new function(r){
					generateRecommendationAttraction(undefined,function(x,y){
						if(!y.cat){
							y.cat = "Food (" + y.cuisine + ")";
						}
						currentRecommendations[parseInt(r.getAttribute('data-arr'))] = y;
						renderRecommendations(currentRecommendations);
					});
				}(this);
			}
		});
		document.getElementById('recommendation_results').appendChild(r);


	}
	var LatLngList = llarr;
	var bounds = new google.maps.LatLngBounds ();
	for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
		bounds.extend (LatLngList[i]);
	}
	map.fitBounds (bounds);
}


function startPlanning(){
	map.setZoom(14);
	async.series([
		function(cb){generateRecommendationAttraction(undefined,cb);},
		function(cb){generateRecommendationRestaurant(undefined,cb);},
		function(cb){generateRecommendationAttraction(undefined,cb);},
		function(cb){generateRecommendationAttraction(undefined,cb);},
		function(cb){generateRecommendationRestaurant(undefined,cb);},
		function(cb){generateRecommendationAttraction(undefined,cb);}
		], function(err, results){
			console.log(results);
			for(var i = 0; i<=results.length-1; i++){
				var currentResult = results[i];
				if(!currentResult.cat){
					currentResult.cat = "Food (" + currentResult.cuisine + ")";
				}
				currentRecommendations.push(currentResult);
			}
			renderRecommendations(currentRecommendations);
		});
}

var count = 0;
function generateRecommendationAttraction(sub, callback){
	$('#loader').css('display','block');

	count++;
	if(count > 4){
		count = 0;
	}
	var day_recos = ['other', 'activities',  'shopping', 'ranch_farm', 'adventure', 'gear_rentals', 'wellness_spas', 'classes', 'sightseeing_tours', 'performances', 'sports', 'outdoors', 'amusement', 'landmarks', 'zoos_aquariums', 'museums', 'cultural'];
	var night_recos = ['nightlife',  'clubs', 'bars', 'wellness_spas']
	if(!sub && count >3){
		sub = "nightlife";
	} else if(!sub && count <= 3){
		sub = day_recos.randomElement();		
	}
	new function(cb){
		$.ajax('/recommendations?type=attractions&loc_id=' + tripAdvisorId + '&sub='+sub, {
			success:function(data){
				var cbObj = {
					name:data.name,
					web_url : data.web_url,
					cat : data.subcategory[0].localized_name,
					lat: data.latitude,
					lon: data.longitude,
					image_url:data.image_url
				}
				$('#loader').css('display','none');

				callback(null,cbObj);

			}
		});
	}(callback);
}
function generateRecommendationRestaurant(cuisine, callback){
	$('#loader').css('display','block');

	var url = '/recommendations?type=restaurants&loc_id=' + tripAdvisorId + '&cuisine_rest='+cuisine;
	if(!cuisine)
		url = '/recommendations?type=restaurants&loc_id=' + tripAdvisorId;
	new function(cb){
		$.ajax(url, {
			success:function(data){
				var cbObj = {
					name:data.name,
					web_url : data.web_url,
					cuisine:data.cuisine[0].localized_name,
					lat: data.latitude,
					lon: data.longitude,
					image_url:data.image_url
				}
				$('#loader').css('display','none');

				callback(null,cbObj);

			}
		});
	}(callback);
}

function searchDestinations(q, callback){
	$('#loader').css('display','block');

	var id = Math.random();
	xid = id;
	new function(id){
		$.ajax('/search?q='+q, {
			success: function(data){
				callback(id, data.data);
			}	
		});
	}(id);
}


Array.prototype.randomElement = function () {
	return this[Math.floor(Math.random() * this.length)]
}


