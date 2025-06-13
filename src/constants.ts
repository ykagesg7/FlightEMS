import { AppContentData, QuestionType } from './types/quiz';

export const APP_CONTENT: AppContentData = {
  appName: "Section4. TACAN Approach",
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
    appOverview: "ようこそ「Section4. TACAN Approach」へ！このアプリでは、パイロット訓練生であるあなたがTACAN進入方式をインタラクティブに学ぶことができます。\n以下の学習セクションを選択して、早速始めましょう。",
    selectSectionToStart: "学習したいセクションを選んでください。",
    nextQuestion: "次の問題へ",
    finishQuiz: "クイズを終了して結果を見る",
    unanswered: "未回答",
  },
  sections: [
    {
      id: "overview",
      title: "1. TACAN進入方式の概要",
      introduction: "このセクションでは、TACAN進入がどのようなもので、なぜ必要なのか、そして主な種類について学びます。",
      steps: [
        {
          id: "overview_1",
          type: "text",
          content: "TACAN進入とは、TACAN（戦術航法装置）を利用して、計器気象状態（IMC）でも航空機を高高度から飛行場の適切な位置へ安全に降下させ、最終進入コースに正対させるための標準的な手順です。特に、迅速な降下と進入経路への正確なアラインメントが求められる場合に重要となります。"
        },
        {
          id: "overview_2",
          type: "text",
          title: "主なTACAN進入の種類",
          content: "TACAN進入にはいくつかの種類がありますが、主に以下の2つが代表的です。\n1. ラジアル・ペネトレーション：TACAN局へ向かう、またはTACAN局から遠ざかる特定のラジアル（方位線）上を直線的に降下する方式です。\n2. ラジアル/アーク・コンビネーション：TACAN局からの一定距離を保ちながら円弧（アーク）を描いて飛行し、その後特定のラジアルに合流して降下する方式です。\n\nこれらの進入方式は、地形や空域の制約、交通状況などに応じて使い分けられます。"
        }
      ]
    },
    {
      id: "radial_penetration",
      title: "2. ラジアル・ペネトレーション",
      introduction: "ここでは、ラジアル・ペネトレーションによる降下について、具体的なシナリオを通じて学びます。",
      steps: [
        {
          id: "rp_scenario",
          type: "text",
          title: "シナリオ1：ラジアル・ペネトレーションによる降下",
          content: "あなたはIAF（Initial Approach Fix：進入開始点）であるABC TACANのR-090（090度ラジアル）/30DME（TACANからの距離30海里）、高度FL200（20,000フィート）にいます。管制から「R-090を維持して降下し、FAF（Final Approach Fix：最終進入点）であるR-090/10DME、高度3000ftへ向かえ」と指示がありました。これがラジアル・ペネトレーションです。"
        },
        {
          id: "rp_step1_q",
          type: "question",
          title: "ステップ1：IAF通過と降下開始タイミング",
          content: {
            id: "q_rp_timing",
            text: "IAFを通過し、降下を開始する適切なタイミングはいつですか？",
            type: QuestionType.MULTIPLE_CHOICE,
            options: [
              { id: "a", text: "a) IAF手前" },
              { id: "b", text: "b) IAF直上" },
              { id: "c", text: "c) IAFのアビーム点を過ぎてから" }
            ],
            correctAnswer: "c",
            explanation: "正解はc)です。ラジアル・ペネトレーションでは、IAFの距離の通過（この場合は30DME）をもってIAFの通過とみなし、IAFのアビーム点を過ぎた後、または管制からの降下許可が得られたら降下を開始します。アビームとは、機体の真横を意味します。これにより、IAFを確実に通過したことを確認し、計画通りに降下フェーズに入ることができます。",
            reference: "教材 P22などを参照"
          }
        },
        {
          id: "rp_step2_q",
          type: "question",
          title: "ステップ2：コース維持",
          content: {
            id: "q_rp_course",
            text: "R-090を維持するために、HSI（水平状況指示器）のコースポインターとCDB（Course Deviation Bar：コース偏向バー）をどのように利用しますか？",
            type: QuestionType.TEXT_INPUT,
            correctAnswer: "コースポインターを090にセットし、CDBが中央からずれないように機首方位を修正します。風がある場合は偏流修正が必要です。",
            explanation: "HSIのコースセレクターでコースポインターを090度にセットします。その後、CDB（多くの場合、左右に動く縦のバー）が中央に位置するように機首方位を微調整します。例えば、CDBが右にずれた場合は、コースから左に逸脱しているため、機首を右に向けてコースに戻します。風がある場合は、風上に機首を向ける「偏流修正角（クラブ角）」を取る必要があります。例えば、左からの横風がある場合は、機首をやや左に向けて飛行することで、R-090上を直進できます。"
          }
        },
        {
          id: "rp_step3_q",
          type: "question",
          title: "ステップ3：FAFへの到達",
          content: {
            id: "q_rp_faf_prep",
            text: "FAF（R-090/10DME、高度3000ft）に近づいてきました。FAFに到達する前に何を確認し、セットする必要がありますか？",
            type: QuestionType.TEXT_INPUT,
            correctAnswer: "ファイナル・コンフィギュレーション（ギア、フラップ等）と進入速度のセットです。また、FAFの高度と距離を再確認します。",
            explanation: "FAFに到達する前に、航空機を着陸に適した状態にするための準備が必要です。具体的には、ファイナル・コンフィギュレーション（降着装置（ギア）を出し、適切なフラップ角度を設定）と、規定された進入速度に調整します。また、計器のクロスチェックとして、FAFの目標高度（3000ft）と距離（10DME）を再確認し、ミスのない進入に備えます。"
          }
        }
      ]
    },
    {
      id: "radial_arc_combination",
      title: "3. ラジアル/アーク・コンビネーション",
      introduction: "次に、アークへのインターセプト、アーク飛行、そしてラジアルへの再インターセプトという、より複雑なラジアル/アーク・コンビネーション進入について学びます。",
      steps: [
        {
          id: "rac_scenario",
          type: "text",
          title: "シナリオ2：アークへのインターセプトとアーク飛行、ラジアルへの再インターセプト",
          content: "あなたはIAFであるXYZ TACANのR-180/25DME、高度FL150にいます。管制から「Cleared to XYZ TACAN Nr. 2 IAF via 15 DME Arc East, then intercept R-270 inbound. Maintain FL150 until established on the arc, then descend to 5000ft. FAF is R-270/5DME, 2000ft.」と指示がありました。これは「XYZ TACANのNo.2 IAFへ、東側の15DMEアークを経由し、その後R-270インバウンドにインターセプトせよ。アークに確立するまでFL150を維持し、確立後は5000ftへ降下せよ。FAFはR-270/5DME、2000ft」という意味です。"
        },
        {
          id: "rac_step1_q",
          type: "question",
          title: "ステップ1：アークへのインターセプト準備",
          content: {
            id: "q_rac_arc_intercept_prep",
            text: "まず、15 DME Arc Eastへインターセプトします。現在のヘディングからアークの方向（East）に近い方へ約90度の角をなすヘディングを計画します（例えば、TACANが真方位000度にあれば、東側のアークへは右旋回）。次に重要なのは何ですか？",
            type: QuestionType.TEXT_INPUT,
            correctAnswer: "リード・ポイントの決定です。",
            explanation: "正解は「リード・ポイントの決定」です。アークにスムーズに乗るためには、早すぎず遅すぎない、適切なリード・ポイントで旋回を開始する必要があります。これにより、オーバーシュートやアンダーシュートを防ぎ、効率的にアークに確立できます。",
            reference: "教材 P24 b 参照"
          }
        },
        {
          id: "rac_step2_q",
          type: "question",
          title: "ステップ2：リード・ポイントの計算",
          content: {
            id: "q_rac_lead_point_calc",
            text: "仮にあなたの対地速度が180ノット (3NM/分 = MPM 3) で、標準率旋回（約30度バンク）で旋回するとします。アークへ進入するためのリード・ポイント（距離）の目安は (MPM - 2) で計算できます。この場合のリード距離は何NMですか？",
            type: QuestionType.NUMBER_INPUT,
            correctAnswer: 1,
            explanation: "正解は1NMです。計算式は (MPM - 2) なので、(3 - 2) = 1NM となります。つまり、DMEが目標アーク距離である15NMに、このリード距離1NMを加えた16NM（15NM + 1NM）を示すあたりから旋回を開始すると、スムーズに15DMEアークに乗ることが期待できます。",
            reference: "教材 P24 (c) III 参照"
          }
        },
        {
          id: "rac_step3_q",
          type: "question",
          title: "ステップ3：アークへの旋回と確立",
          content: {
            id: "q_rac_arc_turn_establish",
            text: "DMEが16NMになりました。旋回を開始します。アーク（15DME）に確立したら、次に何を行いますか？",
            type: QuestionType.TEXT_INPUT,
            correctAnswer: "管制指示に従い、5000ftへの降下を開始します。",
            explanation: "正解は「管制指示に従い、5000ftへの降下を開始します」です。シナリオの指示に『Maintain FL150 until established on the arc, then descend to 5000ft.』とあるため、アークに確立したことを確認後、速やかに5000ftへの降下を開始します。"
          }
        },
        {
          id: "rac_step4_q",
          type: "question",
          title: "ステップ4：メインテニング・アーク（アーク維持飛行）",
          content: {
            id: "q_rac_maintaining_arc",
            text: "15 DMEアークを維持して飛行します。HSIのベアリング・ポインター（TACAN局を示す針）とDMEをどのように利用しますか？（無風状態を仮定）",
            type: QuestionType.TEXT_INPUT,
            correctAnswer: "ベアリング・ポインターを常に翼端方向（この場合は右翼端、90度方位）に維持し、DMEが15NMを保つように微調整します。",
            explanation: "無風状態では、ベアリング・ポインター（多くの場合、細い方の針や矢印の尾部）を常に旋回方向の翼端（このシナリオでは東側アークなので右旋回中、つまり右翼端、相対方位090度）に維持します。DMEが15NMより小さくなれば（アークの内側に入りすぎ）、少し旋回を緩めてアークの外へ。DMEが15NMより大きくなれば（アークの外側に出すぎ）、少し旋回を深めてアークの内へ、というように微調整を繰り返します。",
            reference: "教材 P24 c (a) 参照",
            imagePlaceholder: "HSI図：ベアリングポインターが右翼端を指し、DMEが15NMを示している状態"
          }
        },
        {
          id: "rac_step4_crosswind_q",
          type: "question",
          title: "補足質問（横風時）",
          content: {
            id: "q_rac_crosswind",
            text: "もし右からの横風がある場合、15 DMEアークを維持するためにベアリング・ポインターは右翼端よりやや内側（機首側、相対方位090度より小さい値）ですか、外側（尾部側、相対方位090度より大きい値）ですか？",
            type: QuestionType.MULTIPLE_CHOICE,
            options: [
                { id: "a", text: "内側（機首側）" },
                { id: "b", text: "外側（尾部側）" }
            ],
            correctAnswer: "a",
            explanation: "正解は「内側（機首側）」です。右からの横風（TACAN局から見て風が吹いてくる方向）がある場合、機体は風下に流されやすくなります（アークの外側に押し出される）。これを修正するためには、風上、つまり右側に機首を向ける必要があります。そのため、ベアリング・ポインターは基準となる右翼端（相対方位090度）よりもやや内側（機首に近い側、例えば相対方位085度など）を指すように飛行します。"
          }
        },
        {
          id: "rac_step5_q",
          type: "question",
          title: "ステップ5：アークからのラジアル・インターセプト準備",
          content: {
            id: "q_rac_radial_intercept_prep",
            text: "R-270インバウンドにインターセプトするポイントが近づいてきました。HSIのコースカウンターに270（インバウンドコース）をセットします。ここでも、スムーズなインターセプトのために何が必要ですか？",
            type: QuestionType.TEXT_INPUT,
            correctAnswer: "リード・ポイント（角度）の決定です。",
            explanation: "正解は「リード・ポイント（角度）の決定」です。アーク飛行から直線コースであるラジアルへスムーズに移行するためには、適切なタイミングで旋回を開始する必要があります。このタイミングを計るのがリード・ポイント（角度）です。",
            reference: "教材 P25 d (a)(b) 参照"
          }
        },
        {
          id: "rac_step6_q",
          type: "question",
          title: "ステップ6：リード角の計算",
          content: {
            id: "q_rac_lead_angle_calc",
            text: "リード角の計算方法の一つに「(MPM - 2) × 60 / アークの半径(NM)」があります。MPM=3（対地速度180kt）、アーク半径15NMの場合、リード角は約何度ですか？",
            type: QuestionType.NUMBER_INPUT,
            correctAnswer: 4,
            explanation: "正解は約4度です。計算式は (MPM - 2) × 60 / アークの半径(NM) なので、(3 - 2) × 60 / 15 = 1 × 60 / 15 = 60 / 15 = 4度となります。つまり、HSIのベアリング・ポインター（TACAN局を示す針）が目標ラジアルである270度を指す4度手前、つまり270度 + 4度 = 274度（アークが東側で時計回りに進んでいるため、角度が増加していく）をベアリング・ポインターが示すあたりで、R-270インバウンドへの旋回を開始します。または、コースポインター（270度にセット済み）とベアリングポインターの差が4度になった時とも言えます。",
            reference: "教材 P25 I, II 参照"
          }
        },
        {
          id: "rac_step7_q",
          type: "question",
          title: "ステップ7：FAFへの飛行",
          content: {
            id: "q_rac_faf_prep",
            text: "R-270にインターセプトし、FAF（R-270/5DME、2000ft）へ向かいます。FAF手前での準備は何でしたか？（ラジアル・ペネトレーションのステップ3を思い出してください）",
            type: QuestionType.TEXT_INPUT,
            correctAnswer: "ファイナル・コンフィギュレーション（ギア、フラップ等）と進入速度のセットです。また、FAFの高度と距離を再確認します。",
            explanation: "ラジアル・ペネトレーションの時と同様に、FAF手前ではファイナル・コンフィギュレーション（ギアダウン、フラップ設定）と規定の進入速度への調整、そしてFAFの高度（2000ft）と距離（R-270/5DME）の再確認が不可欠です。これにより、安全かつ正確な最終進入に備えます。"
          }
        }
      ]
    },
    { // Section order changed: TACAN Gate is now before VDP
      id: "tacan_gate",
      title: "4. TACANゲート (FAF) について", // Updated title number
      introduction: "TACANアプローチにおける重要なポイント、「TACANゲート」について説明します。",
      steps: [
        {
          id: "tg_explanation",
          type: "text",
          content: "TACANアプローチのFAF（Final Approach Fix：最終進入点）は、しばしば「TACANゲート」とも呼ばれます。進入チャート上では、このポイントが星印（★）やそれに類する記号で示されることが一般的です。このTACANゲートは、最終進入セグメントの開始点であり、ここを通過する際には規定の高度、速度、コンフィギュレーションであることが求められます。このゲートを正確に通過することが、安定した最終進入と安全な着陸に繋がります。",
          reference: "教材 P25 (エ) 参照",
          imagePlaceholder: "進入チャートのFAF（★印）の例"
        }
      ]
    },
    { // Section order changed: VDP is now after TACAN Gate
      id: "vdp",
      title: "5. VDP (Visual Descent Point) の理解", // Updated title number
      introduction: "一部のTACANアプローチチャートにはVDP（Visual Descent Point：目視降下点）が設定されています。これが何を意味するのか学びましょう。",
      steps: [
        {
          id: "vdp_intro",
          type: "text",
          content: "VDPとは、計器進入方式において、最低降下高度（MDA：Minimum Descent Altitude）で飛行中に、着陸に必要な目視規準（滑走路、進入灯など）を視認できた場合に、MDAから通常の降下経路で着陸するために降下を開始できるポイントのことです。チャート上では「V」の記号で示されることが多いです。",
          reference: "教材 P26 第31図参照"
        },
        {
          id: "vdp_q1",
          type: "question",
          content: {
            id: "q_vdp_before",
            text: "VDPの手前で滑走路を視認できました。この時点でMDA以下に降下しても良いですか？",
            type: QuestionType.MULTIPLE_CHOICE,
            options: [
              { id: "yes", text: "はい、視認できたので降下して良い" },
              { id: "no", text: "いいえ、VDPに到達するまでは降下してはいけない" }
            ],
            correctAnswer: "no",
            explanation: "正解は「いいえ」です。VDPが設定されている場合、VDPに到達するまでは、たとえ滑走路などの目視規準を視認していてもMDA未満に降下してはいけません。VDPは、そこから通常の3度程度の降下角で滑走路に到達できるように設計されたポイントです。VDPより手前で降下を開始すると、障害物との十分な間隔が保証されない可能性があります。"
          }
        },
        {
          id: "vdp_q2",
          type: "question",
          content: {
            id: "q_vdp_at_mda_no_visual",
            text: "VDPをMDAで通過しましたが、滑走路を視認できませんでした。どうしますか？",
            type: QuestionType.TEXT_INPUT,
            correctAnswer: "MAPt（Missed Approach Point）までMDAを維持し、それでも視認できなければ進入復行を実施します。",
            explanation: "VDPをMDAで通過した時点で滑走路等の目視規準を視認できない場合、そのままMDAを維持して飛行を継続します。そして、最終的にMAPt（Missed Approach Point：進入復行点）に到達しても視認できなければ、直ちに進入復行（ゴーアラウンド）を実施しなければなりません。MAPtは通常、FAFからの時間やTACAN局直上などで定義されます。"
          }
        }
      ]
    },
    {
      id: "summary_quiz",
      title: "6. まとめとクイズ", // Updated title number
      introduction: "ここまでの学習内容を振り返り、最後にクイズで理解度を確認しましょう。",
      steps: [
        {
          id: "summary_text",
          type: "text",
          title: "学習のまとめ",
          content: "このアプリでは、TACAN進入の基本から応用までを学びました。主要なポイントは以下の通りです：\n\n*   **ラジアル・ペネトレーション:** TACAN局への直線的な降下方法。\n*   **アーク飛行:** TACAN局からの一定距離を保つ円弧飛行。インターセプトと維持にはリードポイントとHSIの活用が鍵。\n*   **ラジアル/アーク・コンビネーション:** アークとラジアルを組み合わせた進入方法。アークからラジアルへのインターセプトにもリード角の計算が重要。\n*   **リードポイント:** スムーズな旋回とコース確立のために、距離や角度で事前に計算・判断する点。\n*   **TACANゲート (FAF):** 最終進入の開始点。チャートでは「★」印。\n*   **VDP (Visual Descent Point):** MDAから目視で降下を開始できる点。手前での早期降下は不可。\n\nこれらの知識は、計器飛行証明の取得や実運用において非常に重要です。何度も復習し、実際のフライトシミュレーター訓練などに活かしてください。"
        }
      ]
    }
  ],
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
      correctAnswer: "目視物標を視認できたときに、最低降下高度（MDA）以下に降下を開始できる位置。", // More concise and accurate correct answer for TEXT_INPUT
      explanation: "VDPは「目視降下点」と訳され、計器進入中にMDAで水平飛行している際、着陸に必要な滑走路環境（滑走路、進入灯など）を視認した場合に、MDAから通常の降下パスで着陸するために降下を開始できる、チャート上に示されたポイントです。このポイントに到達するまでは、たとえ視認していてもMDA未満に降下してはいけません。"
    }
  ]
};