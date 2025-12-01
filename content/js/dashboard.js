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

    var data = {"OkPercent": 34.763636363636365, "KoPercent": 65.23636363636363};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.003416666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "GET my courses #1"], "isController": false}, {"data": [0.0, 500, 1500, "courses"], "isController": false}, {"data": [0.014, 500, 1500, "specializations"], "isController": false}, {"data": [0.003, 500, 1500, "cities"], "isController": false}, {"data": [0.0, 500, 1500, "GET my courses#2"], "isController": false}, {"data": [0.0, 500, 1500, "UPDATE course to PUBLIC"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "GET my courses#3"], "isController": false}, {"data": [0.023, 500, 1500, "profiles/me"], "isController": false}, {"data": [0.001, 500, 1500, "login"], "isController": false}, {"data": [0.0, 500, 1500, "UPDATE created course"], "isController": false}, {"data": [0.0, 500, 1500, "GET filtered courses"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5500, 3588, 65.23636363636363, 21480.59309090914, 0, 135516, 29997.5, 44614.200000000004, 48428.8, 60572.38999999994, 3.9512260654481084, 11.020630372769443, 2.1724860986437955], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET my courses #1", 500, 245, 49.0, 37195.114000000074, 0, 78652, 33996.0, 60575.9, 68651.05, 75003.01, 0.3819779736221291, 3.2120975432322667, 0.2407311731651306], "isController": false}, {"data": ["courses", 500, 500, 100.0, 545.1160000000003, 0, 135516, 176.0, 481.90000000000003, 586.95, 3766.500000000015, 0.386656036203378, 0.18179026239638588, 0.4129448707273542], "isController": false}, {"data": ["specializations", 500, 216, 43.2, 25893.25400000001, 0, 56097, 29300.0, 30413.4, 30517.15, 51096.31, 0.3777895983945453, 0.977236913462759, 0.22282871685462957], "isController": false}, {"data": ["cities", 500, 223, 44.6, 27457.092000000026, 0, 60606, 29930.5, 30660.8, 49513.15, 54705.75, 0.3812966373449552, 0.27362576521468907, 0.22099863734114228], "isController": false}, {"data": ["GET my courses#2", 500, 284, 56.8, 33181.70200000001, 0, 64356, 30218.5, 47279.3, 48510.5, 50966.130000000005, 0.3831100567922348, 2.757590272222682, 0.2471950297887225], "isController": false}, {"data": ["UPDATE course to PUBLIC", 500, 500, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.3961371870615256, 0.45725991709640945, 0.0], "isController": false}, {"data": ["Test", 500, 500, 100.0, 236286.5240000001, 0, 373701, 250222.5, 298891.9, 310246.05, 327991.48000000004, 0.359177598236869, 11.01987036696816, 2.172336279442686], "isController": true}, {"data": ["GET my courses#3", 500, 290, 58.0, 33103.706000000006, 0, 120708, 30513.5, 46770.3, 48680.95, 51673.270000000004, 0.39484833480611764, 2.768269336315228, 0.2547689473402621], "isController": false}, {"data": ["profiles/me", 500, 355, 71.0, 16954.162000000015, 0, 60314, 6761.0, 51390.3, 58305.149999999994, 59756.64, 0.4021021902506303, 0.23280852924087128, 0.21916375687092118], "isController": false}, {"data": ["login", 500, 219, 43.8, 28634.269999999997, 0, 57000, 30411.5, 36371.6, 37699.299999999996, 50354.13000000005, 0.4098236364962702, 0.35984116157952584, 0.27355967867163045], "isController": false}, {"data": ["UPDATE created course", 500, 500, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.3961371870615256, 0.45725991709640945, 0.0], "isController": false}, {"data": ["GET filtered courses", 500, 256, 51.2, 33322.108, 0, 54580, 30527.0, 46849.2, 48211.649999999994, 50877.200000000004, 0.40121970791205264, 0.20973133325308937, 0.27180049224642916], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["401", 2210, 61.594202898550726, 40.18181818181818], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 35: https://mental-health.duckdns.org/${CREATE_URL}", 1000, 27.870680044593087, 18.181818181818183], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 376, 10.479375696767, 6.836363636363636], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org: Temporary failure in name resolution", 2, 0.055741360089186176, 0.03636363636363636], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5500, 3588, "401", 2210, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 35: https://mental-health.duckdns.org/${CREATE_URL}", 1000, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 376, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org: Temporary failure in name resolution", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET my courses #1", 500, 245, "401", 203, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 42, "", "", "", "", "", ""], "isController": false}, {"data": ["courses", 500, 500, "401", 458, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 42, "", "", "", "", "", ""], "isController": false}, {"data": ["specializations", 500, 216, "401", 174, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 42, "", "", "", "", "", ""], "isController": false}, {"data": ["cities", 500, 223, "401", 181, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 42, "", "", "", "", "", ""], "isController": false}, {"data": ["GET my courses#2", 500, 284, "401", 242, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 42, "", "", "", "", "", ""], "isController": false}, {"data": ["UPDATE course to PUBLIC", 500, 500, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 35: https://mental-health.duckdns.org/${CREATE_URL}", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET my courses#3", 500, 290, "401", 248, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 42, "", "", "", "", "", ""], "isController": false}, {"data": ["profiles/me", 500, 355, "401", 313, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 42, "", "", "", "", "", ""], "isController": false}, {"data": ["login", 500, 219, "401", 177, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 40, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org: Temporary failure in name resolution", 2, "", "", "", ""], "isController": false}, {"data": ["UPDATE created course", 500, 500, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 35: https://mental-health.duckdns.org/${CREATE_URL}", 500, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET filtered courses", 500, 256, "401", 214, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: mental-health.duckdns.org", 42, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
