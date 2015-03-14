var map,xid;

var startDate, endDate;

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
	$('#search').keyup(function(e){
		e.preventDefault();
		if((this.value == "" || this.value == undefined)) {
			$('#search_bar_holder').animate({'padding-top':'250px'},200);
			document.getElementById('search_results').innerHTML = "";
		} else {
			$('#search_bar_holder').animate({'padding-top':'40px'},200);

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
	});
}

var currentRecommendations = [];


function startPlanning(){
	
}

var count = 0;
function generateRecommendationAttraction(sub, callback){
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
					lon: data.longitude
				}
				callback(null,cbObj);
			}
		});
	}(callback);
}
function generateRecommendationRestaurant(cuisine, callback){
	count++;
	if(count > 4){
		count = 0;
	}
	var recos = ['African','American','Asian','Bakery','Barbecue','British','Cafe','Cajun & Creole','Caribbean','Chinese','Continental','Delicatessen','Dessert','Eastern European','Fusion%2FEclectic','European','French','German','Global%2FInternational','Greek','Indian','Irish','Italian','Japanese','Mediterranean','Mexican%2FSouthwestern','Middle Eastern','Pizza','Pub','Seafood','Soups','South American','Spanish','Steakhouse','Sushi','Thai','Vegetarian','Vietnamese']
	if(!cuisine)
		cuisine = recos.randomElement();		
	new function(cb){
		$.ajax('/recommendations?type=restaurants&loc_id=' + tripAdvisorId + '&cuisine_rest='+cuisine, {
			success:function(data){
				var cbObj = {
					name:data.name,
					web_url : data.web_url,
					cat : data.subcategory[0].localized_name,
					lat: data.latitude,
					lon: data.longitude
				}
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
