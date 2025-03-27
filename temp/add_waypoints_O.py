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
        {'id': 'OBAKO', 'name1': 'オバコ', 'lat': '400422N', 'lon': '1400316E'},
        {'id': 'OBMAP', 'name1': 'オブマップ', 'lat': '362236N', 'lon': '1395007E'},
        {'id': 'OBOKE', 'name1': 'オボケ', 'lat': '340054N', 'lon': '1335518E'},
        {'id': 'ODENN', 'name1': 'オデン', 'lat': '344737N', 'lon': '1382516E'},
        {'id': 'OGAKI', 'name1': 'オガキ', 'lat': '351808N', 'lon': '1363737E'},
        {'id': 'OGILA', 'name1': 'オギラ', 'lat': '343713N', 'lon': '1363323E'},
        {'id': 'OGITU', 'name1': 'オギツ', 'lat': '363832N', 'lon': '1404023E'},
        {'id': 'OGORI', 'name1': 'オゴリ', 'lat': '331640N', 'lon': '1302545E'},
        {'id': 'OGUNI', 'name1': 'オグニ', 'lat': '331239N', 'lon': '1305050E'},
        {'id': 'OHANA', 'name1': 'オハナ', 'lat': '372608N', 'lon': '1370604E'},
        {'id': 'OHCHA', 'name1': 'オーチャ', 'lat': '344226N', 'lon': '1382717E'},
        {'id': 'OHGIE', 'name1': 'オギ', 'lat': '331953N', 'lon': '1301042E'},
        {'id': 'OHKOK', 'name1': 'オーコック', 'lat': '330022N', 'lon': '1375454E'},
        {'id': 'OHMAR', 'name1': 'オマー', 'lat': '411834N', 'lon': '1405916E'},
        {'id': 'OHNNO', 'name1': 'オーノ', 'lat': '355328N', 'lon': '1363803E'},
        {'id': 'OHRIN', 'name1': 'オーリン', 'lat': '404946N', 'lon': '1405101E'},
        {'id': 'OHSHU', 'name1': 'オウシュウ', 'lat': '402611N', 'lon': '1410903E'},
        {'id': 'OHSYU', 'name1': 'オーシュウ', 'lat': '380923N', 'lon': '1403955E'},
        {'id': 'OKESA', 'name1': 'オケサ', 'lat': '380215N', 'lon': '1383551E'},
        {'id': 'OKINI', 'name1': 'オーキニ', 'lat': '345058N', 'lon': '1354519E'},
        {'id': 'OKITU', 'name1': 'オキツ', 'lat': '330547N', 'lon': '1331731E'},
        {'id': 'OKUJI', 'name1': 'オクジ', 'lat': '364616N', 'lon': '1402100E'},
        {'id': 'OKUMA', 'name1': 'オクマ', 'lat': '264017N', 'lon': '1280219E'},
        {'id': 'OKUNI', 'name1': 'オークニ', 'lat': '352413N', 'lon': '1374126E'}
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
    
    # 新しいポイントをアルファベット順に挿入するために、適切な位置を見つける
    insertion_index = len(waypoints_data['features'])  # デフォルトでは最後に追加
    
    # 既存のポイントIDをリスト化
    existing_ids = []
    for feature in waypoints_data['features']:
        prop = feature.get('properties', {})
        feature_id = prop.get('id', '')
        existing_ids.append(feature_id)
    
    print(f"既存のポイントID: {existing_ids}", flush=True)
    
    # バックアップファイルを作成
    backup_file = original_file_path + '.bak'
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
    new_ids = [point['properties']['id'] for point in new_points]
    print(f"追加されたポイントID: {new_ids}", flush=True)

except Exception as e:
    print(f"エラーが発生しました: {str(e)}", flush=True)
    traceback.print_exc()
    sys.exit(1) 