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

最終更新日: 2024年7月16日

## 更新履歴
### 2024年7月16日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Zで始まるウェイポイント: ZAIHO, ZAKMI, ZAKRO, ZARON, ZELBU, ZOHRA, ZUSHI

### 2024年7月15日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Yで始まるウェイポイント: YACHI, YADAR, YAESU, YAMEK, YAMGA, YANAI, YAOKO, YARII, YASAK, YASYE, YAYOI, YEELY, YODAI, YODOH, YOJIL, YOKKA, YOKOH, YONAGO, YONEX, YOROI, YORON, YOSEI, YOTEI, YOZAN, YUBAR, YUCCA, YUDAR, YUKII, YUMII, YURAH, YURRY, YUTAN, YUUNO, YUWAN

### 2024年7月14日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Wで始まるウェイポイント: WADAH, WAKSA, WANKO, WAPPA, WASYU, WAVES, WHALE, WHITE, WILBA, WIMPY, WOODY

### 2024年7月13日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Vで始まるウェイポイント: VABLU, VADAR, VASHU, VELLA, VELNO, VIGER, VIRGO

### 2024年7月12日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Uで始まるウェイポイント: UBE, UBRAS, UBSOL, UENOH, UGAMU, UGOLU, UKAKU, UMAKI, UNIEY, UPLOK, URAGA, URAJA, URUMA, URUSI, USIKU, USSAH, USUBA, UTAKI, UTAZU, UTIBO, UTIMA, UWAJI

### 2024年7月11日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Tで始まるウェイポイント: TILAN, TOBBY, TOGIL, TOHNE, TOKUNOSHIMA, TOKUSHIMA, TOLOT, TOMAM, TOMIE, TOMOH, TOMOL, TONOH, TOPAT, TORIK, TOSAR, TOSKO, TOTTORI, TOUSE, TOZAK, TOZAN, TRACY, TRIKE, TRUGA, TSUGA, TSUGU, TSUKA, TSUNO, TSURU, TSUSHIMA, TUBAS, TUJUN, TUMGI, TUTMI

### 2024年7月10日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Tで始まるウェイポイント: TATSU, TAVIS, TAXIR, TAYAS, TEBEK, TEBES, TECHI, TEKKO, TELMA, TELOB, TEMAR, TEMIP, TEMIS, TENAG, TENRU, TENSI, TENSO, TEPPO, TERAD, TERAS, TESAB, TETRA, TEZAN, THETA, TIDRI, TIGER, TIKYU

### 2024年7月9日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Tで始まるウェイポイント: TAIKI, TAIME, TAISI, TAIYO, TAKAS, TAKDA, TAKEO, TAKMA, TAKNE, TAKRA, TAKZO, TALBA, TALMI, TAMAK, TAMBA, TANNO, TANSO, TAPPI

### 2024年7月8日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Sで始まるウェイポイント: SHRAK, SRUGA, STAGE, STONE, STORK, STRAW, SUIHO, SUIKA, SUKMO, SUMAR, SUMOT, SUMOU, SUNFL, SUNNS, SUOH, SURIB, SUSAK, SUSAR, SUVEN, SUZKI, SWAMP, SWING, SYONA, SYOWA

### 2024年7月7日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Sで始まるウェイポイント: SINGO, SINWA, SIOJI, SIOTY, SIRAO, SIRAS, SIROK, SIZMI, SLIDE, SMILE, SNOKE, SNOOK, SOARA, SOBAR, SONBU, SONIC, SOOMY, SORYU, SOUMA

### 2024年7月6日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Sで始まるウェイポイント: SEMKI, SETOH, SGIRA, SHARK, SHATI, SHELL, SHIHO, SHIMA, SHIMOJISHIMA, SHINE, SHINO, SHION, SHIZUOKA, SHODA, SHONAI, SHUJI, SIBAT, SIGAK, SIIBA, SIJMI, SILGA, SIMAG, SIMAK, SIMAZ

### 2024年7月5日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Sで始まるウェイポイント: SANPO, SAORY, SAPEM, SAPET, SAPIM, SAPIS, SARBA, SAROM, SASIK, SASSY, SATAH, SAUNA, SAVER, SAVIT, SAYAK, SAZAN, SAZMA, SCOLI, SCOTT, SCUBA, SEALS, SEBGA, SEBRO, SEIFA, SEKYY

### 2024年7月4日
- 以下のNon-Compulsoryウェイポイントを追加：
  - Sで始まるウェイポイント: SABAK, SABRI, SAEKI, SAGRA, SAILS, SAIRO, SAKAI, SAKIN, SAKYU, SALID, SALSA, SALVO, SAMAX, SAMBA, SANDA, SANDN, SANGO, SANKO
  - 中部地域: RYUDO
  - 近畿地域: RUNEX
  - 中国地域: RYOMA, RYUOH
  - 九州地域: RYUGU, RYUMO
  - 沖縄地域: RURIK, RYOSA, RYUKI 
