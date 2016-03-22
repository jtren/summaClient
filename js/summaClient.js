/*!
 * SUMMA Client JavaScript Library
 * http://people.aifb.kit.edu/ath/summaClient/
 *
 * Includes jQuery and jQueryUI
 * http://jquery.com/
 * http://jqueryui.com/
 *
 * Copyright 2015 Andreas Thalhammer
 * Released under the MIT license and GPL v3.
 * https://github.com/athalhammer/summaClient/blob/master/LICENSE
 *
 * Date: 2015-08-28
 */
function summa(uri, topK, language, fixedProperty, id, service) {
	//$("#" + id).after("<div id=" + id + "_loading><img src='css/images/712.GIF'></div>");
	//$("#" + id + "_loading").hide();
	$("#" + id).hide();
	$.ajaxSetup({
		accepts : {
			"json" : "application/rdf+json, application/json, text/javascript"
		},
		contents : {
			"rdf+json" : "application/rdf+json"
		},
		converters : {
			"rdf+json json" : jQuery.parseJSON
		}
	});
	var url = service + "?entity=" + uri + "&topK=" + topK + "&maxHops=1";

	if (language != null) {
		url += "&language=" + language;
	}
	if (fixedProperty != null) {
		url += "&fixedProperty=" + fixedProperty;
	}
	$.ajax({
		dataType : "json",
		url : url,
		beforeSend : function() {
			// show loading bar
			$("#" + id + "_loading").show();
		},
		complete : function() {
			// remove loading bar
			$("#" + id + "_loading").remove();
		},
		success : function(data) {
			function label(uri) {
				var part1 = data[uri];
				if (part1 != null) {
					return labels = part1["http://www.w3.org/2000/01/rdf-schema#label"][0]["value"];
				} else {
					var strArry = uri.split("/");
					return strArry[strArry.length - 1];
				}
			}

			var print = {
				"entity" : "",
				"statements" : []
			};

			var keys = Object.keys(data);

			for ( i = 0; i < keys.length; i++) {
				var types = data[keys[i]]["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];
				if (types != null) {
					if (types[0]["value"] == "http://purl.org/voc/summa/Summary") {
						print["entity"] = data[keys[i]]["http://purl.org/voc/summa/entity"][0]["value"];
					}
					if (types[0]["value"] == "http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement") {
						var statement = {
							"subject" : "",
							"predicate" : "",
							"object" : ""
						};
						statement["subject"] = data[keys[i]]["http://www.w3.org/1999/02/22-rdf-syntax-ns#subject"][0]["value"];
						statement["predicate"] = data[keys[i]]["http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate"][0]["value"];
						statement["object"] = data[keys[i]]["http://www.w3.org/1999/02/22-rdf-syntax-ns#object"][0]["value"];
						print.statements.push(statement);
					}
				}
			}
			$("#" + id).append("<div style='float:right' id='" + id + "_close'>x</div><h2>" + label(print.entity) + "</h2><table></table>");
			//REN
			var url2 = "http://km.aifb.kit.edu/services/duckbpedia?dbpedia=" + uri;
			var statement2 = {
				"img" : "",
				"text" : ""
			};
			$.ajax({
				dataType : "json",
				url : url2,
				success : function(data) {
					var keys2 = Object.keys(data);
					for ( i = 0; i < keys.length; i++) {
						var types2 = data[keys2[i]];
						if (types2 != null) {
							if (keys2[i] == 'Image') {
								console.log("checkpoint");
								statement2["img"] = types2;
							}
							if (keys2[i] == 'Abstract') {
								statement2["text"] = types2;
							}
						}
					}
					//if abstract longer than 80 characters, it is shortened to the next full-stop after 80 characters
					//problem: why is text background grey?
					//stupid toggle button
					if (statement2["text"].length < 50) {
						if (statement2["img"] == "") {//exception: no image
							$("#" + id).children("table").prepend("<tr><td>" + statement2["text"] + "</td><td>" + "" + "</td>");
						} else {
							$("#" + id).children("table").prepend("<tr><td>" + statement2["text"] + "</td><td>" + "<img src =" + statement2["img"] + ">" + "</td></tr>");
						}
					} else {
						if (statement2["img"] == "") {//exception: no image
							var shorttext = statement2["text"].substring(0, statement2["text"].indexOf(".", 49) + 1);
							var resttext = statement2["text"].substring(statement2["text"].indexOf(".", 49) + 1 + " ", statement2["text"].length);
							var tabletext = "<span class='short'>" + shorttext + "</span>" + "<span class='rest'>" + resttext + "</span>" + "<span class='more'>" + "(more...)" + "</span>";

							$("#" + id).children("table").prepend("<tr><td>" + tabletext + "</td><td>" + "" + "</td>");
							/*var clicked = false;
							clicktoggle = function() {
								if (clicked) {
									clicked = false;
									console.log("hi 1");
								} else {
									clicked = true;
									console.log("hi 2");
								}
							};
							$(".more").clicktoggle();*/

						} else {
							$("#" + id).children("table").prepend("<tr><td>" + statement2["text"] + "</td><td>" + "<img src =" + statement2["img"] + ">" + "</td></tr>");
						}
					}

				}
			});
			//REN end
			for ( i = 0; i < print.statements.length; i++) {
				if (print.statements[i].subject == print.entity) {
					$("#" + id).children("table").append("<tr><td>" + label(print.statements[i].predicate) + "&nbsp;&nbsp;&nbsp;&nbsp;</td><td><a class=\"" + id + " " + "click\" id=\"" + print.statements[i].object + "\" href=\"#" + print.statements[i].object + "\">" + label(print.statements[i].object) + "</a></td></tr>");
				} else if (print.statements[i].object == print.entity) {
					$("#" + id).children("table").append("<tr><td>" + label(print.statements[i].predicate) + " of&nbsp;&nbsp;&nbsp;&nbsp;</td><td><a class=\"" + id + " " + "click\"id=\"" + print.statements[i].subject + "\" href=\"#" + print.statements[i].subject + "\">" + label(print.statements[i].subject) + "</a></td></tr>");
				}
			}
			$("#" + id).append("<i style='font-size:10px'>_______<br>Summary by <a href='" + service.substring(0, service.lastIndexOf("/")) + "'>" + service.substring(0, service.lastIndexOf("/")) + "</a></i>");
			$("#" + id).show();
			$("#" + id + "_close").click(function() {
				$("#" + id).remove();
			});
			$('.' + id + '.click').click(function() {
				$("#" + id).empty();
				$("#" + id).hide();
				summa(this.id, topK, language, fixedProperty, id, service);
			});
		}
	});
}

function qSum(topK, lang, fixedproperty, service) {
	var clicked = false;
	$("[its-ta-ident-ref]").mouseover(function() {
		var letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
		var identifier = letter + Date.now();
		$("body").append("<div class='sum sum-popup' id='" + identifier + "'></div>");
		$("#" + identifier).position({
			my : "left top",
			at : "right",
			of : $(this),
			collision : "fit"
		});
		summa($(this).attr("its-ta-ident-ref"), topK, lang, fixedproperty, identifier, service);
	});
	$("[its-ta-ident-ref]").click(function() {
		clicked = true;
	});
	$("[its-ta-ident-ref]").mouseout(function() {
		if (!clicked) {
			$(".sum-popup").remove();
		} else {
			clicked = false;
		}
	});
}
