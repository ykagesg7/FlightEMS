# FlightAcademyTsx

飛行計画のための対話型ウェブアプリケーション。

## 主な機能
- 対話型マップインターフェースでのフライトプランニング
- 空港、NAVAIDs、ウェイポイントの表示と選択
- フライトパラメータの設定と管理
- ルート情報の詳細表示と計算
- 気象データの取得と活用

詳細な機能リストは[技術ドキュメント](./DOCUMENTATION.md)を参照してください。

## セットアップ手順

1. **リポジトリをクローン**:
   ```
   git clone https://github.com/yourusername/FlightAcademyTsx.git
   cd FlightAcademyTsx
   ```

2. **依存関係のインストール**:
   ```
   npm install
   ```

3. **環境変数の設定**:
   `.env`ファイルを作成し、以下の内容を設定：
   ```
   VITE_WEATHER_API_KEY=your_weather_api_key
   ```

4. **開発サーバーの起動**:
   ```
   npm run dev
   ```

5. **ビルド**:
   ```
   npm run build
   ```

## 主要技術
- React
- TypeScript
- Vite
- Leaflet
- Tailwind CSS
- Weather API

## 関連ドキュメント
- [技術ドキュメント](./DOCUMENTATION.md) - プロジェクトの技術的な設計と実装の詳細
- [開発状況](./DEVELOPMENT_STATUS.md) - 現在の実装状況と今後の開発計画
- [開発参加ガイド](./CONTRIBUTING.md) - プロジェクトへの貢献方法

## ライセンス
MIT

## 利用における注意事項
このプロジェクトは航空関連の教育・訓練を目的としており、実際のフライトナビゲーションに使用することは推奨されません。訓練と学習の補助ツールとしてご利用ください。

最終更新日: 2024年7月2日 