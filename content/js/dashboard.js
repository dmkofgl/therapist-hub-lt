/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 55.0, "KoPercent": 45.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0545, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Get profile id"], "isController": false}, {"data": [0.215, 500, 1500, "specializations"], "isController": false}, {"data": [0.185, 500, 1500, "cities"], "isController": false}, {"data": [0.01, 500, 1500, "UPDATE course to PUBLIC"], "isController": false}, {"data": [0.0, 500, 1500, "Create course"], "isController": false}, {"data": [0.0, 500, 1500, "Login, create course and lifter all courses"], "isController": true}, {"data": [0.135, 500, 1500, "profiles/me"], "isController": false}, {"data": [0.0, 500, 1500, "login"], "isController": false}, {"data": [0.0, 500, 1500, "UPDATE created course"], "isController": false}, {"data": [0.0, 500, 1500, "GET filtered courses"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 900, 405, 45.0, 55075.70666666669, 0, 423274, 8513.0, 284109.9, 284384.6, 421066.8, 1.0311333530394373, 1.4005903578576944, 0.5442126262135867], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get profile id", 100, 31, 31.0, 8872.08, 2721, 22010, 8513.0, 14609.400000000001, 19080.99999999995, 22009.1, 1.6212710765239948, 0.0657849738570039, 0.0], "isController": false}, {"data": ["specializations", 100, 4, 4.0, 17385.48, 284, 284183, 4632.5, 19517.800000000003, 29206.549999999992, 284182.71, 0.258367890038626, 1.0284152198064824, 0.1797271635081192], "isController": false}, {"data": ["cities", 100, 2, 2.0, 10921.86, 211, 39735, 5694.5, 27176.3, 28045.7, 39663.95999999996, 0.968541763520843, 0.7108093952183093, 0.6933018678327909], "isController": false}, {"data": ["UPDATE course to PUBLIC", 100, 94, 94.0, 28231.3, 0, 285275, 0.0, 214825.5, 243287.0, 285267.58999999997, 0.17657144168816424, 0.18177029810115072, 0.06807656755711645], "isController": false}, {"data": ["Create course", 100, 65, 65.0, 78145.99999999997, 112, 284464, 10692.0, 284093.3, 284156.0, 284463.44, 0.1745541886023097, 0.15428101511551995, 0.17373596584323636], "isController": false}, {"data": ["Login, create course and lifter all courses", 100, 95, 95.0, 495681.3599999999, 48729, 869492, 403036.0, 866272.6, 867975.65, 869488.93, 0.11476826565639989, 1.4030095449180038, 0.5451526242194323], "isController": true}, {"data": ["profiles/me", 100, 33, 33.0, 12262.549999999996, 125, 49237, 5762.5, 26609.8, 37863.64999999992, 49139.42999999995, 1.0141370707664847, 0.536452760861408, 0.7308917560797518], "isController": false}, {"data": ["login", 100, 0, 0.0, 39812.67, 7601, 52996, 42185.0, 48884.100000000006, 50639.049999999996, 52987.35, 1.8867924528301887, 1.9273290094339623, 1.5477594339622642], "isController": false}, {"data": ["UPDATE created course", 100, 91, 91.0, 28119.879999999994, 0, 284494, 0.0, 79780.00000000013, 284102.9, 284492.64, 0.17598352794178465, 0.22155191899038248, 0.05186014589034466], "isController": false}, {"data": ["GET filtered courses", 100, 85, 85.0, 271929.54000000004, 8502, 423274, 284164.0, 420000.60000000003, 422715.95, 423272.64, 0.11765785566204899, 0.3232201473341083, 0.014356786196262716], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["null 0/java.sql.SQLException: Cannot create PoolableConnectionFactory (FATAL: terminating connection due to unexpected postmaster exit)", 3, 0.7407407407407407, 0.3333333333333333], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 120, 29.62962962962963, 13.333333333333334], "isController": false}, {"data": ["401", 85, 20.987654320987655, 9.444444444444445], "isController": false}, {"data": ["Value in json path '$.id' expected to be '${profile_id_1}', but found '14a7092c-e38f-4973-ae1b-58be19b32a06'", 15, 3.7037037037037037, 1.6666666666666667], "isController": false}, {"data": ["null 0/java.sql.SQLException: Cannot create PoolableConnectionFactory (The connection attempt failed.)", 2, 0.49382716049382713, 0.2222222222222222], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 35: https://mental-health.duckdns.org/${CREATE_URL}", 136, 33.58024691358025, 15.11111111111111], "isController": false}, {"data": ["null 0/java.sql.SQLException: Error preloading the connection pool", 26, 6.419753086419753, 2.888888888888889], "isController": false}, {"data": ["Value in json path '$.id' expected to be '${profile_id_1}', but found 'e7206823-90b6-4a37-b661-e4fe7883ff11'", 16, 3.950617283950617, 1.7777777777777777], "isController": false}, {"data": ["Response was null", 2, 0.49382716049382713, 0.2222222222222222], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 900, 405, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 35: https://mental-health.duckdns.org/${CREATE_URL}", 136, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 120, "401", 85, "null 0/java.sql.SQLException: Error preloading the connection pool", 26, "Value in json path '$.id' expected to be '${profile_id_1}', but found 'e7206823-90b6-4a37-b661-e4fe7883ff11'", 16], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get profile id", 100, 31, "null 0/java.sql.SQLException: Error preloading the connection pool", 26, "null 0/java.sql.SQLException: Cannot create PoolableConnectionFactory (FATAL: terminating connection due to unexpected postmaster exit)", 3, "null 0/java.sql.SQLException: Cannot create PoolableConnectionFactory (The connection attempt failed.)", 2, "", "", "", ""], "isController": false}, {"data": ["specializations", 100, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["cities", 100, 2, "401", 1, "Response was null", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["UPDATE course to PUBLIC", 100, 94, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 35: https://mental-health.duckdns.org/${CREATE_URL}", 68, "401", 24, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "", "", "", ""], "isController": false}, {"data": ["Create course", 100, 65, "401", 45, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 20, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["profiles/me", 100, 33, "Value in json path '$.id' expected to be '${profile_id_1}', but found 'e7206823-90b6-4a37-b661-e4fe7883ff11'", 16, "Value in json path '$.id' expected to be '${profile_id_1}', but found '14a7092c-e38f-4973-ae1b-58be19b32a06'", 15, "401", 1, "Response was null", 1, "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["UPDATE created course", 100, 91, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 35: https://mental-health.duckdns.org/${CREATE_URL}", 68, "401", 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 9, "", "", "", ""], "isController": false}, {"data": ["GET filtered courses", 100, 85, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 85, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
