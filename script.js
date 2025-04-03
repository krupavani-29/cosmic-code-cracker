// Firebase should already be initialized in game.html
const db = firebase.database();

// Riddle pool (50 riddles)
const riddles = [
    { r: "I’m tall when I’m young, short when I’m old. What am I?", hint: "I burn brightly at celebrations.", a: "candle" },
    { r: "What has keys but can’t open locks?", hint: "I play music with black and white notes.", a: "piano" },
    { r: "What has a neck but no head?", hint: "I hold liquid and you drink from me.", a: "bottle" },
    { r: "What gets wetter the more it dries?", hint: "I’m used after a bath to dry you off.", a: "towel" },
    { r: "What has a shell but isn’t a turtle?", hint: "I’m a breakfast item you might crack open.", a: "egg" },
    { r: "What has a cap but no head?", hint: "I grow in the forest and am a type of fungus.", a: "mushroom" },
    { r: "What runs all around a backyard, yet never moves?", hint: "I’m a boundary you can see.", a: "fence" },
    { r: "What can travel around the world while staying in a corner?", hint: "I’m a postage item.", a: "stamp" },
    { r: "What has hands but can’t clap?", hint: "I tell time.", a: "clock" },
    { r: "What has a head, a tail, is brown, and has no legs?", hint: "I’m currency.", a: "penny" },
    { r: "What can fill a room but takes up no space?", hint: "I’m invisible and essential.", a: "light" },
    { r: "What has cities but no houses, forests but no trees, and rivers but no water?", hint: "I’m a representation.", a: "map" },
    { r: "What has four legs and one arm?", hint: "I’m furniture with a purpose.", a: "chair" },
    { r: "What is so fragile that saying its name breaks it?", hint: "I’m a state of mind.", a: "silence" },
    { r: "What has a bottom at the top?", hint: "I’m worn on your head.", a: "hat" },
    { r: "What has a neck but no head, a body but no legs?", hint: "I’m a bottle type.", a: "shirt" },
    { r: "What can you catch but not throw?", hint: "I’m a common illness.", a: "cold" },
    { r: "What has a heart that doesn’t beat?", hint: "I’m a vegetable.", a: "artichoke" },
    { r: "What has a thumb and four fingers but is not alive?", hint: "I’m worn on your hand.", a: "glove" },
    { r: "What has a face and two hands but no arms or legs?", hint: "I tell time twice a day.", a: "clock" },
    { r: "What can fly without wings?", hint: "I’m a period of time.", a: "time" },
    { r: "What has a bed but never sleeps?", hint: "I’m a body of water.", a: "river" },
    { r: "What has a mouth but never speaks?", hint: "I’m a geographical feature.", a: "river" },
    { r: "What has an eye but cannot see?", hint: "I’m used in sewing.", a: "needle" },
    { r: "What has a head, a tail, is brown, and has no legs?", hint: "I’m money.", a: "coin" },
    { r: "What can you break, even if you never pick it up or touch it?", hint: "I’m a promise.", a: "promise" },
    { r: "What has a foot but no legs?", hint: "I’m a unit of measurement.", a: "ruler" },
    { r: "What has a ring but no finger?", hint: "I’m a tree part.", a: "ring" },
    { r: "What has a tongue but cannot taste?", hint: "I’m footwear.", a: "shoe" },
    { r: "What has a spine but no bones?", hint: "I’m a collection of pages.", a: "book" },
    { r: "What can you hold without ever touching?", hint: "I’m a conversation.", a: "conversation" },
    { r: "What has a head and a tail but no body?", hint: "I’m a coin again.", a: "coin" },
    { r: "What has teeth but cannot eat?", hint: "I’m a tool.", a: "comb" },
    { r: "What has a back but no front?", hint: "I’m furniture.", a: "chair" },
    { r: "What has a neck but no throat?", hint: "I’m clothing.", a: "shirt" },
    { r: "What can you hear but not touch or see?", hint: "I’m a sound.", a: "voice" },
    { r: "What has a face but no eyes?", hint: "I’m a clock face.", a: "clock" },
    { r: "What has a door but no entrance?", hint: "I’m a car part.", a: "car" },
    { r: "What has a lid but no head?", hint: "I’m a container.", a: "jar" },
    { r: "What has a bark but no bite?", hint: "I’m a tree covering.", a: "bark" },
    { r: "What has a stem but no leaves?", hint: "I’m a pipe.", a: "pipe" },
    { r: "What has a crown but no kingdom?", hint: "I’m a tooth.", a: "tooth" },
    { r: "What has a foot on each side?", hint: "I’m a measuring tool.", a: "compass" },
    { r: "What has a hole but holds water?", hint: "I’m a sponge.", a: "sponge" },
    { r: "What has a tongue and a soul but lives in silence?", hint: "I’m a shoe.", a: "shoe" },
    { r: "What has a head, a tail, and a body, but no legs?", hint: "I’m a coin.", a: "coin" },
    { r: "What has a hand but no fingers?", hint: "I’m a clock hand.", a: "clock" },
    { r: "What has a lock but no key?", hint: "I’m a secret.", a: "lock" },
    { r: "What has a face that never smiles?", hint: "I’m a clock face.", a: "clock" },
    { r: "What has a ring but no finger?", hint: "I’m a tree ring.", a: "tree" }
];

// Game state
let currentRiddleIndex = 0;
let startTime;
let rollNumber;
let score = 0;
let timerInterval;

// 20-minute timer in milliseconds (20 * 60 * 1000)
const TIME_LIMIT = 20 * 60 * 1000;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, setting up game");
    document.getElementById("start-screen").style.display = "block";
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById("rollNumber").addEventListener("keypress", function(event) {
        if (event.key === "Enter") startGame();
    });
    document.querySelector("button[onclick='startGame()']").addEventListener("click", startGame);
});

function startGame() {
    rollNumber = document.getElementById("rollNumber").value.trim();
    if (!rollNumber) {
        document.getElementById("feedback").innerText = "Please enter your roll number!";
        console.log("No roll number entered");
        return;
    }

    console.log("Checking if roll number exists:", rollNumber);

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
            db.ref("users/" + rollNumber).set({ participated: true }, error => {
                if (error) console.error("Error marking roll number as participated:", error);
                else console.log("Roll number marked as participated:", rollNumber);
            });

            document.getElementById("start-screen").style.display = "none";
            document.getElementById("quiz").style.display = "block";
            document.getElementById("result").style.display = "none";
            document.getElementById("feedback").innerText = "";
            loadRiddle();
            startTime = Date.now();
            startTimer();
        }
    }, error => {
        console.error("Error checking roll number in database:", error);
        document.getElementById("feedback").innerText = "Error checking roll number. Please try again.";
    });
}

function startTimer() {
    let timeLeft = TIME_LIMIT;
    document.getElementById("timer").innerText = `Time Left: ${Math.floor(timeLeft / 60000)}:${(Math.floor(timeLeft / 1000) % 60).toString().padStart(2, '0')}`;
    timerInterval = setInterval(() => {
        timeLeft -= 1000;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame("Time's up! Your game has ended.");
        } else {
            document.getElementById("timer").innerText = `Time Left: ${Math.floor(timeLeft / 60000)}:${(Math.floor(timeLeft / 1000) % 60).toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function loadRiddle() {
    if (currentRiddleIndex < riddles.length) {
        document.getElementById("riddle").innerText = riddles[currentRiddleIndex].r;
        document.getElementById("hint").innerText = riddles[currentRiddleIndex].hint;
        document.getElementById("feedback").innerText = "";
        document.getElementById("answer").value = "";
    } else {
        endGame("Congratulations! You completed all 8 riddles!");
    }
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim().toLowerCase();
    const correctAnswer = riddles[currentRiddleIndex].a.toLowerCase();

    if (userAnswer === correctAnswer) {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const points = Math.max(100 - timeTaken, 10); // Minimum 10 points
        score += points;

        document.getElementById("a-feedback").innerText = "Congratulations! It's the correct answer!";
        setTimeout(() => {
            currentRiddleIndex++;
            if (currentRiddleIndex < riddles.length) {
                loadRiddle();
                startTime = Date.now(); // Reset timer for next riddle
            } else {
                endGame("Congratulations! You completed all 50 riddles!");
            }
            document.getElementById("a-feedback").innerText = ""; // Clear feedback after moving to next
        }, 2000); // Show congratulations for 2 seconds
    } else {
        document.getElementById("a-feedback").innerText = "Wrong answer! Try again or use the hint.";
    }
}

function endGame(feedbackMessage) {
    clearInterval(timerInterval);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    db.ref("scores/" + rollNumber).set({
        score: score,
        time: totalTime,
        date: new Date().toISOString()
    }, error => {
        if (error) console.error("Error saving score:", error);
        else console.log("Score saved successfully for:", rollNumber);
    });
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "block";
    document.getElementById("score").innerText = score;
    document.getElementById("final-feedback").innerText = feedbackMessage || `Game ended! Your score is ${score} points in ${Math.floor(totalTime / 60)}:${totalTime % 60} minutes.`;
}

function restartGame() {
    currentRiddleIndex = 0;
    score = 0;
    clearInterval(timerInterval);
    document.getElementById("result").style.display = "none";
    document.getElementById("start-screen").style.display = "block";
    document.getElementById("feedback").innerText = "";
    document.getElementById("rollNumber").value = "";
    document.getElementById("timer").innerText = "Time Left: 20:00";
}