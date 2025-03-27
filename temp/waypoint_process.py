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
        {'id': 'METIS', 'name1': 'メティス', 'lat': '355946N', 'lon': '1401423E'},
        {'id': 'MIBAI', 'name1': 'ミバイ', 'lat': '245444N', 'lon': '1252427E'},
        {'id': 'MIDER', 'name1': 'マイダー', 'lat': '350101N', 'lon': '1354934E'},
        {'id': 'MIDOH', 'name1': 'ミドー', 'lat': '343858N', 'lon': '1353600E'},
        {'id': 'MIHAR', 'name1': 'ミハー', 'lat': '384225N', 'lon': '1405657E'},
        {'id': 'MIJIL', 'name1': 'ミジル', 'lat': '244433N', 'lon': '1251026E'},
        {'id': 'MIKAN', 'name1': 'ミカン', 'lat': '341549N', 'lon': '1351410E'},
        {'id': 'MIKAS', 'name1': 'ミカス', 'lat': '335507N', 'lon': '1323451E'},
        {'id': 'MIKKA', 'name1': 'ミッカ', 'lat': '344629N', 'lon': '1372756E'},
        {'id': 'MIKRA', 'name1': 'ミクラ', 'lat': '370255N', 'lon': '1391426E'},
        {'id': 'MIKUM', 'name1': 'ミクム', 'lat': '390004N', 'lon': '1401624E'},
        {'id': 'MILEP', 'name1': 'ミレップ', 'lat': '325250N', 'lon': '1301501E'},
        {'id': 'MILPS', 'name1': 'ミルプス', 'lat': '451755N', 'lon': '1411842E'},
        {'id': 'MIMMY', 'name1': 'ミミー', 'lat': '345557N', 'lon': '1343201E'},
        {'id': 'MINAC', 'name1': 'ミナック', 'lat': '345526N', 'lon': '1361026E'},
        {'id': 'MINAT', 'name1': 'ミナト', 'lat': '353642N', 'lon': '1332537E'},
        {'id': 'MINNE', 'name1': 'ミンネ', 'lat': '341138N', 'lon': '1371255E'},
        {'id': 'MINOU', 'name1': 'ミノウ', 'lat': '353924N', 'lon': '1364424E'},
        {'id': 'MIRAI', 'name1': 'ミライ', 'lat': '343213N', 'lon': '1355352E'},
        {'id': 'MIREI', 'name1': 'ミレイ', 'lat': '423658N', 'lon': '1414307E'},
        {'id': 'MISEN', 'name1': 'ミセン', 'lat': '342609N', 'lon': '1323831E'},
        {'id': 'MISMI', 'name1': 'ミスミ', 'lat': '324524N', 'lon': '1303917E'},
        {'id': 'MITCH', 'name1': 'ミッチ', 'lat': '331004N', 'lon': '1301147E'}
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
    original_file_path = '../public/geojson/waypoints/waypoints_M.json'
    print(f"元のファイルを読み込みます: {original_file_path}", flush=True)
    
    with open(original_file_path, 'r', encoding='utf-8') as f:
        waypoints_data = json.load(f)
    
    print(f"元のウェイポイント数: {len(waypoints_data['features'])}", flush=True)
    
    # MEREDとMIYOSのインデックスを見つける
    mered_index = None
    miyos_index = None
    
    for i, feature in enumerate(waypoints_data['features']):
        prop = feature.get('properties', {})
        feature_id = prop.get('id', '')
        if feature_id == 'MERED':
            mered_index = i
            print(f"MEREDを見つけました: インデックス {i}", flush=True)
        elif feature_id == 'MIYOS':
            miyos_index = i
            print(f"MIYOSを見つけました: インデックス {i}", flush=True)
            break
    
    if mered_index is not None and miyos_index is not None:
        print(f"MEREDのインデックス: {mered_index}", flush=True)
        print(f"MIYOSのインデックス: {miyos_index}", flush=True)
        
        # MEREDとMIYOSの間に新しいポイントを挿入
        waypoints_data['features'] = (
            waypoints_data['features'][:mered_index + 1] + 
            new_points + 
            waypoints_data['features'][miyos_index:]
        )
        
        print(f"更新後のウェイポイント数: {len(waypoints_data['features'])}", flush=True)
        
        # バックアップファイルを作成
        backup_file = original_file_path + '.bak'
        os.rename(original_file_path, backup_file)
        print(f"バックアップファイルを作成しました: {backup_file}", flush=True)
        
        # 更新されたデータを保存
        with open(original_file_path, 'w', encoding='utf-8') as f:
            json.dump(waypoints_data, f, ensure_ascii=False, indent=2)
        
        print(f"{len(new_points)}個のポイントを挿入しました。", flush=True)
    else:
        print("メレッドまたはミヨスのポイントが見つかりませんでした。", flush=True)
        
        # ポイントIDの一覧を表示
        print("全ポイントID:", flush=True)
        for i, feature in enumerate(waypoints_data['features']):
            prop = feature.get('properties', {})
            feature_id = prop.get('id', 'ID不明')
            print(f"{i}: {feature_id}", flush=True)

except Exception as e:
    print(f"エラーが発生しました: {str(e)}", flush=True)
    traceback.print_exc()
    sys.exit(1) 