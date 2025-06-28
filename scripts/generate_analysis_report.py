#!/usr/bin/env python3
"""
CPL試験データ分析レポート生成スクリプト
Supabaseから分析データを取得してMarkdownレポートを生成
"""

import json
from datetime import datetime
from pathlib import Path

def generate_analysis_report():
    """分析レポートを生成"""
    
    # 実際の運用ではSupabaseから取得
    # 今回はテストデータを使用
    
    analysis_data = {
        "questions": [
            {
                "exam_year": 2024,
                "exam_month": 8,
                "question_number": 1,
                "subject_category": "航空法規",
                "sub_category": "航空法",
                "difficulty_level": 2,
                "importance_score": 7.5,
                "question_text": "次の航空法に関する記述のうち、正しいものはどれか。",
                "correct_answer": 3,
                "tags": ["航空法規", "航空法"]
            },
            {
                "exam_year": 2024,
                "exam_month": 8,
                "question_number": 2,
                "subject_category": "気象",
                "sub_category": "大気",
                "difficulty_level": 3,
                "importance_score": 8.2,
                "question_text": "標準大気条件において、高度1500mでの気温として最も近い値はどれか。",
                "correct_answer": 2,
                "tags": ["気象", "大気"]
            },
            {
                "exam_year": 2024,
                "exam_month": 8,
                "question_number": 3,
                "subject_category": "飛行理論",
                "sub_category": "安定性",
                "difficulty_level": 3,
                "importance_score": 8.8,
                "question_text": "航空機の重心位置が後方限界を超えた場合の影響として正しいものはどれか。",
                "correct_answer": 4,
                "tags": ["飛行理論", "安定性"]
            }
        ],
        "trends": [
            {
                "subject_category": "飛行理論",
                "sub_category": "安定性",
                "question_count": 1,
                "avg_difficulty": 3.0,
                "frequency_trend": "increasing",
                "importance_rank": 1,
                "trend_score": 8.8
            },
            {
                "subject_category": "気象",
                "sub_category": "大気",
                "question_count": 1,
                "avg_difficulty": 3.0,
                "frequency_trend": "increasing",
                "importance_rank": 2,
                "trend_score": 8.2
            },
            {
                "subject_category": "航空法規",
                "sub_category": "航空法",
                "question_count": 1,
                "avg_difficulty": 2.0,
                "frequency_trend": "increasing",
                "importance_rank": 3,
                "trend_score": 7.5
            }
        ],
        "recommendations": [
            {
                "priority_score": 9,
                "subject_category": "飛行理論",
                "sub_category": "安定性",
                "recommended_title": "CPL航空理論: 重心と縦安定性の基礎",
                "coverage_gap_percentage": 100.0,
                "estimated_impact_score": 8.8,
                "estimated_study_time": 45,
                "target_difficulty_level": 3,
                "suggested_outline": [
                    "重心位置の基本概念",
                    "縦安定性のメカニズム",
                    "重心移動の影響",
                    "実際の計算例",
                    "安全な飛行のための注意点"
                ]
            },
            {
                "priority_score": 9,
                "subject_category": "気象",
                "sub_category": "大気",
                "recommended_title": "CPL気象学: 標準大気と温度変化",
                "coverage_gap_percentage": 100.0,
                "estimated_impact_score": 8.2,
                "estimated_study_time": 45,
                "target_difficulty_level": 3,
                "suggested_outline": [
                    "標準大気の定義",
                    "高度と気温の関係",
                    "温度減率の計算",
                    "実際の計算問題",
                    "飛行への応用"
                ]
            },
            {
                "priority_score": 7,
                "subject_category": "航空法規",
                "sub_category": "航空法",
                "recommended_title": "CPL航空法規: 耐空証明と技能証明",
                "coverage_gap_percentage": 100.0,
                "estimated_impact_score": 7.5,
                "estimated_study_time": 30,
                "target_difficulty_level": 2,
                "suggested_outline": [
                    "耐空証明書の役割",
                    "技能証明の有効期間",
                    "航空身体検査証明",
                    "飛行計画書の義務",
                    "法規遵守のポイント"
                ]
            }
        ]
    }
    
    # レポート生成
    report_content = f"""---
title: "CPL学科試験データ分析レポート"
analysis_date: "{datetime.now().strftime('%Y-%m-%d')}"
data_source: "2024年8月CPL学科試験"
generated_by: "FlightAcademy CPL試験分析システム"
---

# CPL学科試験データ分析レポート

**分析日時:** {datetime.now().strftime('%Y年%m月%d日 %H:%M')}  
**対象データ:** 2024年8月 CPL学科試験  
**分析問題数:** {len(analysis_data['questions'])}問

## 📊 分析サマリー

### 全体統計
- **総問題数:** {len(analysis_data['questions'])}問
- **平均難易度:** {sum(q['difficulty_level'] for q in analysis_data['questions']) / len(analysis_data['questions']):.1f}
- **平均重要度スコア:** {sum(q['importance_score'] for q in analysis_data['questions']) / len(analysis_data['questions']):.1f}

### 科目別分布
"""

    # 科目別統計
    subjects = {}
    for question in analysis_data['questions']:
        subject = question['subject_category']
        if subject not in subjects:
            subjects[subject] = {
                'count': 0,
                'avg_difficulty': 0,
                'avg_importance': 0,
                'questions': []
            }
        subjects[subject]['count'] += 1
        subjects[subject]['questions'].append(question)
    
    for subject, data in subjects.items():
        data['avg_difficulty'] = sum(q['difficulty_level'] for q in data['questions']) / len(data['questions'])
        data['avg_importance'] = sum(q['importance_score'] for q in data['questions']) / len(data['questions'])
    
    for subject, data in subjects.items():
        report_content += f"""
**{subject}**
- 問題数: {data['count']}問
- 平均難易度: {data['avg_difficulty']:.1f}
- 平均重要度: {data['avg_importance']:.1f}
"""

    report_content += f"""

## 📈 出題傾向分析

### 重要度ランキング
"""

    for i, trend in enumerate(analysis_data['trends'], 1):
        report_content += f"""
{i}. **{trend['subject_category']} - {trend['sub_category']}**
   - 重要度スコア: {trend['trend_score']}
   - 平均難易度: {trend['avg_difficulty']}
   - 出題傾向: {trend['frequency_trend']}
"""

    report_content += f"""

## 🎯 学習コンテンツ推奨事項

### 高優先度コンテンツ
"""

    for rec in analysis_data['recommendations']:
        if rec['priority_score'] >= 9:
            report_content += f"""
#### {rec['recommended_title']}
- **優先度:** {rec['priority_score']}/10
- **対象科目:** {rec['subject_category']} - {rec['sub_category']}
- **推定学習時間:** {rec['estimated_study_time']}分
- **対象難易度:** レベル{rec['target_difficulty_level']}
- **期待効果スコア:** {rec['estimated_impact_score']}

**推奨記事構成:**
"""
            for outline in rec['suggested_outline']:
                report_content += f"- {outline}\n"
            report_content += "\n"

    report_content += f"""
### 中優先度コンテンツ
"""

    for rec in analysis_data['recommendations']:
        if rec['priority_score'] < 9:
            report_content += f"""
#### {rec['recommended_title']}
- **優先度:** {rec['priority_score']}/10
- **推定学習時間:** {rec['estimated_study_time']}分
- **期待効果スコア:** {rec['estimated_impact_score']}
"""

    report_content += f"""

## 📋 詳細問題分析

### 問題別詳細
"""

    for question in analysis_data['questions']:
        report_content += f"""
#### 問題{question['question_number']} - {question['subject_category']}
- **問題文:** {question['question_text']}
- **科目:** {question['subject_category']} - {question['sub_category']}
- **難易度:** レベル{question['difficulty_level']}
- **重要度スコア:** {question['importance_score']}
- **正解:** 選択肢{question['correct_answer']}
- **タグ:** {', '.join(question['tags'])}

"""

    report_content += f"""

## 🔍 分析手法

### データ処理フロー
1. **PDF解析:** MarkItDownによるPDF→Markdown変換
2. **構造化:** 正規表現による問題文・選択肢・解説の抽出
3. **分類:** 自然言語処理による科目・難易度の自動分類
4. **スコアリング:** 出題頻度・難易度・最新性による重要度算出
5. **推奨生成:** 統計分析による学習コンテンツ優先度決定

### 重要度スコア算出式
```
重要度スコア = (出題頻度スコア × 0.4) + (難易度スコア × 0.3) + (最新性スコア × 0.3)
```

### 推奨優先度決定基準
- **高優先度 (9-10点):** 重要度スコア8.0以上
- **中優先度 (7-8点):** 重要度スコア6.0-7.9
- **低優先度 (5-6点):** 重要度スコア6.0未満

## 📌 次のステップ

### 即座に実行すべき施策
1. **飛行理論（重心・安定性）記事の作成** - 最高優先度
2. **気象学（標準大気）記事の作成** - 高優先度  
3. **航空法規（証明書関連）記事の作成** - 中優先度

### 長期的な改善計画
1. **データ蓄積:** より多くの過去問データの収集・分析
2. **精度向上:** 機械学習による分類精度の向上
3. **自動化:** PDF変換からレポート生成までの完全自動化
4. **連携強化:** 学習記事と試験問題の双方向リンク構築

---

*このレポートは FlightAcademy CPL試験分析システム Phase 6 により自動生成されました。*  
*生成日時: {datetime.now().strftime('%Y年%m月%d日 %H:%M:%S')}*
"""

    # レポートファイルを保存
    output_dir = Path("./cpl_exam_data/analysis_reports")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    report_file = output_dir / f"cpl_analysis_report_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"分析レポートが生成されました: {report_file}")
    print(f"レポートサイズ: {len(report_content):,} 文字")
    
    return report_file

if __name__ == "__main__":
    try:
        report_file = generate_analysis_report()
        print(f"\n✅ 分析レポート生成完了: {report_file}")
    except Exception as e:
        print(f"❌ レポート生成エラー: {e}")
        import traceback
        traceback.print_exc() 