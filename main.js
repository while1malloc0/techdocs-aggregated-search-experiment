const express = require("express");
const lunr = require("lunr");
const fs = require("fs");
const process = require("process");

const app = express();
const port = 3000;

const builder = new lunr.Builder();
builder.ref("location");
builder.field("title");
builder.field("text");
// This is... not super well documented, but it gives position info for results.
builder.metadataWhitelist = ["position"];

var idx = builder.build();

// In production code, this would be a more resilient process for building
// aggregated indexes and writing them to a file, which could be periodically
// read by the express.js process.
setInterval(() => {
  // Sure, double callback for reading files, why not
  fs.readFile("first-docs-repo/site/search/search_index.json", (err, f) => {
    if (err) {
      // It's not an experiment if you don't blow up at the first sight of going
      // off the happy path
      console.log(err);
      console.log("panic");
      process.exit(1);
    }
    console.log("Updating star trek docs");
    const parsed = JSON.parse(f);
    for (let doc of parsed.docs) {
      doc.location = `first-docs-repo/${doc.location}`;
      builder.add(doc);
    }
    fs.readFile("second-docs-repo/site/search/search_index.json", (err, f) => {
      if (err) {
        console.log(err);
        console.log("panic");
        process.exit(1);
      }
      console.log("Updating star wars docs");
      const parsed = JSON.parse(f);
      for (let doc of parsed.docs) {
        doc.location = `second-docs-repo/${doc.location}`;
        builder.add(doc);
      }
      idx = builder.build();
    });
  });
}, 5000);

app.get("/", (req, res) => {
  const query = req.query.q;
  const result = idx.search(query);
  res.send(result);
});

app.listen(port, () => {
  console.log("listening");
});
