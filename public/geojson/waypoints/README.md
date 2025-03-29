# ウェイポイントデータについて

このディレクトリには、航空ナビゲーション用のウェイポイントデータが含まれています。データは管理しやすいように以下の方法で分割されています。

## ファイル構造

### アルファベット別の分割

ウェイポイント識別子（ID）の最初の文字に基づいて分割されています。

- `waypoints_A.json` - Aで始まるウェイポイント
- `waypoints_B.json` - Bで始まるウェイポイント
- ...
- `waypoints_Z.json` - Zで始まるウェイポイント

これらのファイルをまとめて参照するためのインデックスは `index.json` にあります。

### 地域別の分割

日本の地域に基づいて分割されています。

- `waypoints_region_hokkaido.json` - 北海道地域のウェイポイント
- `waypoints_region_tohoku.json` - 東北地域のウェイポイント
- `waypoints_region_kanto.json` - 関東地域のウェイポイント
- `waypoints_region_chubu.json` - 中部地域のウェイポイント
- `waypoints_region_kinki.json` - 近畿地域のウェイポイント
- `waypoints_region_chugoku.json` - 中国地域のウェイポイント
- `waypoints_region_shikoku.json` - 四国地域のウェイポイント
- `waypoints_region_kyushu.json` - 九州地域のウェイポイント
- `waypoints_region_okinawa.json` - 沖縄地域のウェイポイント
- `waypoints_region_others.json` - その他の地域のウェイポイント

地域別のインデックスは `regions_index.json` にあります。

## データ形式

すべてのファイルはGeoJSON形式で、以下の構造になっています：

```json
{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "ABCDE",
        "type": "Non-Compulsory",
        "name1": "ウェイポイント名"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [経度, 緯度]
      }
    },
    // ...他のウェイポイント
  ]
}
```

### 座標形式

座標データは次の形式で統一されています：
- 経度：ddd.dddd（小数点以下4桁）
- 緯度：dd.dddd（小数点以下4桁）

例：`[135.4414, 33.3644]`

## 使用方法

アプリケーションの必要に応じて、アルファベット別または地域別にデータを読み込むことができます。

例えば、特定のIDのウェイポイントを検索する場合はアルファベット別のファイルを、特定の地域のウェイポイントを表示する場合は地域別のファイルを使用すると効率的です。

## 更新履歴

- 2025-04-15: Zで始まるウェイポイントを7件追加（ZAIHO, ZAKMI, ZAKRO, ZARON, ZELBU, ZOHRA, ZUSHI）
- 2025-04-14: Yで始まるウェイポイントを34件追加（YACHI, YADAR, YAESU, YAMEK, YAMGA, YANAI, YAOKO, YARII, YASAK, YASYE, YAYOI, YEELY, YODAI, YODOH, YOJIL, YOKKA, YOKOH, YONAGO, YONEX, YOROI, YORON, YOSEI, YOTEI, YOZAN, YUBAR, YUCCA, YUDAR, YUKII, YUMII, YURAH, YURRY, YUTAN, YUUNO, YUWAN）
- 2025-04-13: Wで始まるウェイポイントを11件追加（WADAH, WAKSA, WANKO, WAPPA, WASYU, WAVES, WHALE, WHITE, WILBA, WIMPY, WOODY）
- 2025-04-12: Vで始まるウェイポイントを7件追加（VABLU, VADAR, VASHU, VELLA, VELNO, VIGER, VIRGO）
- 2025-04-11: Uで始まるウェイポイントを22件追加（UBE, UBRAS, UBSOL, UENOH, UGAMU, UGOLU, UKAKU, UMAKI, UNIEY, UPLOK, URAGA, URAJA, URUMA, URUSI, USIKU, USSAH, USUBA, UTAKI, UTAZU, UTIBO, UTIMA, UWAJI）
- 2025-04-10: Tで始まるウェイポイントを33件追加（TILAN, TOBBY, TOGIL, TOHNE, TOKUNOSHIMA, TOKUSHIMA, TOLOT, TOMAM, TOMIE, TOMOH, TOMOL, TONOH, TOPAT, TORIK, TOSAR, TOSKO, TOTTORI, TOUSE, TOZAK, TOZAN, TRACY, TRIKE, TRUGA, TSUGA, TSUGU, TSUKA, TSUNO, TSURU, TSUSHIMA, TUBAS, TUJUN, TUMGI, TUTMI）
- 2025-04-09: Tで始まるウェイポイントを27件追加（TATSU, TAVIS, TAXIR, TAYAS, TEBEK, TEBES, TECHI, TEKKO, TELMA, TELOB, TEMAR, TEMIP, TEMIS, TENAG, TENRU, TENSI, TENSO, TEPPO, TERAD, TERAS, TESAB, TETRA, TEZAN, THETA, TIDRI, TIGER, TIKYU）
- 2025-04-08: Tで始まるウェイポイントを18件追加（TAIKI, TAIME, TAISI, TAIYO, TAKAS, TAKDA, TAKEO, TAKMA, TAKNE, TAKRA, TAKZO, TALBA, TALMI, TAMAK, TAMBA, TANNO, TANSO, TAPPI）
- 2025-04-07: Sで始まるウェイポイントを24件追加（SHRAK, SRUGA, STAGE, STONE, STORK, STRAW, SUIHO, SUIKA, SUKMO, SUMAR, SUMOT, SUMOU, SUNFL, SUNNS, SUOH, SURIB, SUSAK, SUSAR, SUVEN, SUZKI, SWAMP, SWING, SYONA, SYOWA）
- 2025-04-06: Sで始まるウェイポイントを19件追加（SINGO, SINWA, SIOJI, SIOTY, SIRAO, SIRAS, SIROK, SIZMI, SLIDE, SMILE, SNOKE, SNOOK, SOARA, SOBAR, SONBU, SONIC, SOOMY, SORYU, SOUMA）
- 2025-04-05: Sで始まるウェイポイントを24件追加（SEMKI, SETOH, SGIRA, SHARK, SHATI, SHELL, SHIHO, SHIMA, SHIMOJISHIMA, SHINE, SHINO, SHION, SHIZUOKA, SHODA, SHONAI, SHUJI, SIBAT, SIGAK, SIIBA, SIJMI, SILGA, SIMAG, SIMAK, SIMAZ）
- 2025-04-04: Sで始まるウェイポイントを25件追加（SANPO, SAORY, SAPEM, SAPET, SAPIM, SAPIS, SARBA, SAROM, SASIK, SASSY, SATAH, SAUNA, SAVER, SAVIT, SAYAK, SAZAN, SAZMA, SCOLI, SCOTT, SCUBA, SEALS, SEBGA, SEBRO, SEIFA, SEKYY）
- 2025-04-03: Sで始まるウェイポイントを18件追加（SABAK, SABRI, SAEKI, SAGRA, SAILS, SAIRO, SAKAI, SAKIN, SAKYU, SALID, SALSA, SALVO, SAMAX, SAMBA, SANDA, SANDN, SANGO, SANKO）
- 2025-04-02: R始まりのウェイポイントを15件追加（ROUSY, RUGBY, RUMED, RUMOI, RUNEX, RUNID, RUNPA, RURIK, RYOMA, RYOSA, RYUDO, RYUGU, RYUKI, RYUMO, RYUOH）
- 2025-04-01: R始まりのウェイポイントを22件追加、アルファベット順に並び替え（RACKO, RAIKO, RAISU, RAKNO, RALPH, RASYA, RAUSU, RENAU, REPOG, RIASU, RINDO, RINGO, RINTU, RIPPU, RIPSI, RISBA, RITTO, ROBIN, ROCKY, ROKKO, ROMNY, RONIE）
- 2025-03-31: P始まりのウェイポイントを16件追加（PIXIE, PIXUS, POKER, POLAM, POMAS, PONAP, PONTO, POPAI, POPPY, POROT, POTET, PRADA, PROBE, PUDOG, PUKUK, PUNCH）
- 2025-03-30: P始まりのウェイポイントをアルファベット順に並び替え
- 2025-03-29: P始まりのウェイポイントを19件追加（PABBA, PADOC, PAKMU, PALVA, PANAS, PANCH, PANKE, PAPNA, PARCO, PARTY, PATRA, PAULO, PAYAO, PEARL, PEARS, PEKAN, PERID, PILIV, PINNE）
- 2025-03-28: ウェイポイントのname1を修正（OMUTA: オオムタ→オームタ, OTAKI: オオタキ→オタキ）
- 2025-03-27: O始まりのウェイポイントを47件追加
- 2025-03-26: Oのウェイポイントをアルファベット順にソート
- 2025-03-25: 座標形式を統一（経度：ddd.dddd、緯度：dd.dddd）
- 2025-03-24: A〜Cのウェイポイントをアルファベット順にソート
- 2025-03-23: 新規ウェイポイントの追加（A, B領域）
- 2025-03-22: 元のWaypoints.jsonからアルファベット別および地域別に分割 