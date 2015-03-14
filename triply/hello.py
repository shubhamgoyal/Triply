import requests
import mechanize
import pprint
import json
import random

import flask
from flask import Flask, request

browser = mechanize.Browser()
browser.set_handle_robots(False)

API_KEY_TRIPADVISOR = 'SingaporeHack-CDCCADCA7505'

subcategories_list_tripadvisor = ['other', 'activities', 'nightlife', 'shopping', 'bars', 'clubs', 'food_drink', 'ranch_farm', 'adventure', 'gear_rentals', 'wellness_spas', 'classes', 'sightseeing_tours', 'performances', 'sports', 'outdoors', 'amusement', 'landmarks', 'zoos_aquariums', 'museums', 'cultural']
subcategories_restaurants_list_tripadvisor = ['bakery', 'cafe', 'deli', 'fast_food', 'sit_down']
subcategories_restaurants_cuisines_list_tripadvisor = ['African','American','Asian','Bakery','Barbecue','British','Cafe','Cajun & Creole','Caribbean','Chinese','Continental','Delicatessen','Dessert','Eastern European','Fusion%2FEclectic','European','French','German','Global%2FInternational','Greek','Indian','Irish','Italian','Japanese','Mediterranean','Mexican%2FSouthwestern','Middle Eastern','Pizza','Pub','Seafood','Soups','South American','Spanish','Steakhouse','Sushi','Thai','Vegetarian','Vietnamese']
subcategories_restaurants_prices_list_tripadvisor = [i + 1 for i in range(4)]

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

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
		if not subcategory:
			subcategory = random.choice(subcategories_list_tripadvisor)
		recommendations_url = 'http://api.tripadvisor.com/api/partner/2.0/location/' + location_id + '/attractions?key=' + API_KEY_TRIPADVISOR + '&subcategory=' + subcategory
		response = browser.open(recommendations_url)
		html_doc = str(response.read())
		json_dict = json.loads(html_doc)
		results_list = json_dict['data']
		pprint.pprint(results_list)
		result_random = random.choice(results_list)
		detail_url = result_random['api_detail_url']
		response_detail = json.loads(str(browser.open(detail_url).read()))
		result_random['api_detail_url'] = response_detail
		return flask.jsonify(result_random)
	elif str(type) == 'restaurants':
		while(True):
			lat = request.args.get('lat')
			lon = request.args.get('lon')
			restaurant_type = request.args.get('type_rest')
			restaurant_cuisine = request.args.get('cuisine_rest')
			restaurant_price = request.args.get('price_rest')
			if not restaurant_type:
				restaurant_type = random.choice(subcategories_restaurants_list_tripadvisor)
			if not restaurant_cuisine:
				restaurant_cuisine = random.choice(subcategories_restaurants_cuisines_list_tripadvisor)
			if not restaurant_price:
				restaurant_price = str(random.choice(subcategories_restaurants_prices_list_tripadvisor))
			if not lat and not lon:
				recommendations_restaurants_url = 'http://api.tripadvisor.com/api/partner/2.0/location/' + location_id + '/restaurants?key=' + API_KEY_TRIPADVISOR + '&subcategory=' + restaurant_type + '&cuisines=' + restaurant_cuisine + '&prices=' + restaurant_price
				response = browser.open(recommendations_restaurants_url)
				html_doc = str(response.read())
				json_dict = json.loads(html_doc)
				results_list = json_dict['data']
				if results_list == []:
					pprint.pprint('Angel is ugly')
					continue
				pprint.pprint(results_list)
				result_random = random.choice(results_list)
				detail_url = result_random['api_detail_url']
				response_detail = json.loads(str(browser.open(detail_url).read()))
				result_random['api_detail_url'] = response_detail
				return flask.jsonify(result_random)
			else:
				pprint.pprint('Angel is stupid')
				recommendations_restaurants_url = 'http://api.tripadvisor.com/api/partner/2.0/map/' + lat + ',' + lon + '/restaurants?key=' + API_KEY_TRIPADVISOR + '&subcategory=' + restaurant_type + '&cuisines=' + restaurant_cuisine + '&prices=' + restaurant_price + '&lunit=km&distance=1'
				response = browser.open(recommendations_restaurants_url)
				html_doc = str(response.read())
				json_dict = json.loads(html_doc)
				results_list = json_dict['data']
				if results_list == []:
					pprint.pprint('Angel is ugly')
					continue
				pprint.pprint(results_list)
				result_random = random.choice(results_list)
				detail_url = result_random['api_detail_url']
				response_detail = json.loads(str(browser.open(detail_url).read()))
				result_random['api_detail_url'] = response_detail
				return flask.jsonify(result_random)
		

# @app.route('/stop')

# @app.route('/flights')

if __name__ == '__main__':
	app.debug = True
	app.run()