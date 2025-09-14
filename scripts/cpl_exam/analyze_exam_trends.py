#!/usr/bin/env python3
"""
CPL試験出題傾向分析スクリプト
データベースの試験問題データを分析し、出題傾向レポートを生成する

Usage:
    python scripts/analyze_exam_trends.py --output ./cpl_exam_data/analysis_reports --config .env.local
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, date
import json

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
    import matplotlib.pyplot as plt
    import pandas as pd
    import seaborn as sns
except ImportError:
    print("ERROR: Required packages not installed. Please install with:")
    print("pip install supabase python-dotenv matplotlib pandas seaborn")
    sys.exit(1)

@dataclass
class TrendAnalysis:
    """出題傾向分析結果"""
    subject_category: str
    sub_category: str = None
    question_count: int = 0
    avg_difficulty: float = 0.0
    frequency_trend: str = 'stable'  # 'increasing', 'stable', 'decreasing'
    importance_rank: int = 0
    trend_score: float = 0.0
    yearly_data: Dict[int, int] = None
    analysis_notes: str = ""
    
    def __post_init__(self):
        if self.yearly_data is None:
            self.yearly_data = {}

@dataclass
class ContentGap:
    """コンテンツギャップ分析結果"""
    subject_category: str
    sub_category: str
    total_questions: int
    covered_questions: int
    coverage_percentage: float
    gap_priority: int
    missing_question_ids: List[str] = None
    
    def __post_init__(self):
        if self.missing_question_ids is None:
            self.missing_question_ids = []

class ExamTrendAnalyzer:
    """試験傾向分析エンジン"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.analysis_date = date.today()
    
    def fetch_exam_data(self, years: List[int] = None) -> List[Dict]:
        """試験データの取得"""
        query = self.supabase.table('exam_questions_metadata').select('*')
        
        if years:
            query = query.in_('exam_year', years)
        
        result = query.execute()
        return result.data if result.data else []
    
    def analyze_subject_trends(self, years: List[int] = None) -> List[TrendAnalysis]:
        """科目別出題傾向分析"""
        
        if years is None:
            current_year = datetime.now().year
            years = list(range(current_year - 4, current_year + 1))  # 過去5年
        
        exam_data = self.fetch_exam_data(years)
        
        if not exam_data:
            print("Warning: No exam data found")
            return []
        
        # データをDataFrameに変換
        df = pd.DataFrame(exam_data)
        
        # 科目別分析
        trend_analyses = []
        
        # 科目別グループ化
        subject_groups = df.groupby(['subject_category', 'sub_category'])
        
        for (subject, sub_category), group in subject_groups:
            analysis = self.analyze_subject_group(group, subject, sub_category, years)
            trend_analyses.append(analysis)
        
        # 重要度ランキング
        trend_analyses.sort(key=lambda x: x.trend_score, reverse=True)
        for i, analysis in enumerate(trend_analyses, 1):
            analysis.importance_rank = i
        
        return trend_analyses
    
    def analyze_subject_group(self, group_df: pd.DataFrame, subject: str, sub_category: str, years: List[int]) -> TrendAnalysis:
        """科目グループの詳細分析"""
        
        # 年度別問題数
        yearly_counts = {}
        for year in years:
            year_data = group_df[group_df['exam_year'] == year]
            yearly_counts[year] = len(year_data)
        
        # 傾向計算
        trend = self.calculate_frequency_trend(yearly_counts)
        
        # 平均難易度
        avg_difficulty = group_df['difficulty_level'].mean() if len(group_df) > 0 else 0.0
        
        # トレンドスコア計算
        trend_score = self.calculate_trend_score(
            question_count=len(group_df),
            avg_difficulty=avg_difficulty,
            frequency_trend=trend,
            recent_frequency=yearly_counts.get(max(years), 0)
        )
        
        # 分析メモ生成
        analysis_notes = self.generate_analysis_notes(group_df, yearly_counts, trend)
        
        return TrendAnalysis(
            subject_category=subject,
            sub_category=sub_category,
            question_count=len(group_df),
            avg_difficulty=avg_difficulty,
            frequency_trend=trend,
            trend_score=trend_score,
            yearly_data=yearly_counts,
            analysis_notes=analysis_notes
        )
    
    def calculate_frequency_trend(self, yearly_counts: Dict[int, int]) -> str:
        """出題頻度の傾向計算"""
        if len(yearly_counts) < 3:
            return 'stable'
        
        # 直近3年の傾向を分析
        recent_years = sorted(yearly_counts.keys())[-3:]
        counts = [yearly_counts[year] for year in recent_years]
        
        # 線形回帰的な傾向判定
        if len(counts) >= 3:
            trend_diff = counts[-1] - counts[0]
            if trend_diff > 1:
                return 'increasing'
            elif trend_diff < -1:
                return 'decreasing'
        
        return 'stable'
    
    def calculate_trend_score(self, question_count: int, avg_difficulty: float, 
                            frequency_trend: str, recent_frequency: int) -> float:
        """トレンドスコア計算（重要度指標）"""
        
        # 基本スコア（問題数ベース）
        count_score = min(10.0, question_count * 0.5)
        
        # 難易度スコア
        difficulty_score = avg_difficulty * 2.0
        
        # 傾向スコア
        trend_scores = {'increasing': 3.0, 'stable': 2.0, 'decreasing': 1.0}
        trend_score = trend_scores.get(frequency_trend, 2.0)
        
        # 最近の出題頻度スコア
        recent_score = min(5.0, recent_frequency * 1.0)
        
        # 重み付け合計
        total_score = (count_score * 0.3 + difficulty_score * 0.2 + 
                      trend_score * 0.3 + recent_score * 0.2)
        
        return round(total_score, 2)
    
    def generate_analysis_notes(self, group_df: pd.DataFrame, yearly_counts: Dict[int, int], trend: str) -> str:
        """分析メモの自動生成"""
        notes = []
        
        # 問題数に関するコメント
        total_questions = len(group_df)
        if total_questions > 15:
            notes.append("高頻出分野")
        elif total_questions > 5:
            notes.append("中頻出分野")
        else:
            notes.append("低頻出分野")
        
        # 傾向に関するコメント
        trend_comments = {
            'increasing': "出題傾向が増加している重要分野",
            'decreasing': "出題頻度が減少傾向",
            'stable': "安定した出題パターン"
        }
        notes.append(trend_comments.get(trend, ""))
        
        # 難易度に関するコメント
        avg_difficulty = group_df['difficulty_level'].mean()
        if avg_difficulty > 4:
            notes.append("高難易度分野")
        elif avg_difficulty > 3:
            notes.append("中難易度分野")
        else:
            notes.append("基本レベル分野")
        
        # 最新年度の変化
        years = sorted(yearly_counts.keys())
        if len(years) >= 2:
            recent_change = yearly_counts[years[-1]] - yearly_counts[years[-2]]
            if recent_change > 0:
                notes.append(f"前年比+{recent_change}問")
            elif recent_change < 0:
                notes.append(f"前年比{recent_change}問")
        
        return " | ".join(notes)
    
    def analyze_content_gaps(self) -> List[ContentGap]:
        """コンテンツギャップ分析"""
        
        # Supabaseの関数を呼び出し
        result = self.supabase.rpc('analyze_content_gaps').execute()
        
        if not result.data:
            return []
        
        gaps = []
        for row in result.data:
            gap = ContentGap(
                subject_category=row['subject_category'],
                sub_category=row['sub_category'],
                total_questions=row['total_questions'],
                covered_questions=row['covered_questions'],
                coverage_percentage=row['coverage_percentage'],
                gap_priority=row['gap_priority']
            )
            gaps.append(gap)
        
        return gaps
    
    def save_trend_analysis(self, trends: List[TrendAnalysis]) -> None:
        """分析結果をデータベースに保存"""
        
        for trend in trends:
            # 既存データの削除（日付・科目・サブカテゴリで一意）
            self.supabase.table('exam_trend_analysis').delete().eq(
                'analysis_date', self.analysis_date.isoformat()
            ).eq(
                'subject_category', trend.subject_category
            ).eq(
                'sub_category', trend.sub_category
            ).execute()
            
            # 新規データ挿入
            insert_data = {
                'analysis_date': self.analysis_date.isoformat(),
                'subject_category': trend.subject_category,
                'sub_category': trend.sub_category,
                'question_count': trend.question_count,
                'avg_difficulty': trend.avg_difficulty,
                'frequency_trend': trend.frequency_trend,
                'importance_rank': trend.importance_rank,
                'trend_score': trend.trend_score,
                'yearly_data': trend.yearly_data,
                'analysis_notes': trend.analysis_notes
            }
            
            self.supabase.table('exam_trend_analysis').insert(insert_data).execute()

class ReportGenerator:
    """分析レポート生成クラス"""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_markdown_report(self, trends: List[TrendAnalysis], gaps: List[ContentGap]) -> str:
        """Markdownレポート生成"""
        
        report_date = datetime.now().strftime("%Y年%m月%d日")
        
        report = f"""# CPL学科試験 出題傾向分析レポート

**分析日:** {report_date}  
**分析対象:** 過去5年間の出題データ

## エグゼクティブサマリー

### 重要度ランキング TOP 10

"""
        
        # TOP 10の表
        top_trends = sorted(trends, key=lambda x: x.trend_score, reverse=True)[:10]
        
        report += "| 順位 | 科目 | サブカテゴリ | 問題数 | 傾向 | スコア |\n"
        report += "|------|------|-------------|--------|------|--------|\n"
        
        for i, trend in enumerate(top_trends, 1):
            sub_cat = trend.sub_category or "-"
            report += f"| {i} | {trend.subject_category} | {sub_cat} | {trend.question_count} | {trend.frequency_trend} | {trend.trend_score} |\n"
        
        # 科目別詳細分析
        report += "\n## 科目別詳細分析\n\n"
        
        subjects = {}
        for trend in trends:
            if trend.subject_category not in subjects:
                subjects[trend.subject_category] = []
            subjects[trend.subject_category].append(trend)
        
        for subject, subject_trends in subjects.items():
            report += f"### {subject}\n\n"
            
            total_questions = sum(t.question_count for t in subject_trends)
            avg_difficulty = sum(t.avg_difficulty * t.question_count for t in subject_trends) / total_questions if total_questions > 0 else 0
            
            report += f"- **総問題数:** {total_questions}\n"
            report += f"- **平均難易度:** {avg_difficulty:.1f}\n"
            report += f"- **サブカテゴリ数:** {len(subject_trends)}\n\n"
            
            # サブカテゴリ別詳細
            for trend in sorted(subject_trends, key=lambda x: x.trend_score, reverse=True):
                sub_cat = trend.sub_category or "その他"
                report += f"#### {sub_cat}\n\n"
                report += f"- **問題数:** {trend.question_count}\n"
                report += f"- **平均難易度:** {trend.avg_difficulty:.1f}\n"
                report += f"- **出題傾向:** {trend.frequency_trend}\n"
                report += f"- **重要度スコア:** {trend.trend_score}\n"
                report += f"- **分析メモ:** {trend.analysis_notes}\n\n"
        
        # コンテンツギャップ分析
        report += "## コンテンツギャップ分析\n\n"
        report += "学習記事でカバーできていない分野の分析結果です。\n\n"
        
        report += "| 科目 | サブカテゴリ | 総問題数 | カバー済み | カバレッジ | 優先度 |\n"
        report += "|------|-------------|----------|------------|------------|--------|\n"
        
        for gap in sorted(gaps, key=lambda x: x.gap_priority, reverse=True):
            report += f"| {gap.subject_category} | {gap.sub_category} | {gap.total_questions} | {gap.covered_questions} | {gap.coverage_percentage:.1f}% | {gap.gap_priority} |\n"
        
        # 推奨アクション
        report += "\n## 推奨アクション\n\n"
        
        high_priority_gaps = [g for g in gaps if g.gap_priority >= 8]
        if high_priority_gaps:
            report += "### 高優先度（記事作成推奨）\n\n"
            for gap in high_priority_gaps:
                report += f"- **{gap.subject_category} - {gap.sub_category}**: "
                report += f"カバレッジ{gap.coverage_percentage:.1f}%、{gap.total_questions}問中{gap.covered_questions}問のみカバー\n"
        
        increasing_trends = [t for t in trends if t.frequency_trend == 'increasing']
        if increasing_trends:
            report += "\n### 出題増加傾向分野（強化推奨）\n\n"
            for trend in sorted(increasing_trends, key=lambda x: x.trend_score, reverse=True)[:5]:
                sub_cat = trend.sub_category or trend.subject_category
                report += f"- **{trend.subject_category} - {sub_cat}**: "
                report += f"スコア{trend.trend_score}、{trend.analysis_notes}\n"
        
        return report
    
    def generate_charts(self, trends: List[TrendAnalysis], gaps: List[ContentGap]) -> None:
        """分析チャート生成"""
        
        # 日本語フォント設定
        plt.rcParams['font.family'] = ['DejaVu Sans', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'Takao', 'IPAexGothic', 'IPAPGothic', 'VL PGothic', 'Noto Sans CJK JP']
        
        # 1. 科目別問題数分布
        subjects = {}
        for trend in trends:
            if trend.subject_category not in subjects:
                subjects[trend.subject_category] = 0
            subjects[trend.subject_category] += trend.question_count
        
        fig, ax = plt.subplots(figsize=(12, 6))
        subjects_sorted = dict(sorted(subjects.items(), key=lambda x: x[1], reverse=True))
        ax.bar(subjects_sorted.keys(), subjects_sorted.values())
        ax.set_title('科目別問題数分布')
        ax.set_xlabel('科目')
        ax.set_ylabel('問題数')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig(self.output_dir / 'subject_distribution.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 2. 重要度スコア TOP 15
        top_trends = sorted(trends, key=lambda x: x.trend_score, reverse=True)[:15]
        
        fig, ax = plt.subplots(figsize=(14, 8))
        labels = [f"{t.subject_category}\n{t.sub_category or ''}" for t in top_trends]
        scores = [t.trend_score for t in top_trends]
        
        bars = ax.barh(range(len(labels)), scores)
        ax.set_yticks(range(len(labels)))
        ax.set_yticklabels(labels)
        ax.set_xlabel('重要度スコア')
        ax.set_title('分野別重要度スコア TOP 15')
        
        # カラーマップ
        colors = plt.cm.viridis([score/max(scores) for score in scores])
        for bar, color in zip(bars, colors):
            bar.set_color(color)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / 'importance_ranking.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. コンテンツギャップ分析
        if gaps:
            fig, ax = plt.subplots(figsize=(12, 8))
            
            gap_data = [(g.subject_category, g.coverage_percentage, g.total_questions) for g in gaps]
            gap_data.sort(key=lambda x: x[1])  # カバレッジ順
            
            subjects = [item[0] for item in gap_data]
            coverages = [item[1] for item in gap_data]
            
            bars = ax.barh(range(len(subjects)), coverages)
            ax.set_yticks(range(len(subjects)))
            ax.set_yticklabels(subjects)
            ax.set_xlabel('カバレッジ (%)')
            ax.set_title('科目別コンテンツカバレッジ')
            ax.set_xlim(0, 100)
            
            # 色分け（赤：低カバレッジ、緑：高カバレッジ）
            colors = ['red' if c < 50 else 'orange' if c < 80 else 'green' for c in coverages]
            for bar, color in zip(bars, colors):
                bar.set_color(color)
            
            plt.tight_layout()
            plt.savefig(self.output_dir / 'content_coverage.png', dpi=300, bbox_inches='tight')
            plt.close()

def main():
    parser = argparse.ArgumentParser(description='Analyze CPL exam trends')
    parser.add_argument('--output', '-o', required=True, help='Output directory for reports')
    parser.add_argument('--config', '-c', default='.env.local', help='Environment config file')
    parser.add_argument('--years', nargs='+', type=int, help='Years to analyze (default: last 5 years)')
    parser.add_argument('--save-db', action='store_true', help='Save analysis results to database')
    
    args = parser.parse_args()
    
    # 環境変数読み込み
    if Path(args.config).exists():
        load_dotenv(args.config)
    
    # Supabase接続
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set")
        sys.exit(1)
    
    supabase = create_client(supabase_url, supabase_key)
    
    # 分析実行
    analyzer = ExamTrendAnalyzer(supabase)
    
    print("Analyzing exam trends...")
    trends = analyzer.analyze_subject_trends(args.years)
    
    print("Analyzing content gaps...")
    gaps = analyzer.analyze_content_gaps()
    
    print(f"Found {len(trends)} trend analyses")
    print(f"Found {len(gaps)} content gaps")
    
    # データベース保存
    if args.save_db:
        print("Saving analysis to database...")
        analyzer.save_trend_analysis(trends)
    
    # レポート生成
    output_dir = Path(args.output)
    generator = ReportGenerator(output_dir)
    
    print("Generating reports...")
    
    # Markdownレポート
    markdown_report = generator.generate_markdown_report(trends, gaps)
    report_path = output_dir / f"exam_trend_analysis_{datetime.now().strftime('%Y%m%d')}.md"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(markdown_report)
    
    print(f"Markdown report saved: {report_path}")
    
    # チャート生成
    try:
        generator.generate_charts(trends, gaps)
        print(f"Charts saved to: {output_dir}")
    except Exception as e:
        print(f"Warning: Failed to generate charts: {e}")
    
    # JSON出力
    analysis_data = {
        'analysis_date': datetime.now().isoformat(),
        'trends': [asdict(t) for t in trends],
        'content_gaps': [asdict(g) for g in gaps],
        'summary': {
            'total_analyses': len(trends),
            'total_gaps': len(gaps),
            'high_priority_gaps': len([g for g in gaps if g.gap_priority >= 8]),
            'increasing_trends': len([t for t in trends if t.frequency_trend == 'increasing'])
        }
    }
    
    json_path = output_dir / f"analysis_data_{datetime.now().strftime('%Y%m%d')}.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(analysis_data, f, indent=2, ensure_ascii=False)
    
    print(f"JSON data saved: {json_path}")
    print("Analysis completed!")

if __name__ == "__main__":
    main() 