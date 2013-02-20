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

        // Draw axis
        drawAxis(this);

        this.draw = function() {

            var line = d3.svg.line()
                .x(function(d) { return self.xScale(new Date(d.x)); })
                .y(function(d) { return self.yScale(d.y); });

            self.svg.select('.line')
                .remove();

            // TODO: handle dynamic/custom colors
            self.svg.append('path')
                .style('stroke', colors[0])
                .attr('class', 'line')
                .attr('d', line);

        };

        // TODO: When passing in newData, need to handle more than one
        // additional data set and transition option.
        this.update = function(newData) {

            // Add new dataset
            self.data.push(newData);

            // Remove old dataset
            self.data.shift();

            // Rescale x/y axis
            //rescaleAxis(self);

            // Redraw the line with the new data point.
            self.draw(self);

        };

        // Draw out chart
        this.draw();

    }

    function drawAxis(self) {

        self.svg = d3.select(self.selector)
            .data([self.data])
            .append('svg')
            .attr('class', 'axis-line-chart')
            .attr('width', self.width + self.margin.left + self.margin.right)
            .attr('height', self.height + self.margin.top + self.margin.bottom)
            .append('g');

        self.xAxis = d3.svg.axis()
            .orient('bottom')
            .scale(self.xScale);

        self.svg
            .append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', 'translate(0, ' + self.height + ')')
            .call(self.xAxis);

        self.yAxis = d3.svg.axis()
            .orient('left')
            .scale(self.yScale);

        self.svg
            .append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', 'translate(' + self.margin.left + ', 0)')
            .call(self.yAxis);

    }

    function rescaleAxis(self) {

        self.yScale.domain([d3min(self.data, 'y'), d3max(self.data, 'y')]);
        self.svg.select('.y-axis').call(self.yAxis);

        self.xScale.domain([d3min(self.data, 'x'), d3max(self.data, 'x')]);
        self.svg.select('.x-axis').call(self.xAxis);

    }

    function d3min(data, key) {
        return d3.min(data, function(d) { return d[key]; });
    }

    function d3max(data, key) {
        return d3.max(data, function(d) { return d[key]; });
    }

    function yScale(self) {

        var yScale;
        var yMin = d3min(self.data, 'y');
        var yMax = d3max(self.data, 'y');

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

            var xMin = d3min(self.data, 'x');
            var xMax = d3max(self.data, 'x');

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
