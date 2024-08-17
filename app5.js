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
          answers: [item.answer1, item.answer2, item.answer3, item.answer4].filter(Boolean),
          correct: item.correct // 0-basedインデックスに変換
      }));

      console.log('Processed quiz data:', allQuizData);

      initializeQuiz();
  } catch (error) {
      console.error('データの取得に失敗しました:', error.message);
      alert('クイズデータの取得に失敗しました。ページをリロードしてください。');
  }
}

function initializeQuiz() {
  if (!allQuizData || allQuizData.length === 0) {
      console.error('No quiz data available');
      alert('クイズデータが利用できません。ページをリロードしてください。');
      return;
  }

  const quizSelection = document.getElementById('quiz-selection');
  if (!quizSelection) {
      console.error('Quiz selection element not found');
      return;
  }

  const quizContainer = document.getElementById('quiz-container');
  quizSelection.innerHTML = '<option value="">カテゴリーを選択してください</option>';
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

  // プログレスバーをリセット
  const progressBar = document.getElementById('progress-bar');
  const questionCounter = document.getElementById('question-counter');
  if (progressBar && questionCounter) {
      progressBar.style.width = '0%';
      questionCounter.textContent = '';
  }
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
        <div id="progress-container">
            <div id="progress-bar"></div>
        </div>
        <div id="question-counter"></div>
        <h2 id="question"></h2>
        <div id="answer-buttons"></div>
        <div id="result"></div>
        <div id="explanation"></div>
        <button id="next-question" style="display: none;">次の問題へ</button>
        <div id="final-score" style="display: none;">
            <h2>クイズ終了</h2>
            <p>あなたのスコア: <span id="score"></span> / ${currentQuizQuestions.length}</p>
            <button id="retry-button">もう一度挑戦する</button>
        </div>`;

    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('retry-button').addEventListener('click', () => {
        initializeQuiz();
    });
}

function displayQuestion() {
  // 結果と解説をリセット
  const resultElement = document.getElementById('result');
  const explanationElement = document.getElementById('explanation');
  if (resultElement) resultElement.style.display = 'none';
  if (explanationElement) explanationElement.style.display = 'none';

  // 「次の問題へ」ボタンを非表示にする
  const nextButton = document.getElementById('next-question');
  if (nextButton) {
      nextButton.style.display = 'none';
  }

  const question = currentQuizQuestions[currentQuestionIndex];
  const questionElement = document.getElementById('question');
  const answerButtonsElement = document.getElementById('answer-buttons');

  if (questionElement) questionElement.textContent = question.question;
  if (answerButtonsElement) {
      answerButtonsElement.innerHTML = '';
      question.answers.forEach((answer, index) => {
          const button = document.createElement('button');
          button.textContent = answer;
          button.classList.add('answer-button');
          button.addEventListener('click', () => selectAnswer(index));
          answerButtonsElement.appendChild(button);
      });
  }

  updateProgressBar();

  // 問題表示時にページ上部にスクロール
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 回答ボタンの背景色をリセット
  const answerButtons = document.querySelectorAll('.answer-button');
  answerButtons.forEach(button => {
      button.style.backgroundColor = '';
      button.disabled = false;
  });
}

function displayResult(isCorrect, explanation) {
  const resultElement = document.getElementById('result');
  const explanationElement = document.getElementById('explanation');
  
  if (resultElement) {
      resultElement.textContent = isCorrect ? '正解！' : '不正解';
      resultElement.className = isCorrect ? 'correct' : 'incorrect';
      resultElement.style.display = 'block';
  }
  
  if (explanationElement) {
      explanationElement.textContent = explanation;
      explanationElement.style.display = 'block';
  }

  // 結果表示後に「次の問題へ」ボタンまでスクロール
  setTimeout(() => {
      const nextButton = document.getElementById('next-question');
      if (nextButton) {
          nextButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, 100);
}

function selectAnswer(selectedIndex) {
  const currentQuestion = currentQuizQuestions[currentQuestionIndex];
  const correctAnswerIndex = currentQuestion.correct;
  const isCorrect = selectedIndex === correctAnswerIndex;

  if (isCorrect) {
      score++;
  }

  console.log('Selected index:', selectedIndex);
  console.log('Correct answer index:', correctAnswerIndex);
  console.log('Correct answer:', currentQuestion.answers[correctAnswerIndex]);

  const resultElement = document.getElementById('result');
  const explanationElement = document.getElementById('explanation');
  const nextButton = document.getElementById('next-question');

  if (isCorrect) {
      resultElement.textContent = '正解！';
      resultElement.className = 'correct';
  } else {
      resultElement.textContent = `不正解。正解は${currentQuestion.answers[correctAnswerIndex]}でした。`;
      resultElement.className = 'incorrect';
  }

  explanationElement.textContent = currentQuestion.explanation || '説明はありません。';

  resultElement.style.display = 'block';
  explanationElement.style.display = 'block';
  nextButton.style.display = 'block';

  const answerButtons = document.querySelectorAll('.answer-button');
  answerButtons.forEach((button, index) => {
      button.disabled = true;
      if (index === correctAnswerIndex) {
          button.style.backgroundColor = 'green';
      } else if (index === selectedIndex) {
          button.style.backgroundColor = 'red';
      }
  });

  // 結果表示後に「次の問題へ」ボタンまでスクロール
  setTimeout(() => {
      if (nextButton) {
          nextButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, 100);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuizQuestions.length) {
        displayQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    const finalScoreElement = document.getElementById('final-score');
    const scoreElement = document.getElementById('score');

    quizContainer.querySelector('#question').style.display = 'none';
    quizContainer.querySelector('#answer-buttons').style.display = 'none';
    quizContainer.querySelector('#result').style.display = 'none';
    quizContainer.querySelector('#explanation').style.display = 'none';
    quizContainer.querySelector('#next-question').style.display = 'none';

    finalScoreElement.style.display = 'block';
    scoreElement.textContent = score;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  const questionCounter = document.getElementById('question-counter');
  if (progressBar && questionCounter) {
      const progress = ((currentQuestionIndex + 1) / currentQuizQuestions.length) * 100;
      progressBar.style.width = `${progress}%`;
      questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuizQuestions.length}`;
  }
}