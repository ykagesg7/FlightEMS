var supabaseClient;
var allQuizData = [];
var currentQuizQuestions = [];
var currentQuestionIndex = 0;
var score = 0;

document.addEventListener('DOMContentLoaded', async() => {
  if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded');
    return;
  }
  const supabaseUrl = 'https://fstynltdfdetpyvbrswr.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8';
  supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  
  try {
    await fetchQuizData();
  } catch (error) {
    console.error('クイズデータの初期化に失敗しました:', error);
    alert('クイズの準備に問題が発生しました。ページをリロードしてください。');
  }
});

async function fetchQuizData() {
  try {
    console.log('Fetching quiz data...');
    const { data, error } = await supabaseClient
      .from('quiz_questions')
      .select('*');
    
    console.log('Raw response:', { data, error });

    if (error) throw error;
    if (!data || data.length === 0) {
      console.log('No data found in quiz_questions table');
      return;
    }
    
    allQuizData = data.map(item => ({
      ...item,
      answers: [item.answer1, item.answer2, item.answer3, item.answer4].filter(Boolean)
    }));

    console.log('Processed quiz data:', allQuizData);
    initializeQuiz();
  } catch (error) {
    console.error('データの取得に失敗しました:', error.message);
    alert('クイズデータの取得に失敗しました。ページをリロードしてください。');
  }
}

function initializeQuiz() {
  const quizSelection = document.getElementById('quiz-selection');
  if(!quizSelection){
    console.error('Quiz selection element not found');
    return;
  }

  const quizContainer = document.getElementById('quiz-container');
  quizSelection.innerHTML = '<option value="">問題セットを選択してください</option>';
  const categories = [...new Set(allQuizData.map(quiz => quiz.category))].sort();
  categories.forEach(category => {
      quizSelection.innerHTML += `<option value="${category}">${category}</option>`;
  });
  console.log('Quiz categories:', categories);
  quizContainer.style.display = 'none';
  quizSelection.style.display = 'block';
  quizSelection.addEventListener('change', (e) => {
      console.log('Selection changed:', e.target.value);
      if (e.target.value !== "") {
          startQuiz(e.target.value);
      }
  });
}

function startQuiz(category) {
  console.log('Starting quiz for category:', category);
  
  currentQuizQuestions = allQuizData.filter(quiz => quiz.category === category);
  currentQuizQuestions = shuffleArray(currentQuizQuestions).slice(0, 10);
  currentQuestionIndex = 0;
  score = 0;

  const quizContainer = document.getElementById('quiz-container');
  const quizSelection = document.getElementById('quiz-selection');

  if (quizContainer && quizSelection) {
      quizContainer.style.display = 'block';
      quizSelection.style.display = 'none';
      createQuizElements();
      displayQuestion();
  } else {
      console.error('Quiz container or selection element not found');
  }
}

function createQuizElements() {
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = `
    <h2 id="question"></h2>
    <div id="answer-buttons"></div>
    <p id="result" style="display: none;"></p>
    <p id="explanation" style="display: none;"></p>
    <button id="next-button" style="display: none;" onclick="nextQuestion()">次の問題</button>
  `;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function displayQuestion() {
  console.log('Displaying question:', currentQuestionIndex + 1);
  console.log('Current question:', currentQuizQuestions[currentQuestionIndex]);

  const questionElement = document.getElementById('question');
  const answerButtons = document.getElementById('answer-buttons');
  const nextButton = document.getElementById('next-button');

  if (!questionElement || !answerButtons || !nextButton) {
      console.error('Required elements not found');
      return;
  }

  const question = currentQuizQuestions[currentQuestionIndex];
  if (!question) {
    console.error('Question not found for index:', currentQuestionIndex);
    return;
  }
  
  questionElement.textContent = question.question;
  answerButtons.innerHTML = '';
  if (!question.answers || !Array.isArray(question.answers)) {
    console.error('Answers not found or not an array:', question);
    return;
  }  

  question.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.textContent = answer;
      button.classList.add('btn');
      button.addEventListener('click', () => selectAnswer(index));
      answerButtons.appendChild(button);
  });

  nextButton.style.display = 'none';
}

function selectAnswer(answerIndex) {
  const question = currentQuizQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll('#answer-buttons button');
  buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === question.correct) {
          button.classList.add('correct');
      } else if (index === answerIndex) {
          button.classList.add('incorrect');
      }
  });

  const isCorrect = answerIndex === question.correct;
  if (isCorrect) {
      score++;
  }

  const resultElement = document.getElementById('result');
  if (resultElement) {
      resultElement.textContent = isCorrect ? '正解！' : '不正解...';
      resultElement.className = isCorrect ? 'correct' : 'incorrect';
      resultElement.style.display = 'block';
  }

  const explanationElement = document.getElementById('explanation');
  if (explanationElement) {
      explanationElement.textContent = question.explanation;
      explanationElement.style.display = 'block';
  }

  const nextButton = document.getElementById('next-button');
  if (nextButton) {
      nextButton.style.display = 'block';
  }
}

function clearPreviousQuestionInfo() {
  const resultElement = document.getElementById('result');
  const explanationElement = document.getElementById('explanation');
  
  if (resultElement) {
    resultElement.textContent = '';
    resultElement.className = '';
    resultElement.style.display = 'none';
  }
  
  if (explanationElement) {
    explanationElement.textContent = '';
    explanationElement.style.display = 'none';
  }
  
  const buttons = document.querySelectorAll('#answer-buttons button');
  buttons.forEach(button => {
    button.classList.remove('correct', 'incorrect');
    button.disabled = false;
  });
}

function nextQuestion() {
  clearPreviousQuestionInfo();
  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuizQuestions.length) {
    displayQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = `
    <h2>クイズ終了</h2>
    <p>あなたのスコア: ${score} / ${currentQuizQuestions.length}</p>
    <button id="retry-button">再挑戦</button>
  `;
  document.getElementById('retry-button').addEventListener('click', () => {
    initializeQuiz();
  });
}