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
  console.log('Supabase client initialized:', supabaseClient);

  initializeThemeToggle();
  initializeAuth();

  const databaseSelect = document.getElementById('database-select');
  
  databaseSelect.addEventListener('change', async (e) => {
      selectedDatabase = e.target.value;
      console.log('Selected database:', selectedDatabase);

    if (selectedDatabase) {
      try {
        await fetchQuizData(selectedDatabase);
        const categories = await fetchCategories(selectedDatabase);
        populateCategorySelect(categories);

        console.log('Category selection element:'),
        // カテゴリ選択要素を表示
        document.getElementById('category-selection');
        
        console.log('Category select element:',document.getElementById('category-select'));
        document.getElementById('category-selection').style.display = 'block'; // 明示的に表示
        initializeQuiz();
      } catch (error) {
        console.error('エラーが発生しました:', error);
        alert('データの取得中にエラーが発生しました。ページをリロードして再試行してください。');
      }
    } else {
      document.getElementById('category-selection').style.display = 'none'; // 非表示
    }
  });

    // カテゴリ選択イベントの追加
    const categorySelect = document.getElementById('category-select');
    categorySelect.addEventListener('change', (e) => {
      const selectedCategory = e.target.value;
      console.log('Selected category:', selectedCategory);
      if (selectedCategory) {
        startQuiz(selectedCategory);
      }
    });
});

async function fetchQuizData(database) {
  try {
      console.log(`Fetching quiz data from ${database}...`);
      const { data, error } = await supabaseClient
          .from(database)
          .select('*');

      if (error) throw error;
      if (!data || data.length === 0) {
          console.log(`No data found in ${database} table`);
          alert('クイズデータが見つかりませんでした。別のデータベースを選択してください。');
          return;
      }

      allQuizData = data.map(item => ({
          ...item,
          answers: [item.answer1, item.answer2, item.answer3, item.answer4].filter(Boolean),
          correct: database === 'financial_questions' ? item.correct - 1 : item.correct
      }));

      console.log('Processed quiz data:', allQuizData);
      currentQuizQuestions = shuffleArray(allQuizData).slice(0, 10);
      currentQuestionIndex = 0;
      score = 0;

  } catch (error) {
      console.error('エラーが発生しました:', error);
      alert(`クイズデータの取得に失敗しました: ${error.message}\nページをリロードしてください。`);
  }
}

async function fetchCategories(database) {
  try {
    const { data, error } = await supabaseClient
      .from(database)
      .select('category')
      .order('category');

    if (error) throw error;

    // 重複を除去
    const uniqueCategories = [...new Set(data.map(item => item.category))];
    console.log('Fetched categories:', uniqueCategories); // デバッグ用ログ
    return uniqueCategories;
  } catch (error) {
    console.error('カテゴリの取得に失敗しました:', error);
    throw error;
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
    updateUIAfterLogin();

  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    if (error.message.includes('Email rate limit exceeded')){
      alert('短時間に多くの登録リクエストがありました。しばらく待ってから再度お試しください。');
      handleSignupRateLimit();
    }else{
      alert('ユーザー登録に失敗しました:'+error.message);
    }
  }
}

let signupAttempts = 0;
const MAX_ATTEMPTS = 3;
const COOLDOWN_TIME = 300000; // 5分（ミリ秒）

function checkAnswer(selectedIndex) {
  const question = currentQuizQuestions[currentQuestionIndex];
  const isCorrect = selectedIndex === question.correct;
  const feedbackElement = document.getElementById('feedback');
  const explanationElement = document.getElementById('explanation');
  const nextButton = document.getElementById('next-button');

  updateProgressBar(currentQuestionIndex + 1, currentQuizQuestions.length);

  if (feedbackElement) {
      feedbackElement.textContent = isCorrect ? '正解！' : '不正解...';
      feedbackElement.className = isCorrect ? 'correct' : 'incorrect';
      feedbackElement.style.display = 'block';
  }

  if (explanationElement) {
    let explanationText = '';
    if (!isCorrect && question.answers && question.correct !== undefined) {
      explanationText += `正解は「${question.answers[question.correct]}」です。\n`;
    }
    explanationText += question.explanation || '解説はありません。';
    explanationElement.textContent = explanationText;
    explanationElement.style.display = 'block';
  }

  if (nextButton) {
      nextButton.style.display = 'block';
      nextButton.addEventListener('click', showNextQuestion);
  }

  if (isCorrect) score++;

  // 次へボタンにスクロール
  if (nextButton) {
      nextButton.scrollIntoView({ behavior: 'smooth' });
  }
}

function displayQuestion() {
  const currentQuestion = currentQuizQuestions[currentQuestionIndex];
  const quizContainer = document.getElementById('quiz-container');
  if (!quizContainer) {
      console.error('Quiz container not found');
      return;
  }

  quizContainer.innerHTML = `
      <div id="progress-container">
          <div id="progress-bar"></div>
      </div>
      <div id="question-counter"></div>
      <h2>${currentQuestion.question}</h2>
      <div id="answers">
          ${currentQuestion.answers.map((answer, index) => `
              <button onclick="checkAnswer(${index})">${answer}</button>
          `).join('')}
      </div>
      <div id="feedback" style="display: none;"></div>
      <div id="explanation" style="display: none;"></div>
      <button id="next-button" style="display: none;">次の問題</button>
  `;

  updateProgressBar(currentQuestionIndex + 1, currentQuizQuestions.length);

  // 問題表示後、quiz-containerまでスクロール
  quizContainer.scrollIntoView({ behavior: 'smooth' });
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

function handleSignupRateLimit() {
  signupAttempts++;
  if (signupAttempts >= MAX_ATTEMPTS) {
    const signupButton = document.querySelector('#signup-form button[type="submit"]');
    signupButton.disabled = true;
    let remainingTime = COOLDOWN_TIME / 1000;
    
    const updateButton = () => {
      signupButton.textContent = `再試行まで ${remainingTime} 秒`;
      remainingTime--;
      if (remainingTime < 0) {
        signupButton.disabled = false;
        signupButton.textContent = '登録';
        signupAttempts = 0;
      } else {
        setTimeout(updateButton, 1000);
      }
    };
    
    updateButton();
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

// テーマ切り替え機能
function initializeThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  function setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
  }

  function getTheme() {
      return localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
  }

  // 初期テーマの設定
  setTheme(getTheme());

  themeToggle.addEventListener('click', () => {
      const currentTheme = getTheme();
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
  });

  // システムのテーマ変更を検知
  prefersDarkScheme.addListener((e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
  });
}

function initializeQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  shuffleArray(currentQuizQuestions);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuizQuestions.length) {
    displayQuestion();
    // 問題表示エリアにスクロール
    document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth' });
  } else {
    finishQuiz();
  }
}

function populateCategorySelect(categories) {
  const categorySelect = document.getElementById('category-select');
  console.log('Populating category select:', categories); // デバッグ用ログ
  categorySelect.innerHTML = '<option value="">選択してください</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
  console.log('Category select populated'); // デバッグ用ログ
}

function restartQuiz() {
  initializeQuiz();
  displayQuestion();
}

function startQuiz(category) {
  currentQuizQuestions = allQuizData.filter(q => q.category === category);
  currentQuizQuestions = shuffleArray(currentQuizQuestions).slice(0, 10);
  currentQuestionIndex = 0;
  score = 0;
  
  // データベース選択とカテゴリ選択を非表示にする
  document.getElementById('database-selection').style.display = 'none';
  document.getElementById('category-selection').style.display = 'none';
  
  // クイズコンテナを表示する
  document.getElementById('quiz-container').style.display = 'block';
  
  displayQuestion();
}

function selectAnswer(selectedIndex) {
  const currentQuestion = currentQuizQuestions[currentQuestionIndex];
  const correctAnswerIndex = currentQuestion.correct;
  const isCorrect = selectedIndex === correctAnswerIndex;

  if (isCorrect) {
    score++;
  }

  // 結果表示用の要素を作成
  let resultElement = document.getElementById('result');
  if (!resultElement) {
    resultElement = document.createElement('div');
    resultElement.id = 'result';
    document.getElementById('quiz-container').appendChild(resultElement);
  }

  // 説明表示用の要素を作成
  let explanationElement = document.getElementById('explanation');
  if (!explanationElement) {
    explanationElement = document.createElement('div');
    explanationElement.id = 'explanation';
    document.getElementById('quiz-container').appendChild(explanationElement);
  }

  // 次へボタンを作成
  let nextButton = document.getElementById('next-button');
  if (!nextButton) {
    nextButton = document.createElement('button');
    nextButton.id = 'next-button';
    nextButton.textContent = '次の問題';
    document.getElementById('quiz-container').appendChild(nextButton);
  }

  // 結果を表示
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

  // 選択肢を無効化
  const answerButtons = document.querySelectorAll('.answer-button');
  answerButtons.forEach((button, index) => {
    button.disabled = true;
    if (index === correctAnswerIndex) {
      button.style.backgroundColor = 'green';
    } else if (index === selectedIndex) {
      button.style.backgroundColor = 'red';
    }
  });

  // 次へボタンにイベントリスナーを追加
  nextButton.onclick = nextQuestion;

  // 次へボタンまでスクロール
  nextButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showQuestion(question) {
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = `
    <h2>${question.question}</h2>
    <div id="answer-buttons"></div>
    <div id="feedback" class="hidden"></div>
    <div id="explanation" class="hidden"></div>
    <button id="next-button" class="hidden">次の問題</button>
  `;

  const answerButtons = document.getElementById('answer-buttons');
  question.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.innerText = answer;
    button.classList.add('answer-button');
    button.addEventListener('click', () => checkAnswer(index));
    answerButtons.appendChild(button);
  });
}

function showNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuizQuestions.length) {
      displayQuestion();

      const quizContainer = document.getElementById('quiz-container');
    if (quizContainer) {
      quizContainer.scrollIntoView({ behavior: 'smooth' });
    }

  } else {
      showResult();
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showFeedback(isCorrect, explanation) {
  const feedbackElement = document.getElementById('feedback');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackText = document.getElementById('feedback-text');
  const explanationElement = document.getElementById('explanation');

  if (feedbackElement && feedbackIcon && feedbackText && explanationElement) {
    feedbackElement.className = isCorrect ? 'correct fade-in' : 'incorrect fade-in';
    feedbackIcon.className = isCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle';
    feedbackText.textContent = isCorrect ? '正解！' : '不正解';
    
    explanationElement.textContent = explanation || '説明はありません。';
    explanationElement.className = 'fade-in';

    feedbackElement.classList.remove('hidden');
    explanationElement.classList.remove('hidden');
  } else {
    console.warn('Feedback elements not found');
  }
}

function showResult() {
  const quizContainer = document.getElementById('quiz-container');

  quizContainer.innerHTML = `
    <h2>クイズ終了</h2>
    <p>あなたのスコア: ${score} / ${currentQuizQuestions.length}</p>
    <button id="restart-button">もう一度挑戦する</button>
  `;

  document.getElementById('restart-button').addEventListener('click', () => {
    // データベース選択画面を表示
    document.getElementById('database-selection').style.display = 'block';
    // カテゴリ選択と問題表示を非表示に
    document.getElementById('category-selection').style.display = 'none';

    document.getElementById('quiz-container').style.display = 'none';
    // 選択されたデータベースをリセット
    selectedDatabase = '';
    // データベース選択のセレクトボックスをリセット
    document.getElementById('database-select').value = '';
  });
}

// エラーハンドリングの改善
function safelySetDisplay(elementId, displayValue) {
  const element = document.getElementById(elementId);
  if (element) {
      element.style.display = displayValue;
  } else {
      console.warn(`Element with id '${elementId}' not found`);
  }
}

// フォーム切り替え機能を追加
function toggleAuthForm() {
  safelySetDisplay('login-form', document.getElementById('login-form').style.display === 'none' ? 'block' : 'none');
  safelySetDisplay('signup-form', document.getElementById('signup-form').style.display === 'none' ? 'block' : 'none');
}

function updateProgressBar(currentQuestion, totalQuestions) {
  const progressBar = document.getElementById('progress-bar');
  const questionCounter = document.getElementById('question-counter');
  if (progressBar && questionCounter) {
    const progress = (currentQuestion / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
    questionCounter.textContent = `質問 ${currentQuestion} / ${totalQuestions}`;
  }
}

function updateUIAfterLogin() {
  document.body.classList.add('logged-in');
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('logout-button').style.display = 'block';
  document.getElementById('toggle-auth-form').style.display = 'none';
  document.getElementById('database-selection').style.display = 'block';
  document.getElementById('category-selection').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'none';
}
  
function updateUIAfterLogout() {
  document.body.classList.remove('logged-in');
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('logout-button').style.display = 'none';
  document.getElementById('toggle-auth-form').style.display = 'block';
  document.getElementById('database-selection').style.display = 'none';
  document.getElementById('category-selection').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'none';
}