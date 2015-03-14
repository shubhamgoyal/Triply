import requests
import mechanize
import pprint
import json
import random

import flask
from flask import Flask, request, redirect, url_for

from geopy.geocoders import Nominatim

browser = mechanize.Browser()
browser.set_handle_robots(False)

API_KEY_TRIPADVISOR = 'SingaporeHack-CDCCADCA7505'
API_KEY_SKYSCANNER = 'ah575316411675885377228089817799'

NUM_HOTELS = 5

subcategories_list_tripadvisor = ['other', 'activities', 'nightlife', 'shopping', 'bars', 'clubs', 'food_drink', 'ranch_farm', 'adventure', 'gear_rentals', 'wellness_spas', 'classes', 'sightseeing_tours', 'performances', 'sports', 'outdoors', 'amusement', 'landmarks', 'zoos_aquariums', 'museums', 'cultural']
subcategories_restaurants_list_tripadvisor = ['bakery', 'cafe', 'deli', 'fast_food', 'sit_down']
subcategories_restaurants_cuisines_list_tripadvisor = ['African','American','Asian','Bakery','Barbecue','British','Cafe','Cajun & Creole','Caribbean','Chinese','Continental','Delicatessen','Dessert','Eastern European','Fusion%2FEclectic','European','French','German','Global%2FInternational','Greek','Indian','Irish','Italian','Japanese','Mediterranean','Mexican%2FSouthwestern','Middle Eastern','Pizza','Pub','Seafood','Soups','South American','Spanish','Steakhouse','Sushi','Thai','Vegetarian','Vietnamese']
subcategories_restaurants_prices_list_tripadvisor = [i + 1 for i in range(4)]

app = Flask(__name__)

@app.route('/')
def hello_world():
    return redirect(url_for("static", filename="index.html"))



@app.route('/search')
def getIDForLocation():
	location = request.args.get('q')
	search_url = "http://www.tripadvisor.com.sg/TypeAheadJson?interleaved=true&geoPages=true&blenderPages=true&flightsToPages=true&nearPages=false&details=true&types=geo&link_type=geo&neighborhood_geos=true&allowPageInsertionOnGeoMatch=false&defaultListInsertionType=hotel&max=12&nearby=true&local=true&query=" + location + "&action=API&uiOrigin=MASTHEAD&source=MASTHEAD"
	response = browser.open(search_url)
	html_doc = str(response.read())
	json_dict = json.loads(html_doc)
	results_list = json_dict['results']
	ids = []
	ids_list = []
	for result in results_list:
		if str(result['type']) == 'GEO':
			if result['value'] not in ids_list:
				pprint.pprint('I am here!')
				result_dict = {}
				result_dict['id'] = result['value']
				result_dict['name'] = result['name']
				result_dict['coords'] = result['coords']
				ids.append(result_dict)
				ids_list.append(result['value'])
	return flask.jsonify({'data':ids})

@app.route('/recommendations')
def getRecommendationsForLocation():
	pprint.pprint('I am here!')
	type = request.args.get('type')
	location_id = request.args.get('loc_id')
	subcategory = request.args.get('sub')

	if str(type) == 'attractions':
		while (True):	
			if not subcategory:
				subcategory = random.choice(subcategories_list_tripadvisor)
			recommendations_url = 'http://api.tripadvisor.com/api/partner/2.0/location/' + location_id + '/attractions?key=' + API_KEY_TRIPADVISOR + '&subcategory=' + subcategory
			response = browser.open(recommendations_url)
			html_doc = str(response.read())
			json_dict = json.loads(html_doc)
			results_list = json_dict['data']
			pprint.pprint(results_list)
			result_random = random.choice(results_list)
			if result_random['latitude'] == '0.0' and result_random['longitude'] == '0.0':
				continue
			detail_url = result_random['api_detail_url']
			response_detail = json.loads(str(browser.open(detail_url).read()))
			result_random['api_detail_url'] = response_detail
			return flask.jsonify(result_random)
	elif str(type) == 'restaurants':
		while(True):
			lat = request.args.get('lat')
			lon = request.args.get('lon')
			# restaurant_type = request.args.get('type_rest')
			restaurant_cuisine = request.args.get('cuisine_rest')
			# restaurant_price = request.args.get('price_rest')
			# if not restaurant_type:
			# 	restaurant_type = random.choice(subcategories_restaurants_list_tripadvisor)
			if not restaurant_cuisine:
				restaurant_cuisine = random.choice(subcategories_restaurants_cuisines_list_tripadvisor)
			# if not restaurant_price:
			# 	restaurant_price = str(random.choice(subcategories_restaurants_prices_list_tripadvisor))
			if not lat and not lon:
				# recommendations_restaurants_url = 'http://api.tripadvisor.com/api/partner/2.0/location/' + location_id + '/restaurants?key=' + API_KEY_TRIPADVISOR + '&subcategory=' + restaurant_type + '&cuisines=' + restaurant_cuisine + '&prices=' + restaurant_price
				recommendations_restaurants_url = 'http://api.tripadvisor.com/api/partner/2.0/location/' + location_id + '/restaurants?key=' + API_KEY_TRIPADVISOR + '&cuisines=' + restaurant_cuisine
				response = browser.open(recommendations_restaurants_url)
				html_doc = str(response.read())
				json_dict = json.loads(html_doc)
				results_list = json_dict['data']
				if results_list == []:
					pprint.pprint('Angel is ugly')
					continue
				pprint.pprint(results_list)
				result_random = random.choice(results_list)
				if result_random['latitude'] == '0.0' and result_random['longitude'] == '0.0':
					continue
				detail_url = result_random['api_detail_url']
				response_detail = json.loads(str(browser.open(detail_url).read()))
				result_random['api_detail_url'] = response_detail
				return flask.jsonify(result_random)
			else:
				pprint.pprint('Angel is stupid')
				# recommendations_restaurants_url = 'http://api.tripadvisor.com/api/partner/2.0/map/' + lat + ',' + lon + '/restaurants?key=' + API_KEY_TRIPADVISOR + '&subcategory=' + restaurant_type + '&cuisines=' + restaurant_cuisine + '&prices=' + restaurant_price + '&lunit=km&distance=1'
				recommendations_restaurants_url = 'http://api.tripadvisor.com/api/partner/2.0/map/' + lat + ',' + lon + '/restaurants?key=' + API_KEY_TRIPADVISOR + '&cuisines=' + restaurant_cuisine + '&lunit=km&distance=1'
				response = browser.open(recommendations_restaurants_url)
				html_doc = str(response.read())
				json_dict = json.loads(html_doc)
				results_list = json_dict['data']
				if results_list == []:
					pprint.pprint('Angel is ugly')
					continue
				pprint.pprint(results_list)
				result_random = random.choice(results_list)
				if result_random['latitude'] == '0.0' and result_random['longitude'] == '0.0':
					continue
				detail_url = result_random['api_detail_url']
				response_detail = json.loads(str(browser.open(detail_url).read()))
				result_random['api_detail_url'] = response_detail
				return flask.jsonify(result_random)
		

# @app.route('/stop')

@app.route('/destinations')
def getFlights():
	o_lat = request.args.get('o_lat')
	o_lon = request.args.get('o_lon')
	budget = request.args.get('budget')
	start_date = request.args.get('start_date')
	end_date = request.args.get('end_date')
	geolocator = Nominatim()
	location = geolocator.reverse(str(o_lat + ", " + o_lon), timeout=None)
	origin_city = str(location.raw['address']['city'])
	pprint.pprint(origin_city)
	places_list_url = 'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/SG/SGD/en-GB?query=' + origin_city + '&apiKey=prtl6749387986743898559646983194'
	pprint.pprint(places_list_url)
	browser.addheaders = [('accept', 'application/json')]
	response_list_places = browser.open(places_list_url)
	# pprint.pprint(places_list_url)
	html_doc_list_places = str(response_list_places.read())
	json_dict_list_places = json.loads(html_doc_list_places)
	origin_city_code = json_dict_list_places['Places'][0]['PlaceId']
	pprint.pprint(json_dict_list_places)
	browseroutes_url = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/SG/SGD/en-GB/' + origin_city_code + '/anywhere/' + start_date + '/' + end_date + '?apiKey=' + API_KEY_SKYSCANNER
	pprint.pprint(browseroutes_url)
	response = browser.open(browseroutes_url)
	html_doc = str(response.read())
	json_dict_list_routes = json.loads(html_doc)
	list_routes = json_dict_list_routes['Routes']
	list_places = json_dict_list_routes['Places']
	dict_places = {}
	for place in list_places:
		dict_places[place['PlaceId']] = place['Name']
	list_routes_cheapest_ascending = []
	for route in list_routes:
		if 'Price' in route:
			# pprint.pprint('budget = ', str(float(budget)))
			if float(budget) >= route['Price']:
				list_routes_cheapest_ascending.append({'destination': dict_places[route['DestinationId']], 'origin': dict_places[route['OriginId']], 'price': route['Price']})
	list_routes_cheapest_ascending = sorted(list_routes_cheapest_ascending, key=lambda k: k['price'])	
	# min_price_possible = 0
	pprint.pprint(json_dict_list_routes)
	pprint.pprint(browseroutes_url)
	# for route in list_routes_cheapest_ascending:
	# 	assert min_price_possible <= route['price']
	# 	min_price_possible = route['price']
	list_routes_cities_within_budget = []
	for cheap_route_country in list_routes_cheapest_ascending:
		destination = cheap_route_country['destination']
		destination_places_list_url = 'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/SG/SGD/en-GB?query=' + destination + '&apiKey=prtl6749387986743898559646983194'
		destination_places_list_url = destination_places_list_url.replace(' ', '%20')
		pprint.pprint(destination_places_list_url)
		destination_response_list_places = browser.open(destination_places_list_url)
		destination_html_doc_list_places = str(destination_response_list_places.read())
		destination_json_dict_list_places = json.loads(destination_html_doc_list_places)
		destination_country_code = destination_json_dict_list_places['Places'][0]['CountryId']
		cheap_route_country_cities_url = 'http://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/SG/SGD/en-GB/' + origin_city_code + '/' + destination_country_code + '/' + start_date + '/' + end_date + '?apiKey=' + API_KEY_SKYSCANNER
		pprint.pprint(cheap_route_country_cities_url)
		cheap_route_country_cities_dict = json.loads(str(browser.open(cheap_route_country_cities_url).read()))
		list_routes_cities = cheap_route_country_cities_dict['Routes']
		list_places_cities = cheap_route_country_cities_dict['Places']
		dict_places_cities = {}
		for place in list_places_cities:
			dict_places_cities[place['PlaceId']] = place['Name']
		for route in list_routes_cities:
			if 'Price' in route:
				if float(budget) >= route['Price']:
					list_routes_cities_within_budget.append({'destination': dict_places_cities[route['DestinationId']], 'origin': dict_places_cities[route['OriginId']], 'price': route['Price']})			
	list_routes_cities_within_budget = sorted(list_routes_cities_within_budget, key=lambda k: k['price'])				
	pprint.pprint(cheap_route_country_cities_dict)
	return flask.jsonify({'data': list_routes_cities_within_budget})

@app.route('/hotels')
def get_hotels():
	location_id = request.args.get('loc_id')
	hotels_url = 'http://api.tripadvisor.com/api/partner/2.0/location/' + location_id + '/hotels?key=' + API_KEY_TRIPADVISOR
	response = browser.open(hotels_url)
	html_doc = str(response.read())
	json_dict = json.loads(html_doc)
	hotels_list = json_dict['data']
	count = 0
	list_hotels_for_client = []
	for hotel in hotels_list:
		if count < NUM_HOTELS:
				if not (hotel['latitude'] == '0.0' and hotel['longitude'] == '0.0'):
					list_hotels_for_client.append(hotel)
					count = count + 1
	return flask.jsonify({'data': list_hotels_for_client})
	# results_list = json_dict['data']

if __name__ == '__main__':
	app.debug = True
	app.run()