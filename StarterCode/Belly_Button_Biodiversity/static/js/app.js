function buildMetadata(sample) {

   var url = "/metadata/" + sample;
  d3.json(url).then(function(sample){

    var sample_metadata = d3.select("#sample-metadata");

    sample_metadata.html("");

    Object.entries(sample).forEach(([key, value]) => {
      var row = sample_metadata.append("p");
      row.text(`${key}: ${value}`);

    })
  })
};

function buildCharts(sample) {

  var url = `/samples/${sample}`;
  d3.json(url).then(function(data) {

    var xValues = data.otu_ids;
    var yValues = data.sample_values;
    var tValues = data.otu_labels;
    var mSize = data.sample_values;
    var mClrs = data.otu_ids;

    var trace_bubble = {
      x: xValues,
      y: yValues,
      text: tValues,
      mode: 'markers',
      marker: {
        size: mSize,
        color: mClrs
      }
    };

    var data = [trace_bubble];

    var layout = {
      xaxis: {title: "OTU ID"}
    };

    Plotly.newPlot('bubble', data, layout);


    d3.json(url).then(function(data) {
      var pieValue = data.sample_values.slice(0,10);
      var pielabel = data.otu_ids.slice(0, 10);
      var pieHover = data.otu_labels.slice(0, 10);

      var data = [{
        values: pieValue,
        labels: pielabel,
        hovertext: pieHover,
        type: 'pie'
      }];

      Plotly.newPlot('pie', data);
    });
  });
};

function init() {
  var selector = d3.select("#selDataset");

  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    buildGuage(firstSample)

  });
};

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  buildGuage(newSample)
};

function buildGuage(sample) {
  var wfreq 
  var url = `/wfreq/${sample}`;
    d3.json(url).then(function(data) {
      wfreq=+data.WFREQ;
      console.log("data from endpoint "+wfreq)
   
  // Enter a speed between 0 and 180
  var level = wfreq*10;
  console.log("speed is "+level)
  
  // Trig to calc meter point
  var degrees = 180 - level,
       radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);
  
  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
       pathX = String(x),
       space = ' ',
       pathY = String(y),
       pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);
  
  var data = [{ type: 'scatter',
     x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'speed',
      text: level,
      hoverinfo: 'text+name'},
    { values: [50/6, 50/6, 50/6, 50/6, 50/6, 50/6, 50],
    rotation: 90,
    text: ['TOO Many!', 'Many', 'More than Required', 'Optimal',
              'Low', 'Very Low', ''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                           'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                           'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                           'rgba(255, 255, 255, 0)']},
    labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];
  
  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: '<b>Gauge</b> <br> Shower Frequency 0-10',
    height: 500,
    width: 500,
    xaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]}
  };
  
  Plotly.newPlot('gauge', data, layout);
});
}

// Initialize the dashboard
init();
