#!/usr/bin/env python3
"""
CPL試験データの出題傾向分析と推奨コンテンツ生成システム
Phase 2: 試験逆算学習システム
"""

import os
import json
import pandas as pd
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
from collections import defaultdict, Counter
import numpy as np

# Supabase接続設定
from supabase import create_client, Client
import logging

# ログ設定
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CPLExamTrendAnalyzer:
    """CPL試験データの出題傾向分析クラス"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.exam_data = []
        self.trend_data = {}
        
    def fetch_unified_cpl_data(self) -> List[Dict]:
        """unified_cpl_questionsテーブルからデータを取得"""
        try:
            response = self.supabase.table('unified_cpl_questions').select('*').execute()
            self.exam_data = response.data
            logger.info(f"取得したCPL問題数: {len(self.exam_data)}")
            return self.exam_data
        except Exception as e:
            logger.error(f"データ取得エラー: {e}")
            return []
    
    def analyze_subject_trends(self) -> Dict[str, Dict]:
        """科目別出題傾向を分析"""
        if not self.exam_data:
            logger.warning("分析対象データがありません")
            return {}
        
        subject_stats = defaultdict(lambda: {
            'total_questions': 0,
            'by_year': defaultdict(int),
            'by_sub_category': defaultdict(int),
            'difficulty_distribution': defaultdict(int),
            'trend_score': 0.0
        })
        
        # データの集計
        for question in self.exam_data:
            main_subject = question.get('main_subject', 'その他')
            sub_subject = question.get('sub_subject', 'その他')
            exam_date = question.get('exam_date', '')
            
            # 年度の抽出
            year = None
            if exam_date:
                try:
                    year = datetime.strptime(exam_date, '%Y-%m-%d').year
                except:
                    # exam_dateが異なる形式の場合の処理
                    try:
                        year = int(exam_date[:4])
                    except:
                        year = 2024  # デフォルト年度
            
            subject_stats[main_subject]['total_questions'] += 1
            if year:
                subject_stats[main_subject]['by_year'][year] += 1
            subject_stats[main_subject]['by_sub_category'][sub_subject] += 1
            
            # 難易度の推定（問題の文字数や複雑さから）
            difficulty = self._estimate_difficulty(question)
            subject_stats[main_subject]['difficulty_distribution'][difficulty] += 1
        
        # 傾向スコアの計算
        for subject, stats in subject_stats.items():
            stats['trend_score'] = self._calculate_trend_score(stats)
            stats['avg_difficulty'] = self._calculate_avg_difficulty(stats['difficulty_distribution'])
        
        self.trend_data = dict(subject_stats)
        return self.trend_data
    
    def _estimate_difficulty(self, question: Dict) -> int:
        """問題の難易度を推定（1-5）"""
        question_text = question.get('question_text', '')
        options = question.get('options', [])
        
        difficulty = 1
        
        # 文字数による判定
        if len(question_text) > 200:
            difficulty += 1
        if len(question_text) > 400:
            difficulty += 1
        
        # 専門用語の数による判定
        technical_terms = ['空港', '航空機', '計器', '飛行場', '管制塔', '滑走路', 
                          'ILS', 'VOR', 'DME', 'RNAV', 'GPS', 'TACAN']
        term_count = sum(1 for term in technical_terms if term in question_text)
        if term_count >= 3:
            difficulty += 1
        if term_count >= 5:
            difficulty += 1
        
        return min(difficulty, 5)
    
    def _calculate_trend_score(self, stats: Dict) -> float:
        """傾向スコアを計算（出題頻度と重要度から）"""
        total = stats['total_questions']
        if total == 0:
            return 0.0
        
        # 出題頻度スコア（0-5）
        frequency_score = min(total / 50.0 * 5, 5.0)
        
        # 継続性スコア（0-5）：複数年度にわたる出題
        years_count = len(stats['by_year'])
        continuity_score = min(years_count / 3.0 * 5, 5.0)
        
        return (frequency_score + continuity_score) / 2
    
    def _calculate_avg_difficulty(self, difficulty_dist: Dict[int, int]) -> float:
        """平均難易度を計算"""
        if not difficulty_dist:
            return 1.0
        
        total_questions = sum(difficulty_dist.values())
        weighted_sum = sum(difficulty * count for difficulty, count in difficulty_dist.items())
        
        return weighted_sum / total_questions if total_questions > 0 else 1.0
    
    def generate_content_recommendations(self) -> List[Dict]:
        """推奨コンテンツ生成"""
        if not self.trend_data:
            logger.warning("傾向データがありません")
            return []
        
        recommendations = []
        
        for subject, stats in self.trend_data.items():
            # 高頻度・高重要度の科目を対象
            if stats['trend_score'] >= 3.0 and stats['total_questions'] >= 10:
                
                # サブカテゴリ別の推奨記事
                for sub_category, count in stats['by_sub_category'].items():
                    if count >= 5:  # 最低5問以上出題されている分野
                        
                        priority_score = min(int(stats['trend_score'] * 2), 10)
                        coverage_gap = self._calculate_coverage_gap(subject, sub_category)
                        
                        recommendation = {
                            'subject_category': subject,
                            'sub_category': sub_category,
                            'priority_score': priority_score,
                            'recommended_title': f"{subject} - {sub_category} 完全攻略",
                            'coverage_gap_percentage': coverage_gap,
                            'estimated_impact_score': stats['trend_score'],
                            'estimated_study_time': self._estimate_study_time(count, stats['avg_difficulty']),
                            'target_difficulty_level': int(stats['avg_difficulty']),
                            'suggested_outline': self._generate_outline(subject, sub_category),
                            'related_learning_contents': self._find_related_contents(subject)
                        }
                        
                        recommendations.append(recommendation)
        
        # 優先度順にソート
        recommendations.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return recommendations[:20]  # 上位20件
    
    def _calculate_coverage_gap(self, subject: str, sub_category: str) -> float:
        """コンテンツカバレッジのギャップを計算"""
        # 既存の学習コンテンツとのマッピングを確認
        try:
            response = self.supabase.table('learning_test_mapping')\
                .select('*')\
                .eq('topic_category', subject)\
                .execute()
            
            existing_mappings = len(response.data)
            expected_mappings = self.trend_data[subject]['by_sub_category'][sub_category]
            
            if expected_mappings == 0:
                return 0.0
            
            coverage_rate = min(existing_mappings / expected_mappings, 1.0)
            return (1.0 - coverage_rate) * 100
            
        except Exception as e:
            logger.warning(f"カバレッジギャップ計算エラー: {e}")
            return 50.0  # デフォルト値
    
    def _estimate_study_time(self, question_count: int, avg_difficulty: float) -> int:
        """推定学習時間（分）を計算"""
        base_time = question_count * 5  # 1問あたり基本5分
        difficulty_multiplier = 1 + (avg_difficulty - 1) * 0.3  # 難易度に応じた倍数
        
        return int(base_time * difficulty_multiplier)
    
    def _generate_outline(self, subject: str, sub_category: str) -> List[str]:
        """推奨記事構成を生成"""
        outlines = {
            '航空法規': [
                '1. 基本概念と定義',
                '2. 関連法令の構造',
                '3. 実務上の注意点',
                '4. 過去問題分析',
                '5. 実践演習'
            ],
            '航空工学': [
                '1. 基礎理論の解説',
                '2. 計算方法とコツ',
                '3. 図表の読み方',
                '4. 典型問題パターン',
                '5. 応用問題対策'
            ],
            '航空気象': [
                '1. 気象現象の基礎',
                '2. 観測データの読み方',
                '3. 予報の活用方法',
                '4. 安全運航への応用',
                '5. 事例研究'
            ],
            '空中航法': [
                '1. 航法の基本原理',
                '2. 機器の使用方法',
                '3. 計算手順とコツ',
                '4. エラー回避法',
                '5. 実戦的演習'
            ],
            '航空通信': [
                '1. 通信の基本ルール',
                '2. 標準用語と表現',
                '3. 緊急時の対応',
                '4. 実践的会話例',
                '5. 演習問題'
            ]
        }
        
        return outlines.get(subject, [
            '1. 基本概念の理解',
            '2. 重要ポイントの整理',
            '3. 過去問題の分析',
            '4. 実践的演習',
            '5. まとめと確認'
        ])
    
    def _find_related_contents(self, subject: str) -> List[str]:
        """関連する既存学習コンテンツを検索"""
        try:
            response = self.supabase.table('learning_test_mapping')\
                .select('learning_content_id')\
                .eq('topic_category', subject)\
                .execute()
            
            return [item['learning_content_id'] for item in response.data]
        except Exception as e:
            logger.warning(f"関連コンテンツ検索エラー: {e}")
            return []
    
    def save_analysis_results(self) -> bool:
        """分析結果をデータベースに保存"""
        try:
            # 1. 出題傾向分析結果の保存
            for subject, stats in self.trend_data.items():
                for sub_category, count in stats['by_sub_category'].items():
                    if count >= 3:  # 最低3問以上の分野のみ保存
                        
                        # 傾向判定
                        trend = self._determine_trend(stats['by_year'])
                        
                        analysis_record = {
                            'analysis_date': date.today().isoformat(),
                            'subject_category': subject,
                            'sub_category': sub_category,
                            'question_count': count,
                            'avg_difficulty': round(stats['avg_difficulty'], 2),
                            'frequency_trend': trend,
                            'trend_score': round(stats['trend_score'], 2),
                            'yearly_data': dict(stats['by_year']),
                            'analysis_notes': f"出題頻度: {count}問, 平均難易度: {stats['avg_difficulty']:.2f}"
                        }
                        
                        # upsert操作（存在する場合は更新）
                        self.supabase.table('exam_trend_analysis').upsert(
                            analysis_record,
                            on_conflict='analysis_date,subject_category,sub_category'
                        ).execute()
            
            # 2. 推奨コンテンツの保存
            recommendations = self.generate_content_recommendations()
            for rec in recommendations:
                self.supabase.table('content_recommendations').insert(rec).execute()
            
            logger.info(f"分析結果を保存しました: {len(self.trend_data)}科目, {len(recommendations)}推奨コンテンツ")
            return True
            
        except Exception as e:
            logger.error(f"分析結果保存エラー: {e}")
            return False
    
    def _determine_trend(self, yearly_data: Dict[int, int]) -> str:
        """出題傾向の判定（増加/安定/減少）"""
        if len(yearly_data) < 2:
            return 'stable'
        
        years = sorted(yearly_data.keys())
        values = [yearly_data[year] for year in years]
        
        # 最近3年間の傾向を確認
        recent_years = years[-3:] if len(years) >= 3 else years
        recent_values = [yearly_data[year] for year in recent_years]
        
        if len(recent_values) < 2:
            return 'stable'
        
        # 傾向の判定
        first_half = sum(recent_values[:len(recent_values)//2])
        second_half = sum(recent_values[len(recent_values)//2:])
        
        if second_half > first_half * 1.2:
            return 'increasing'
        elif second_half < first_half * 0.8:
            return 'decreasing'
        else:
            return 'stable'

def main():
    """メイン処理"""
    # 環境変数から設定を取得
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        logger.error("Supabase設定が見つかりません")
        return
    
    analyzer = CPLExamTrendAnalyzer(supabase_url, supabase_key)
    
    # データ取得と分析
    logger.info("CPL試験データの取得開始...")
    exam_data = analyzer.fetch_unified_cpl_data()
    
    if not exam_data:
        logger.error("分析対象データが取得できませんでした")
        return
    
    logger.info("出題傾向の分析開始...")
    trend_data = analyzer.analyze_subject_trends()
    
    logger.info("推奨コンテンツの生成開始...")
    recommendations = analyzer.generate_content_recommendations()
    
    # 結果の保存
    logger.info("分析結果の保存開始...")
    success = analyzer.save_analysis_results()
    
    if success:
        logger.info("=== 分析完了 ===")
        logger.info(f"分析対象科目: {len(trend_data)}")
        logger.info(f"推奨コンテンツ: {len(recommendations)}")
        
        # サマリー出力
        print("\n=== 出題傾向分析結果 ===")
        for subject, stats in sorted(trend_data.items(), key=lambda x: x[1]['trend_score'], reverse=True):
            print(f"{subject}: {stats['total_questions']}問 (傾向スコア: {stats['trend_score']:.2f})")
        
        print(f"\n=== 推奨コンテンツ（上位5位） ===")
        for i, rec in enumerate(recommendations[:5], 1):
            print(f"{i}. {rec['recommended_title']} (優先度: {rec['priority_score']})")
    else:
        logger.error("分析結果の保存に失敗しました")

if __name__ == "__main__":
    main() 