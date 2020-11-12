var lang = 'en';
var country = 'ch';

const flagStyle = 'flat';
const flagSize = 64;
 
const labels = ["CLASSFIED", "NOT_PRESENT", "NOT_STARTED", "RETIRED", "ELIMINATED", "OFF_COURSE", "DISQUALIFIED"];
const headerClasses = {
    rnkClass: 'col-rank text-center px-02',
    numClass: 'col-rank text-center px-02',
    riderClass: 'w-50',
    horseClass: 'w-50',
    flagClass: 'col-nation px-0',
    pointsClass: 'col-point px-02 text-center',
    timeClass: 'col-time px-02 text-center'
};

const dataClasses = {
    rnkClass: 'col-rank text-center bg-color-macaroni text-color-black px-02',
    numClass: 'col-rank text-center bg-white text-color-black px-02',
    riderClass: 'w-50 col-rider',
    horseClass: 'w-50 col-horse',
    flagClass: 'col-nation px-02',
    pointsClass: 'col-point col-font-monospace text-right bg-color-perano text-color-black px-02',
    timeClass: 'col-time col-font-monospace text-right bg-color-pale-canary text-color-black px-02'
};

function localizedValue(key, lang) {
    const pack = localization[lang];
    if (!pack) { return key; }
    return pack[key] || key;
}

function localizeKey(key) {
    const elements = $(`[data-key="${key}"]`);
    const elementCount = elements.length;
    for (let i = 0; i < elementCount; i ++)
    {
        $(elements[i]).html(localizedValue(key, lang));
    }
}

function localizeAll(lan) {
    lang = lan;
    const elements = $('[data-key]');
    const elementCount = elements.length;
    for (let i = 0; i < elementCount; i ++)
    {
        key = $(elements[i]).attr('data-key');
        $(elements[i]).html(localizedValue(key, lan));
    }
}

function onEn() { lang = 'en'; localizeAll(lang); }
function onGe() { lang = 'ge'; localizeAll(lang); }
function onFr() { lang = 'fr'; localizeAll(lang); }
function onIt() { lang = 'it'; localizeAll(lang); }

$(function () {
    var FADETIMOUT      = 2000;

    // running events
    var events = [];
    var curEvent = 0;

    // info of current event
    var startlist = []; // startlist
    var horses = {};    // indexed map
    var riders = {};    // indexed map
    var startlistmap = {};  // number indexed map
    var rankings = [];  // ranking list
    var realtime = {};  // live info


    var rolling_timer;
    var timer_running = false;
    var show_timer = true;

    var eventInfo = {}; // event.info

    // Prompt for setting a username
    var connected = false;
    var socket = io();
    
    socket.emit("subscribe", "consumer");
//

    //// messages to process
    //   socket.to('consumer').emit('start', { id: event.id} );
    //   socket.to('consumer').emit('end', { id: socket.eventId });
    //   socket.to(event.id).emit('info', event.info);
    //   socket.to(event.id).emit('horses', event.horses);
    //   socket.to(event.id).emit('riders', event.riders);
    //   socket.to(event.id).emit('startlist', event.startlist);
    //   socket.to(event.id).emit('ranking', event.ranking);
    //   socket.to(event.id).emit('ready', event.realtime);
    //   socket.to(event.id).emit('resume');
    //   socket.to(event.id).emit('realtime', event.realtime);
    //   socket.to(event.id).emit('pause');
    //   socket.to(event.id).emit('final', event.realtime);

    // Socket events

    // get the current running events information
    socket.on("events", function(data) {
        console.log("[on] events:" + JSON.stringify(data));
        events = data;
        updateEventList();
    });

    // add new event started
    socket.on("start", function (data) {
        console.log("[on] start:" + JSON.stringify(data));
        events.push(data);
        updateEventList();
    });

    // an event is ended
    socket.on("end", function (data) {
        console.log("[on] end:" + JSON.stringify(data));

        // stop timer
        clearInterval(rolling_timer);
        timer_running = false;
        setRuntimeList(true);

        events = events.filter((event) => {
            return event.id !== data;
        });

        $('#error_finishevent').show();

        updateEventList();
    });

    // update event info
    socket.on("info", function (data) {
        console.log("[on] info:" + JSON.stringify(data));

        // set eventInfo
        eventInfo = data;

        country = eventInfo.country.toLowerCase();

        // update UI
        $('#meeting-title').text(data.title);
        $('#event-title').text(data.eventTitle);

        $('#event-date').text(formatDate(data.eventDate));

        // update headercolumns according to the race type
        updateTableHeaderColumns();
    });

    // update horse info
    socket.on('horses', function (data) {
        console.log("[on] horses:" + data.length/* + JSON.stringify(data) */);
        horses = {};
        for (let horse of data) {
            horses[horse.idx] = horse;
        }

        // update UI
        updateRankingList();
    });

    // update rider info
    socket.on('riders', function (data) {
        console.log("[on] riders:" + data.length/* + JSON.stringify(data) */);
        riders = {};
        for (let rider of data) {
            riders[rider.idx] = rider;
        }

        // update UI
        updateRankingList();
    });

    // update startlist
    socket.on('startlist', function (data) {
        console.log("[on] startlist:" + data.length/* + JSON.stringify(data) */);
        startlist = data;

        startlistmap = {};
        for (let startlistentry of data) {
            startlistmap[startlistentry.num] = startlistentry;
        }

        // updateUI
    });

    // update ranking info
    socket.on('ranking', function (data) {
        console.log("[on] ranking:" + data.length/* + JSON.stringify(data) */);
        // move "labeled" to the bottom
        rankings = data;
        for (let i = 1 ; i < rankings.length ; i++) {
            let num = rankings[i][1];
            let startlistentry = startlistmap[num];
            if(startlistentry !== undefined) {
                const horseIdx = startlistentry.horse_idx;
                const riderIdx = startlistentry.rider_idx;
                const rider = riders[riderIdx];

                rankings[i][2] = horses[horseIdx].name || '';
                rankings[i][3] = rider ? `${rider.firstName} ${rider.lastName}` : '';
                rankings[i][4] = rider.nation || country;
            }
        }

        // Update UI
        updateRankingList();
        updateStartList();
    });

    // one ready to race
    socket.on('ready', function(data) {
        console.log("[on] ready:");
        // find position
        let startlistentry = startlistmap[realtime.num];

        // update atstart and atend
        if(startlistentry !== undefined) {
            updateLiveAtStart(startlistentry['pos'] + 1);
            updateLiveAtFinish(startlistentry['pos'] - 1);
        }
        // init realtime and update
        console.log('ready');
        setRuntimeList(true);
    });

    // get live race info
    socket.on('realtime', function (data) {
        // console.log("[on] realtime:" + JSON.stringify(data));
        realtime = data;
        realtime.updateTick = Date.now();
        // update except time
        setRuntimeList(false);

        if(timer_running == false) {
            let curTime;
            if(realtime.lane === 1) {
                curTime = realtime.score.lane1.time;
            } else {
                curTime = realtime.score.lane2.time;
            }
            updateRuntimeTimer(realtime.lane, curTime);
        }
    });

    // racing is started (every round)
    socket.on('resume', function (data) {
        console.log("[on] resume");

        // find position
        let startlistentry = startlistmap[realtime.num];

        // update atstart and atend
        if(startlistentry !== undefined) {
            updateLiveAtStart(startlistentry['pos'] + 1);
            updateLiveAtFinish(startlistentry['pos'] - 1);
        }

        // start rolling timer
        if(timer_running) {
            console.log("timer already running");
        } else {
            let started = 0, tickFrom = Date.now();
            if(realtime.lane === 1) {
                started = realtime.score.lane1.time;
            } else {
                started = realtime.score.lane2.time;
	    }
	    rolling_timer = setInterval(function() {
		    if (Date.now() - tickFrom > 500) {
			    tickFrom = realtime.updateTick;
			    if (realtime.lane === 1) {
				    started = realtime.score.lane1.time;
			    } else {
				    started = realtime.score.lane2.time;
			    }
		    } else {
			    show_timer = true;
		    }
		    updateRuntimeTimer(realtime.lane, started + (Date.now() - tickFrom));
	    }, 100);
	  
            timer_running = false;
        }
    });

    // racing is paused (every round)
    socket.on('pause', function (data) {
        console.log("[on] pause");
        // stop rolling timer
        clearInterval(rolling_timer);
        timer_running = false;

        // full update
        if(data.finished === true) {
            setRuntimeList(true);
        } else {
            let started;
            if(realtime.lane === 1) {
                started = realtime.score.lane1.time;
            } else {
                started = realtime.score.lane2.time;
            }
            updateRuntimeTimer(realtime.lane, started);
        }

        setRuntimeListFinal();
    });

    // one player finished
    socket.on('final', function (data) {
        console.log("[on] final:" + JSON.stringify(data));

        // find position
        let startlistentry = startlistmap[realtime.num];

        // update atstart and atend
        if(startlistentry !== undefined) {
            updateLiveAtStart(startlistentry['pos'] + 1);
            updateLiveAtFinish(startlistentry['pos']);
        }

        // update runtime with ranking
        let ranking = rankings.find(function(ranking) {
            return ranking.num === realtime.num;
        });
        if(ranking !== undefined) {
            realtime.rank = ranking.rank;
        }
        setRuntimeListFinal();
    });

    socket.on('disconnect', function () {
        console.log('you have been disconnected');
    });

    socket.on('reconnect', function () {
        console.log('you have been reconnected');
        events = [];

        socket.emit("subscribe", "consumer");
    });

    socket.on('reconnect_error', function () {
        console.log('attempt to reconnect has failed');
    });


    ///////////////////////////////////////////////////
    // UI management function

    function formatFloat(point, digit, round) {
        digit = (digit > 5)?5:digit;
        digit = (digit < 0)?0:digit;

        let pos = Math.pow(10, digit);
        if(round==='round') {
            point = Math.round(point * pos);
        } else if(round ==='ceil') {
            point = Math.ceil(point * pos);
        } else if(round==='floor') {
            point = Math.floor(point * pos);
        }
        return (point / pos).toFixed(digit);
    }

    function formatPoint(score, detail) {
        if(score.point === undefined)
            return "&nbsp";

        if(score.point === undefined)
            return "&nbsp";

        if(score.point < 0) {
            let index = Math.abs(score.point) - 1;
            if(index > 0 && index <= 6) {
                return `<span class="point-label" data-key="${labels[index]}">${labels[index]}</span>`;
            }
        }

        let label = formatFloat(score.point / 1000, 2, 'floor');
        if(detail && (score.pointPenalty !== undefined && score.pointPenalty != 0)) {
            label += "<span class=\"text-small\">(+" + formatFloat(score.pointPenalty / 1000, 2, 'floor') + ")</span>";
        }
        return label;
    }

    function formatTime(score, detail) {
        if(score.time === undefined)
            return "&nbsp";

        let label = formatFloat(Math.abs(score.time) / 1000, 2, 'floor');
        if(detail && (score.timePenalty !== undefined && score.timePenalty != 0)) {
            label += "(+" + formatFloat(Math.abs(score.timePenalty) / 1000, 2, 'floor') + ")";
        }
        return label;
    }

    function formatDate(dateString) {
        var d = new Date(dateString);

        return ("0" + d.getDate()).slice(-2) + "." + ("0"+(d.getMonth()+1)).slice(-2) + "." + d.getFullYear();
    }

    function updateTableHeaderColumns() {
        // change header
        let headers = $(".table-scoreboard thead tr");

         if(eventInfo.jumpoffNumber > 0) {
             headers.children("th:nth-child(6)").addClass("small-font");
             headers.children("th:nth-child(7)").addClass("small-font");
             headers.children("th:nth-child(8)").addClass("small-font");
         } else {
             headers.children("th:nth-child(6)").removeClass("small-font");
             headers.children("th:nth-child(7)").removeClass("small-font");
             headers.children("th:nth-child(8)").removeClass("small-font");
         }

        // realtime
        var tr = $('#live-realtime tr:first');

        if(eventInfo.jumpoffNumber > 0) {
            tr.children("td:nth-child(6)");
            tr.children("td:nth-child(7)");
            tr.children("td:nth-child(8)");
        } else {
            tr.children("td:nth-child(6)");
            tr.children("td:nth-child(7)");
            tr.children("td:nth-child(8)");
        }
    }

    //  fill the list from index to the atstart list
    function updateLiveAtStart(index) {
        console.log(`updating live at start ${index}`);
        const jumpoff = eventInfo.jumpoff;
        const roundCount = eventInfo.roundNumber;
        const l = index;
        index = 0;
        const filtered = startlist.filter((r, i) => {
            const num = r.num;
            const ranking = rankings.find(r2 => r2[1] === num);
            if (jumpoff) {
                if (!ranking) { return false; }
                const point = parseFloat(ranking[5 + (roundCount - 1) * 2]);
                const time = parseFloat(ranking[5 + (roundCount -1 ) * 2 + 1]);
                if (point !== 0 || time === 0) { return false; }
            }
            if (i < l) {
                index ++;
            }
            return true;
        });

        let limit = (index + 3 < filtered.length)?(index + 3):filtered.length;

        const table = [];
        if (rankings.length >= 1) {
            table[0] = rankings[0];
        }
        let j = 1;
        for(i = limit - 1 ; i >= index ; i--) {
            const startlistentry = filtered[i];
            const num = startlistentry.num;
            const ranking = rankings.find(r => r[1] === num);
            table[j] = ranking;
            if (!ranking) {
                const horse = horses[startlistentry.horse_idx];
                const rider = riders[startlistentry.rider_idx];
                const data = Array(rankings[0].length).fill('');
                data[0] = num;
                data[1] = num;
                data[2] = `${horse.name}`;
                data[3] = `${rider.firstName} ${rider.lastName}`;
                table[j] = data;
            }
            j += 1;
        }
        updateTable("nextriders", table);
        localizeAll(lang);
    }

    // fill the rank from index to the atstart list
    function updateLiveAtFinish(index) {
        
        const jumpoff = eventInfo.jumpoff;
        const roundCount = eventInfo.roundNumber;
        const l = index;
        index = 0;
        const filtered = startlist.filter((r, i) => {
            const num = r.num;
            const ranking = rankings.find(r2 => r2[1] === num);
            if (jumpoff) {
                if (!ranking) { return false; }
                const point = parseFloat(ranking[5 + (roundCount - 1) * 2]);
                const time = parseFloat(ranking[5 + (roundCount -1 ) * 2 + 1]);
                if (point !== 0 || time === 0) { return false; }
            }
            if (i < l) {
                index ++;
            }
            return true;
        });

        let limit = (index - 3 >= 0)?(index - 3):-1;

        const table = [];
        if (rankings.length >= 1) {
            table[0] = rankings[0];
        }
        let j = 1;
        for(let i = index ; i > limit ; i--) {
            let num = filtered[i].num;

            let ranking = rankings.find(r => r[1] === num);
            table[j] = ranking;
            j += 1;
        }
        updateTable("finish", table);
        localizeAll(lang);
    }

    function updateRuntimeTimer(lane, value)
    {
        const diff = Date.now() - realtime.updateTick;
        if (diff >= 300) {
            show_timer = false;
        } else {
            show_timer = true;
        }
            let label = formatFloat(Math.abs(value) / 1000, 1, 'floor');
        if (!show_timer) { label = ''; }

        const jumpoffNumber = eventInfo.jumpoffNumber;
        const roundNumber = eventInfo.roundNumber;
        country = eventInfo.country.toLowerCase();
        const round = eventInfo.round;
        const jumpoff = eventInfo.jumpoff;
        const offset = round ? round : (jumpoff + roundNumber);
        const score = round ? realtime.score.lane1 : realtime.score.lane2;

        const currentBody = $('#current_body');
        const tr = $(currentBody.children(0));
        tr.children(`td:nth-child(${5 + (offset - 1) * 2 + 2})`).html(label);
        updateStartlistRowRealtimeTime(label, offset);
        localizeAll(lang);
    }

    function setRuntimeListFinal() {
        const currentBody = $("#current_body");
        if (!currentBody.children().length) {
            return;
        }
        let currentRiderData = rankings.find(r => r[1] === realtime.num);
        if (!currentRiderData) {
            return;
        }
        $("#current_body").html('');
        addRow(currentRiderData, currentBody, true, dataClasses);
        localizeAll(lang);
    }

    function setRuntimeList(fullupdate) {
        // clear content
        if (realtime.num == 0 || startlistmap[realtime.num] === undefined) {
            $("#current_body").html('');
            return;
        }

        const currentBody = $("#current_body");
        if (currentBody.children().length) {
            $("#current_body").html('');
        }

        const startlistentry = startlistmap[realtime.num];
        const horse = horses[startlistentry.horse_idx];
        const rider = riders[startlistentry.rider_idx];

        let currentRider = $(currentBody.children()[0]);
        if (!currentBody.children().length) {
            let data = rankings.find(r => r[1] === realtime.num);
            const currentRiderData = data || rankings[0];
            currentRiderData[2] = horse.name;
            currentRiderData[3] = `${rider.firstName} ${rider.lastName}`;
            if (!data) {
                const l = currentRiderData.length;
                for (let i = 4; i < l; i ++) {
                    currentRiderData[i] = '';
                }
            }
            console.log(`adding row: ${currentRiderData}`);
            currentRider = addRow(currentRiderData, currentBody, true, dataClasses);
        }

        const jumpoffNumber = eventInfo.jumpoffNumber;
        const roundNumber = eventInfo.roundNumber;
        const round = eventInfo.round;
        const jumpoff = eventInfo.jumpoff;
        const offset = round ? round : (jumpoff + roundNumber);
        const score = round ? realtime.score.lane1 : realtime.score.lane2;

        currentRider.children("td:nth-child(1)").html((realtime.rank===undefined)?"&nbsp":realtime.rank + ".");
        currentRider.children("td:nth-child(2)").html(realtime.num);
        currentRider.children(`td:nth-child(${5 + (offset - 1) * 2 + 1})`).html(formatPoint(score, false));
        if(fullupdate === true) {
            currentRider.children(`td:nth-child(${5 + (offset - 1) * 2 + 2})`).html(formatTime(score, false));
        }

        if (horse !== undefined) {
            currentRider.children("td:nth-child(3)").html(`<span>${horse.name}</span>`);
        } else {
            currentRider.children("td:nth-child(3)").html("&nbsp");
        }
        currentRider.children("td:nth-child(3)").addClass("bg-white text-color-black");

        if (rider !== undefined) {
            currentRider.children("td:nth-child(4)").html(`<span>${rider.firstName} ${rider.lastName}</span>`);
            const nation = rider.nation || country;
            const url = `/flags/${nation}.bmp`;
            currentRider.children("td:nth-child(5)").css("background", `#232323 url('${url}') center no-repeat`).css("background-size", "contain");
            currentRider.children("td:nth-child(5)").attr("data-toggle", "tooltip").attr("title", nation);
        } else {
            currentRider.children("td:nth-child(4)").html("&nbsp");
            // currentRider.children("td:nth-child(5)").html("&nbsp");
        }
        currentRider.children("td:nth-child(4)").addClass("bg-white text-color-black");
        setTimeout(() => {
            updateStartlistRealtimePoint(score, offset);
        }, 10);
        localizeAll(lang);
    }

    function findRealtimeRow() {
        const startlistBody = $("#startlist_body");
        const i = startlist.findIndex(r => r.num === realtime.num);
        return $(startlistBody.children()[i]);
    }

    function updateStartlistRealtimePoint(score, offset) {
        const startlistRow = findRealtimeRow();
        console.log(score, offset);
        startlistRow.children(`td:nth-child(${5 + (offset - 1) * 2 + 1})`).html(formatPoint(score, false));
        localizeAll(lang);
    }

    function updateStartlistRowRealtimeTime(label, offset) {
        const startlistRow = findRealtimeRow();
        startlistRow.children(`td:nth-child(${5 + (offset - 1) * 2 + 2})`).html(label);
        localizeAll(lang);
    }

    function clearRuntimeList() {
        var tds = $('#live-realtime tr td');
        tds.html("&nbsp");
    }

    function updateStartList()
    {
        if ($.isEmptyObject(horses) || $.isEmptyObject(riders)) {
            return;
        }
        const tbody = $("#startlist_body");
        tbody.html('');
        const colCount = rankings.length ? rankings[0].length : 7;
        const jumpoff = eventInfo.jumpoff;
        const roundCount = eventInfo.roundNumber;
        console.log(roundCount);
        startlist.forEach(r => {
            const num = r.num;
            const ranking = rankings.find(r2 => r2[1] === num);
            if (jumpoff) {
                if (!ranking) { return; }
                const point = parseFloat(ranking[5 + (roundCount - 1) * 2]);
                const time = parseFloat(ranking[5 + (roundCount -1 ) * 2 + 1]);
                if (point !== 0 || time === 0) { return; }
            }
            const row = Array(colCount).fill('');
            if (!ranking) {
                const rider = riders[r.rider_idx];
                const horse = horses[r.horse_idx];
                row[0] = '';
                row[1] = num; // rank
                row[2] = horse.name;
                row[3] = `${rider.firstName} ${rider.lastName}`;
                row[4] = rider.nation || country;
            }
            addRow(ranking || row, tbody, true, dataClasses, true);
        });
        localizeAll(lang);
    }

    function updateRankingList() {
        if (rankings.length >= 1) {
            updateHeaders(rankings[0]);
        }
        updateTable("ranking", rankings);
        localizeAll(lang);
    }

    function addRow(rowData, container, isData, classes, swapNumAndRank, hideRank) {
        if (!rowData) { return; }
        const row = $("<tr class=''></tr>");
        const cols = [];
        for (let i = 0; i < rowData.length; i ++) {
            let style = '';
            const dot = i === 0 && isData && rowData[i] !== '' ? '.' : '';
            if (i === 0) { style = classes.rnkClass; }
            if (i === 1) { style = classes.numClass; }
            if (i === 2) { style = classes.horseClass; }
            if (i === 3) {
                style = classes.riderClass;
            }
            if (i === 4) { style = classes.flagClass; }
            if (i >= 5 && i % 2 === 1) { style = classes.pointsClass; }
            if (i >= 5 && i % 2 === 0) { style = classes.timeClass; }
            let v = rowData[i];
            if (i === 0 && isData && v !== '') {
                // Rank column
                v = `${v}.`;
            }
            if (i === 2 || i === 3) {
                // horse, rider column
                v = `<span>${v}</span>`;
            }
            if (i >= 5 && i % 2 === 1) {
                // point column
                if (v < 0) {
                    const label = labels[Math.abs(v) - 1];
                    v = `<span class="point-label" data-key="${label}">${label}</span>`;
                }
            }
            const colType = isData ? 'td' : 'th';
            const col = $(`<${colType} class='${style}'>${v}</${colType}>`);
            if (i === 4 && isData) {
                const url = `/flags/${rowData[i]}.bmp`;
                col.css("background", `#232323 url('${url}') center no-repeat`).css("background-size", "contain");
                col.attr("data-toggle", "tooltip").attr("title", rowData[i]);
                col.html('');
            }
            if (hideRank) {
                console.log('hiding rank');
            }
            if (i === 0 && hideRank) {
                col.addClass("d-none");
            }
            if (i === 1 && hideRank) {
                col.addClass("col-num-lg");
            }
            cols.push(col);
        }
        if (swapNumAndRank) {
            const temp = cols[0].html();
            cols[0].html(cols[1].html());
            cols[1].html(temp);
        }
        cols.forEach(col => row.append(col));
        container.append(row);
        return row;
    };


    function updateHeaders(header) {
        const tables = ['ranking', 'current', 'finish', 'nextriders', 'startlist'];
        tables.forEach(tableName => {
            const tableHeader = $(`#${tableName}_header`);
            tableHeader.html('');
            if (tableName === 'startlist') {
                const temp = header[0];
                header[0] = header[1];
                header[1] = temp;
            }
            addRow(header, tableHeader, false, headerClasses, false, tableName === 'nextriders');
        });
    }

    function updateTable(tableName, table) {
        if (table.length < 1) { return; }
        const tableBody = $(`#${tableName}_body`);        
        tableBody.html('');
        for (let i = 1; i < table.length; i ++) {
            addRow(table[i], tableBody, true, dataClasses, false, tableName === 'nextriders');
        }
    }

    function updateEventList() {
        $('#live-events').html('');

        for(event of events) {
            $('#live-events').append($('<tr class="d-flex">'));
            tr = $('#live-events tr:last');
            tr.append($('<td class="col-3">').html("&nbsp"));
            tr.append($('<td class="col-5">').html("&nbsp"));
            tr.append($('<td class="col-2">').html("&nbsp"));
            tr.append($('<td class="col-2">').html("&nbsp"));

            tr.children("td:nth-child(1)").html(event.info.title);
            tr.children("td:nth-child(2)").html(event.info.eventTitle);
            tr.children("td:nth-child(3)").html(formatDate(event.info.startDate));
            tr.children("td:nth-child(4)").html(formatDate(event.info.endDate));

            tr.attr("data-ref", event.id);

            tr.click(function() {
                evendId = $(this).attr("data-ref");
                joinToEvent(evendId);
            });
        }

        $("#current_body").html('');
        $("#nextriders_body").html('');
        $("#finish_body").html('');
    }

    function joinToEvent(eventId) {
        let event = events.find( (event) => {
            return (event.id == eventId);
        });

        if(event === undefined) {
            $("#error_noevent").show();
            return ;
        }

        $("#error_noevent").hide();
        $("#error_finishevent").hide();

        socket.emit("subscribe", eventId);
        curEvent = eventId;
        realtime.num = 0;
        $("#current_body").html('');
        $("#nextriders_body").html('');
        $("#finish_body").html('');

        $('#event_list').hide();
        $('#start_list').hide();
        $('#event_view').show();
        $("#nextriders_list").show();
        $("#current_list").show();
        $("#finished_list").show();
        $("#ranking_list").show();
    }

    // goto event list
    $("#goto-events").click(function () {
        socket.emit('unsubscribe', curEvent);

        clearInterval(rolling_timer);
        timer_running = false;

        $('#error_finishevent').hide();

        $('#event_list').show();
        $('#event_view').hide();
    });

    $('#event_view').hide();
    $('#event_list').show();
});

$(".nav .nav-link").click(function() {
    $(this).parents("ul").find("div.nav-link").removeClass("active");
    $(this).addClass("active");

    var menu_id = $(this).attr("id");

    $("section#sec-live").css("display", "none");
    $("section#sec-startlist").css("display", "none");
    $("section#sec-ranking").css("display", "none");

    if(menu_id == "nav-live") {
        $("#nextriders_list").show();
        $("#current_list").show();
        $("#finished_list").show();
        $("#ranking_badge").show();
        $("#ranking_list").show();
        $("#start_list").hide();
    } else if(menu_id == "nav-startlist") {
        $("#nextriders_list").hide();
        $("#current_list").hide();
        $("#finished_list").hide();
        $("#ranking_list").hide();
        $("#start_list").show();
    } else if(menu_id == "nav-ranking") {
        $("#nextriders_list").hide();
        $("#current_list").hide();
        $("#finished_list").hide();
        $("#ranking_list").show();
        $("#start_list").hide();
        $("#ranking_badge").hide();
    }
});

