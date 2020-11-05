const labels = ["Classified", "Not Present", "Not Started", "Retired", "Eliminated", "Off-course", "Disqualified"];

function generateRanking(roundScore, jumpoffScore,
    roundCount, jumpoffCount,
    round, jumpoff,
    roundTableTypes, jumpoffTableTypes,
    allowedTimeRounds, allowedTimeJumpoffs,
    againstTimeClockRounds, againstTimeClockJumpoffs) {
    const roundDisplayCount = round !== 0 ? round : (roundCount + jumpoff);
    const scoreList = [...roundScore.slice(0, roundCount), ...jumpoffScore.slice(0, jumpoffCount)];
    const tableTypeList = [...roundTableTypes.slice(0, roundCount), ...jumpoffTableTypes.slice(0, jumpoffCount)];
    const allowedTimesList = [...allowedTimeRounds.slice(0, roundCount), ...allowedTimeJumpoffs.slice(0, jumpoffCount)];
    const againstTimeClockList = [...againstTimeClockRounds.slice(0, roundCount), ...againstTimeClockJumpoffs.slice(0, jumpoffCount)];
    const columnCount = 4 + 2 * roundDisplayCount;
    let riderCount = scoreList[0].length;

    for (let i = 1; i < roundDisplayCount; i ++) {
        if (scoreList[i].length > riderCount) {
            riderCount = scoreList[i].length;
        }
    }

    // format result table
    let result = Array(riderCount + 1).fill(0).map(() => Array(columnCount).fill(''));

    // format result table header
    result[0][0] = "Rnk";
    result[0][1] = "Num";
    result[0][2] = "Horse";
    result[0][3] = "Rider";
    for (let i = 0; i < roundDisplayCount; i++) {
        const roundType = i < roundCount ? 'Round' : 'Jump-Off';
        result[0][4 + i * 2] = `${roundType} ${i + 1}\nPoints`;
        result[0][4 + i * 2 + 1] = `${roundType} ${i + 1}\nTime`;
    }

    // calculate ranking
    let resultNums = [];
    for (let i = roundDisplayCount - 1; i >= 0; i --) {
        const tableSlice = scoreList[i]
            .filter(s => {
                const num = s.num;
                const found = resultNums.find(r => r[1] === num);
                return !found;
            }).map(s => ({...s}));
        if (i >= 1 && i < roundCount - 1) {
            for (let j = 0; j < tableSlice.length; j ++) {
                tableSlice[j].point = 0;
                tableSlice[j].pointPlus = 0;
            }
            for (let j = 0; j <= i; j ++) {
                const table = scoreList[j];
                for (let k = 0; k < tableSlice.length; k ++) {
                    const num = tableSlice[k].num;
                    const found = table.find(t => t.num === num);
                    if (!found) { continue; }
                    tableSlice[k].point += found.point + found.pointPlus;
                }
            }
        }
        let applyAgainstTimeClock = false;
        if (jumpoffCount === 0 || (jumpoffCount >= 1 && i >= roundCount) || roundCount === round) {
            applyAgainstTimeClock = againstTimeClockList[i];
        }
        const sortResult = sortTable(tableSlice, tableTypeList[i], applyAgainstTimeClock, allowedTimesList[i]);
        sortResult.forEach(s => {
            s[0] = s[0] + resultNums.length;
        });
        resultNums = [...resultNums, ...sortResult];
    }

    // write result table
    for (let i = 0; i < riderCount; i++) {
        const [rank, num] = resultNums[i];
        result[i + 1][0] = rank + 1;
        result[i + 1][1] = num;
        let displayRank = false;
        let scoreSummary = 0;
        for (let j = 0; j < roundDisplayCount; j++) {
            const score = scoreList[j].find(s => s.num === num);
            if (!score) { continue; }
            result[i + 1][4 + j * 2] = score.point < 0 ? formatPoint(score.point) : formatPoint(score.point + score.pointPlus);
            result[i + 1][4 + j * 2 + 1] = score.point < 0 ? '' : formatTime(score.time + score.timePlus);
            if (score.point >= 0) {
                displayRank = true;
                scoreSummary += score.point;
            }
        }
        if (!displayRank) { result[i + 1][0] = ''; }
        if (round > 1 && round <= roundCount) {
            result[i + 1][4 + roundDisplayCount * 2 + 2] = displayRank ? formatPoint(scoreSummary) : '';
        }
    }

    // update table header
    if (round > 1 && round <= roundCount) {
        result[0][4 + roundDisplayCount * 2 + 2] = 'Points';
    }
    if (round === 1) {
        result[0][4] = 'Points';
        result[0][5] = 'Time';
    }

    return result;
}

function sortTable(scoreTableSlice, tableType, applyAgainstTimeClock, optimumTime) {
    let scoreTable = scoreTableSlice.slice();
    const cnt = scoreTable.length;
    let result = Array(cnt).fill([0, 0]);
    let rankCounter = 0;
    let lastMax;
    for (let i = 0; i < cnt; i++) {
        let max = scoreTable[0];
        let iMax = 0;
        const n = scoreTable.length;
        for (let j = 1; j < n; j++) {
            const compareResult = compareFn(max, scoreTable[j], tableType, applyAgainstTimeClock, optimumTime);
            if (compareResult === -1) {
                max = scoreTable[j];
                iMax = j;
            }
        }
        if (i === 0) {
            result[i] = [0, max.num];
        } else {
            const compareResult = compareFn(max, lastMax, tableType, applyAgainstTimeClock, optimumTime);
            if (compareResult === -1) {
                rankCounter = i;
            }
            result[i] = [rankCounter, max.num];
        }
        lastMax = max;
        scoreTable.splice(iMax, 1);
    }
    return result;
}

function compareFn(score1, score2, tableType, applyAgainstTimeClock, optimumTime) {
    const pointA = score1.point + score1.pointPlus;
    const pointB = score2.point + score2.pointPlus;
    const timeA = score1.time + score1.timePlus;
    const timeB = score2.time + score2.timePlus;
    switch (tableType) {
        case 0: { // Table A
            // least point and fastest time
            if (score1.point < 0) { return -1; }
            if (score2.point < 0) { return 1; }
            if (pointA < pointB) { return 1; }
            else if (pointA === pointB) {
                if (!applyAgainstTimeClock) { return 1; }
                if (timeA < timeB) { return 1; }
                else if (timeA === timeB) { return 0; }
                else { return -1; }
            }
            else { return -1; }
        }
        case 1: { // Table C
            // fastest time
            if (timeA < timeB) { return 1; }
            else if (timeA === timeB) { return 0; }
            else { return -1; }
        }
        case 2: { // Table Penalties
            if (score1.point < 0) { return -1; }
            if (score2.point < 0) { return 1; }
            if (pointA > pointB) { return 1; }
            else if (pointA === pointB) {
                if (!applyAgainstTimeClock) { return 1; }
                if (timeA < timeB) { return 1; }
                else if (timeA === timeB) { return 0; }
                else { return -1; }
            }
            else { return -1; }
        }
        case 10: { // Table Optimum
            if (score1.point < 0) { return -1; }
            if (score2.point < 0) { return 1; }
            if (pointA < pointB) { return 1; }
            else if (pointA === pointB) {
                const timeDiffA = Math.abs(timeA - optimumTime);
                const timeDiffB = Math.abs(timeB - optimumTime);
                if (timeDiffA < timeDiffB) { return 1; }
                else if (timeDiffA === timeDiffB) { return 0; }
                else { return -1; }
            }
            else { return -1; }
        }
        default: {
            return 0;
        }
    }
}

function formatPoint(score) {
    if (score < 0) {
        return labels[Math.abs(score) - 1];
    }
    const s = score / 1000;
    return s.toFixed(2);
}

function formatTime(time) {
    const t = time / 1000;
    return t.toFixed(2);
}

module.exports = { generateRanking };