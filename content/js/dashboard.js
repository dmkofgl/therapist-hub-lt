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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3933333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "GET my courses #1"], "isController": false}, {"data": [0.44, 500, 1500, "courses"], "isController": false}, {"data": [1.0, 500, 1500, "specializations"], "isController": false}, {"data": [1.0, 500, 1500, "cities"], "isController": false}, {"data": [0.0, 500, 1500, "GET my courses#2"], "isController": false}, {"data": [0.45, 500, 1500, "UPDATE course to PUBLIC"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "GET my courses#3"], "isController": false}, {"data": [0.99, 500, 1500, "profiles/me"], "isController": false}, {"data": [0.42, 500, 1500, "login"], "isController": false}, {"data": [0.415, 500, 1500, "UPDATE created course"], "isController": false}, {"data": [0.005, 500, 1500, "GET filtered courses"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1100, 0, 0.0, 5415.96545454546, 95, 21883, 1299.0, 15974.3, 17168.75, 18962.18, 1.797235851260761, 10.680777686928867, 1.6241178737556183], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET my courses #1", 100, 0, 0.0, 13629.93, 4173, 20879, 14237.0, 17992.9, 18971.449999999997, 20865.319999999992, 0.16984301410206548, 2.688105715918027, 0.1321922678118615], "isController": false}, {"data": ["courses", 100, 0, 0.0, 1209.81, 554, 2293, 1199.0, 1586.3000000000004, 1697.0, 2289.109999999998, 0.1710896184530419, 0.05998161428187699, 0.21285954483317907], "isController": false}, {"data": ["specializations", 100, 0, 0.0, 164.5999999999999, 95, 498, 110.0, 293.9, 317.94999999999976, 497.1899999999996, 0.17132293859957204, 0.6889725206572633, 0.12414220746179927], "isController": false}, {"data": ["cities", 100, 0, 0.0, 194.79000000000005, 95, 407, 205.0, 294.5, 325.9, 406.8099999999999, 0.17132029700086687, 0.1271517829303309, 0.12263454853675335], "isController": false}, {"data": ["GET my courses#2", 100, 0, 0.0, 13246.930000000004, 4377, 21883, 13932.5, 17692.8, 18573.6, 21853.989999999983, 0.16941600608542295, 2.681372276002392, 0.13185991879890827], "isController": false}, {"data": ["UPDATE course to PUBLIC", 100, 0, 0.0, 1170.2399999999998, 298, 1997, 1201.0, 1595.6, 1699.9, 1995.039999999999, 0.17108522781708935, 0.3226226317527339, 0.21987124981180625], "isController": false}, {"data": ["Test", 100, 0, 0.0, 59575.62, 28717, 76664, 61453.5, 70357.90000000001, 74204.54999999999, 76657.78, 0.1633629238042651, 10.67932946717957, 1.623897657620717], "isController": true}, {"data": ["GET my courses#3", 100, 0, 0.0, 13209.980000000001, 3367, 21468, 14586.0, 17391.5, 18201.1, 21447.17999999999, 0.16998765889596415, 2.690419909889542, 0.1323048477930502], "isController": false}, {"data": ["profiles/me", 100, 0, 0.0, 199.03000000000006, 96, 1790, 199.0, 286.60000000000025, 321.4499999999999, 1776.309999999993, 0.1734283489447752, 0.0914563558888463, 0.12499035304808995], "isController": false}, {"data": ["login", 100, 0, 0.0, 2417.5900000000006, 456, 10705, 613.0, 7630.1, 8181.249999999998, 10700.959999999997, 0.1712229082553413, 0.17490152542488965, 0.14045629192820966], "isController": false}, {"data": ["UPDATE created course", 100, 0, 0.0, 1221.0, 299, 2229, 1249.5, 1611.1000000000004, 1821.099999999999, 2226.6899999999987, 0.17063769011171648, 0.32111213754421647, 0.21862954045563673], "isController": false}, {"data": ["GET filtered courses", 100, 0, 0.0, 12911.72, 1323, 20920, 13800.0, 17097.2, 17610.149999999998, 20894.019999999986, 0.17405531477903677, 1.2984254521086802, 0.14158991915130628], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1100, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
