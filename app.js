let supabase;

document.addEventListener('DOMContentLoaded', () => {
  const supabaseUrl = 'https://fstynltdfdetpyvbrswr.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHlubHRkZmRldHB5dmJyc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM1MzI1ODcsImV4cCI6MjAzOTEwODU4N30.vzbj7_IjPZPBhJPUHvYLTONpOySASM8npaZIvwUXVG8';
  supabase = supabase.createClient(supabaseUrl, supabaseKey);

// スペース学習理論のクラス
class SpacedRepetition {
    constructor() {
        this.intervals = [1, 3, 7, 14, 30, 60, 120]; // 復習間隔（日数）
    }

    calculateNextReview(currentIntervalIndex, wasCorrect) {
        let nextIntervalIndex;
        if (wasCorrect) {
            nextIntervalIndex = Math.min(currentIntervalIndex + 1, this.intervals.length - 1);
        } else {
            nextIntervalIndex = Math.max(currentIntervalIndex - 1, 0);
        }
        const nextInterval = this.intervals[nextIntervalIndex];
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
        return { nextReviewDate, nextIntervalIndex };
    }

    addQuestion() {
        return { nextReviewDate: new Date(), intervalIndex: 0 };
    }
}

// グローバル変数
let allQuizData = [];
let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let spacedRepetition = new SpacedRepetition();
let questionReviewData = {};

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    fetchQuizData();
});

// 問題データをsupabaseから取得
async function fetchQuizData() {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*');
      if (error) throw error;
      allQuizData = data;
      initializeQuiz();
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    }
  }

// クイズの初期化
function initializeQuiz() {
    const quizSelection = document.getElementById('quiz-selection');
    const quizContainer = document.getElementById('quiz-container');
    quizSelection.innerHTML = '<option value="">問題セットを選択してください</option>';
    allQuizData.forEach((quizSet, index) => {
        quizSelection.innerHTML += `<option value="${index}">${quizSet.category}</option>`;
    });
    quizContainer.style.display = 'none';
    
    quizSelection.addEventListener('change', (e) => {
        if (e.target.value !== "") {
            startQuiz(parseInt(e.target.value));
        }
    });
}

// クイズの開始
function startQuiz(quizIndex) {
    currentQuizQuestions = allQuizData[quizIndex].questions;
    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-selection').style.display = 'none';
}

// 問題の表示
function displayQuestion() {
    const question = currentQuizQuestions[currentQuestionIndex];
    document.getElementById('question').textContent = question.question;
    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.classList.add('btn');
        button.addEventListener('click', () => selectAnswer(index));
        answerButtons.appendChild(button);
    });
    document.getElementById('next-button').style.display = 'none';
}

// 回答の選択
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

    if (answerIndex === question.correct) {
        score++;
    }

    document.getElementById('next-button').style.display = 'block';
}

// 次の問題へ
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuizQuestions.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

// 結果の表示
function showResults() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <h2>クイズ終了</h2>
        <p>あなたのスコア: ${score} / ${currentQuizQuestions.length}</p>
    `;
    const restartButton = document.createElement('button');
    restartButton.textContent = '再挑戦';
    restartButton.addEventListener('click', initializeQuiz);
    quizContainer.appendChild(restartButton);
}

// イベントリスナーの設定
document.getElementById('next-button').addEventListener('click', nextQuestion)})