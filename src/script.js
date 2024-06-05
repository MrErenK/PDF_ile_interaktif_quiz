let net = 0;
let submitted = false;
let questions = [];
let answers = {};

document.getElementById('questions-button').addEventListener('click', function() {
    document.getElementById('questions-file-input').click();
});

document.getElementById('answers-button').addEventListener('click', function() {
    document.getElementById('answers-file-input').click();
});

document.getElementById('questions-file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = event.target.result;
                questions = JSON.parse(data);
                populateQuestions();
                checkFilesLoaded();
            } catch (e) {
                alert('Invalid questions file format.');
                console.error('Error parsing questions file:', e);
            }
        };
        reader.onerror = function() {
            alert('Error reading questions file.');
            console.error('Error reading file');
        };
        reader.readAsText(file);
    }
});

document.getElementById('answers-file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = event.target.result;
                answers = JSON.parse(data);
                checkFilesLoaded();
            } catch (e) {
                alert('Invalid answers file format.');
                console.error('Error parsing answers file:', e);
            }
        };
        reader.onerror = function() {
            alert('Error reading answers file.');
            console.error('Error reading file');
        };
        reader.readAsText(file);
    }
});

function checkFilesLoaded() {
    const allLoaded = questions.length > 0 && Object.keys(answers).length > 0;
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.disabled = !allLoaded;
    });
    document.getElementById("submit-button").disabled = !allLoaded;

    if (allLoaded) {
        document.getElementById('questions-button').style.display = 'none';
        document.getElementById('answers-button').style.display = 'none';
    }
}

function populateQuestions() {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = ''; // Clear any existing content
    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question';
        questionElement.id = `question-${index}`;
        questionElement.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${question.question}<br><br></p>
            ${question.options.map((option, j) => `
                <label>
                    <input type="radio" name="question${index}" value="${option.option}" disabled onchange="checkAnswerSelected(${index})">
                    ${option.option} ${option.text}
                </label>
            `).join('')}
            <button class='clear-answer-button' style='display: none; margin-top: 10px;' onclick='clearAnswer(${index})'>Clear Answer</button>
            <p class='feedback' id='feedback${index}'></p>
        `;
        questionContainer.appendChild(questionElement);
    });
    checkFilesLoaded();
}

function loadFilesFromDisk() {
    fetch('../questions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Questions file not found');
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            populateQuestions();
            checkFilesLoaded();
        })
        .catch(error => {
            console.error('Questions file not found or invalid:', error);
            // Prompt user to upload files
            document.getElementById('questions-button').style.display = 'inline-block';
            document.getElementById('answers-button').style.display = 'inline-block';
        });

    fetch('../answers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Answers file not found');
            }
            return response.json();
        })
        .then(data => {
            answers = data;
            checkFilesLoaded();
        })
        .catch(error => {
            console.error('Answers file not found or invalid:', error);
            // Prompt user to upload files
            document.getElementById('questions-button').style.display = 'inline-block';
            document.getElementById('answers-button').style.display = 'inline-block';
        });
}

window.onscroll = function() {
    scrollFunction();
};

window.onload = function() {
    scrollFunction();
    loadFilesFromDisk();
};

function checkAnswerSelected(questionIndex) {
    const questionId = `question-${questionIndex}`;
    const selected = document.querySelector(`input[name="question${questionIndex}"]:checked`);
    const clearButton = document.getElementById(questionId).querySelector('.clear-answer-button');
    clearButton.style.display = selected ? 'block' : 'none';

    // Check if any answer is selected, then enable/disable the submit button
    const submitButton = document.getElementById("submit-button");
    const anyAnswerSelected = document.querySelectorAll('input[type="radio"]:checked').length > 0;
    submitButton.disabled = !anyAnswerSelected;
}

function clearAnswer(questionIndex) {
    const questionId = `question-${questionIndex}`;
    const selected = document.querySelector(`input[name="question${questionIndex}"]:checked`);
    if (selected) {
        selected.checked = false;
    }
    checkAnswerSelected(questionIndex); // Call this function to update the clear button's visibility
}

function submitExam() {
    if (!submitted) {
        const submitButton = document.getElementById("submit-button");
        const anyAnswerSelected = document.querySelectorAll('input[type="radio"]:checked').length > 0;

        if (anyAnswerSelected) {
            checkAnswers();
            submitted = true;
            submitButton.textContent = "Restart Exam";
            submitButton.onclick = restartExam;

            const clearButtons = document.querySelectorAll('.clear-answer-button');
            clearButtons.forEach(button => {
                button.disabled = true;
                button.style.display = 'none';
            });
            scrollToBottom();
        } else {
            submitButton.disabled = true;
            alert("Please select an answer before submitting.");
        }
    }
}

function checkAnswers() {
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    for (let i = 0; i < questions.length; i++) {
        let radioButtons = document.getElementsByName(`question${i}`);
        let feedback = document.getElementById(`feedback${i}`);
        let selected = Array.from(radioButtons).find(radio => radio.checked); // Find the selected radio button
        if (selected) {
            let questionNumber = i + 1; // question numbers start from 1
            let correctAnswer = answers[questionNumber.toString()]; // convert question number to string
            // Strip trailing ')' from selected value if it exists
            let selectedValue = selected.value.trim().replace(/\)$/, '');
            if (selectedValue === correctAnswer.trim()) {
                feedback.textContent = 'Correct!';
                feedback.className = 'feedback correct';
                net += 1;
                correctAnswers++;
            } else {
                feedback.textContent = `Incorrect! Correct answer: ${correctAnswer}`;
                feedback.className = 'feedback incorrect';
                net -= 0.25;
                incorrectAnswers++;
            }
            radioButtons.forEach(radio => {
                radio.disabled = true; // Disable each radio button
            });
        }
    }
    document.getElementById("points").textContent = "Correct answers: " + correctAnswers + " |" + " Incorrect answers: " + incorrectAnswers + " |" + " Net: " + net + " points";
}

function scrollFunction() {
    var arrowUp = document.getElementById("scroll-arrow-up");
    var arrowDown = document.getElementById("scroll-arrow-down");
    if (document.body.scrollTop === 0 && document.documentElement.scrollTop === 0) {
        arrowDown.style.display = "block";
        arrowUp.style.display = "none";
        arrowDown.style.right = "20px";
        arrowDown.style.bottom = "20px";
    } else if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        arrowDown.style.display = "none";
        arrowUp.style.display = "block";
        arrowUp.style.right = "20px";
        arrowUp.style.bottom = "20px";
    } else {
        arrowDown.style.display = "block";
        arrowUp.style.display = "block";
        arrowDown.style.right = "20px";
        arrowDown.style.bottom = "20px";
        arrowUp.style.right = "20px";
        arrowUp.style.bottom = "60px";
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

function restartExam() {
    net = 0;
    submitted = false;
    document.getElementById("points").textContent = "";
    document.getElementById("submit-button").textContent = "Submit";
    document.getElementById("submit-button").onclick = submitExam;
    document.getElementById("submit-button").disabled = true;
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
        radio.disabled = false;
    });
    const feedbacks = document.querySelectorAll('.feedback');
    feedbacks.forEach(feedback => {
        feedback.textContent = "";
    });
    const clearButtons = document.querySelectorAll('.clear-answer-button');
    clearButtons.forEach(button => {
        button.disabled = false;
        button.style.display = 'none';
    });
    scrollToTop();
}
