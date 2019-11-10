export function readCsv(path) {
  return new dex.promise(function (resolve) {

    d3.csv(path, function (input) {
      var header = Object.keys(input[0]);
      var data = input.map(function (row) {
        var csvRow = header.map(function (col) {
          return row[col];
        });
        return csvRow;
      });

      resolve(new dex.csv(header, data));
    });
  });
};

export function readTsv(path) {
  return new dex.promise(function (resolve) {

    d3.tsv(path, function (input) {
      var header = Object.keys(input[0]);
      var data = input.map(function (row) {
        var csvRow = header.map(function (col) {
          return row[col];
        });
        return csvRow;
      });

      resolve(new dex.csv(header, data));
    });
  });
};

export function transformXmlXpath(xpaths) {
  return function (xml) {
    var header = Object.keys(xpaths);
    var csv = new dex.csv(header);

    header.map(function (h) {
      //dex.log("XPATHS[" + h + "] = " + xpaths[h]);
      xpath = xml.evaluate(xpaths[h], xml);
      //dex.log(xpath);
      var xi = 0;
      try {
        var thisNode = xpath.iterateNext();

        while (thisNode) {
          if (!csv.data[xi]) {
            csv.data[xi] = [thisNode.textContent];
          }
          else {
            csv.data[xi].push(thisNode.textContent);
          }
          xi++;
          //dex.log("NODE", thisNode.textContent);
          thisNode = xpath.iterateNext();
        }
      }
      catch (e) {
        alert('Error: Document tree modified during iteration ' + e);
      }
    });
    return csv;
  };
};

export function transformXmlRows(xml) {
  var xpath = "//row[1]/*";
  var xpaths = {};
  xpath = xml.evaluate(xpath, xml);

  try {
    var thisNode = xpath.iterateNext();

    while (thisNode) {
      //dex.log("NODE", thisNode.localName);
      xpaths[thisNode.localName] = "//row/" + thisNode.localName;
      thisNode = xpath.iterateNext();
    }
  }
  catch (e) {
    alert('Error: Document tree modified during iteration ' + e);
  }

  //dex.log("XPATHS", xpaths);
  return transformXmlXpath(xpaths)(xml);
};

export function readXml(path, transformer) {
  var transform = transformer || io.transform.xml.rows;

  return new dex.promise(function (resolve) {

    d3.xml(path, function (xml) {
      resolve(transform(xml));
    });
  });
};

export function readJson(path, transformer) {
  var transform = transformer || function (json) {
    return new dex.csv(json);
  }

  return new dex.promise(function (resolve) {

    d3.json(path, function (json) {
      resolve(transform(json));
    });
  });
};