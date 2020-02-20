/* 	Sends http request to the specified url to load .json file or data and 
executes callback function with parsed json data objects. */

d3.json("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then((d) => {
    createPlot(d)
});

const createPlot = (data) => {

    const H = 400,
        W = 800;
    const height = H - 80;
    const width = W - 100;
    const color1 = '#FF0074',
        color2 = '#661AE2';

    const tooltip = d3.select('.plot')
        .append('div')
        .attr('id', 'tooltip');

    const svg = d3.select('.plot')
        .append('svg')
        .attr('width', W)
        .attr('height', H)
        .append('g')
        .attr('transform', 'translate(70, 50)');


    const Time = d3.extent(data, d => d.Time);
    const Year = d3.extent(data, d => d.Year);
    const timeFormat = d3.timeFormat("%M:%S");

    const convertTime = (time, option) => {
        let date = new Date();
        time = option != undefined ? time[option] : time;
        date.setMinutes(time.replace(/:\d+$/, ''));
        date.setSeconds(time.replace(/^\d+:/, ''));
        return date;
    }

    const maxTime = convertTime(Time, 1);
    const minTime = convertTime(Time, 0);

    // CREATION AXISES

    const xScale = d3.scaleLinear()
        .domain([Year[0] - 1, Year[1] + 1])
        .range([0, width]);

    // Time scales are similar to linear scales, but use Dates instead of numbers

    const yScale = d3.scaleTime()
        .domain([minTime, maxTime])
        .range([0, height]);

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'));

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(timeFormat);

    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    svg.append('g')
        .attr('id', 'y-axis')
        .call(yAxis)
        .append('text')
        // Text sections
        .text('Time in Minutes')
        .attr('fill', '#000')
        .attr('x', -50)
        .attr('y', -50)
        .attr('font-size', '18px')
        .attr('transform', 'rotate(-90)');

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('fill', d => d.Doping ? color1 : color2)
        .attr('cx', d => xScale(d.Year))
        .attr('cy', d => yScale(convertTime(d.Time)))
        .attr('r', 6)
        .attr('stroke', '#000')
        .attr('opacity', .9)
        .attr('data-xvalue', d => d.Year)
        .attr('data-yvalue', d => convertTime(d.Time))
        .on('mouseover', (d, i) => {
            tooltip.html(`
          <p>
            ${d.Name}: ${d.Nationality}<br/>
            Year: ${d.Year}, Time: ${d.Time}
          </p>
          <p>${d.Doping}</p> 
      `)
                .style('opacity', .9)
                .style('left', 110 + xScale(d.Year) + 'px')
                .style('top', 10 + yScale(convertTime(d.Time)) + 'px')
                .attr("data-year", d.Year)
        })
        .on('mouseout', d => {
            tooltip.style('opacity', 0)
                .style('top', 0)
                .style('left', W)
        })

    // Legend
    const g = height => svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${width - 20}, ${height})`);

    const status = (func, height, color, text) => {
        let obj = func(height);
        obj.append('rect')
            .attr('fill', color)
            .attr('width', '18px')
            .attr('height', '18px')
            .attr('y', '-14px');
        obj.append('text')
            .text(text)
            .style("text-anchor", "end")
            .attr('x', '-7px')
            .attr('font-size', '17px');
    }

    status(g, 72, color1, 'Riders with doping allegations')
    status(g, 50, color2, 'No doping allegations')

}