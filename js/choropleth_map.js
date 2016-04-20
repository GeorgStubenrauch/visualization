/* uses code by: http://bl.ocks.org/bentrm/562ad975d599badf2822 / https://gist.github.com/bentrm/562ad975d599badf2822 as well as: Learning d3.js mapping - Chapter 5 Example 2 and d3 cookbook - Chapter 12 Example Choropleth map*/
/**
Arguments:
----------
div:
id of div-tag the svg element should be appended to (including '#') as string, e.g. '#svg'

filenames:
array with three different files:
1.) path of a topojson file with geometries to create a choropleth map as string, e.g. "../data/file.json"
2.) path of a csv file with attributes to create a choropleth map (basically a csv export of the topojson file), e.g. "../data/file.csv"
3.) path of a csv file with points, e.g. measurements, that should also be displayed on top of the "basemap", e.g. "..data/points.csv"
-> e.g. ["../data/file.json","../data/file.csv","..data/points.csv"]

attributes_topojson:
For this project a shapefile was converted to topojson using a command similar to this:
topojson -o out.json -p id="ID" -- name=in.shp
To be able to use this function to automatically create a choropleth map without any changes to this code,
you would need to convert the file (must not necessarily be a shapefile) in the same manner
and pass this additional information to the function as an array,
in thise case e.g. ["name", "id"],	first: name of the input file [especially usefill if you convert multiple input files to one topojson file],
									second: the name of the property you want to keep after conversion, e.g. an id of the geometries!

attribute_choropleth:
define the two attributes (of first csv file) that are needed to create the choropleth map,
the first array entry is used to identify the different geometries, the second array entry is used to determine the class using the domain (->should be numerical) 
e.g. ["ID","AVG_VALUE"] 

attributes_tooltip:
Needed for the tooltip of the points (second csv file), array of attribute names inside the csv file that should be displayed when hovering over the points
e.g.["TYPE","AVG_VALUE","COUNT"], up to five tooltips, for more changes would need to be made

domain:
Array of numerical values that are needed to specify the classes for the choropleth map, best use the boundaries of the data (e.g. "AVG_VALUE" of the csv file)
e.g. [60, 100, 150, 250, 350] <-> <60, >60-<100, >100-<150, >150-<250, >250-<350, >350

range:
color values in hex-code to visualize different classes, important: number of colors must always be one higher than the classes
e.g. ["#0a6e01", "#40ff05", "#E4FF05", "#FFDB00", "#ff6700", "#ff0000"]
**/
function drawChoroplethMap(div,filenames,attributes_topojson,attribute_choropleth,attributes_tooltip,domain,range) {
  var tooltip_length = attributes_tooltip.length;
  var height = 900;
  var width = 800;
  var projection = d3.geo.mercator();
  var choropleth_var = void 0;
  var db = d3.map();
  var b, s, t;
  var map = void 0; // update global

  var geoID = function(d) {
	console.log(d.properties[attributes_topojson[1]]);
    return d.properties[attributes_topojson[1]];
  };
	
  var color = d3.scale.threshold().domain(domain)
			.range(range); //<-A
			
  var path = d3.geo.path().projection(projection);
  
  function click() {
	  alert("Click!");
  }
	//Modal:
				$('#myModal').on('show.bs.modal', function () {
					$(this).find('.modal-content').css({
						width:'auto', //probably not needed
						height:'auto', //probably not needed 
						'max-height':'100%'
					});
				});

	//Datasets for modal window:
	var array_datasets = ["data/single_states/bawu_stats.csv","data/single_states/bayern_stats.csv","data/single_states/berlin_stats.csv","data/single_states/brandenburg_stats.csv","data/single_states/bremen_stats.csv","data/single_states/hamburg_stats.csv","data/single_states/hessen_stats.csv","data/single_states/meckvor_stats.csv","data/single_states/niedersachsen_stats.csv","data/single_states/nrw_stats.csv","data/single_states/rlp_stats.csv","data/single_states/saarland_stats.csv","data/single_states/sachsen_anhalt_stats.csv","data/single_states/sachsen_stats.csv","data/single_states/schleswig_holstein_stats.csv","data/single_states/thueringen_stats.csv"]
				
  //Tooltip:
   var tip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function(d) {
		var tooltip = "";
		console.log(d.properties["id"]);//attributes_tooltip[0]
		if (d.properties[attributes_tooltip[0]] != undefined) {
			tooltip += "Name of state: " + d.properties[attributes_tooltip[0]]; 
		}
        if (d.properties[attributes_tooltip[1]] != undefined) {
			tooltip += "<br>" + "Total number of institutions: " + d.properties[attributes_tooltip[1]];
		}
		if (d.properties[attributes_tooltip[2]] != undefined) {
			tooltip += "<br>" + "Total number of students: " + d.properties[attributes_tooltip[2]];
		}
		if (d.properties[attributes_tooltip[3]] != undefined) {
			tooltip += "<br>" + "Avergage number of students per institution: " + d.properties[attributes_tooltip[3]];
		}
		if (d.properties[attributes_tooltip[4]] != undefined) {
			tooltip += "<br>" + "Click here for more information!" ;
		}
		if (d.properties[attributes_tooltip[5]] != undefined) {
			tooltip += "<br>" + attributes_tooltip[5] + ": " + d.properties[attributes_tooltip[5]];
		}
		tooltip += "<br>" + "Click here for more information!" ;
		return tooltip;
  });

  var svg = d3.select(div)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
	  //.call(d3.behavior.zoom()
	  //.on("zoom", redraw));
	  
  function redraw() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
  
  svg.call(tip);  

  d3.json(filenames[0], function(data) {
	d3.csv(filenames[1], function(statistics) {
		
		//get color for choropleth map:
		var rateByValue = {};
				
        statistics.forEach(function (d) { // <-B
				//console.log(d[attribute_choropleth[0]]);
				console.log(d[attribute_choropleth[0]]);
                rateByValue[d[attribute_choropleth[0]]] = Math.round( d[attribute_choropleth[1]] );
		});	
		
		var choropleth = topojson.feature(data, data.objects[attributes_topojson[0]]);

    
		projection.scale(1).translate([0, 0]);
		var b = path.bounds(choropleth);
		var s = .9 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
		var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
		projection.scale(s).translate(t);

		map = svg.append('g').attr('class', 'boundary');
	
		choropleth_var = map.selectAll('path').data(choropleth.features);

		choropleth_var.enter()
			.append('path')
			.attr('d', path)	//;
			.on('mouseover', tip.show)			// event for tooltip
			.on('mouseout', tip.hide)
			.on('click', function(d){ 
				console.log(d.properties[attributes_tooltip[0]]);
				var selected_dataset = array_datasets[d.properties["id"]-753];
				document.getElementById("modal_header").innerHTML = d.properties[attributes_tooltip[0]];
				
				//Clear div:
				$('#grouped').empty();
				$('#stacked').empty();
				$('#sortable_bar').empty();
				$('#dashboard').empty();
				
				//Grouped:
				var grouped_div = "#grouped",
				//grouped_filename = "data/single_states/bawu_stats.csv",
				grouped_filename = selected_dataset,
				grouped_attributes = ["Semester","Stud_uni","Stud_fh","Stud_ph","Stud_vfh"],	//first: attribute for x-Axis, the following attributes: attribute for y-Axis (bars)
				grouped_attributes_tooltip = [["Stud_uni","number of students at a university", ""], ["Stud_fh","number of students at a university of applied sciences", ""], ["Stud_ph","number of students at a university of education", ""], ["Stud_vfh","number of students at a university of administration", ""]],
				grouped_range = ["#006d2c","#2ca25f", "#66c2a4", "#b2e2e2"], //; //colors for bars
				grouped_y_axis_annotation = "Number of students";
				
				//Stacked:
				var stacked_div = "#stacked",
				//stacked_filename = "data/single_states/bawu_stats.csv",
				stacked_filename = selected_dataset,
				stacked_attributes = ["Semester","Stud_uni","Stud_fh","Stud_ph","Stud_vfh"],	//first: attribute for x-Axis, the following attributes: attribute for y-Axis (bars)
				stacked_attributes_tooltip = [["Stud_uni","number of students at a university", ""], ["Stud_fh","number of students at a university of applied sciences", ""], ["Stud_ph","number of students at a university of education", ""], ["Stud_vfh","number of students at a university of administration", ""]],
				stacked_range = ["#006d2c","#2ca25f", "#66c2a4", "#b2e2e2"]; //; //colors for bars
				stacked_y_axis_annotation = "Number of students";
		
				//Sortable:
				var sortable_div = "#sortable_bar",
				//sortable_filename = "data/single_states/bawu_stats.csv",
				sortable_filename = selected_dataset,
				sortable_attributes = ["Semester","Stud_total"],
				sortable_attributes_tooltip = ["total number of students", ""],
				sortable_y_axis_annotation = "Number of students";
		
				//draw charts:
				drawDashboard_modal("#dashboard", selected_dataset, ["Semester","Stud_uni","Stud_fh","Stud_ph","Stud_vfh"],["#006d2c","#2ca25f", "#66c2a4", "#b2e2e2"]);   
				drawGroupedVerticalBar(grouped_div,grouped_filename,grouped_attributes,grouped_attributes_tooltip,grouped_range,grouped_y_axis_annotation);
				drawStackedVerticalBar(stacked_div,stacked_filename,stacked_attributes,stacked_attributes_tooltip,stacked_range,stacked_y_axis_annotation);
				drawSortableBarChart(sortable_div,sortable_filename,sortable_attributes,sortable_attributes_tooltip,sortable_y_axis_annotation);
	
				//button settings when loading the page:
				document.getElementById('button_grouped').disabled = true; 
				document.getElementById('button_stacked').disabled = false;
				document.getElementById('button_sortable').disabled = false;
				document.getElementById('button_dashboard').disabled = false;  
				document.getElementById('label_checkbox').style.visibility="hidden";
				document.getElementById('checkbox').checked = false;
	
				$(document.getElementById('grouped')).show();
				$(document.getElementById('stacked')).hide();
				$(document.getElementById('sortable_bar')).hide();
				$(document.getElementById('dashboard')).hide();
				
				$('#myModal').modal('show');
			});			// event for tooltip 

		choropleth_var.attr("fill", function (d) {
						var col = color(rateByValue[d.properties[attributes_topojson[1]]]);
						console.log(col);
						return col; // <-C
        });

		choropleth_var.exit().remove();

		
		//legend:                         
		var legend = svg.selectAll('g.legendEntry')
			.data(color.range())
			.enter()
			.append('g').attr('class', 'legendEntry');

		legend
			.append('rect')
			.attr("x", width - 150)
			.attr("y", function(d, i) {
				return (height - 350) + (i * 20);
			})
			//.attr("y", height - 500)
			.attr("width", 10)
			.attr("height", 10)
			.style("stroke", "black")
			.style("stroke-width", 1)
			.style("fill", function(d){return d;}); 

		legend
			.append('text')
			.attr("x", width - 130) //leave space of about 5 pixel after the rectangles
			.attr("y", function(d, i) {
				return (height - 350) + (i * 20);
			})
			.attr("dy", "0.8em") //place text one line "below" the x,y point
			.text(function(d,i) {
				var extent = color.invertExtent(d);
				//extent will be a two-element array, format it however you want:
				var format = d3.format("0.2f");
				return format(+extent[0]) + " - " + format(+extent[1]);
			});
	
	});	
	
  });
}

function updateData(clicked_buttonid) {
	
	var arrayChartsData = [['button_grouped','grouped'],['button_stacked','stacked'],['button_sortable','sortable_bar'],['button_dashboard', 'dashboard']];
		
	//Disable clicked button and change drawType as well as enable other buttons:
	for (i = 0; i<arrayChartsData.length; i++) {
		singleChartArray = arrayChartsData[i];
		console.log(singleChartArray[0]);
		console.log(singleChartArray[1]);
		if (clicked_buttonid == singleChartArray[0]) {
			//Disable clicked button:
			document.getElementById(clicked_buttonid).disabled = true; 	
			$(document.getElementById(singleChartArray[1])).show();
			if (clicked_buttonid == "button_sortable") {
				document.getElementById(singleChartArray[1]).style.display = true;
			//	document.getElementById('lable_checkbox').style.display="inline"; 
				document.getElementById('label_checkbox').style.visibility="visible";

			}
		} else {
			//Enable other buttons:
			document.getElementById(singleChartArray[0]).disabled = false;
			//Disable display of div:
		//	document.getElementById(singleChartArray[1]).style.display = false;
			$(document.getElementById(singleChartArray[1])).hide();
			if (clicked_buttonid != "button_sortable") {
				document.getElementById('label_checkbox').style.visibility="hidden";
			//	document.getElementById('lable_checkbox').style.display="none";  
			}
		}			
	}	
};