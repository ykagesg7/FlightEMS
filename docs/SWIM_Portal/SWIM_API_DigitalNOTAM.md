# SWIM サービス API 連携仕様書 付録 04 — デジタルノータムリクエストサービス

**発行:** 国土交通省 航空局  
**版:** Ver 1.0.1（2025 年 5 月 30 日）  
**サービス ID:** S2019（共通編 別紙 1 参照）

> 本文書は PDF 原本の転記・整形です。**WebAPI の認証・Cookie・セッション**は [SWIM_API_Common.md](./SWIM_API_Common.md) の共通編に従います（ログイン API → `Set-Cookie` → 各 API で `Cookie` 付与）。本付録のリクエストに `userId` クエリがある場合でも、実装時は原本・ポータル手順と照合してください。

## 改版履歴

| # | 版名  | 発行日    | 改訂内容           |
|---|-------|-----------|--------------------|
| 1 | 1.0   | 2025/1/10 | 初版               |
| 2 | 1.0.1 | 2025/5/30 | 別紙 2, 4 誤記修正 |

---

## 1. はじめに

本付録は HTTP による WebAPI を利用したアプリケーション間インタフェースについて規定したもので、**デジタルノータムリクエストサービス**に関する技術資料である。

---

## 2. メッセージフォーマット

デジタルノータムリクエストサービスの SWIM サービス提供システム — 利用者システム間の業務メッセージ本文について詳細を記載する。

### 2.1 利用者システム → SWIM サービス提供システムの WebAPI 一覧

利用者システムから SWIM サービス提供システム宛の WebAPI 一覧を **別紙 1** に示す。

### 2.2 利用者システム → SWIM サービス提供システムの WebAPI インタフェース仕様

利用者システムから SWIM サービス提供システム宛の WebAPI インタフェース仕様を **別紙 2** に示す。

### 2.3 SWIM サービス提供システム → 利用者システムの WebAPI 一覧

SWIM サービス提供システムから利用者システム宛の WebAPI 一覧を **別紙 3** に示す。

### 2.4 SWIM サービス提供システム → 利用者システムの WebAPI インタフェース仕様

SWIM サービス提供システムから利用者システム宛の WebAPI インタフェース仕様を **別紙 4** に示す。

---

## 3. その他

なし。

---

## 別紙 1 — 利用者システム → SWIM サービス提供システムの WebAPI 一覧

| 項 | 交換データ           | データ交換方式 | データ形式     | コード体系 | タイミング                                         | 備考 |
|----|----------------------|----------------|----------------|------------|----------------------------------------------------|------|
| 1  | デジタルノータム検索要求 | http           | 可変長文字列   | UTF-8      | 利用者システムからデジタルノータムの検索時       |      |

---

## 別紙 2 — WebAPI インタフェース仕様（デジタルノータム検索要求）

| 機能 ID | サービス名                 | API ID    | API 名                 |
|---------|----------------------------|-----------|------------------------|
| FUV205  | デジタルノータムリクエストサービス | FUV205001 | デジタルノータム検索要求 |

### 1. 概要

検索条件に該当するデジタルノータムを要求する。

### 2. API 詳細

#### （1）文字コード

UTF-8

#### （2）リクエスト

**リクエスト形式**

| 項目     | 内容   |
|----------|--------|
| メソッド | `GET`  |

**URL（テンプレート）**

```http
GET https://web.swim.mlit.go.jp/f2dnrq/web/search?userId={アカウントID}&nof={NOF}&fir={FIR}&location={ロケーション}&notamCode={ノータムコード}&series={シリーズ}&notamNr={ノータム番号}&uuid={UUID}&lowerFL={下限高度}&upperFL={上限高度}&keyword={キーワード}&andOrCondition={AND・OR検索}&display={有効無効}&validDatetimeStart={有効開始日時}&validDatetimeEnd={有効終了日時}&issueDatetime={発行日時}
```

**リクエストパラメータ**

| 項目名（英字）     | 項目名（日本語）   | 設定内容                         | 必須 | 備考 |
|--------------------|--------------------|----------------------------------|------|------|
| `userId`           | アカウント ID      | ログインアカウント ID            | ○    |      |
| `nof`              | NOF                | NOF                              |      |      |
| `fir`              | FIR                | 飛行情報区                       |      |      |
| `location`         | ロケーション       | 地点略号                         |      | 複数指定時は `+` で区切る |
| `notamCode`        | ノータムコード     | ノータムコード                   |      | 2 桁または 4 桁 |
| `series`           | シリーズ           | シリーズ                         |      |      |
| `notamNr`          | ノータム番号       | `9999/99` 形式                   |      | 通番／年次 |
| `uuid`             | UUID               | フィーチャ ID                    |      |      |
| `lowerFL`          | 下限高度           | `000`～`999`                     |      |      |
| `upperFL`          | 上限高度           | `000`～`999`                     |      |      |
| `keyword`          | キーワード         | E 項本文を検索する文字列         |      | 複数指定時は `+` で区切る |
| `andOrCondition`   | AND・OR 検索       | `0`：AND／`1`：OR                | △    | キーワード指定時は必須 |
| `display`          | 有効ノータム表示   | `0`                              | ○    |      |
| `validDatetimeStart` | 有効開始日時     | `YYYYMMDDhhmm`                   |      | 省略時は現在日時で検索 |
| `validDatetimeEnd` | 有効終了日時       | `YYYYMMDDhhmm`                   | ○    |      |
| `issueDatetime`    | 発行日時           | `YYYYMMDDhhmm`                   |      | 指定日時以降で検索 |

**URL サンプル**

```http
https://web.swim.mlit.go.jp/f2dnrq/web/search?userId=user123456&nof=RJAAYNYX&fir=RJJJ&location=RJAA+RJTT&notamCode=MXCL&series=A&notamNr=0001/21&uuid=dc296f9b-0149-4cef-8e93-650444b47dae&lowerFL=000&upperFL=999&keyword=RWY+TWY&andOrCondition=0&display=0&validDatetimeStart=202105091500&validDatetimeEnd=202106161500&issueDatetime=202105081500
```

---

## 別紙 3 — SWIM サービス提供システム → 利用者システムの WebAPI 一覧

| 項 | 交換データ           | データ交換方式 | データ形式   | コード体系 | タイミング | 備考 |
|----|----------------------|----------------|--------------|------------|------------|------|
| 1  | デジタルノータム検索応答 | http           | 可変長文字列 | UTF-8      | デジタルノータム検索要求を SWIM サービス提供システムで受信後、処理結果返却時 |      |

---

## 別紙 4 — WebAPI インタフェース仕様（デジタルノータム検索応答）

| 機能 ID | サービス名                 | API ID    | API 名                 |
|---------|----------------------------|-----------|------------------------|
| FUV205  | デジタルノータムリクエストサービス | FUV205101 | デジタルノータム検索応答 |

### 1. 概要

検索条件に該当するデジタルノータムを返却する。

### 2. API 詳細

#### （1）文字コード

UTF-8

#### （2）レスポンス

**HTTP ステータスとボディ（エラー情報）**

| HTTP ステータスコード | エラーコード | エラー詳細 | 意味 |
|----------------------|--------------|------------|------|
| 200                  | 0            | -          | 正常終了 |
| 200                  | 1            | -          | 正常終了（対象データなし） |

**HTTP ヘッダ**

| 項目名        | 項目名（日本語）           | 設定内容           | 備考 |
|---------------|----------------------------|--------------------|------|
| `Content-Type` | 応答データの形式（MIME タイプ） | `application/json` |      |

**HTTP ボディ（構造）**

| 項目パス（論理） | 項目名（日本語） | 型 | 設定内容・備考 |
|------------------|------------------|-----|----------------|
| `error_info` | エラー情報 | object | |
| `error_info.error_code` | エラーコード | string | |
| `error_info.error_description` | エラー詳細 | string | |
| `query` | 検索条件 | object | リクエストパラメータのエコー |
| `query.userId` | アカウント ID | string | |
| `query.nof` | NOF | string | |
| `query.fir` | FIR | string | |
| `query.location` | ロケーション | string 配列 | |
| `query.notamCode` | ノータムコード | string | |
| `query.series` | シリーズ | string | |
| `query.notamNr` | ノータム番号 | string | |
| `query.uuid` | UUID | string | |
| `query.lowerFL` | 下限高度 | string | |
| `query.upperFL` | 上限高度 | string | |
| `query.keyword` | キーワード | string 配列 | |
| `query.andOrCondition` | AND・OR 検索 | string | |
| `query.display` | 有効ノータム表示 | string | |
| `query.validDatetimeStart` | 有効開始日時 | string | |
| `query.validDatetimeEnd` | 有効終了日時 | string | |
| `query.issueDatetime` | 発行日時 | string | |
| `data` | データ | array | |
| `data[].totalCount` | 総件数 | string | |
| `data[].digitalNotam` | デジタルノータム | string 配列 | AIXM（XML）文字列の配列。ロケーション昇順、ノータム番号降順でソート |

**`digitalNotam` のエスケープ（原本注記）**

JSON 内に XML を埋め込むため、XML 内のダブルクォートやバックスラッシュ等はエスケープする。

例: `<?xml version=\"1.0\" encoding=\"UTF-8\"?>`

**HTTP ボディサンプル**

```json
{
  "error_info": {
    "error_code": "",
    "error_description": ""
  },
  "query": {
    "userId": "user123456",
    "nof": "RJAAYNYX",
    "fir": "RJJJ",
    "location": ["RJAA", "RJTT"],
    "notamCode": "MXCL",
    "series": "A",
    "notamNr": "0001/21",
    "uuid": "dc296f9b-0149-4cef-8e93-650444b47dae",
    "lowerFL": "000",
    "upperFL": "999",
    "keyword": ["RWY", "TWY"],
    "andOrCondition": "0",
    "display": "0",
    "validDatetimeStart": "202105091500",
    "validDatetimeEnd": "202106161500",
    "issueDatetime": "202105081500"
  },
  "data": [
    {
      "totalCount": "2",
      "digitalNotam": [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<message:AIXMBasicMessage gml:id=\"uuid.6aad9942-4170-43d3-9f8f-ec230f477be1\" xmlns:aixm=\"http://www.aixm.aero/schema/5.1.1\"\n～略～\n</message:AIXMBasicMessage>",
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<message:AIXMBasicMessage gml:id=\"uuid.73ef8fb8-c5f9-494c-a631-d2e893c82b4a\" xmlns:aixm=\"http://www.aixm.aero/schema/5.1.1\"\n～略～\n</message:AIXMBasicMessage>"
      ]
    }
  ]
}
```

#### （3）エラーレスポンス

HTTP ステータスコード **200** で返却されるエラーボディ（`error_info` 等によるエラー情報）。

| エラーコード | エラー詳細（例）           | 意味 |
|--------------|----------------------------|------|
| 2            | -                          | アカウント ID パラメータがない（必須パラメータ不足） |
| 4            | 高度下限                   | 高度下限の値が不正 |
| 5            | 高度上限                   | 高度上限の値が不正 |
| 6            | 高度下限、高度上限         | 高度上限 ＜ 高度下限 |
| 7            | -                          | キーワードが指定されているが AND・OR 条件が未指定 |
| 8            | -                          | AND・OR 検索に 0～1 以外が指定されている |
| 9, 10        | -                          | 有効ノータム表示に 0 以外が指定されている |
| 11           | 有効開始日時、有効終了日時 | 有効終了日時 ＜ 有効開始日時 |
| 12           | 有効開始日時               | 有効開始日時の値が不正 |
| 13           | 有効終了日時               | 有効終了日時の値が不正 |
| 14           | -                          | 取得件数が検索上限値を超える |
| 15           | -                          | 有効終了日時パラメータがない（必須パラメータ不足） |
| 16           | 発行日時                   | 発行日時の値が不正 |
| 99           | -                          | 障害や予期せぬエラー |

---

*出典: 国土交通省 航空局「SWIM サービス API 連携仕様書 付録 04_デジタルノータムリクエストサービス」Ver 1.0.1。利用・再掲は同庁の利用条件に従ってください。*
