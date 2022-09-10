//  Importing Required Module
const http = require("http");
const url = require("url");
const { exec } = require("node:child_process");

/*
 We use the created http instance and call http.createServer() method to create a server instance and then we bind it at port 8080 using the listen method associated with the server instance. Pass it a function with parameters request and response.
*/
http
  .createServer(function (request, response) {
    /*

    The url.parse() method takes a URL string, parses it, and returns a URL object.
    
    @param urlString — The URL string to parse.
    
    @param parseQueryString
    If true, the query property will always be set to an object returned by the querystring module's parse() method. If false, the query property on the returned URL object will be an unparsed, undecoded string.
    
    */
    const queryObject = url.parse(request.url, true).query;

    /* 
        Extrating queryParam from url
          url : http://localhost:8080/?queryParam=apple%20or%20banana
          values : apple or banana
    */
    let values = queryObject.queryParam;

    // If queryParam is not given in url then it will return with a text "No query given"
    if (typeof values == "undefined") {
      /*
          Send the HTTP header
          HTTP Status: 200 : OK
          Content Type: text/plain
      */
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end("No query given");
      return;
    }

    /* 
        given a list of values to search in script.jl
          if found -> return first matching index "startIndex:EndIndex" ;
          if not found -> return a text as  "nothing"

          url : http://localhost:8080/?queryParam=apple%20or%20banana
          result : ["nothing", "47:48", "nothing"]
    */
    exec("julia script.jl " + values, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);

      // removing erd bracket([])
      stdout = stdout.substring(1, stdout.length - 1);

      // spliting each word
      let splited_result = stdout.split(" ");
      let splited_values = values.split(" ");
      let result = "";

      for (let x in splited_result) {
        // removing extra inverted comma and white space
        splited_result[x] = splited_result[x].substring(
          1,
          splited_result[x].length - 1
        );
        if (splited_result[x][splited_result[x].length - 1] == '"') {
          splited_result[x] = splited_result[x].substring(
            0,
            splited_result[x].length - 1
          );
        }

        let each_result =
          "<div>" +
          "<b>" +
          splited_values[x] +
          "</b>" +
          " is " +
          "<b>" +
          (splited_result[x] == "nothing" ? "not found" : "found") +
          "</b>" +
          "</div>";

        // adding each query to result
        result += each_result;
      }

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(result);
    });
  })
  .listen(8080);
