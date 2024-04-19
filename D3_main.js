// Load the Pokémon data from CSV
d3.csv("mdf.csv").then(data => {
    data.forEach(d => {
        d.generation = +d.generation;
        d.hp = +d.hp;
        d.attack = +d.attack;
        d.defense = +d.defense;
        d.sp_attack = +d.sp_attack;
        d.sp_defense = +d.sp_defense;
        d.speed = +d.speed;
    });

    // Group the data by generation
    const nestedData = d3.group(data, d => d.generation);

    // Calculate the average values for each statistic for each generation
    const averagesData = [];
    nestedData.forEach((generationData, generation) => {
        const averageValues = {
            generation: generation,
            hp: d3.mean(generationData, d => d.hp),
            attack: d3.mean(generationData, d => d.attack),
            defense: d3.mean(generationData, d => d.defense),
            sp_attack: d3.mean(generationData, d => d.sp_attack),
            sp_defense: d3.mean(generationData, d => d.sp_defense),
            speed: d3.mean(generationData, d => d.speed)
        };
        averagesData.push(averageValues);
    });

    // Define the dimensions for the SVG container and margins
    const svgWidth = 1000;
    const svgHeight = 400;
    const margin = { top: 20, right: 150, bottom: 50, left: 70 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Append the SVG object to the chart container
    const svg = d3.select("svg#chart-container")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define x and y scales
    const xScale = d3.scaleBand()
        .domain(averagesData.map(d => d.generation))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(averagesData, d => d3.max([d.hp, d.attack, d.defense, d.sp_attack, d.sp_defense, d.speed]))])
        .nice()
        .range([height, 0]);

    // Define the tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Draw bars for each generation and each statistic
    const statKeys = ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"];
    const barWidth = xScale.bandwidth() / statKeys.length;

    statKeys.forEach((stat, i) => {
        svg.selectAll(`.bar-${stat}`)
            .data(averagesData)
            .enter()
            .append("rect")
            .attr("class", `bar-${stat}`)
            .attr("x", d => xScale(d.generation) + i * barWidth)
            .attr("y", d => yScale(d[stat]))
            .attr("width", barWidth)
            .attr("height", d => height - yScale(d[stat]))
            .attr("fill", d3.schemeCategory10[i])
            .on("click", function() {
                // Show tooltip on click
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(`${stat}: ${d3.select(this).data()[0][stat].toFixed(2)}`) // Rounded to 2 decimals
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                // Hide tooltip on mouseout
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });

    // Draw x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    // Draw y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 20}, 20)`);

    statKeys.forEach((stat, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendItem.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d3.schemeCategory10[i]);

        legendItem.append("text")
            .attr("x", 15)
            .attr("y", 5)
            .attr("dy", "0.35em")
            .text(stat);
    });

    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.top + 20})`)
        .style("text-anchor", "middle")
        .text("Generation");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Stat Value");
});
