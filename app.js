/* global d3, topojson */

d3.queue()
  .defer(d3.json, './us.json')
  .defer(d3.csv, './2016_US_County_Level_Presidential_Results.csv', function(row) {
    return {
      votes_dem: +row.votes_dem,
      votes_gop: +row.votes_gop,
      total_votes: +row.total_votes,
      state_abbr: row.state_abbr,
      county_name: row.county_name,
      state_abbr: row.state_abbr,
      combined_fips: +row.combined_fips,
      voter_ratio: +row.votes_dem / +row.votes_gop
    }

  })
  .await(function(error, mapData, electionData) {
    if (error) throw error;

    var geoData = topojson.feature(mapData, mapData.objects.counties).features;
    
    electionData.forEach(row => {
      var counties = geoData.filter(d => d.id === row.combined_fips);
      counties.forEach(county => county.properties = row);
    });
    
    var countyScale = []
    geoData.forEach(function(data) {
      countyScale.push(data.properties.combined_fips)
    })
    
    var voterScale = []
    geoData.forEach(data => {
      voterScale.push(data.properties.voter_ratio)
    })
    console.log(voterScale)
    

    function voteColor(data) {
        if(data.voter_ratio < 1) {
          return gopColorScale(data.voter_ratio)
        }
        else if(data.voter_ratio > 1 && data.voter_ratio < 1.5) {
          return demColorScale1(data.voter_ratio)
        }
        else if(data.voter_ratio === undefined)
          return "rgba(188,57,57,0.5)"
        else 
         return demColorScale2(data.voter_ratio)
    } 
    
    var gopColorScale = d3.scaleLinear()
                     .domain([d3.min(electionData, d => d.voter_ratio ), 1])
                     .range(["rgb(188,57,57)", "rgba(188,57,57,0.25)"])
                     
    var demColorScale1 = d3.scaleLinear()
                     .domain([1, 1.5])
                     .range(["rgba(38, 106, 169, 0.15)", "rgba(38, 106, 169, 0.5)"])
                     
     var demColorScale2 = d3.scaleLinear()
                     .domain([1.5, d3.max(electionData, d => d.voter_ratio )])
                     .range(["rgba(38, 106, 169,0.5)", "rgb(38, 106, 169)"])
  
    var legendText = ["100% Clinton", "", "50%", "", "little margin","", "50%", "", "100% Trump"]  
    var legendData = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    var legendColor = d3.scaleOrdinal()
                      .domain(legendData)
                      .range(["rgb(38,106,169)", "rgba(38,106,169, 0.75)", "rgba(38,106,169, 0.5)", "rgba(38,106,169, 0.25)", "white", "rgba(188,57,57, 0.25)", "rgba(188,57,57, 0.5)", "rgba(188,57,57, 0.75)", "rgb(188,57,57)"])
                      

    var width = 1280;
    var height = 720;

    var projection = d3.geoAlbersUsa()
        .scale(1400)
        .translate([width / 2, height / 2]);     

    var path = d3.geoPath()
                .projection(projection)
                
    var tooltip = d3.select("body") 
                  .append("div")
                  .classed("tooltip", true)                
                    
    d3.select("svg")
        .attr("width", width)
        .attr("height", height)
      .selectAll(".county")
      .data(geoData)
      .enter()
        .append("path")
        .classed("county", true)
        .attr("d", path)
        .attr("fill", d => voteColor(d.properties))
        .on("mousemove", function(d) {
            tooltip
              .style("opacity", 1)
              .style("top", (event.pageY + 30) + "px")
              .style("left", (event.pageX + 30) + "px")
              .html(
                `<h4>${d.properties.county_name + ', ' + d.properties.state_abbr}</h4>
                 <p>Clinton: ${d.properties.votes_dem}</p>
                 <p>Trump: ${d.properties.votes_gop}</p>
                 <p>Total Votes: ${d.properties.total_votes}</p>`
              )
        })
        .on("mouseout", function() {
          tooltip
              .style("opacity", 0)
        })
    
      
      //Legend 
      
      var legend = d3.select("svg")
                   .append("g")
                   .classed("legend", true)
                   .attr("transform", "translate(1100, 450)")
            
      legend
          .selectAll("rect")
          .data(legendData)
          .enter()
          .append("rect")
          .attr("height", 20)
          .attr("width", 20)
          .attr("y", function(i) {
                 return i * 20
          })
          .attr("fill", d => legendColor(d))
      
      legend
          .selectAll("text")
          .data(legendText)
          .enter()
          .append("text")
          .attr("height", 20)
          .attr("y", function(d, i) {
                 return i * 20
          })
          .attr("transform", "translate(40, 35)")
          .attr("font-weight", "bold")
          .text(d => d)
    
});

















	



