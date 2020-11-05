const roundScore = [
    [
      { num: 1, point: -4, pointPlus: 0, pos: 1, time: 0, timePlus: 0 },
      { num: 2, point: 4000, pointPlus: 0, pos: 2, time: 71412, timePlus: 0 },
      { num: 3, point: 4000, pointPlus: 0, pos: 3, time: 73796, timePlus: 0 },
      { num: 4, point: 0, pointPlus: 0, pos: 4, time: 69396, timePlus: 0 },
      { num: 5, point: -4, pointPlus: 0, pos: 5, time: 0, timePlus: 0 },
      { num: 6, point: 0, pointPlus: 0, pos: 6, time: 68698, timePlus: 0 },
      { num: 7, point: 0, pointPlus: 0, pos: 7, time: 64928, timePlus: 0 },
      { num: 8, point: -4, pointPlus: 0, pos: 8, time: 0, timePlus: 0 },
      { num: 9, point: 20000, pointPlus: 0, pos: 9, time: 99765, timePlus: 0 },
      { num: 10, point: 4000, pointPlus: 0, pos: 10, time: 77298, timePlus: 0 },
      { num: 11, point: 4000, pointPlus: 0, pos: 11, time: 65964, timePlus: 0 },
      { num: 12, point: -4, pointPlus: 0, pos: 12, time: 0, timePlus: 0 }
    ],
    [
      { num: 1, point: 107000, pointPlus: 0, pos: 1, time: 72370, timePlus: 0 },
      { num: 2, point: 0, pointPlus: 0, pos: 2, time: 46886, timePlus: 0 },
      { num: 3, point: 8000, pointPlus: 0, pos: 3, time: 48683, timePlus: 0 },
      { num: 4, point: 4000, pointPlus: 0, pos: 4, time: 46603, timePlus: 0 },
      { num: 5, point: -4, pointPlus: 0, pos: 5, time: 0, timePlus: 0 },
      { num: 6, point: 0, pointPlus: 0, pos: 6, time: 46401, timePlus: 0 },
      { num: 7, point: 0, pointPlus: 0, pos: 7, time: 44476, timePlus: 0 },
      { num: 8, point: -4, pointPlus: 0, pos: 8, time: 0, timePlus: 0 },
      { num: 9, point: -4, pointPlus: 0, pos: 9, time: 0, timePlus: 0 },
      { num: 10, point: 0, pointPlus: 0, pos: 10, time: 52517, timePlus: 0 },
      { num: 11, point: 0, pointPlus: 0, pos: 11, time: 46438, timePlus: 0 },
      { num: 12, point: 99000, pointPlus: 0, pos: 12, time: 50930, timePlus: 0 }
    ],
    [],
    []
  ];

const jumpoffScore = [
    [
      {
        num: 2,
        point: 12000,
        pointPlus: 0,
        pos: 2,
        time: 49510,
        timePlus: 0
      },
      {
        num: 4,
        point: 0,
        pointPlus: 0,
        pos: 4,
        time: 31277,
        timePlus: 0
      },
      {
        num: 6,
        point: 0,
        pointPlus: 0,
        pos: 6,
        time: 10000,
        timePlus: 0
      },
      {
        num: 7,
        point: 0,
        pointPlus: 0,
        pos: 7,
        time: 10000,
        timePlus: 0
      },
      {
        num: 10,
        point: 0,
        pointPlus: 0,
        pos: 10,
        time: 36057,
        timePlus: 0
      },
      {
        num: 11,
        point: 0,
        pointPlus: 0,
        pos: 11,
        time: 25670,
        timePlus: 0
      }
    ],
    [
      {
        num: 6,
        point: 0,
        pointPlus: 0,
        pos: 6,
        time: 28624,
        timePlus: 0
      },
      {
        num: 7,
        point: 0,
        pointPlus: 0,
        pos: 7,
        time: 29111,
        timePlus: 0
      }
    ],
    [],
    []
  ];

const roundCount = 2;
const jumpoffCount = 2;
const round = 2;
const jumpoff = 0;
const roundTableTypes = [0, 0, 0, 0];
const jumpoffTableTypes = [0, 0, 0, 0];
const allowedTimeRounds = [0, 0, 0, 0];
const allowedTimeJumpoffs = [0, 0, 0, 0];
const allowedTimeClockRounds = [false, false, false, false];
const allowedTimeClockJumpoffs = [false, false, false, false];

function testRanking() {
    const ranking = require("./ranking.js");
    const result = ranking.generateRanking(roundScore, jumpoffScore, roundCount, jumpoffCount, round, jumpoff,
        roundTableTypes, jumpoffTableTypes, allowedTimeRounds, allowedTimeJumpoffs, allowedTimeClockRounds, allowedTimeClockJumpoffs);
    console.table(result);
}

testRanking();