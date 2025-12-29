let emotionStack = [];
let gameQuestions = [];
let questionIndex = 0;
let score = 100;
let paused = false;
let musicOn = false;
let EQ = 50;
let IQ = 50;

const TOTAL_QUESTIONS = 6;
let pressureMode = true;     // 🔥 set false if you want normal mode
let timeLeft = 10;
let timerInterval = null;
const PRESSURE_TIME = 10;

const music = document.getElementById("bgMusic");
const situation = document.getElementById("situation");
const buttons = document.getElementById("buttons");
const stackText = document.getElementById("emotionStack");
const stackContainer = document.getElementById("stackContainer");
const progressBar = document.getElementById("progressBar");
const difficultySelect = document.getElementById("difficultySelect");

/* ---------- UTILS ---------- */
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
// ✅ Normalize EQ / IQ to 0–100
function normalize(value, min, max) {
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(((clamped - min) / (max - min)) * 100);
}
/* ---------- QUESTION TEMPLATE ---------- */
function q(text, good, bad) {
  return {
    q: text,
    a: [
      { t: good, e: "Confidence", s: +6 },
      { t: bad, e: "Stress", s: -8 }
    ]
  };
}
function mq(text, good, bad) {
  return {
    q: text,
    a: [
      { t: good, e: "Motivation", s: +7 },
      { t: bad, e: "Guilt", s: -7 }
    ]
  };
}
function hq(text, good, bad) {
  return {
    q: text,
    a: [
      { t: good, e: "Confidence", s: +9 },
      { t: bad, e: "Stress", s: -10 }
    ]
  };
}

/* ---------- QUESTION BANK ---------- */
const QUESTION_BANK = {
  easy: [
    [
  q(
    "You feel slightly anxious before starting work.",
    "Begin anyway and adjust mood later",
    "Pause briefly to understand the anxiety"
  ),
  q(
    "You made a small mistake that no one noticed.",
    "Correct it quietly",
    "Leave it since it caused no harm"
  ),
  q(
    "You feel low energy during a productive day.",
    "Continue to maintain momentum",
    "Slow down to avoid burnout"
  ),
  q(
    "A task feels boring but important.",
    "Finish it efficiently",
    "Add interest even if it takes longer"
  ),
  q(
    "You feel distracted but not stressed.",
    "Remove distractions immediately",
    "Accept mild distraction and continue"
  ),
  q(
    "You receive neutral feedback.",
    "Assume improvement is needed",
    "Assume performance is acceptable"
  )
],
   [
  q(
    "A friend seems quiet but says they are fine.",
    "Respect their space",
    "Check in again gently"
  ),
  q(
    "You disagree but don’t feel strongly.",
    "Express your view calmly",
    "Let it go to avoid friction"
  ),
  q(
    "Someone praises you unexpectedly.",
    "Accept it without analysis",
    "Reflect on why it was said"
  ),
  q(
    "You feel slightly ignored in a group.",
    "Stay engaged anyway",
    "Withdraw and observe"
  ),
  q(
    "A joke makes you uncomfortable.",
    "Laugh lightly and move on",
    "Address discomfort later"
  ),
  q(
    "You feel socially drained.",
    "Take short alone time",
    "Push through for connection"
  )
],
    [
  q(
    "You feel unfocused before studying.",
    "Start with easy material",
    "Organize tasks first"
  ),
  q(
    "You completed a task faster than expected.",
    "Move to the next task",
    "Review work for quality"
  ),
  q(
    "You feel mild pressure to perform.",
    "Use it as motivation",
    "Reduce pressure intentionally"
  ),
  q(
    "You catch yourself procrastinating.",
    "Forgive and restart",
    "Push yourself harder"
  ),
  q(
    "Your plan changes slightly.",
    "Adapt quickly",
    "Re-evaluate fully"
  ),
  q(
    "You feel calm but unmotivated.",
    "Act without motivation",
    "Wait for clarity"
  )
],
    [
  q(
    "You are unsure why you feel off.",
    "Continue routine",
    "Reflect briefly"
  ),
  q(
    "You succeed but feel neutral.",
    "Accept neutrality",
    "Search for meaning"
  ),
  q(
    "You feel confident without reason.",
    "Use confidence",
    "Question it"
  ),
  q(
    "You fail slightly.",
    "Move on quickly",
    "Understand cause"
  ),
  q(
    "You feel content but stagnant.",
    "Maintain stability",
    "Seek growth"
  ),
  q(
    "You receive advice you didn’t ask for.",
    "Consider it",
    "Ignore it"
  )
],
    [
  q(
    "You have extra time unexpectedly.",
    "Use it productively",
    "Use it to rest"
  ),
  q(
    "You feel motivated late at night.",
    "Work briefly",
    "Preserve sleep"
  ),
  q(
    "You feel good after finishing work.",
    "Reward yourself",
    "Maintain discipline"
  ),
  q(
    "You feel average today.",
    "Accept normalcy",
    "Push for excellence"
  ),
  q(
    "You feel responsible for group mood.",
    "Support others",
    "Focus on yourself"
  ),
  q(
    "You feel capable but unsure.",
    "Try anyway",
    "Prepare more"
  )
],
    [
  q(
    "You feel mild stress before a task.",
    "Start to reduce it",
    "Wait until calm"
  ),
  q(
    "You notice improvement in yourself.",
    "Acknowledge it",
    "Stay humble"
  ),
  q(
    "You feel slightly bored.",
    "Finish responsibilities",
    "Change activity"
  ),
  q(
    "You are asked for help while busy.",
    "Help briefly",
    "Decline politely"
  ),
  q(
    "You feel mentally tired.",
    "Short break",
    "Push through"
  ),
  q(
    "You feel steady progress.",
    "Maintain pace",
    "Increase challenge"
  )
]
  ],
  medium: [
    [
  mq(
    "You are productive but emotionally drained.",
    "Adjust workload slightly",
    "Maintain output"
  ),
  mq(
    "Pressure improves results but increases stress.",
    "Control pressure",
    "Accept stress temporarily"
  ),
  mq(
    "Your routine works but feels rigid.",
    "Optimize gradually",
    "Redesign fully"
  ),
  mq(
    "You perform well but feel replaceable.",
    "Strengthen unique skills",
    "Ignore perception"
  ),
  mq(
    "You feel confident but complacent.",
    "Introduce challenge",
    "Stabilize performance"
  ),
  mq(
    "You fear losing momentum.",
    "Push harder",
    "Protect balance"
  )
],
    [
  mq(
    "You disagree with a respected peer.",
    "Express disagreement thoughtfully",
    "Stay silent strategically"
  ),
  mq(
    "Honesty may strain a relationship.",
    "Be transparent",
    "Preserve harmony"
  ),
  mq(
    "You feel undervalued but not mistreated.",
    "Address concern",
    "Observe longer"
  ),
  mq(
    "You sense passive resistance.",
    "Clarify openly",
    "Adapt quietly"
  ),
  mq(
    "You are praised publicly.",
    "Accept confidently",
    "Redirect credit"
  ),
  mq(
    "You feel emotionally distant.",
    "Reconnect intentionally",
    "Allow distance"
  )
],
   [
  mq(
    "You have incomplete information.",
    "Decide with assumptions",
    "Delay for clarity"
  ),
  mq(
    "Speed improves outcomes but risks errors.",
    "Move fast",
    "Slow down"
  ),
  mq(
    "You feel internal resistance.",
    "Examine it",
    "Override it"
  ),
  mq(
    "You sense diminishing returns.",
    "Change strategy",
    "Increase effort"
  ),
  mq(
    "You feel capable but anxious.",
    "Act anyway",
    "Reduce anxiety first"
  ),
  mq(
    "You are close to burnout.",
    "Pause briefly",
    "Finish strongly"
  )
],
    [
  mq(
    "Your strengths no longer excite you.",
    "Evolve them",
    "Develop new ones"
  ),
  mq(
    "You feel boxed by expectations.",
    "Redefine role",
    "Perform within limits"
  ),
  mq(
    "You fear losing competence.",
    "Protect expertise",
    "Risk beginner status"
  ),
  mq(
    "Your progress feels slow but steady.",
    "Trust process",
    "Accelerate change"
  ),
  mq(
    "You feel aligned but unchallenged.",
    "Seek discomfort",
    "Preserve alignment"
  ),
  mq(
    "You feel ambition rising.",
    "Channel strategically",
    "Moderate ambition"
  )
],
   [
  mq(
    "A shortcut saves time but feels wrong.",
    "Reject shortcut",
    "Use it cautiously"
  ),
  mq(
    "Helping others slows your progress.",
    "Support selectively",
    "Focus on self"
  ),
  mq(
    "Your success disadvantages someone.",
    "Accept outcome",
    "Adjust behavior"
  ),
  mq(
    "Silence avoids conflict but feels dishonest.",
    "Speak up",
    "Stay silent"
  ),
  mq(
    "Rules restrict innovation.",
    "Work within rules",
    "Challenge rules"
  ),
  mq(
    "Responsibility increases stress.",
    "Accept responsibility",
    "Reduce load"
  )
],
    [
  mq(
    "Strong emotion clouds judgment.",
    "Pause decision",
    "Proceed carefully"
  ),
  mq(
    "You feel calm but disengaged.",
    "Reignite motivation",
    "Accept calm state"
  ),
  mq(
    "You fear future regret.",
    "Consider long-term impact",
    "Trust present intuition"
  ),
  mq(
    "You feel controlled by routine.",
    "Introduce flexibility",
    "Strengthen discipline"
  ),
  mq(
    "You feel emotionally guarded.",
    "Lower guard gradually",
    "Maintain protection"
  ),
  mq(
    "You feel internal conflict.",
    "Resolve actively",
    "Let it settle"
  )
]
  ],
  hard: [
   [
  hq(
    "You are consistently performing well but feel disconnected from your work.",
    "Continue performing while searching quietly for meaning",
    "Risk performance by confronting dissatisfaction directly"
  ),
  hq(
    "Your success creates pressure to never fail.",
    "Maintain standards even if anxiety increases",
    "Lower expectations to preserve mental health"
  ),
  hq(
    "You realize your strengths no longer excite you.",
    "Leverage strengths strategically anyway",
    "Rebuild identity around curiosity, not competence"
  ),
  hq(
    "You outperform peers but feel undeserving.",
    "Rationalize success through evidence",
    "Downplay success to reduce internal conflict"
  ),
  hq(
    "Consistency is costing creativity.",
    "Preserve stability",
    "Sacrifice stability to rediscover growth"
  ),
  hq(
    "Your discipline feels like emotional suppression.",
    "Continue discipline with awareness",
    "Loosen control to explore emotions"
  )
],
    [
  hq(
    "A major failure threatens your self-image.",
    "Detach identity from outcome",
    "Use shame as fuel for recovery"
  ),
  hq(
    "Repeated failure suggests pattern or misalignment.",
    "Analyze data without emotion",
    "Pause and reassess life direction"
  ),
  hq(
    "Admitting failure may damage reputation.",
    "Accept reputational loss for integrity",
    "Recover silently through future results"
  ),
  hq(
    "Fear of failing again reduces risk-taking.",
    "Accept calculated exposure",
    "Build confidence before attempting again"
  ),
  hq(
    "Failure isolates you socially.",
    "Seek connection despite vulnerability",
    "Withdraw to rebuild competence privately"
  ),
  hq(
    "You can either recover fast or recover deeply.",
    "Recover efficiently",
    "Recover meaningfully"
  )
],
   [
  hq(
    "Your emotions interfere with decision-making.",
    "Train emotional regulation",
    "Outsource decisions to logic and structure"
  ),
  hq(
    "Staying calm reduces urgency.",
    "Accept emotional neutrality",
    "Reintroduce pressure deliberately"
  ),
  hq(
    "Strong emotions increase motivation but distort judgment.",
    "Channel emotion carefully",
    "Suppress emotion entirely"
  ),
  hq(
    "You think clearly but feel empty.",
    "Optimize cognition",
    "Re-engage emotionally"
  ),
  hq(
    "Emotional honesty risks instability.",
    "Reveal selectively",
    "Maintain composure at cost of authenticity"
  ),
  hq(
    "Control improves outcomes but reduces connection.",
    "Preserve effectiveness",
    "Sacrifice control for connection"
  )
],
    [
  hq(
    "Success requires bending values slightly.",
    "Protect long-term integrity",
    "Adapt values pragmatically"
  ),
  hq(
    "You must choose speed or correctness.",
    "Deliver fast with risk",
    "Delay for precision"
  ),
  hq(
    "Others benefit from your compromise.",
    "Accept moral discomfort",
    "Reject outcome despite benefit"
  ),
  hq(
    "Ethical clarity costs opportunity.",
    "Preserve principles",
    "Delay ethics until stability"
  ),
  hq(
    "Ambition conflicts with empathy.",
    "Advance regardless",
    "Slow down for alignment"
  ),
  hq(
    "Pressure rewards decisiveness over reflection.",
    "Act decisively",
    "Pause for reflection"
  )
],
    [
  hq(
    "You compare yourself to higher achievers constantly.",
    "Use comparison as benchmark",
    "Detach self-worth from ranking"
  ),
  hq(
    "Validation improves confidence but weakens autonomy.",
    "Accept validation strategically",
    "Reject external validation"
  ),
  hq(
    "Being exceptional isolates you.",
    "Accept isolation",
    "Blend in for belonging"
  ),
  hq(
    "You can outperform or stay mentally healthy.",
    "Push limits",
    "Protect mental equilibrium"
  ),
  hq(
    "Recognition motivates but traps identity.",
    "Use recognition as tool",
    "Distance identity from success"
  ),
  hq(
    "You fear becoming average.",
    "Accept realism",
    "Fight relentlessly"
  )
],
    [
  hq(
    "Your long-term path feels rational but unfulfilling.",
    "Commit for stability",
    "Redesign path despite risk"
  ),
  hq(
    "Certainty reduces growth.",
    "Stabilize life",
    "Live in strategic uncertainty"
  ),
  hq(
    "Meaning requires sacrifice.",
    "Accept sacrifice",
    "Optimize comfort"
  ),
  hq(
    "Your potential feels underused.",
    "Maximize output",
    "Redefine success"
  ),
  hq(
    "Security delays purpose.",
    "Build security first",
    "Chase purpose early"
  ),
  hq(
    "Clarity might close possibilities.",
    "Decide firmly",
    "Remain open-ended"
  )
]
  ]
};

/* ---------- GAME FLOW ---------- */
function startGame() {
   const level = difficultySelect.value;

  // ❌ If difficulty not selected
  if (level === "") {
    situation.innerHTML = "⚠️ Please select a difficulty level first!";
    situation.style.color = "red";
    return;
  }

  // ✅ Reset color when valid
  situation.style.color = "";

  emotionStack = [];
  score = 100;
  questionIndex = 0;
  paused = false;
  EQ = 50;
  IQ = 50;
  clearInterval(timerInterval);

  
  const randomSet = shuffle(QUESTION_BANK[level])[0];
  gameQuestions = shuffle(randomSet);

  nextQuestion();
}

function nextQuestion() {
  if (paused) return;

  if (questionIndex >= TOTAL_QUESTIONS) {
    clearInterval(timerInterval);
    endGame();
    return;
  }

  const q = gameQuestions[questionIndex++];
  situation.textContent = q.q;
  buttons.innerHTML = "";

  shuffle(q.a).forEach(opt => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = opt.t;
    b.onclick = () => {
      clearInterval(timerInterval);
      applyChoice(opt);
    };
    buttons.appendChild(b);
  });

  progressBar.style.width = `${(questionIndex / TOTAL_QUESTIONS) * 100}%`;
  if (pressureMode) startPressureTimer();
}
/* ===================== PRESSURE TIMER ===================== */
function startPressureTimer() {
  clearInterval(timerInterval);
  timeLeft = PRESSURE_TIME;
  updateTimerText();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerText();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      autoMoveNext();
    }
  }, 1000);
}
function autoMoveNext() {
  emotionStack.push("Stress");
  score -= 10;
  EQ -= 5;
  IQ += 1;

  updateUI();
  nextQuestion();
}

function updateTimerText() {
  stackText.textContent = pressureMode
    ? `⏱ Think Fast: ${timeLeft}s`
    : `Current Emotion: ${emotionStack.at(-1) || "Calm"}`;
}

function applyChoice(opt) {
  emotionStack.push(opt.e);
  score += opt.s;
  // EQ vs IQ scoring
  if (opt.e === "Confidence" || opt.e === "Motivation") {
    EQ += 4;
    IQ += 2;
  } else {
    EQ -= 3;
    IQ += 1;
  }
  updateUI();
  nextQuestion();
}
function updateBackgroundByEmotion(emotion) {
  const dark = document.body.classList.contains("dark");

  if (!dark) {
    if (emotion === "Stress") document.body.style.background = "#ff6b6b";
    else if (emotion === "Confidence") document.body.style.background = "#64b5f6";
    else if (emotion === "Motivation") document.body.style.background = "#81c784";
    else if (emotion === "Guilt") document.body.style.background = "#bdbdbd";
    else document.body.style.background = "#dbeafe"; // Calm
  } else {
    if (emotion === "Stress") document.body.style.background = "#5c1a1a";
    else if (emotion === "Confidence") document.body.style.background = "#0d47a1";
    else if (emotion === "Motivation") document.body.style.background = "#1b5e20";
    else if (emotion === "Guilt") document.body.style.background = "#424242";
    else document.body.style.background = "#121212"; // Calm
  }
}

/* ---------- UI ---------- */
function updateUI() {
  const emotion = emotionStack.at(-1) || "Calm";
  stackText.textContent = `Current Emotion: ${emotion}`;
  updateBackgroundByEmotion(emotion);

  stackContainer.innerHTML = "";
  [...emotionStack].reverse().forEach(e => {
    const div = document.createElement("div");
    div.className = `stack-item ${e}`;
    div.textContent = e;
    stackContainer.appendChild(div);
  });
}


/* ---------- END GAME ---------- */
function endGame() {
  const ending =
    score >= 85 ? "GOOD ENDING 🌟" :
    score >= 60 ? "NEUTRAL ENDING ⚖️" :
    "STRESSFUL ENDING ⚠️";

  const level = difficultySelect.value;

  // Save best score
  saveBestScore(level);
  
  const bestScore = localStorage.getItem("bestScore_" + level);
  const insight = getPsychologyInsight();
  // ✅ NORMALIZED SCORES
  const EQ_Normalized = normalize(EQ, 0, 100);
  const IQ_Normalized = normalize(IQ, 0, 100);
  // ✅ INTERPRETATION
  const EQ_Interpretation = interpretEQ(EQ_Normalized);
  const IQ_Interpretation = interpretIQ(IQ_Normalized);
  situation.innerHTML = `
    <strong>${ending}</strong><br><br>
    Final Score: <b>${score}</b><br>
    Final EQ: <b>${EQ_Normalized}</b> → ${EQ_Interpretation}<br>
    Final IQ: <b>${IQ_Normalized}</b> → ${IQ_Interpretation}<br><br>
    Best Score (${level.toUpperCase()}): <b>${bestScore}</b><br><br>
    <em>${insight}</em>
  `;

  buttons.innerHTML = "";
}


/* ---------- CONTROLS ---------- */
function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
}
function toggleMusic() {
  musicOn = !musicOn;
  musicOn ? music.play() : music.pause();
}
function pauseGame() {
  paused = !paused;
}
function restartGame() {
  location.reload();
}
function exitGame() {
  // Replace body content with message
  document.body.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;">
      <h1>Thanks for Playing 👋</h1>
    </div>
  `;

  // Try to close the tab after 2 seconds
  setTimeout(() => {
    window.close();  // may work if tab was opened via JS
  }, 2000);
}

function getPsychologyInsight() {
  const stress = emotionStack.filter(e => e === "Stress").length;
  const confidence = emotionStack.filter(e => e === "Confidence").length;
  const motivation = emotionStack.filter(e => e === "Motivation").length;
  const guilt = emotionStack.filter(e => e === "Guilt").length;

  if (confidence + motivation > stress + guilt) {
    return "🧠 Insight: You stay emotionally balanced under pressure and make constructive decisions.";
  }

  if (stress > confidence) {
    return "🧠 Insight: You react emotionally under pressure. Mindfulness and planning can help.";
  }

  return "🧠 Insight: You show mixed emotional patterns. Self-awareness is your strongest trait.";
}
function saveBestScore(level) {
  const key = "bestScore_" + level;
  const storedBest = localStorage.getItem(key);

  if (!storedBest || score > parseInt(storedBest)) {
    localStorage.setItem(key, score);
  }
}
function interpretEQ(value) {
  if (value >= 85) return "Emotionally Intelligent Leader";
  if (value >= 70) return "Strong Emotional Awareness";
  if (value >= 50) return "Balanced Emotional Thinker";
  if (value >= 35) return "Needs Emotional Focus";
  return "Struggles with Emotional Understanding";
}

function interpretIQ(value) {
  if (value >= 85) return "Strong Analytical Thinker";
  if (value >= 70) return "Good Problem Solver";
  if (value >= 50) return "Average Logical Skills";
  if (value >= 35) return "Needs Analytical Practice";
  return "Struggles with Logical Reasoning";
}

