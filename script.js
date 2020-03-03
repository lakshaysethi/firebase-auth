function Goal() {
  this.name = "";
  this.plan = [];
  this.achieved = false;
  this.scheduledFor = "later";
  this.scheduledForLater = false;
  this.workList = [];
  this.archived = false;
}
var goalsArray;


var achievementsArray = [];
Storage.prototype.setObject = function (key, value) {
  this.setItem(key, JSON.stringify(value));
};
Storage.prototype.getObject = function (key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
};


makeNewFieldsForGoalsArray(goalsArray);
function makeNewFieldsForGoalsArray(goalsArray) {
  if (goalsArray && goalsArray.length > 0) {
    goalsArray.forEach(function (goal) {
      if (!goal.scheduledForLater) {
        goal.scheduledForLater = false;
      }
      if (!goal.scheduledFor) {
        goal.scheduledFor = "later";
      }
      if (!goal.workList) {
        goal.workList = [];
      }
      if (!goal.archived) {
        goal.archived = false;
      }
      if (goal.plan && goal.plan.length > 0) {
        makeNewFieldsForGoalsArray(goal.plan);
      }
    });
  }
}
function startApp() {
  refreshGoalsBrowser();
}
if (localStorage.getObject("achievementsArray")) {
  achievementsArray = localStorage.getObject("achievementsArray");
} else {
  achievementsArray = [];
}

var saveBtn = $("<button>Save goals to FireStore</button>");
saveBtn.click(function () {
  saveGoalsArray();
});
saveBtn.appendTo(".buttonsHolder");
function saveGoalsArray() {
  var dataToWrite = JSON.parse(JSON.stringify(goalsArray));

  lakshayDoc
    .set({
      mainGoalsArray: dataToWrite
    })
    .then(function () {
      console.log("successfully added the data to firestore app");
      alert("successfully added the data to firestore app");
    })
    .catch(function (err) {
      alert(err);
    });
}

var loadBtn = $("<button>load goals Data From FireStore</button>");
loadBtn.click(function () {
  loadGoalsArray();
});
loadBtn.appendTo(".buttonsHolder");
var mainGoal;
var workOnAllGoalsBtn = $(".workOnAllGoals");
mainGoal = new Goal();
mainGoal.plan = goalsArray;

workOnAllGoalsBtn.click(function () {
  workonplan(mainGoal, $("<div class=goal>"));
});
function loadGoalsArray() {
  lakshayDoc
    .get()
    .then(function (docSnapshot) {
      if (docSnapshot && docSnapshot.exists) {
        var data = docSnapshot.data();
        console.log("data recieved from firestore");
        if (!data.mainGoalsArray){
          data.mainGoalsArray = [];
        }
        console.log(data);
        
        goalsArray = data.mainGoalsArray;

        startApp();

        mainGoal = new Goal();
        mainGoal.name = "Work on All Goals"
        mainGoal.plan = goalsArray;

        workOnAllGoalsBtn.click(function () {
          workonplan(mainGoal, $("<div class=goal>"));
        });
      }
    })
    .catch(function (err) {
      alert(err);
    });
}

var saveInterval = setInterval(save, 5000);
function save() {
  localStorage.setObject("goalsArray2", goalsArray);
  localStorage.setObject("achievementsArray", achievementsArray);
}
window.onbeforeunload = function (event) {
  save();
};

function setGoalName(goal, name) {
  goal.name = name;
}

function setGoalStatus(goal, status) {
  goal.achieved = status;
}

$(".newGoalBtn").click(function () {
  //make a new goal object
  let goal = new Goal();

  //ask user for name of the goal and set the name of goal
  var H1 = $("<H1>please enter the name for new goal</H1>");
  var goalinput = $("<input type='text'>");
  var okButton = $("<button>OK</button>");
  H1.appendTo("body");
  goalinput.appendTo("body");
  goalinput.focus();
  okButton.appendTo("body");

  okButton.click(function () {
    if (goalinput.val() != "") {
      dothis1();
    }
  });
  goalinput.on("keypress", function (e) {
    if (e.which == 13 && goalinput.val() != "") {
      dothis1();
    }
  });

  function dothis1() {
    setGoalName(goal, goalinput.val());
    /*/next step after setting name*/
    H1.remove();
    goalinput.remove();
    okButton.remove();
    goalsArray.push(goal);
    //askForPlan(goal);
    refreshGoalsBrowser();
  }
});

function askForPlan(goal) {
  var H1 = $(`<H1>does -> ${goal.name}<- need a plan to achieve it?</H1>`);
  var yesButton = $("<button>yes</button>");
  var noButton = $("<button>No</button>");
  $(".goal").hide();
  var goalContainer = $("<div class='goal'>");

  H1.appendTo(goalContainer);
  yesButton.appendTo(goalContainer);
  noButton.appendTo(goalContainer);
  goalContainer.appendTo(".goalsHolder");

  yesButton.click(function () {
    dothis1();
    tellUserToWorkOnPlan(goal, goalContainer);
  });
  noButton.click(function () {
    dothis1();
    tellUserToWork(goal, goalContainer);
  });

  function dothis1() {
    //goalContainer.remove();
    /*/next step after setting name*/
    H1.remove();
    yesButton.remove();
    noButton.remove();
  }
}

function resetLaters(goalsArray) {
  goalsArray.forEach(goal => {
    goal.scheduledForLater = false;
    if (goal.plan.length > 0) {
      resetLaters(goal.plan);
    }
  });
}

function tellUserToWorkOnPlan(goal, goalContainer) {
  //TODO makeNewFieldsForGoalsArray(goalsArray, false, false);
  $(".goal").hide();
  goalContainer.show();
  resetLaters(goalsArray);

  var H1 = $(`<H1>Plan for-> ${goal.name}<- </H1>`);
  // var input = $(`<input type='text'>`);
  var addButton = $("<button>add plan</button>");
  var doneButton = $("<button>done</button>");
  var paraPlan = $("<p>");
  H1.appendTo(goalContainer);
  paraPlan.appendTo(goalContainer);
  // input.appendTo("body")
  // input.focus();
  addButton.appendTo(goalContainer);
  doneButton.appendTo(goalContainer);
  var string = printPlan(goal);
  var html = string.replace(/[1-9][.]/g, "<br>");
  paraPlan.html("plan for goal: " + goal.name + "<br> " + html);
  // input.on("keypress", function (e) {
  //     if (e.which = 13) {
  //         getPlan(goal)
  //     }
  // })

  addButton.click(function () {
    getPlan(goal);
    string = printPlan(goal);
    html = string.replace(/[1-9][.]/g, "<br>");
    paraPlan.html("plan for goal: " + goal.name + "<br> " + html);
  });
  doneButton.click(function () {
    dothis1();
    workonplan(goal, goalContainer);
  });

  function dothis1() {
    /*/next step after setting name*/
    H1.remove();
    addButton.remove();
    paraPlan.remove();
    doneButton.remove();
  }
}

function getPlan(goal) {
  dowhile = true;
  while (dowhile) {
    var plan = new Goal();

    plan.name = prompt(
      "what is the plan for " +
      goal.name +
      "? how can we achieve it?\n we already have :\n" +
      printPlan(goal)
    );
    if (plan.name != null && plan.name !== "") goal.plan.push(plan);
    else if (confirm("are you sure you want to stop entering plans?")) {
      dowhile = false;
    }
  }
}

function printPlan(goal) {
  var plan2 = "";
  for (i = 0; i < goal.plan.length; i++) {
    plan2 +=
      i + 1 + ". " + goal.plan[i].name + ":" + goal.plan[i].achieved + "\n";
  }
  return plan2;
}
function allSubgoalsAchieved(goal) {
  if (goal.plan.length > 0) {
    var areAllachieved = true;
    for (i = 0; i < goal.plan.length; i++) {
      if (!goal.plan[i].achieved) {
        return false;
      }
    }
    return areAllachieved;
  }
}
function workonplan(goal, goalContainer) {

  if (goal.plan.length > 0 && !allSubgoalsAchieved(goal)) {
    try {
      var i = 0;
      var isPaused = false;

      var workinterval = setInterval(dothis, 1000);

      function dothis() {
        if (i > 0) {
          if (goal.plan[i - 1].achieved || goal.plan[i - 1].scheduledForLater) {
            isPaused = false;
          }
        } else if (i >= goal.plan.length) {
          if (goal.plan[i - 1].achieved) {

            clearInterval(workinterval);
            alert(" I have cleared work interval");
            askIfAchieved(goal, goalContainer);
            goalContainer.show();
          }
        }
        if (!isPaused) {
          try {
            if (!goal.plan[i].achieved) {
              if (!goal.plan[i].archived) {
                askForPlan(goal.plan[i]);
                isPaused = true;
              } else {
                alert(goal.plan[i].name + " is archived");
              }

            }
            i++;
          } catch (e) {
            if (i >= goal.plan.length) {
              //alert(e);
              clearInterval(workinterval);
              alert(" I have cleared work interval");
              askIfAchieved(goal, goalContainer);
            } else {
              alert(e);
            }
          }
        }
      }
    } catch (e) {
      alert(e);
    }
  } else {

    askIfAchieved(goal, goalContainer);

  }
}


// for (var i = 0; i < goal.plan.length; i++){
//     askForPlan(goal.plan[i]);
// }

// askIfAchieved(goal);


function tellUserToWork(goal, goalContainer) {
  var H1 = $(`<H1>NOW you need to work on-> ${goal.name}<- </H1>`);
  var doneBtn = $("<button>Done</button>");
  var scheduleForLaterBtn = $("<button>later</button>");
  var WorkHereBtn = $("<button>Work(make a list) Here</button>");
  H1.appendTo(goalContainer);
  doneBtn.appendTo(goalContainer);
  scheduleForLaterBtn.appendTo(goalContainer);
  WorkHereBtn.appendTo(goalContainer);
  scheduleForLaterBtn.click(function () {
    askUserForTime(goal, goalContainer);
    dothis1();
  });
  doneBtn.click(function () {
    askIfAchieved(goal, goalContainer);
    dothis1();
  });
  WorkHereBtn.click(function () {
    $(".workList").remove();
    workListfunction();

  });
  function workListfunction() {
    getWorkList(goal);

    var workList = $(`<div class='workList'>${printWorkList(goal)}</div>`)
    var deleteWorkListButton = $(`<button>delete WorkList</button>`);
    deleteWorkListButton.appendTo(workList);
    deleteWorkListButton.click(function () {
      if (confirm(`Are you sure you want to delete   ${goal.name}'s worklist?\n${printWorkList(goal)}`)) {
        goal.workList = [];
        $(".workList").remove();
      }

    })
    workList.appendTo(goalContainer);
  }
  function dothis1() {
    /*/next step after setting name*/
    H1.remove();
    doneBtn.remove();
    scheduleForLaterBtn.remove();

  }
}
function getWorkList(goal) {
  dowhile = true;
  while (dowhile) {
    var work = new Goal();

    work.name = prompt(
      "what is the workList items for " +
      goal.name +
      "?\n we already have :\n" +
      printWorkList(goal)
    );
    if (work.name != null && work.name !== "") goal.workList.push(work);
    else if (confirm("are you sure you want to stop entering works?")) {
      dowhile = false;
    }
  }
}

function printWorkList(goal) {
  var workList2 = "";
  for (i = 0; i < goal.workList.length; i++) {
    workList2 +=
      i + 1 + ". " + goal.workList[i].name + "\n";
  }
  return workList2;
}

function askUserForTime(goal, goalContainer) {
  var scheduleh1 = $(`<h1> Please schedule a time for -> ${goal.name}</h1>`);
  scheduleh1.appendTo(goalContainer);

  var dateInput = $("<input type='text' placeholder='date'>");
  var timeInput = $("<input type='text' placeholder='time'>");
  dateInput.appendTo(goalContainer);
  timeInput.appendTo(goalContainer);
  var today = new Date();
  dateInput.datepicker({
    dateFormat: "D, dd-M-yy",

    autoclose: true,
    minDate: today
  }).on('changeDate', function (ev) {
    $(this).datepicker('hide');
  });


  dateInput.keyup(function () {
    if (this.value.match(/[^0-9]/g)) {
      this.value = this.value.replace(/[^0-9^-]/g, '');
    }
  });
  timeInput.timepicker({
    timeFormat: 'h:mm p',
    interval: 30,
    minTime: '00:01 am',
    maxTime: '11:59pm',
    defaultTime: '4 00 am',
    startTime: '10:00',
    dynamic: true,
    dropdown: true,
    scrollbar: true
  });

  var doneBtn = $("<button>Done/ LATER!(leave date empty)</button>")
  doneBtn.appendTo(goalContainer);
  doneBtn.click(function () {
    if (dateInput.val() != "") {
      goal.scheduledFor = `${timeInput.val()} --- on --- ${dateInput.val()} `;

      setReminder(goal);
    } else {
      goal.scheduledFor = `later`;
    }
    goal.scheduledForLater = true;
  })
}



function setReminder(goal) {
  //TODO
}


function askIfAchieved(goal, goalContainer) {
  $(".goal").hide();
  var H1 = $(`<H1>is  -> ${goal.name}<-  done /achieved?</H1>`);
  var yesButton = $("<button>yes</button>");
  var noButton = $("<button>No</button>");
  H1.appendTo(goalContainer);
  yesButton.appendTo(goalContainer);
  noButton.appendTo(goalContainer);
  goalContainer.show();
  goalContainer.appendTo($(".goalsHolder"))
  yesButton.click(function () {
    goal.achieved = true;
    celebrate(goal, goalContainer);
    dothis1();
  });
  noButton.click(function () {
    dothis1();
    askForPlan(goal);
  });

  function dothis1() {
    /*/next step after setting name*/
    H1.remove();
    yesButton.remove();
    noButton.remove();
  }
}

function celebrate(goal, goalContainer) {
  var goalContainer1 = $("<div class='achievement'>");
  var H1 = $(
    `<H1>YAY!!! you achieved -> ${goal.name} at ${nowTime()}<- YAY!!!</H1>`
  );
  var nextButton = $("<button>Next</button>");

  H1.appendTo(goalContainer1);
  nextButton.appendTo(goalContainer1);
  //refreshGoalsBrowser();
  nextButton.click(function () {
    dothis1();
  });
  achievementsArray.push(`you achieved -> ${goal.name}<- at ${nowTime()}`);
  goalContainer1.appendTo("body");
  function dothis1() {
    /*/next step after setting name*/
    H1.remove();
    nextButton.remove();
    goalContainer1.remove();
  }
}

function nowTime() {
  var timeanddate = moment().format("h:mm:ss a [on] dddd Do-MMMM-YYYY");
  return timeanddate;

  // var today = new Date();
  // var dd = today.getDate();
  // var mm = today.getMonth() + 1; //January is 0!

  // var yyyy = today.getFullYear();
  // if (dd < 10) {
  //     dd = '0' + dd;
  // }
  // if (mm < 10) {
  //     mm = '0' + mm;
  // }
  // var date = dd + '/' + mm + '/' + yyyy;

  // return `${time} on ${date}`;
}
$(".achievedBtn").click(function () {
  $(".goalBrowser").show();
  showAchievements();
});

function showAchievements() {
  refreshGoalsBrowser();
}

function refreshGoalsBrowser() {
  //var goalElementArray = [];
  $(".achievementSection").html("");
  var goalDiv = $("<div class='achievedGoals'>");
  var goalContentHolder = $(`<div class="goalBrowser"></div>`);
  var realContent = recursiveGoalBrowser(goalsArray, true);
  realContent.appendTo(goalContentHolder);
  goalContentHolder.appendTo(goalDiv);
  goalDiv.appendTo(".achievementSection");
}

function recursiveGoalBrowser(goalsOrPlansArray, openOrClosed) {
  var mainGoal = $("<div class='goalA'>");
  var openCloseBtn = $("<button class='openCloseBtn'>+</button>");
  openCloseBtn.prependTo(mainGoal);
  var subGoalElementArray = [];
  if (goalsOrPlansArray.length > 0) {
    goalsOrPlansArray.forEach(function (goal) {
      var subGoal;
      if (goal.archived) {
        subGoal = $(`<div class='archived goalB'><div class='goalNameInBrowser'><span>${goal.name}:</span></div></div>`);
      } else {
        subGoal = $(`<div class='normal goalB'><div class='goalNameInBrowser'><span>${goal.name}:</span></div></div>`);
      }

      var achievedornotbutton = achievedOrNotString(goal, goalsOrPlansArray, subGoal);
      achievedornotbutton.appendTo(subGoal);
      var workOnPlanBtn = $("<button class='workOnPlanBtn'>▶</button>");
      var goalContainer = $("<div class='goal'>");
      workOnPlanBtn.click(function () {
        $(".goalBrowser").hide();
        goalContainer.appendTo(".goalsHolder");
        tellUserToWorkOnPlan(goal, goalContainer);
      });
      workOnPlanBtn.appendTo(subGoal);
      var editBtn = $("<button class='editBtn'>✏</button>");
      editBtn.click(function () {
        var newName = prompt("whats the new name for " + goal.name);
        if (newName) {
          goal.name = newName;
          achievedornotopenclose(goalsOrPlansArray, subGoal, true);
        }
      });
      editBtn.appendTo(subGoal);
      var archivedBtn = $("<button class='archivedBtn'>🗃</button>");
      archivedBtn.click(function () {

        if (!goal.archived) {
          goal.archived = true;
          alert(goal.name + "is archievd:" + goal.archived);
        } else {
          goal.archived = false;
          alert(goal.name + "is archievd:" + goal.archived);
        }
        refreshGoalsBrowser();
      });
      archivedBtn.appendTo(subGoal);
      var deleteBtn = $("<button class='deleteBtn'>❌</button>");
      deleteBtn.click(function () {
        if (confirm("Are you sure you want to delete " + goal.name)) {
          if (
            confirm(
              "Are you sure you REALLY SURE you want to delete " + goal.name
            )
          ) {
            let index = goalsOrPlansArray.indexOf(goal);
            if (index !== -1) {
              goalsOrPlansArray.splice(index, 1);
              achievedornotopenclose(goalsOrPlansArray, subGoal, true);
              goalContainer.remove();
            } else {
              alert(`${goal.name} not found in goalsArray`);
            }
          }
        }
      });
      deleteBtn.appendTo(subGoal);
      if (!goal.plan.length < 1) {
        var subsubGoals = recursiveGoalBrowser(goal.plan);
        subsubGoals.appendTo(subGoal);
      }
      subGoal.appendTo(mainGoal);
      subGoalElementArray.push(subGoal);
      if (openOrClosed) {
        subGoal.show();
      } else {
        subGoal.hide();
      }
    });
  }
  openCloseBtn.click(function () {
    if (openCloseBtn.html() == "+") {
      var keep = openCloseBtn.parent().parent();
      var hideThese = keep.parent().children();
      hideThese.hide();
      // keep.show();
      subGoalElementArray.forEach(function (subGoal) {
        subGoal.appendTo(".goalBrowser")
        subGoal.show();
        subGoal.children().show();
      });

      openCloseBtn.html("-");
    } else if (openCloseBtn.html() == "-") {
      subGoalElementArray.forEach(function (subGoal) {
        subGoal.hide();
      });
      openCloseBtn.html("+");
    }
  });
  return mainGoal;

  // var htmlString = '';
  // goalsArray.forEach(function (goal) {
  //     htmlString += `<div class='goalB'><span>${goal.name}:${achievedOrNotString(goal).html()}</span><br>`;
  //     if (!goal.plan.length < 1) {
  //         htmlString += recursiveGoalBrowser(goal.plan);
  //     }
  //     htmlString += `</div>`;

  // });
  // return htmlString;
}

function achievedOrNotString(goal, goalsArray, subGoal) {
  var achieved = $("<span><button><b> Achieved</b></button></span>");
  var notAchieved = $("<span><button><i> Not achieved</i></button></span>");
  var goalContainer = $("<div>");
  goalContainer.appendTo("body");
  achieved.click(function () {
    goal.achieved = false;
    //showAchievements();

    achievedornotopenclose(goalsArray, subGoal, true);
  });
  notAchieved.click(function () {
    goal.achieved = true;
    celebrate(goal, goalContainer);

    achievedornotopenclose(goalsArray, subGoal, true);
    //showAchievements();
  });
  if (goal.achieved) {
    return achieved;
  } else {
    return notAchieved;
  }
}

function achievedornotopenclose(goalsArray, subGoal, openOrClosed) {
  var subgoalParent = subGoal.parent();
  subgoalGradParent = subgoalParent.parent();
  subgoalParent.remove();
  var goalContent = recursiveGoalBrowser(goalsArray, openOrClosed);
  goalContent.appendTo(subgoalGradParent);
}


var resetLatersBtn = $(".resetLatersBtn");

resetLatersBtn.click(function () {
  resetLaters(goalsArray);
});




var showScheduleBtn = $(".showScheduleBtn");
var scheduleHolder = $(".scheduleHolder");

showScheduleBtn.click(function () {
  if (scheduleHolder.css("display") == "none") {
    scheduleHolder.html("");
    var table = $("<table class='scheduleTable'>");
    populateTableWithSchedule(goalsArray, table);
    table.appendTo(scheduleHolder);
    scheduleHolder.show();
  } else {
    scheduleHolder.hide();
  }

});



function populateTableWithSchedule(goalsArray, table) {
  if (goalsArray.length > 0) {
    goalsArray.forEach(function (goal) {
      if (goal.scheduledFor != "later" && !goal.achieved) {
        var row = $(`<tr>   </tr>`);
        var leftData = $(`<td><h3>${goal.name}</h3></td>`);
        var rightData = $(`<td><h3>${goal.scheduledFor}</h3></td>`);
        leftData.appendTo(row);
        rightData.appendTo(row);
        row.appendTo(table);
      }
      populateTableWithSchedule(goal.plan, table);
    });
  }
}


$(".startSchudlingBtn").click(function () {
  if (confirm("are you sure you want to overwrite all schedules?")) {
    scheduleTasks(goalsArray);
  }

  function scheduleTasks(gArray) {
    gArray.forEach(function (goal) {
      var time = prompt(`what time do you want to work on ` + goal.name + `\n we already have:\n${printSchedule(goalsArray)} `);
      if (time) {
        goal.scheduledFor = time;
      } else {
        goal.scheduledFor = "later";
      }
      if (goal.plan && goal.plan.length > 0) {
        if (confirm(`do you want to schedule ${goal.name}'s sub tasks?`)) {
          scheduleTasks(goal.plan);
        }
      }

    });
  }
})

function printSchedule(goalsArray) {
  var string = "";
  if (goalsArray.length > 0) {
    goalsArray.forEach(function (goal) {
      if (goal.scheduledFor != "later") {
        string += `${goal.name}->${goal.scheduledFor}\n`
      }
      string += `${printSchedule(goal.plan)}`;
    })
  }
  return string;
}
var toggleArchive = true;
$(".toggleArchivedBtn").click(function () {

  if (toggleArchive) {

    $(".normal.goalB").hide();
    $(".archived.goalB").show();
    toggleArchive = false;
  } else {
    $(".normal.goalB").show();
    $(".archived.goalB").hide();
    toggleArchive = true;
  }
  //refreshGoalsBrowser();
})