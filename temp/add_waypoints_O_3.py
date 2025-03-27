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
        {'id': 'ONUMI', 'name1': 'オヌミ', 'lat': '430649N', 'lon': '1440524E'},
        {'id': 'OPANO', 'name1': 'オパノ', 'lat': '425846N', 'lon': '1413808E'},
        {'id': 'OPARL', 'name1': 'オパール', 'lat': '353532N', 'lon': '1395302E'},
        {'id': 'OPERA', 'name1': 'オペラ', 'lat': '352950N', 'lon': '1324237E'},
        {'id': 'OPPAR', 'name1': 'オッパー', 'lat': '352216N', 'lon': '1394405E'},
        {'id': 'ORAMO', 'name1': 'オラモ', 'lat': '323519N', 'lon': '1310846E'},
        {'id': 'ORISU', 'name1': 'オーリス', 'lat': '452758N', 'lon': '1410351E'},
        {'id': 'ORVIL', 'name1': 'オービル', 'lat': '350243N', 'lon': '1364540E'},
        {'id': 'OSAMU', 'name1': 'オサム', 'lat': '341818N', 'lon': '1352600E'},
        {'id': 'OSETO', 'name1': 'オセト', 'lat': '325037N', 'lon': '1293747E'},
        {'id': 'OSIRO', 'name1': 'オシロ', 'lat': '245450N', 'lon': '1311113E'},
        {'id': 'OSROB', 'name1': 'オスロブ', 'lat': '425537N', 'lon': '1432234E'},
        {'id': 'OSTEP', 'name1': 'オステップ', 'lat': '330832N', 'lon': '1302632E'},
        {'id': 'OSTIG', 'name1': 'オスティグ', 'lat': '362307N', 'lon': '1393420E'},
        {'id': 'OSUZU', 'name1': 'オスズ', 'lat': '322037N', 'lon': '1315257E'},
        {'id': 'OTAKI', 'name1': 'オオタキ', 'lat': '344636N', 'lon': '1345254E'},
        {'id': 'OTKEV', 'name1': 'オトケブ', 'lat': '340613N', 'lon': '1344218E'},
        {'id': 'OTOWA', 'name1': 'オトワ', 'lat': '331455N', 'lon': '1355253E'},
        {'id': 'OVSID', 'name1': 'オヴシッド', 'lat': '315719N', 'lon': '1303943E'},
        {'id': 'OWARI', 'name1': 'オワリ', 'lat': '352106N', 'lon': '1365858E'},
        {'id': 'OYABE', 'name1': 'オヤベ', 'lat': '363618N', 'lon': '1364513E'},
        {'id': 'OYODO', 'name1': 'オヨド', 'lat': '315341N', 'lon': '1314132E'},
        {'id': 'OZORA', 'name1': 'オーゾラ', 'lat': '432908N', 'lon': '1441153E'}
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
    backup_file = original_file_path + '.bak3'
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