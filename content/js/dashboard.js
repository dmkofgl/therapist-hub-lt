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

    var data = {"OkPercent": 77.77777777777777, "KoPercent": 22.22222222222222};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Get profile id"], "isController": false}, {"data": [1.0, 500, 1500, "specializations"], "isController": false}, {"data": [1.0, 500, 1500, "cities"], "isController": false}, {"data": [1.0, 500, 1500, "UPDATE course to PUBLIC"], "isController": false}, {"data": [1.0, 500, 1500, "Create course"], "isController": false}, {"data": [0.0, 500, 1500, "Login, create course and lifter all courses"], "isController": true}, {"data": [0.0, 500, 1500, "profiles/me"], "isController": false}, {"data": [0.0, 500, 1500, "login"], "isController": false}, {"data": [1.0, 500, 1500, "UPDATE created course"], "isController": false}, {"data": [0.0, 500, 1500, "GET filtered courses"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9, 2, 22.22222222222222, 615.2222222222222, 5, 2967, 140.0, 2967.0, 2967.0, 2967.0, 1.143728555089592, 2.280135063222773, 0.9665101982462829], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get profile id", 1, 1, 100.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 10.3515625, 0.0], "isController": false}, {"data": ["specializations", 1, 0, 0.0, 101.0, 101, 101, 101.0, 101.0, 101.0, 101.0, 9.900990099009901, 39.81667698019802, 7.174350247524752], "isController": false}, {"data": ["cities", 1, 0, 0.0, 101.0, 101, 101, 101.0, 101.0, 101.0, 101.0, 9.900990099009901, 7.348391089108911, 7.087329826732673], "isController": false}, {"data": ["UPDATE course to PUBLIC", 1, 0, 0.0, 140.0, 140, 140, 140.0, 140.0, 140.0, 140.0, 7.142857142857142, 13.469587053571427, 9.1796875], "isController": false}, {"data": ["Create course", 1, 0, 0.0, 145.0, 145, 145, 145.0, 145.0, 145.0, 145.0, 6.896551724137931, 2.417834051724138, 8.580280172413794], "isController": false}, {"data": ["Login, create course and lifter all courses", 1, 1, 100.0, 5537.0, 5537, 5537, 5537.0, 5537.0, 5537.0, 5537.0, 0.18060321473722232, 3.2404520159833847, 1.3735721058334838], "isController": true}, {"data": ["profiles/me", 1, 1, 100.0, 101.0, 101, 101, 101.0, 101.0, 101.0, 101.0, 9.900990099009901, 5.221225247524752, 7.135674504950495], "isController": false}, {"data": ["login", 1, 0, 0.0, 2967.0, 2967, 2967, 2967.0, 2967.0, 2967.0, 2967.0, 0.3370407819346141, 0.34428189248399055, 0.2764787664307381], "isController": false}, {"data": ["UPDATE created course", 1, 0, 0.0, 146.0, 146, 146, 146.0, 146.0, 146.0, 146.0, 6.8493150684931505, 12.889287243150685, 8.77568493150685], "isController": false}, {"data": ["GET filtered courses", 1, 0, 0.0, 1831.0, 1831, 1831, 1831.0, 1831.0, 1831.0, 1831.0, 0.5461496450027307, 4.074255017749864, 0.4442799358274167], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["null 0/java.sql.SQLException: Cannot load JDBC driver class 'org.postgresql.Driver'", 1, 50.0, 11.11111111111111], "isController": false}, {"data": ["Value in json path '$.id' expected to be '${profile_id_1}', but found 'e7206823-90b6-4a37-b661-e4fe7883ff11'", 1, 50.0, 11.11111111111111], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9, 2, "null 0/java.sql.SQLException: Cannot load JDBC driver class 'org.postgresql.Driver'", 1, "Value in json path '$.id' expected to be '${profile_id_1}', but found 'e7206823-90b6-4a37-b661-e4fe7883ff11'", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get profile id", 1, 1, "null 0/java.sql.SQLException: Cannot load JDBC driver class 'org.postgresql.Driver'", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["profiles/me", 1, 1, "Value in json path '$.id' expected to be '${profile_id_1}', but found 'e7206823-90b6-4a37-b661-e4fe7883ff11'", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
