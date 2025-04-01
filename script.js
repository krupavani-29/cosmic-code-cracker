// Firebase configuration (replace with your own after setup)
const firebaseConfig = {
    apiKey: "AIzaSyCgA2l3hd79x0if8WRjFY3ciMoJ9XFavjo",
    authDomain: "brainlockbreaker.firebaseapp.com",
    databaseURL: "https://brainlockbreaker-default-rtdb.firebaseio.com",
    projectId: "brainlockbreaker",
    storageBucket: "brainlockbreaker.firebasestorage.app",
    messagingSenderId: "78096786370",
    appId: "1:78096786370:web:1a5b8e69576bbc5b136c5b",
    measurementId: "G-R3RZKPCN1C"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Question pool (riddles with answers)
const questions = [
    { q: "I’m tall when I’m young, short when I’m old. What am I?", a: "candle" },
    { q: "What has keys but can’t open locks?", a: "piano" },
    { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "m" },
    { q: "The more you take, the more you leave behind. What am I?", a: "footsteps" },
    { q: "What has a head, a tail, but no body?", a: "coin" },
    { q: "I speak without a mouth and hear without ears. What am I?", a: "echo" },
    { q: "What can travel the world while staying in a corner?", a: "stamp" },
    { q: "What has one eye but can’t see?", a: "needle" },
    { q: "What gets wetter the more it dries?", a: "towel" },
    { q: "What has a neck but no head?", a: "bottle" }
];

let username = "";
let currentQuestion = 0;
let score = 0;
let startTime;
let usedQuestions = [];
let currentPassword = "start"; // Initial password

// Start the game
function startGame() {
    username = document.getElementById("username").value.trim();
    if (!username) return alert("Enter a username!");
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("quiz").style.display = "block";
    currentQuestion = 0;
    score = 0;
    usedQuestions = [];
    currentPassword = "start";
    startTime = Date.now();
    loadQuestion();
}

// Load a random question
function loadQuestion() {
    if (currentQuestion >= 5) {
        endGame();
        return;
    }
    let availableQuestions = questions.filter(q => !usedQuestions.includes(q));
    if (availableQuestions.length === 0) availableQuestions = questions; // Reset if all used
    const q = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    usedQuestions.push(q);
    document.getElementById("question").innerText = q.q;
    document.getElementById("password-hint").innerText = currentPassword;
    document.getElementById("answer").value = "";
    document.getElementById("feedback").innerText = "";
}

// Check answer and unlock next
function checkAnswer() {
    const input = document.getElementById("answer").value.trim().toLowerCase();
    const q = usedQuestions[currentQuestion];
    if (input === currentPassword) {
        document.getElementById("feedback").innerText = "Correct password! Now solve this:";
        currentPassword = q.a; // Answer becomes next password
        score += Math.max(100 - Math.floor((Date.now() - startTime) / 1000), 10); // 100 max, -1 per second
        currentQuestion++;
        startTime = Date.now(); // Reset time for next question
        loadQuestion();
    } else {
        document.getElementById("feedback").innerText = "Wrong password! Try again.";
    }
}

// End the game
function endGame() {
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "block";
    document.getElementById("score").innerText = score;
    saveScore();
}

// Save score to Firebase (update if higher)
function saveScore() {
    db.ref("scores/" + username).once("value", snapshot => {
        const existingScore = snapshot.val() ? snapshot.val().score : 0;
        if (score > existingScore) {
            db.ref("scores/" + username).set({
                score: score,
                date: new Date().toISOString()
            });
        }
    });
}

// Show leaderboard
function showLeaderboard() {
    document.getElementById("result").style.display = "none";
    document.getElementById("leaderboard").style.display = "block";
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = "";
    db.ref("scores").orderByChild("score").limitToLast(10).once("value", snapshot => {
        const scores = [];
        snapshot.forEach(child => {
            scores.push({ name: child.key, ...child.val() });
        });
        scores.reverse().forEach(s => {
            const li = document.createElement("li");
            li.innerText = `${s.name}: ${s.score} points (${s.date.split("T")[0]})`;
            leaderboardList.appendChild(li);
        });
    });
}

// Restart or go back
function restartGame() {
    document.getElementById("result").style.display = "none";
    startGame();
}

function backToStart() {
    document.getElementById("leaderboard").style.display = "none";
    document.getElementById("start-screen").style.display = "block";
}