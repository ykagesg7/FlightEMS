import { AppContentData, QuestionType } from './types/quiz';

export const APP_CONTENT: AppContentData = {
  appName: "Flight Academy Learning",
  generalMessages: {
    startLearning: "学習を開始する",
    nextStep: "次のステップへ",
    previousStep: "前のステップへ",
    submitAnswer: "回答する",
    correct: "正解！",
    incorrect: "不正解",
    viewExplanation: "解説を見る",
    nextSection: "次のセクションへ",
    backToSections: "セクション一覧へ",
    backToContents: "目次に戻る",
    startQuiz: "クイズを開始する",
    quizSummary: "クイズ結果",
    yourScore: "あなたのスコア",
    retakeQuiz: "もう一度クイズに挑戦",
    finalThoughts: "学習お疲れ様でした！",
    showAnswer: "答えを見る",
    hideAnswer: "答えを隠す",
    tableOfContents: "学習コンテンツ一覧",
    appOverview: "ようこそFlight Academyへ！ここでは、パイロット訓練生であるあなたが航空知識をインタラクティブに学ぶことができます。以下の学習セクションを選択して、早速始めましょう。",
    selectSectionToStart: "学習したいセクションを選んでください。",
    nextQuestion: "次の問題へ",
    finishQuiz: "クイズを終了して結果を見る",
    unanswered: "未回答",
  },
  sections: [],
  quizTitle: "TACAN進入理解度クイズ",
  quizQuestions: [
    {
      id: "quiz_q1",
      text: "DMEアークを飛行中、DME値が増加し始めました（アークの外側に出始めた）。機首はアークの内側、外側のどちらに修正すべきですか？",
      type: QuestionType.MULTIPLE_CHOICE,
      options: [
        { id: "a", text: "内側（TACAN局方向へ）" },
        { id: "b", text: "外側（TACAN局から遠ざかる方向へ）" }
      ],
      correctAnswer: "a",
      explanation: "DME値が増加しているということは、機体がアークの外側に逸脱し始めていることを意味します。したがって、機首をアークの内側（TACAN局の方向）に向けて旋回を深め、DME値を減少させて正しいアークに戻す必要があります。"
    },
    {
      id: "quiz_q2",
      text: "ラジアル/アーク・コンビネーションで、アークからファイナルアプローチコース（ラジアル）へインターセプトする際のリードポイント（リード角）は、主に何に依存しますか？",
      type: QuestionType.MULTIPLE_CHOICE,
      options: [
        { id: "a", text: "対地速度とアーク半径" },
        { id: "b", text: "風向のみ" },
        { id: "c", text: "航空機の種類" }
      ],
      correctAnswer: "a",
      explanation: "リード角の計算式 (例: (MPM-2) * 60 / アーク半径) が示す通り、主に対地速度（MPMに反映）とアークの半径に依存します。対地速度が速いほど、またアーク半径が小さいほど、大きなリード角（より手前からの旋回開始）が必要になります。"
    },
    {
      id: "quiz_q3",
      text: "VDP（Visual Descent Point）とは何ですか？簡潔に説明してください。",
      type: QuestionType.TEXT_INPUT,
      correctAnswer: "目視物標を視認できたときに、最低降下高度（MDA）以下に降下を開始できる位置。",
      explanation: "VDPは「目視降下点」と訳され、計器進入中にMDAで水平飛行している際、着陸に必要な滑走路環境（滑走路、進入灯など）を視認した場合に、MDAから通常の降下パスで着陸するために降下を開始できる、チャート上に示されたポイントです。このポイントに到達するまでは、たとえ視認していてもMDA未満に降下してはいけません。"
    }
  ]
};
