import json
import os
import math
import traceback
import sys

try:
    print("スクリプトを実行しています...", flush=True)

    def dms_to_decimal(dms_str):
        """度分秒形式（例：355946N、1401423E）を10進数度形式に変換"""
        direction = dms_str[-1]
        numeric_part = dms_str[:-1]
        
        # 桁数によって分割方法を決定
        if len(numeric_part) == 6:  # 度と分と秒（緯度の場合）: DDMMSS
            degrees = int(numeric_part[0:2])
            minutes = int(numeric_part[2:4])
            seconds = int(numeric_part[4:6])
        elif len(numeric_part) == 7:  # 度と分と秒（経度の場合）: DDDMMSS
            degrees = int(numeric_part[0:3])
            minutes = int(numeric_part[3:5])
            seconds = int(numeric_part[5:7])
        else:
            raise ValueError(f'Invalid DMS format: {dms_str}')
        
        # 10進数度に変換
        decimal = degrees + minutes/60 + seconds/3600
        
        # 南緯または西経の場合は負の値にする
        if direction in ['S', 'W']:
            decimal = -decimal
        
        return round(decimal, 4)

    # 変換対象データのリスト
    waypoints_data = [
        {'id': 'OLIVE', 'name1': 'オリーブ', 'lat': '344518N', 'lon': '1342700E'},
        {'id': 'OLKUN', 'name1': 'オルクン', 'lat': '383508N', 'lon': '1395639E'},
        {'id': 'OLNAS', 'name1': 'オルナス', 'lat': '404509N', 'lon': '1433817E'},
        {'id': 'OLPOL', 'name1': 'オルポル', 'lat': '425348N', 'lon': '1413900E'},
        {'id': 'OLSAK', 'name1': 'オルサク', 'lat': '292240N', 'lon': '1315526E'},
        {'id': 'OLSAS', 'name1': 'オルサス', 'lat': '344828N', 'lon': '1395625E'},
        {'id': 'OLSEG', 'name1': 'オルセグ', 'lat': '344801N', 'lon': '1413536E'},
        {'id': 'OLSER', 'name1': 'オルサー', 'lat': '302037N', 'lon': '1295756E'},
        {'id': 'OLSOP', 'name1': 'オルソップ', 'lat': '353105N', 'lon': '1344729E'},
        {'id': 'OLSOX', 'name1': 'オルソックス', 'lat': '403807N', 'lon': '1414116E'},
        {'id': 'OLSUB', 'name1': 'オルサブ', 'lat': '331327N', 'lon': '1295911E'},
        {'id': 'OLTEN', 'name1': 'オルテン', 'lat': '431003N', 'lon': '1414443E'},
        {'id': 'OLTOM', 'name1': 'オルトム', 'lat': '350134N', 'lon': '1372742E'},
        {'id': 'OLVAL', 'name1': 'オルバル', 'lat': '260411N', 'lon': '1272441E'},
        {'id': 'OLVIN', 'name1': 'オルビン', 'lat': '332854N', 'lon': '1420740E'},
        {'id': 'OMIYA', 'name1': 'オミヤ', 'lat': '355506N', 'lon': '1393551E'},
        {'id': 'OMOGO', 'name1': 'オモゴ', 'lat': '334050N', 'lon': '1331233E'},
        {'id': 'OMUTA', 'name1': 'オオムタ', 'lat': '330332N', 'lon': '1302701E'},
        {'id': 'ONAGA', 'name1': 'オナガ', 'lat': '431413N', 'lon': '1440524E'},
        {'id': 'ONASU', 'name1': 'オナス', 'lat': '345253N', 'lon': '1405514E'},
        {'id': 'ONGHA', 'name1': 'オンガ', 'lat': '334719N', 'lon': '1304712E'},
        {'id': 'ONMAE', 'name1': 'オンマエ', 'lat': '343419N', 'lon': '1344005E'},
        {'id': 'ONSEN', 'name1': 'オンセン', 'lat': '244904N', 'lon': '1412840E'},
        {'id': 'ONSKE', 'name1': 'オンスケ', 'lat': '303723N', 'lon': '1303853E'}
    ]

    # GeoJSON形式に変換
    print("新しいウェイポイントデータを変換します...", flush=True)
    new_points = []
    for wp in waypoints_data:
        lat_decimal = dms_to_decimal(wp['lat'])
        lon_decimal = dms_to_decimal(wp['lon'])
        
        feature = {
            "type": "Feature",
            "properties": {
                "id": wp['id'],
                "type": "Non-Compulsory",
                "name1": wp['name1']
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    lon_decimal,
                    lat_decimal
                ]
            }
        }
        new_points.append(feature)
    
    print(f"変換されたポイント数: {len(new_points)}", flush=True)
    
    # 元のJSONファイルを読み込む
    original_file_path = '../public/geojson/waypoints/waypoints_O.json'
    print(f"元のファイルを読み込みます: {original_file_path}", flush=True)
    
    with open(original_file_path, 'r', encoding='utf-8') as f:
        waypoints_data = json.load(f)
    
    print(f"元のウェイポイント数: {len(waypoints_data['features'])}", flush=True)
    
    # 既存のポイントIDをリスト化して重複チェック
    existing_ids = []
    for feature in waypoints_data['features']:
        prop = feature.get('properties', {})
        feature_id = prop.get('id', '')
        existing_ids.append(feature_id)
    
    # 重複IDをチェック
    duplicate_ids = []
    new_ids = [point['properties']['id'] for point in new_points]
    for new_id in new_ids:
        if new_id in existing_ids:
            duplicate_ids.append(new_id)
    
    if duplicate_ids:
        print(f"警告: 次のIDは既に存在しています: {duplicate_ids}", flush=True)
        # 重複するIDのポイントを除外
        new_points = [point for point in new_points if point['properties']['id'] not in duplicate_ids]
        print(f"重複を除外した後のポイント数: {len(new_points)}", flush=True)
    
    print(f"既存のポイントID: {existing_ids}", flush=True)
    
    # バックアップファイルを作成
    backup_file = original_file_path + '.bak2'
    os.rename(original_file_path, backup_file)
    print(f"バックアップファイルを作成しました: {backup_file}", flush=True)
    
    # 既存のポイントと新しいポイントを結合し、IDでソート
    all_features = waypoints_data['features'] + new_points
    all_features.sort(key=lambda x: x['properties']['id'])
    
    # 更新されたデータを設定
    waypoints_data['features'] = all_features
    
    print(f"更新後のウェイポイント数: {len(waypoints_data['features'])}", flush=True)
    
    # 更新されたデータを保存
    with open(original_file_path, 'w', encoding='utf-8') as f:
        json.dump(waypoints_data, f, ensure_ascii=False, indent=2)
    
    print(f"{len(new_points)}個のポイントを挿入しました。", flush=True)
    
    # 新しいポイントIDを確認
    added_ids = [point['properties']['id'] for point in new_points]
    print(f"追加されたポイントID: {added_ids}", flush=True)

except Exception as e:
    print(f"エラーが発生しました: {str(e)}", flush=True)
    traceback.print_exc()
    sys.exit(1) 