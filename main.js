const reader = require("g-sheets-api");
const Mustache = require("mustache");
const readerOptions = {
  sheetId: "1VKRUgz2hyZxii1jKlSnIxq_Be9EBOej16bYgGzhfWnQ",
  sheetNumber: 1,
  returnAllResults: false,
};



function generateTree(data) {
  const root = tree(bilink(d3.hierarchy(data)
      .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

  d3.select("body").select("#graph").select("svg").remove();

  let svg = d3.select("body").select("#graph").append("svg")
      .attr("viewBox", [-width / 2, -width / 2, width, width]);

  const node = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.name)
      .each(function (d) {
          d.text = this;
      })
      .on("mouseover", overed)
      .on("mouseout", outed)
      .call(text => text.append("title").text(d => `${id(d)}
${d.outgoing.length} outgoing
${d.incoming.length} incoming`));

  const link = svg.append("g")
      .attr("stroke", colorNone)
      .attr("fill", "none")
      .selectAll("path")
      .data(root.leaves().flatMap(leaf => leaf.outgoing))
      .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("d", ([i, o]) => line(i.path(o)))
      .each(function (d) {
          d.path = this;
      });

  function overed(d) {
      link.style("mix-blend-mode", null);
      d3.select(this).attr("font-weight", "bold");
      d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorIn).raise();
      d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", colorIn).attr("font-weight", "bold");
      d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorOut).raise();
      d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorOut).attr("font-weight", "bold");
  }

  function outed(d) {
      link.style("mix-blend-mode", "multiply");
      d3.select(this).attr("font-weight", null);
      d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
      d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
      d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
      d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
  }
}



reader(readerOptions, (results) => {
  let season = -1
  console.log(results)
  for (var i = 0; i < results.length; ++i) {

    if ("season" in results[i])
    {
      season = results[i]["season"]

      var template = document.getElementById("season-template").textContent;
      var html = Mustache.render(template, {"season": season});

      li = document.createElement("li")
      li.classList.add("nav-item")
      li.innerHTML = html;
      panal = document.getElementById("seasonlist")
      panal.appendChild(li)

      console.log("generated")

      var template = document.getElementById("table-template").textContent;
      var html = Mustache.render(template, {"season": season});

      schedule = document.getElementById("scheduleTable")
      schedule.innerHTML += html


    }

    var template = document.getElementById("match-template").textContent;
    var html = Mustache.render(template, results[i]);

    tr = document.createElement("tr")
    tr.innerHTML = html
    
    panal = document.getElementById("tseason" + season)
    panal.appendChild(tr)
  }
});



