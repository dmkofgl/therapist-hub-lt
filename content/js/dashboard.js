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

    var data = {"OkPercent": 35.125, "KoPercent": 64.875};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.13984375, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "GET my courses #1"], "isController": false}, {"data": [0.168125, 500, 1500, "courses"], "isController": false}, {"data": [0.35125, 500, 1500, "specializations"], "isController": false}, {"data": [0.34875, 500, 1500, "cities"], "isController": false}, {"data": [0.0, 500, 1500, "GET my courses#2"], "isController": false}, {"data": [0.16625, 500, 1500, "UPDATE course to PUBLIC"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "GET my courses#3"], "isController": false}, {"data": [0.350625, 500, 1500, "profiles/me"], "isController": false}, {"data": [0.1425, 500, 1500, "login"], "isController": false}, {"data": [0.15, 500, 1500, "UPDATE created course"], "isController": false}, {"data": [6.25E-4, 500, 1500, "GET filtered courses"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8800, 5709, 64.875, 1707.7972727272743, 0, 22822, 0.0, 9348.200000000015, 12974.0, 16011.949999999999, 4.682176020022688, 16.936541870658345, 1.486197552811487], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET my courses #1", 800, 519, 64.875, 4196.655000000004, 0, 21098, 0.0, 13879.8, 15393.75, 17901.140000000003, 0.42933771973370327, 3.043928439297013, 0.11737449670214964], "isController": false}, {"data": ["courses", 800, 519, 64.875, 381.36124999999964, 0, 2298, 0.0, 1203.9, 1393.8999999999999, 1892.840000000001, 0.4302400685802669, 0.7109806416506268, 0.18801680067300303], "isController": false}, {"data": ["specializations", 800, 519, 64.875, 57.582499999999946, 0, 396, 0.0, 199.0, 205.94999999999993, 298.99, 0.4301947222635986, 1.265600104160897, 0.10949274900073831], "isController": false}, {"data": ["cities", 800, 519, 64.875, 65.93875000000001, 0, 531, 0.0, 216.89999999999998, 286.8499999999998, 398.30000000000064, 0.43016881437409094, 0.7700326340177499, 0.10815815576547197], "isController": false}, {"data": ["GET my courses#2", 800, 519, 64.875, 4243.935, 0, 22714, 0.0, 14164.8, 15302.599999999999, 18165.420000000002, 0.4307040288054855, 3.053643719911286, 0.11774802512108166], "isController": false}, {"data": ["UPDATE course to PUBLIC", 800, 519, 64.875, 390.54500000000024, 0, 1994, 0.0, 1293.9, 1398.9499999999998, 1793.98, 0.4338343034952945, 0.9508538986045177, 0.19583763439373283], "isController": false}, {"data": ["Test", 800, 519, 64.875, 18785.769999999997, 0, 78724, 2.0, 57866.899999999994, 61490.94999999999, 69078.00000000001, 0.4256390038557573, 16.936010217763563, 1.4861508997676012], "isController": true}, {"data": ["GET my courses#3", 800, 519, 64.875, 3990.0737500000073, 0, 17871, 0.0, 13196.9, 14889.95, 16681.170000000002, 0.4343041660084244, 3.0791635213544644, 0.11873224866546472], "isController": false}, {"data": ["profiles/me", 800, 519, 64.875, 61.64125000000006, 0, 518, 0.0, 211.0, 218.94999999999993, 314.0, 0.42929694040070576, 0.736075510581633, 0.10867522083302925], "isController": false}, {"data": ["login", 800, 519, 64.875, 1016.3637500000002, 0, 16989, 0.0, 2768.299999999999, 6491.049999999993, 16011.560000000001, 0.4256525919316487, 0.8041160447682774, 0.12264530981389936], "isController": false}, {"data": ["UPDATE created course", 800, 519, 64.875, 415.44625, 0, 2635, 0.0, 1324.9, 1507.8999999999999, 1811.970000000001, 0.4335267946654528, 0.9495850886088125, 0.19510399223987038], "isController": false}, {"data": ["GET filtered courses", 800, 519, 64.875, 3966.227499999999, 0, 22822, 0.0, 13408.2, 14829.699999999997, 16878.18, 0.4361225002684879, 1.8097534546694274, 0.12461487061199435], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 5708, 99.9824837975127, 64.86363636363636], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org: Temporary failure in name resolution", 1, 0.017516202487300753, 0.011363636363636364], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8800, 5709, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 5708, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org: Temporary failure in name resolution", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET my courses #1", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["courses", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["specializations", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["cities", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET my courses#2", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["UPDATE course to PUBLIC", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET my courses#3", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["profiles/me", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["login", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 518, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org: Temporary failure in name resolution", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["UPDATE created course", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET filtered courses", 800, 519, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 519, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
