var supabaseClient;
var allQuizData = [];
var currentQuizQuestions = [];
var currentQuestionIndex = 0;
var score = 0;
var selectedDatabase = '';

document.addEventListener('DOMContentLoaded', async() => {
  if (typeof supabase === 'undefined') {
      console.error('Supabase library not loaded');
      return;
  }

  const supabaseUrl = 'https://fstynltdfdetpyvbrswr.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8';
  supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized:', supabaseClient); // デバッグ情報

  // ここに認証関連の初期化コードを追加
  initializeAuth();

  const databaseSelect = document.getElementById('database-select');
  databaseSelect.addEventListener('change', (e) => {
  selectedDatabase = e.target.value;
  console.log('Selected database:', selectedDatabase); // デバッグ情報

    if (selectedDatabase) {
      fetchQuizData(selectedDatabase);
    }
  });
});

async function fetchQuizData(database) {
  try {
    console.log(`Fetching quiz data from ${database}...`);
    console.log('Supabase client:', supabaseClient); // デバッグ情報

    const { data, error } = await supabaseClient
      .from(database)// 'database'ではなく、選択されたデータベース名を使用
      .select('*');
      console.log('Raw response:', { data, error }); // デバッグ情報

    if (error) throw error;
      if (!data || data.length === 0) {
          console.log(`No data found in ${database} table`);
          return;
      }

      allQuizData = data.map(item => ({
          ...item,
          answers: [item.answer1, item.answer2, item.answer3, item.answer4].filter(Boolean),
          correct: database === 'financial_questions' ? item.correct - 1 : item.correct // 0-basedインデックスに変換
      }));

      console.log('Processed quiz data:', allQuizData);

      initializeQuiz();

    } catch (error) {
      console.error('エラーが発生しました:', error);
      alert(`クイズデータの取得に失敗しました: ${error.message}\nページをリロードしてください。`);
    }
}

function initializeQuiz() {
  if (!allQuizData || allQuizData.length === 0) {
      console.error('No quiz data available');
      alert('クイズデータが利用できません。ページをリロードしてください。');
      return;
  }

  const categorySelection = document.getElementById('category-selection');
  const categorySelect = document.getElementById('category-select');
  const quizContainer = document.getElementById('quiz-container');

  if (!categorySelection || !categorySelect || !quizContainer) {
    console.error('Required elements not found');
    return;
  }

  // カテゴリーの重複を除去してソート
  const categories = [...new Set(allQuizData.map(quiz => quiz.category))].sort();

  // カテゴリー選択オプションをクリアして再構築
  categorySelect.innerHTML = '<option value="">選択してください</option>';
  categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
  });

  console.log('Quiz categories:', categories);

  // カテゴリー選択を表示し、クイズコンテナを非表示に
  categorySelection.style.display = 'block';
  quizContainer.style.display = 'none';

  // カテゴリー選択イベントリスナー
  categorySelect.addEventListener('change', (e) => {
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
  const categorySelection = document.getElementById('category-selection');
  
  if (quizContainer && categorySelection) {
    quizContainer.style.display = 'block';
    categorySelection.style.display = 'none';
    createQuizElements();
    displayQuestion();
  } else {
    console.error('Quiz container or category selection element not found');
    if (!quizContainer) console.error('quiz-container not found');
    if (!categorySelection) console.error('category-selection not found');
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

  // 問題表示部分へのスクロール
  const quizContainer = document.getElementById('quiz-container');
  if (quizContainer) {
    quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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

function initializeAuth() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const logoutButton = document.getElementById('logout-button');
  const toggleAuthFormButton = document.getElementById('toggle-auth-form');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  if (toggleAuthFormButton) {
    toggleAuthFormButton.addEventListener('click', toggleAuthForm);
  }

  checkAuthState();
}
  
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;
    console.log('ログイン成功:', data);
    // ログイン後の処理（例：UIの更新）
    updateUIAfterLogin();
  } catch (error) {
    console.error('ログインエラー:', error.message);
    alert('ログインに失敗しました: ' + error.message);
  }
}

// フォーム切り替え機能を追加
function toggleAuthForm() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
}

async function handleLogout() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    console.log('ログアウト成功');
    // ログアウト後の処理（例：UIの更新）
    updateUIAfterLogout();
  } catch (error) {
    console.error('ログアウトエラー:', error.message);
    alert('ログアウトに失敗しました: ' + error.message);
  }
}
  
async function checkAuthState() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    updateUIAfterLogin();
  } else {
    updateUIAfterLogout();
  }
}

// ユーザー登録処理を追加
async function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

    if (error) throw error;
    console.log('ユーザー登録成功:', data);
    alert('登録確認メールを送信しました。メールを確認してアカウントを有効化してください。');
    // ここでUIを更新するなどの処理を行う
  } catch (error) {
    console.error('ユーザー登録エラー:', error.message);
    alert('ユーザー登録に失敗しました: ' + error.message);
  }
}

// updateUIAfterLogout 関数を更新
function updateUIAfterLogout() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('logout-button').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('toggle-auth-form').style.display = 'block';
}
  
function updateUIAfterLogout() {
  // ログアウト後のUI更新（例：ログインフォームを表示し、ログアウトボタンを非表示）
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('logout-button').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'none';
}