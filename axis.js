(function(){

    // Alias axis for internal use.
    var a = window.axis = {};

    // [green, blue, yellow, red, purple]
    var colors = ['#5EE873', '#67BCFF', '#FFED74', '#E88A5E', '#ED74FF'];

    // Basic line chart object
    function lineChart(opt) { 

        var self = this;

        this.opt = opt || {};
        this.selector = opt.selector || 'body';

        this.isTimeseries = opt.isTimeseries || false;

        this.margin = opt.margin || {
            top: 0,
            right: 0,
            bottom: 20,
            left: 30
        };

        this.width = (opt.width || 500) - this.margin.left - this.margin.right;
        this.height = (opt.height || 300) - this.margin.top - this.margin.bottom;
        this.isTimeseries = opt.isTimeseries || false;

        this.data = opt.data;

        this.xScale = xScale(this);
        this.yScale = yScale(this);

        this.svg = d3.select(this.selector)
            .data([this.data])
            .append('svg')
            .attr('class', 'axis-line-chart')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g');

        // Draw axis
        drawAxis(this);

        this.draw = function() {

            // TODO: Handle multiple data sets on one graph.
            self.line = d3.svg.line()
                .x(function(d) {
                    if (self.isTimeseries) {
                        return self.xScale(new Date(d.x)); 
                    } else {
                        return self.xScale(d.x);
                    }
                })
                .y(function(d) { return self.yScale(d.y); });

            // TODO: handle dynamic/custom colors
            self.path = self.svg.append('path')
                .style('stroke', colors[1])
                .attr('class', 'line')
                .attr('d', self.line);

        };

        // TODO: When passing in newData, need to handle more than one
        // additional data set and transition option.
        this.update = function(newData) {

            // Add new dataset
            self.data.push(newData);

            // Rescale x/y axis
            rescaleAxis(self);

            self.path
                .transition()
                .duration(1000)
                .ease('linear')
                .attr('d', self.line);

            // Remove old dataset
            // self.data.shift();

        };

        // Draw out chart
        this.draw();

    }

    function drawAxis(self) {

        self.xAxis = d3.svg.axis()
            .orient('bottom')
            .scale(self.xScale);

        self.yAxis = d3.svg.axis()
            .orient('left')
            .scale(self.yScale);

        // Not really turning the axis off, just removing the ticks
        if (self.opt.axisOff) {
            self.xAxis.tickValues([]);
            self.yAxis.tickValues([]);
        }

        self.svg
            .append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', 'translate(0, ' + self.height + ')')
            .call(self.xAxis);

        self.svg
            .append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', 'translate(' + self.margin.left + ', 0)')
            .call(self.yAxis);

    }

    function rescaleAxis(self) {

        self.yScale.domain([d3min(self.data, 'y', false), d3max(self.data, 'y', false)]);
        self.svg.select('.y-axis')
            .transition()
            .duration(1000)
            .ease('linear')
            .call(self.yAxis);

        self.xScale.domain([d3min(self.data, 'x', self.isTimeseries), d3max(self.data, 'x', self.isTimeseries)]);
        self.svg.select('.x-axis')
            .transition()
            .duration(1000)
            .ease('linear')
            .call(self.xAxis);

    }

    function d3min(data, key, isTimeseries) {
        if (key == 'x' && isTimeseries) {
            return d3.min(data, function(d) { return new Date(d[key]); });
        } else {
            return d3.min(data, function(d) { return d[key]; });
        }
    }

    function d3max(data, key, isTimeseries) {
        if (key == 'x' && isTimeseries) {
            return d3.max(data, function(d) { return new Date(d[key]); });
        } else {
            return d3.max(data, function(d) { return d[key]; });
        }
    }

    function yScale(self) {

        var yScale;
        var yMin = d3min(self.data, 'y', false);
        var yMax = d3max(self.data, 'y', false);

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

            var xMin = d3min(self.data, 'x', false);
            var xMax = d3max(self.data, 'x', false);

            scale = d3.scale.linear()
                .domain([xMin, xMax])
                .range([(self.margin.left + self.margin.right), self.width]);

            return scale;

        }

    }

    a.lineChart = function(opt) {
        return new lineChart(opt);
    };

})();
