# 国土交通省 航空局
# SWIM サービス API 連携仕様書
## 付録 04_デジタルノータムリクエストサービス
Ver1.0.1（2025 年 5 月 30 日）

### 改版履歴
| # | 版名 | 発行日 | 改訂内容 |
|---|---|---|---|
| 1 | 1.0 | 2025/1/10 | 初版 |
| 2 | 1.0.1 | 2025/5/30 | 別紙 2, 4<br>誤記修正 |

---

## 1. はじめに
本付録は HTTP による WebAPI を利用したアプリケーション間インタフェースについて規定したもので、デジタルノータムリクエストサービスに関する技術資料である。

## 2. メッセージフォーマット
デジタルノータムリクエストサービスの SWIM サービス提供システム－利用者システム間業務メッセージ本文について詳細を記載する。

* **2.1** 利用者システム→SWIM サービス提供システムの WebAPI 一覧を別紙 1 に示す。
* **2.2** 利用者システム→SWIM サービス提供システムの WebAPI インタフェース仕様を別紙 2 に示す。
* **2.3** SWIM サービス提供システム→利用者システムの WebAPI 一覧を別紙 3 に示す。
* **2.4** SWIM サービス提供システム→利用者システムの WebAPI インタフェース仕様を別紙 4 に示す。

## 3. その他
なし。

---

## 別紙1：利用者システム→SWIMサービス提供システムのWebAPI一覧

| 項 | 交換データ | データ交換方式 (方式) | データ交換方式 (データ形式) | データ交換方式 (コード体系) | タイミング | 備考 |
|---|---|---|---|---|---|---|
| 1 | デジタルノータム検索要求 | http | 可変長文字列 | UTF-8 | 利用者システムからデジタルノータムの検索時 | |

---

## 別紙2：WebAPIインタフェース仕様 (デジタルノータム検索要求)

* **機能ID:** FUV205
* **サービス名:** デジタルノータムリクエストサービス
* **APIID:** FUV205001
* **API名:** デジタルノータム検索要求

### 1. 概要
検索条件に該当するデジタルノータムを要求する。

### 2. API詳細
#### (1) 文字コード
UTF-8

#### (2) リクエスト
**リクエスト形式**
* **メソッド:** GET
* **URL:**
  ```text
  https://web.swim.mlit.go.jp/f2dnrq/web/search?userId={アカウントID}&nof={NOF}&fir={FIR}&location={ロケーション}&notamCode={ノータムコード}&series={シリーズ}&notamNr={ノータム番号}&uuid={UUID}&lowerFL={下限高度}&upperFL={上限高度}&keyword={キーワード}&andOrCondition={AND・OR検索}&display={有効無効}&validDatetimeStart={有効開始日時}&validDatetimeEnd={有効終了日時}&issueDatetime={発行日時}
  ```

**リクエストパラメータ**

| 項目名(英字) | 項目名(日本語) | 設定内容 | 必須 | 備考 |
|---|---|---|:---:|---|
| `userId` | アカウントID | ログインアカウントID | ◯ | |
| `nof` | NOF | NOF | | |
| `fir` | FIR | 飛行情報区 | | |
| `location` | ロケーション | 地点略号 | | 複数ロケーション指定時は「+」で区切る。 |
| `notamCode` | ノータムコード | ノータムコード | | 2桁、または4桁 |
| `series` | シリーズ | シリーズ | | |
| `notamNr` | ノータム番号 | `9999/99` | | 通番/年次 |
| `uuid` | UUID | フィーチャID | | |
| `lowerFL` | 下限高度 | `000`～`999` | | |
| `upperFL` | 上限高度 | `000`～`999` | | |
| `keyword` | キーワード | E項本文を検索する文字列 | | 複数項目指定時は「+」で区切る。 |
| `andOrCondition`| AND・OR検索 | `0`, `1`<br>(0: AND, 1: OR) | △ | KEYWORDに入力された内容をAND条件、もしくはOR条件で検索するのかを指定する。<br>キーワードが指定されている場合は必須とする。 |
| `display` | 有効ノータム表示 | `0` | ◯ | |
| `validDatetimeStart`| 有効開始日時 | `YYYYMMDDhhmm` | | 省略時は現在日時にて検索する。 |
| `validDatetimeEnd`| 有効終了日時 | `YYYYMMDDhhmm` | ◯ | |
| `issueDatetime` | 発行日時 | `YYYYMMDDhhmm` | | 指定日時以降で検索する。 |

**URLサンプル**
```text
https://web.swim.mlit.go.jp/f2dnrq/web/search?userId=user123456&nof=RJAAYNYX&fir=RJJJ&location=RJAA+RJTT&notamCode=MXCL&series=A&notamNr=0001/21&uuid=dc296f9b-0149-4cef-8e93-650444b47dae&lowerFL=000&upperFL=999&keyword=RWY+TWY&andOrCondition=0&display=0&validDatetimeStart=202105091500&validDatetimeEnd=202106161500&issueDatetime=202105081500
```

---

## 別紙3：SWIMサービス提供システム→利用者システムのWebAPI一覧

| 項 | 交換データ | データ交換方式 (方式) | データ交換方式 (データ形式) | データ交換方式 (コード体系) | タイミング | 備考 |
|---|---|---|---|---|---|---|
| 1 | デジタルノータム検索応答 | http | 可変長文字列 | UTF-8 | デジタルノータム検索要求をSWIMサービス提供システムで受信後、処理結果返却時 | |

---

## 別紙4：WebAPIインタフェース仕様 (デジタルノータム検索応答)

* **機能ID:** FUV205
* **サービス名:** デジタルノータムリクエストサービス
* **APIID:** FUV205101
* **API名:** デジタルノータム検索応答

### 1. 概要
検索条件に該当するデジタルノータムを返却する。

### 2. API詳細
#### (1) 文字コード
UTF-8

#### (2) レスポンス
**HTTPステータスコード: 200**

| HTTPボディ（エラー情報）エラーコード | HTTPボディ（エラー情報）エラー詳細 | 意味 |
|---|---|---|
| `0` | - | 正常終了 |
| `1` | - | 正常終了（対象データなし） |

**HTTPヘッダ**

| 項目名 | 項目名(日本語) | 設定内容 | 備考 |
|---|---|---|---|
| `Content-Type` | 応答データの形式(MIMEタイプ) | `application/json` | |

**HTTPボディ**

| 項目名(英字) | 項目名(日本語) | 設定内容 | 型 | 備考 |
|---|---|---|---|---|
| `error_info` | エラー情報 | | - | |
| `error_code` | エラーコード | | string | |
| `error_description`| エラー詳細 | | string | |
| `query` | 検索条件 | リクエストパラメータ | - | |
| `userId` | アカウントID | | string | |
| `nof` | NOF | | string | |
| `fir` | FIR | | string | |
| `location` | ロケーション | ロケーションの配列 | string | |
| `notamCode` | ノータムコード | | string | |
| `series` | シリーズ | | string | |
| `notamNr` | ノータム番号 | | string | |
| `uuid` | UUID | | string | |
| `lowerFL` | 下限高度 | | string | |
| `upperFL` | 上限高度 | | string | |
| `keyword` | キーワード | キーワードの配列 | string | |
| `andOrCondition`| AND・OR検索 | | string | |
| `display` | 有効ノータム表示 | | string | |
| `validDatetimeStart`| 有効開始日時 | | string | |
| `validDatetimeEnd`| 有効終了日時 | | string | |
| `issueDatetime` | 発行日時 | | string | |
| `data` | データ | | - | |
| `totalCount` | 総件数 | | string | |
| `digitalNotam` | デジタルノータム | デジタルノータム（XML形式）単位の配列。<br>ロケーションの昇順、ノータム番号の降順でソートして設定する。 | string | ※JSONデータ内でXML形式のデータを解釈可能とするため、XML形式内で使用されるダブルクォーテーションやバックスラッシュ等の記号はエスケープして設定する。<br>例）XML内に存在するダブルクォーテーション<br>`<?xml version="1.0" encoding="UTF-8"?>`<br>→エスケープ処理後の設定内容<br>`<?xml version=\"1.0\" encoding=\"UTF-8\"?>` |

**HTTPボディサンプル**
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
    "location": [ "RJAA", "RJTT" ],
    "notamCode": "MXCL",
    "series": "A",
    "notamNr": "0001/21",
    "uuid": "dc296f9b-0149-4cef-8e93-650444b47dae",
    "lowerFL": "000",
    "upperFL": "999",
    "keyword": [ "RWY" , "TWY" ],
    "andOrCondition": "0",
    "display": "0",
    "validDatetimeStart": "202105091500",
    "validDatetimeEnd": "202106161500",
    "issueDatetime": "202105081500"
  },
  "data": [
    {
      "totalCount" : "2",
      "digitalNotam": [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<message:AIXMBasicMessage gml:id=\"uuid.6aad9942-4170-43d3-9f8f-ec230f477be1\" xmlns:aixm=\"http://www.aixm.aero/schema/5.1.1\"\n～略～\nxmlns:xlink=\"http://www.w3.org/1999/xlink\">\n<message:hasMember>\n<aixm:RunwayDirection gml:id=\"uuid.8eebc792-52ff-485f-9e5a-39da0b034390\">\n<gml:identifier codeSpace=\"urn:uuid:\">8eebc792-52ff-485f-9e5a-39da0b034390</gml:identifier>\n<aixm:timeSlice>\n<aixm:RunwayDirectionTimeSlice gml:id=\"id.3571c750-346b-40b6-b4d8-92a7eb4aca91\">\n<gml:validTime>\n<gml:TimePeriod gml:id=\"vt.id.3571c750-346b-40b6-b4d8-92a7eb4aca91\">\n<gml:beginPosition>2021-05-10T00:45:00Z</gml:beginPosition>\n<gml:endPosition>2021-06-07T08:45:00Z</gml:endPosition>\n</gml:TimePeriod>\n～略～\n</aixm:RunwayDirectionTimeSlice>\n</aixm:timeSlice>\n</aixm:RunwayDirection>\n</message:hasMember>",
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<message:AIXMBasicMessage gml:id=\"uuid.73ef8fb8-c5f9-494c-a631-d2e893c82b4a\" xmlns:aixm=\"http://www.aixm.aero/schema/5.1.1\" \n～略～\nxmlns:xlink=\"http://www.w3.org/1999/xlink\">\n<message:hasMember>\n<aixm:RunwayDirection gml:id=\"uuid.7a1d182c-f25b-493f-91ae-cc3cc943255b\">\n<gml:identifier codeSpace=\"urn:uuid:\">7a1d182c-f25b-493f-91ae-cc3cc943255b</gml:identifier>\n<aixm:timeSlice>\n<aixm:RunwayDirectionTimeSlice gml:id=\"id.12dce548-fb1a-4e1f-8d22-e3daa08d296b\">\n～略～\n</aixm:RunwayDirectionTimeSlice>\n</aixm:timeSlice>\n</aixm:RunwayDirection>\n</message:hasMember>"
      ]
    }
  ]
}
```

#### (3) エラーレスポンス
**HTTPステータスコード: 200**
※エラー時もHTTPステータスコードは200で返却され、ボディ内のエラーコードで詳細が示されます。

| HTTPボディ（エラー情報）エラーコード | HTTPボディ（エラー情報）エラー詳細 | 意味 |
|---|---|---|
| `2` | - | アカウントIDパラメータがない（必須パラメータ不足） |
| `4` | 高度下限 | 高度下限の値が不正である |
| `5` | 高度上限 | 高度上限の値が不正である |
| `6` | 高度下限、高度上限 | 高度上限＜高度下限である |
| `7` | - | キーワードが指定されているにも関わらずAND・OR条件が指定されていない |
| `8` | - | AND・OR検索に0～1以外が指定されている |
| `9, 10` | - | 有効ノータム表示に0以外が指定されている |
| `11` | 有効開始日時、有効終了日時 | 有効終了日時＜有効開始日時である |
| `12` | 有効開始日時 | 有効開始日時の値が不正である |
| `13` | 有効終了日時 | 有効終了日時の値が不正である |
| `14` | - | 取得件数が検索上限値を超える |
| `15` | - | 有効終了日時パラメータがない（必須パラメータ不足） |
| `16` | 発行日時 | 発行日時の値が不正である |
| `99` | - | 障害や予期せぬエラーが発生 |
