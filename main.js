const reader = require("g-sheets-api");
const Mustache = require("mustache");
const readerOptions = {
  sheetId: "1VKRUgz2hyZxii1jKlSnIxq_Be9EBOej16bYgGzhfWnQ",
  sheetNumber: 1,
  returnAllResults: false,
};






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