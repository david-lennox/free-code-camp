console.log("testWikiApi file running...")
$.getJSON(
  "https://en.wikipedia.org/w/api.php?action=query&titles=Main%20Page&prop=revisions&rvprop=content&format=json&callback=?",
  function(json) { console.log(json.query.pages); }
);