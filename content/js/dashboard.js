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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3680555555555556, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "GET my courses #1"], "isController": false}, {"data": [0.4166666666666667, 500, 1500, "courses"], "isController": false}, {"data": [1.0, 500, 1500, "specializations"], "isController": false}, {"data": [1.0, 500, 1500, "cities"], "isController": false}, {"data": [0.0, 500, 1500, "GET my courses#2"], "isController": false}, {"data": [0.5, 500, 1500, "UPDATE course to PUBLIC"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0, 500, 1500, "GET my courses#3"], "isController": false}, {"data": [1.0, 500, 1500, "profiles/me"], "isController": false}, {"data": [0.0, 500, 1500, "login"], "isController": false}, {"data": [0.5, 500, 1500, "UPDATE created course"], "isController": false}, {"data": [0.0, 500, 1500, "GET filtered courses"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 66, 0, 0.0, 4019.5757575757575, 103, 12022, 1349.0, 11559.6, 11880.7, 12022.0, 1.375544486359184, 8.174744625476752, 1.2430457498801608], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET my courses #1", 6, 0, 0.0, 9544.833333333332, 6016, 11970, 10482.5, 11970.0, 11970.0, 11970.0, 0.4884402474763921, 7.730616299658092, 0.3801629660534028], "isController": false}, {"data": ["courses", 6, 0, 0.0, 1278.8333333333333, 905, 1572, 1347.5, 1572.0, 1572.0, 1572.0, 0.813890396093326, 0.2853385275366251, 1.0125941060770483], "isController": false}, {"data": ["specializations", 6, 0, 0.0, 183.5, 111, 200, 197.5, 200.0, 200.0, 200.0, 0.9391141023634372, 3.776632688996713, 0.6804908827672562], "isController": false}, {"data": ["cities", 6, 0, 0.0, 161.16666666666666, 105, 206, 163.5, 206.0, 206.0, 206.0, 0.9379396592152572, 0.6961270908238236, 0.6713962599656088], "isController": false}, {"data": ["GET my courses#2", 6, 0, 0.0, 7494.833333333333, 4687, 9281, 7976.0, 9281.0, 9281.0, 9281.0, 0.4086636697997548, 6.467980562934205, 0.31807123518594194], "isController": false}, {"data": ["UPDATE course to PUBLIC", 6, 0, 0.0, 1112.5, 903, 1301, 1095.0, 1301.0, 1301.0, 1301.0, 0.5663583160279404, 1.0680057697753447, 0.7278589295827828], "isController": false}, {"data": ["Test", 6, 0, 0.0, 44215.33333333333, 36413, 47944, 46078.5, 47944.0, 47944.0, 47944.0, 0.12472975220355895, 8.153842131111759, 1.239867331718776], "isController": true}, {"data": ["GET my courses#3", 6, 0, 0.0, 6542.5, 4681, 8278, 6412.0, 8278.0, 8278.0, 8278.0, 0.37537537537537535, 5.941121785848348, 0.292162279466967], "isController": false}, {"data": ["profiles/me", 6, 0, 0.0, 148.16666666666666, 103, 208, 139.0, 208.0, 208.0, 208.0, 8.01068090787717, 4.224382510013351, 5.773322763684913], "isController": false}, {"data": ["login", 6, 0, 0.0, 11725.333333333334, 11371, 12022, 11768.5, 12022.0, 12022.0, 12022.0, 0.4899158977708826, 0.5004414346370539, 0.4018841348901772], "isController": false}, {"data": ["UPDATE created course", 6, 0, 0.0, 1025.6666666666667, 818, 1231, 1026.0, 1231.0, 1231.0, 1231.0, 0.5930611841454977, 1.1160438494613028, 0.7598596421864189], "isController": false}, {"data": ["GET filtered courses", 6, 0, 0.0, 4998.0, 3348, 6792, 5071.0, 6792.0, 6792.0, 6792.0, 0.3863987635239567, 2.882519682187017, 0.3143263379057187], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 66, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
