(function(){

    // Alias axis for internal use.
    var a = window.axis = {};

    var colors = ['red', 'green', 'blue', 'yellow', 'black'];

    // Basic line chart object
    function lineChart(opt) { 

        var self = this;

        this.opt = opt || {};
        this.selector = opt.selector || 'body';

        this.margin = opt.margin || {
            top: 0,
            right: 0,
            bottom: 20,
            left: 30
        };

        this.width = (opt.width || 500) - this.margin.left - this.margin.right;
        this.height = (opt.height || 300) - this.margin.top - this.margin.bottom;
        this.isTimeseries = opt.isTimeseries || true; // Change back to false

        this.data = opt.data;

        this.xScale = xScale(this);
        this.yScale = yScale(this);

        this.draw = function() {

            self.svg = d3.select(self.selector)
                .data(self.data)
                .append('svg')
                .attr('class', 'axis-line-chart')
                .attr('width', self.width + self.margin.left + self.margin.right)
                .attr('height', self.height + self.margin.top + self.margin.bottom)
                .append('g');

            self.xAxis = d3.svg.axis()
                .scale(self.xScale)
                .orient('bottom');

            self.svg
                .append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(0, ' + self.height + ')')
                .call(self.xAxis);

            self.yAxis = d3.svg.axis()
                .orient('left')
                .scale(self.yScale);

            self.svg
                .append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + self.margin.left + ', 0)')
                .call(self.yAxis);

        };

        this.update = function() {
        };

        // Draw out chart
        this.draw();

    }

    function yScale(self) {

        var yScale;
        var yMin = d3.min(self.data, function(d) { return d.y; });
        var yMax = d3.max(self.data, function(d) { return d.y; });

        yScale = d3.scale.linear()
            .domain([yMin, yMax])
            .range([self.height, (self.margin.top + self.margin.bottom)]);

        return yScale;

    }

    function xScale(self) {

        var scale;

        if (self.isTimeseries) {
             scale = d3.time.scale()
                .domain(d3.extent(self.data, function(d) {
                    return new Date(d.x);
                }))
                .range([self.margin.left, self.width]);
                
            return scale;
        } else {
            // non-timeseries xScale...
        }

    }

    a.lineChart = function(opt) {
        return new lineChart(opt);
    };

})();
