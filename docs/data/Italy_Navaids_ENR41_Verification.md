# イタリア NAVAID 点検報告（AIP ENR 4.1）

点検日: 2026-11-11（Asia/Tokyo）
対象 PDF: `AIS_ITALY_ENR_4.pdf`（AIP Italia ENR 4、182 ページの編集済み pAIP）
提出データ: `Navaids_ITALY_submitted.json`（57 件）

## 出典と発効日

ENR 4.1 の各シートは改正日が揃っていない（編集済み pAIP）。単一の AIRAC 日付は付けられない。

**ENR 4.1.1 Radio Navigation Aids — Enroute**（PDF p.1–12）

| シート | AIRAC 発効日 | 改正 |
|---|---|---|
| ENR 4.1.1-1～2 | 07 AUG 2025 | A08/25 |
| ENR 4.1.1-3～4 | 16 APR 2026 | A04/26 |
| ENR 4.1.1-5～6 | 06 AUG 2026 | A08/26 |
| ENR 4.1.1-7～12 | 11 JUN 2026 | A06/26 |

**ENR 4.1.2 Military Radio Aids Not Included in AD Section**（PDF p.13–18。p.18 は本文なし）

| シート | AIRAC 発効日 | 改正 |
|---|---|---|
| ENR 4.1.2-1～2 | 06 AUG 2026 | A08/26 |
| ENR 4.1.2-3～4 | 28 NOV 2024 | A12/24 |
| ENR 4.1.2-5～6 | 26 DEC 2024 | A13/24 |

このファイル内の ENR 4.1 シートで最も新しい発効日は 06 AUG 2026（A08/26）、最も古いのは 28 NOV 2024（A12/24）。ENR 4.2（Special Navigation Systems）と ENR 4.3（GNSS）は NIL。ENR 4.4 はウェイポイント、ENR 4.5 は地上灯で、今回の対照対象外。

## 件数

| | 件数 | 内訳 |
|---|---:|---|
| AIP ENR 4.1.1 + 4.1.2 | 56 | 4.1.1 が 39、4.1.2 が 17 |
| 提出 JSON | 57 | VORTAC 6、VOR 31、TACAN 13、NDB 7 |
| 点検後 GeoJSON | 56 | VORTAC 6、VOR 31、TACAN 12、NDB 7 |

AIP 上の正式種別（4.1.1 + 4.1.2）: VOR/DME 23、DVOR/DME 6、TVOR/DME 1、DVOR 1、VORTAC 6、TACAN 12、NDB 5、L（Locator）2。スタンドアロン DME は掲載なし。

地図側の `type` は日本ファイルに合わせた。VOR/DME・DVOR/DME・TVOR/DME・DVOR は `VOR`（ch ありは VOR/DME 相当、GRO の DVOR だけ ch なし）。Locator は `NDB` とした。

座標は VOR/DVOR/TVOR アンテナを採用（DME / TACAN アンテナが別に出ている局がある）。小数第 4 位に四捨五入。提出データとの座標差は、照合できた 55 局すべて 0 m（閾値 0.002° を超える差なし）。

## 相違点

1. **提出にあって ENR 4.1 にない局（1 件）**  
   TACAN DEC DECIMOMANNU、ch 74x、座標 [8.9717, 39.3542]。ENR 4.1.1 / 4.1.2 に掲載なし。4.1.2 は「AD に載っていない軍用援助」だけなので、AD 節（LIED など）にだけ出ている可能性はあるが、この PDF では確認できない。点検後ファイルには入れていない。〔推定〕

2. **AIP に座標がない局（1 件）**  
   GROSSETO DVOR（GRO、109.85 MHz、ch なし）。ENR 4.1.1-4（AIRAC 16 APR 2026、A04/26）の座標欄は空欄（ページ画像でも空）。提出の [11.0717, 42.7597] を点検後ファイルに仮置きし、metadata に「AIP にない値」と注記した。未検証。〔不確実〕

3. **局名（name2）の不足（2 件）**  
   - CTF: AIP は `CATANIA/Fontanarossa`、提出は `CATANIA`（ENR 4.1.1-3）  
   - PAL: AIP は `PALERMO/Punta Raisi`、提出は `PALERMO`（ENR 4.1.1-6）  
   点検後ファイルは AIP の表記にした。識別符号・周波数・チャンネル・座標は一致。

4. **AIP 種別が NDB ではなく L（Locator）の局（2 件）**  
   - PIS 379 kHz（ENR 4.1.1-7）  
   - GRA 343 kHz（ENR 4.1.2-3）  
   提出はどちらも NDB。地図の type は NDB のままにし、metadata に AIP 種別を記した。周波数と座標は一致。

5. **欠けている AIP 局はなし。** 識別符号・地図 type・周波数・チャンネルの誤りも、上記以外にはない。提出の「VOR + ch」は、AIP の VOR/DME（および DVOR/DME・TVOR/DME）に対応しており、日本ファイルの書き方と一致する。誤りではない。

6. **同じ識別符号が 2 局ある組**（AIP どおり、提出も分離済み）: PIS（DVOR/DME と L）、TRP（NDB と VORTAC）、AVI（NDB と TACAN）、GRA（L と TACAN）、RIV（NDB と TACAN）、SIG（NDB と TACAN）。アプリが `id` だけで局を識別すると、片方が消える。

## 成果物

- `/workspace/gungi/flightacademy/italy/Navaids_ITALY_checked.geojson`  
  日本ファイルと同じプロパティ（type, name1, name2, id, ch, freq）。先頭 metadata に出典、シートごとの AIRAC、生成日（2026-11-11）、注記を入れた。
- `/workspace/gungi/flightacademy/italy/extract_enr41_navaids.py`  
  `pdftotext -bbox` で ENR 4.1.1 / 4.1.2 を読み、上記 GeoJSON を再現する。GRO の仮座標だけはスクリプト内の `UNVERIFIED_COORDS` から入れる（AIP の値ではない）。
- `/workspace/gungi/flightacademy/italy/check_report.md`（本報告）

リポジトリと上様のパソコンのファイルは変更していない。
