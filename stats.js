const reader = require("g-sheets-api");
const readerOptions = {
  sheetId: "1VKRUgz2hyZxii1jKlSnIxq_Be9EBOej16bYgGzhfWnQ",
  sheetNumber: 1,
  returnAllResults: false,
};


let width = 650;
let radius = width / 2.3;
let colorNone = "#eee";
let colorOut = "#00f";
let colorIn = "#f00";

let tree = d3.cluster()
    .size([2 * Math.PI, radius - 100]);

let line = d3.lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius(d => d.y)
    .angle(d => d.x);


function id(node) {
    return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}


function hierarchy(data, delimiter = ".") {
    console.log("hierarchy")
    console.log(data)
    let root;
    const map = new Map;
    data.forEach(function find(data) {
        const {name} = data;
        if (map.has(name)) return map.get(name);
        const i = name.lastIndexOf(delimiter);
        map.set(name, data);
        if (i >= 0) {
            find({name: name.substring(0, i), children: []}).children.push(data);
            data.name = name.substring(i + 1);
        } else {
            root = data;
        }
        return data;
    });
    return root;
}


function bilink(root) {
    console.log("bilink")
    console.log(root)
    console.log(root.leaves()[0].data.imports)
    const map = new Map(root.leaves().map(d => [id(d), d]));
    for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
    for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
    return root;
}





function generateTree(data) {
    console.log("generateTree")
    console.log(data)
    const root = tree(bilink(d3.hierarchy(data)
        .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));
  
    d3.select("body").select("#scheduleTable").select("svg").remove();
  
    let svg = d3.select("body").select("#scheduleTable").append("svg")
        .attr("viewBox", [-width / 2, -width / 2, width, width]);
  
    const node = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .style("fill", "white")
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
        .style("mix-blend-mode", null)
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
        link.style("mix-blend-mode", null);
        d3.select(this).attr("font-weight", null);
        d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
        d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
        d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
    }
  }


reader(readerOptions, (results) => {
    let data = []
    console.log(results)
    var temp = {}
    for (var i = 0; i < results.length; ++i) {
        var win = ""
        var lose = ""
        var result = results[i]
        if (result["win"] == "blue"){
            win = result["blue-champ"]
            lose = result["red-champ"]
        }
        else {
            lose = result["blue-champ"]
            win = result["red-champ"]
            console.log(win)
        }
        if (win == lose)
            continue
        win = "champ." + win
        lose = "champ." + lose
        if (win in temp) {
            if (!(lose in temp[win]))
            {
                temp[win].push(lose)
            }
        }
        else {
            temp[win] = [lose]
        }
        if (!(lose in temp))
        {
            temp[lose] = []
        }
    }

    for (key in temp) {
        data.push({name: key, imports: temp[key]})
    }

    console.log("data")
    console.log(data)
    generateTree(hierarchy(data))
  });


