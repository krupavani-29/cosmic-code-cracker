// Replace this placeholder with your actual Firebase configuration
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
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

const db = firebase.database();

// Riddle pool (6 riddles for now, can expand to 50)
const riddles = [
    { r: "I’m tall when I’m young, short when I’m old. What am I?", hint: "I burn brightly at celebrations.", a: "candle" },
    { r: "What has keys but can’t open locks?", hint: "I play music with black and white notes.", a: "piano" },
    { r: "What has a neck but no head?", hint: "I hold liquid and you drink from me.", a: "bottle" },
    { r: "What gets wetter the more it dries?", hint: "I’m used after a bath to dry you off.", a: "towel" },
    { r: "What has a shell but isn’t a turtle?", hint: "I’m a breakfast item you might crack open.", a: "egg" },
    { r: "What has a cap but no head?", hint: "I grow in the forest and am a type of fungus.", a: "mushroom" }
];

// Game state
let currentRiddleIndex = 0;
let startTime;
let rollNumber;
let score = 0;

function startGame() {
    rollNumber = document.getElementById("rollNumber").value.trim();
    if (!rollNumber) {
        document.getElementById("feedback").innerText = "Please enter your roll number!";
        return;
    }

    console.log("Checking if roll number exists:", rollNumber);

    // Check if roll number already participated
    db.ref("users/" + rollNumber).once("value", snapshot => {
        console.log("Snapshot exists:", snapshot.exists());
        console.log("Snapshot data:", snapshot.val());

        if (snapshot.exists()) {
            console.log("Roll number already participated:", rollNumber);
            document.getElementById("feedback").innerText = "This roll number has already participated!";
            document.getElementById("start-screen").style.display = "block";
            document.getElementById("quiz").style.display = "none";
            document.getElementById("result").style.display = "none";
        } else {
            console.log("New roll number, starting game for:", rollNumber);
            // Mark the roll number as participated
            db.ref("users/" + rollNumber).set({ participated: true }, error => {
                if (error) {
                    console.error("Error marking roll number as participated:", error);
                } else {
                    console.log("Roll number marked as participated:", rollNumber);
                }
            });

            // Start the game
            document.getElementById("start-screen").style.display = "none";
            document.getElementById("quiz").style.display = "block";
            document.getElementById("result").style.display = "none";
            document.getElementById("feedback").innerText = ""; // Clear feedback
            loadRiddle();
            startTime = Date.now();
        }
    }, error => {
        console.error("Error checking roll number in database:", error);
        document.getElementById("feedback").innerText = "Error checking roll number. Please try again.";
    });
}

function loadRiddle() {
    if (currentRiddleIndex < riddles.length) {
        document.getElementById("riddle").innerText = riddles[currentRiddleIndex].r;
        document.getElementById("hint").innerText = riddles[currentRiddleIndex].hint;
        document.getElementById("feedback").innerText = "";
        document.getElementById("answer").value = "";
    } else {
        endGame();
    }
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim().toLowerCase();
    const correctAnswer = riddles[currentRiddleIndex].a.toLowerCase();

    if (userAnswer === correctAnswer) {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const points = Math.max(100 - timeTaken, 10); // Minimum 10 points
        score += points;

        document.getElementById("feedback").innerText = "Congratulations! It's the correct answer!";
        setTimeout(() => {
            currentRiddleIndex++;
            if (currentRiddleIndex < riddles.length) {
                loadRiddle();
                startTime = Date.now(); // Reset timer for next riddle
            } else {
                endGame();
            }
            document.getElementById("feedback").innerText = ""; // Clear feedback after moving to next
        }, 2000); // Show congratulations for 2 seconds
    } else {
        document.getElementById("feedback").innerText = "Wrong answer! Try again or use the hint.";
    }
}

function endGame() {
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    db.ref("scores/" + rollNumber).set({
        score: score,
        time: totalTime,
        date: new Date().toISOString()
    }, error => {
        if (error) {
            console.error("Error saving score:", error);
        } else {
            console.log("Score saved successfully for:", rollNumber);
        }
    });
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "block";
    document.getElementById("score").innerText = score;
}

function restartGame() {
    currentRiddleIndex = 0;
    score = 0;
    document.getElementById("result").style.display = "none";
    document.getElementById("start-screen").style.display = "block";
    document.getElementById("feedback").innerText = "";
    document.getElementById("rollNumber").value = "";
}

// Ensure game starts with start screen visible
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start-screen").style.display = "block";
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "none";
});