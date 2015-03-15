var search_result_template = '<span class = "city"> {{{name}}}</span>';

var recommendation_template = '<div class = "container-fluid" style = "padding:0px;">\
						<div class = "col-xs-12 recommendationItem"  style = "padding:0px; margin-top:5px; margin-bottom:5px; margin-left:10px; margin-right:10px; height:100px; background:white; padding-top:10px; font-size:20px;">\
							<div class = "container-fluid">\
								<!--<div class = "itemColor" style = "position:absolute; background:#25D526;width:20px;left:0px;height:100px; top:0px; left:0px;"></div>-->\
								<div class="col-xs-12" style = "padding-left:40px;">\
									<div class = "row">\
										<div class = "col-xs-12">\
											<h4> {{name}} </h4>\
										</div>\
									</div>\
									<div class = "row">\
										<div class = "col-xs-6">\
											<h6> {{type}} </h6>\
										</div>\
										<div class = "col-xs-6" style = "text-align:right;">\
											<h6></h6>\
										</div>\
									</div>\
								</div>\
							</div>\
						</div>\
					</div>';

var hotel_template = '<span class = "city"> {{name}}</span><img class ="pull-right" src = "{{imageUrl}}"/>';