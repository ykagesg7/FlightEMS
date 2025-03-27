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
        {'id': 'NACKS', 'name1': 'ナックス', 'lat': '430001N', 'lon': '1413903E'},
        {'id': 'NACKY', 'name1': 'ナッキー', 'lat': '255359N', 'lon': '1311714E'},
        {'id': 'NAEBA', 'name1': 'ナエバ', 'lat': '371515N', 'lon': '1383209E'},
        {'id': 'NAGRA', 'name1': 'ナグラ', 'lat': '344438N', 'lon': '1400544E'},
        {'id': 'NAKAH', 'name1': 'ナカ', 'lat': '362610N', 'lon': '1402251E'},
        {'id': 'NAKAU', 'name1': 'ナカウ', 'lat': '353242N', 'lon': '1330947E'},
        {'id': 'NAKRA', 'name1': 'ナクラ', 'lat': '401128N', 'lon': '1402325E'},
        {'id': 'NALKO', 'name1': 'ナルコ', 'lat': '332926N', 'lon': '1295305E'},
        {'id': 'NANAO', 'name1': 'ナナオ', 'lat': '370310N', 'lon': '1370253E'},
        {'id': 'NANJO', 'name1': 'ナンジョー', 'lat': '260739N', 'lon': '1281710E'},
        {'id': 'NANNO', 'name1': 'ナンノ', 'lat': '415458N', 'lon': '1405133E'},
        {'id': 'NANYO', 'name1': 'ナンヨウ', 'lat': '340236N', 'lon': '1314448E'},
        {'id': 'NAPRO', 'name1': 'ナプロ', 'lat': '430126N', 'lon': '1413900E'},
        {'id': 'NARAH', 'name1': 'ナラ', 'lat': '342959N', 'lon': '1360657E'},
        {'id': 'NASNO', 'name1': 'ナスノ', 'lat': '365306N', 'lon': '1401016E'},
        {'id': 'NASSY', 'name1': 'ナッシー', 'lat': '353212N', 'lon': '1340222E'},
        {'id': 'NATAC', 'name1': 'ナタック', 'lat': '244430N', 'lon': '1411722E'},
        {'id': 'NATCH', 'name1': 'ナッチ', 'lat': '341133N', 'lon': '1361140E'},
        {'id': 'NATEN', 'name1': 'ナテン', 'lat': '344105N', 'lon': '1353324E'},
        {'id': 'NATON', 'name1': 'ナトン', 'lat': '260706N', 'lon': '1273858E'},
        {'id': 'NAVER', 'name1': 'ネイバー', 'lat': '420744N', 'lon': '1413129E'},
        {'id': 'NEBTA', 'name1': 'ネブタ', 'lat': '404027N', 'lon': '1403438E'},
        {'id': 'NECTA', 'name1': 'ネクタ', 'lat': '354133N', 'lon': '1395305E'},
        {'id': 'NEGMA', 'name1': 'ネグマ', 'lat': '401249N', 'lon': '1401232E'},
        {'id': 'NEKKY', 'name1': 'ネッキー', 'lat': '330701N', 'lon': '1301301E'},
        {'id': 'NESIC', 'name1': 'ネシック', 'lat': '425304N', 'lon': '1414029E'},
        {'id': 'NEXUS', 'name1': 'ネクサス', 'lat': '354749N', 'lon': '1395830E'},
        {'id': 'NIIMI', 'name1': 'ニイミ', 'lat': '351015N', 'lon': '1332107E'},
        {'id': 'NIKAK', 'name1': 'ニカク', 'lat': '343505N', 'lon': '1335627E'},
        {'id': 'NIKAN', 'name1': 'ニカン', 'lat': '431330N', 'lon': '1410326E'},
        {'id': 'NIKON', 'name1': 'ニコン', 'lat': '381914N', 'lon': '1422812E'},
        {'id': 'NIMOH', 'name1': 'ニモー', 'lat': '343945N', 'lon': '1365121E'},
        {'id': 'NIMOX', 'name1': 'ニモックス', 'lat': '225441N', 'lon': '1531208E'},
        {'id': 'NIPPO', 'name1': 'ニッポー', 'lat': '324411N', 'lon': '1395012E'},
        {'id': 'NIRAI', 'name1': 'ニライ', 'lat': '262951N', 'lon': '1331627E'},
        {'id': 'NISIN', 'name1': 'ニシン', 'lat': '400010N', 'lon': '1374954E'},
        {'id': 'NITRO', 'name1': 'ニトロ', 'lat': '354611N', 'lon': '1395705E'},
        {'id': 'NIVIL', 'name1': 'ニビル', 'lat': '341151N', 'lon': '1393157E'},
        {'id': 'NOBEL', 'name1': 'ノーベル', 'lat': '370818N', 'lon': '1372520E'},
        {'id': 'NOBIG', 'name1': 'ノビッグ', 'lat': '423258N', 'lon': '1414225E'},
        {'id': 'NODAN', 'name1': 'ノダン', 'lat': '402510N', 'lon': '1445946E'},
        {'id': 'NODUK', 'name1': 'ノダック', 'lat': '430606N', 'lon': '1430005E'},
        {'id': 'NONOC', 'name1': 'ノノック', 'lat': '372011N', 'lon': '1370516E'},
        {'id': 'NOPPY', 'name1': 'ノッピー', 'lat': '372215N', 'lon': '1402825E'},
        {'id': 'NORAN', 'name1': 'ノラン', 'lat': '335740N', 'lon': '1350607E'},
        {'id': 'NOSLY', 'name1': 'ノズリー', 'lat': '421404N', 'lon': '1453055E'},
        {'id': 'NOSSY', 'name1': 'ノッシー', 'lat': '401322N', 'lon': '1400855E'},
        {'id': 'NUPDA', 'name1': 'ヌプダ', 'lat': '265904N', 'lon': '1282748E'},
        {'id': 'NURLI', 'name1': 'ヌーリ', 'lat': '342605N', 'lon': '1365920E'},
        {'id': 'NYUDO', 'name1': 'ニュウド', 'lat': '423658N', 'lon': '1414307E'}
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
    original_file_path = '../public/geojson/waypoints/waypoints_N.json'
    print(f"元のファイルを読み込みます: {original_file_path}", flush=True)
    
    with open(original_file_path, 'r', encoding='utf-8') as f:
        waypoints_data = json.load(f)
    
    print(f"元のウェイポイント数: {len(waypoints_data['features'])}", flush=True)
    
    # NUBDAのインデックスを見つける（最後のエントリ）
    nubda_index = None
    
    for i, feature in enumerate(waypoints_data['features']):
        prop = feature.get('properties', {})
        feature_id = prop.get('id', '')
        if feature_id == 'NUBDA':
            nubda_index = i
            print(f"NUBDAを見つけました: インデックス {i}", flush=True)
            break
    
    if nubda_index is not None:
        print(f"NUBDAのインデックス: {nubda_index}", flush=True)
        
        # NUBDAの後に新しいポイントを挿入
        waypoints_data['features'] = (
            waypoints_data['features'][:nubda_index + 1] + 
            new_points
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
        print("NUBDAポイントが見つかりませんでした。", flush=True)
        
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