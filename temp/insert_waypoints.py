import json
import os
import traceback
import sys

try:
    print("スクリプトを実行しています...", flush=True)
    
    # 元のJSONファイルを読み込む
    original_file_path = '../public/geojson/waypoints/waypoints_M.json'
    print(f"ファイルを読み込みます: {original_file_path}", flush=True)
    
    with open(original_file_path, 'r', encoding='utf-8') as f:
        print("ファイルを開きました", flush=True)
        waypoints_data = json.load(f)
    
    print(f"元のウェイポイント数: {len(waypoints_data['features'])}", flush=True)
    
    # 新しいポイントデータを読み込む
    print("新しいポイントデータを読み込みます...", flush=True)
    
    import os
    print(f"現在のディレクトリ: {os.getcwd()}", flush=True)
    print(f"ファイル存在: {os.path.exists('waypoint_entries_new.json')}", flush=True)
    
    with open('waypoint_entries_new.json', 'r', encoding='utf-8') as f:
        print("新しいポイントファイルを開きました", flush=True)
        # 各行を連結してJSON配列に変換
        content = f.read()
        print(f"読み込んだコンテンツの長さ: {len(content)}", flush=True)
        # 最初と最後の閉じ括弧がないので、それを追加してJSON配列にする
        try:
            new_points_json = json.loads('[' + content + ']')
            print(f"JSONの解析に成功しました", flush=True)
        except json.JSONDecodeError as je:
            print(f"JSONの解析に失敗しました: {je}", flush=True)
            # コンテンツの一部を表示
            print(f"コンテンツの先頭部分: {content[:100]}", flush=True)
            raise
    
    print(f"新しいポイント数: {len(new_points_json)}", flush=True)
    
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
            new_points_json + 
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
        
        print(f"{len(new_points_json)}個のポイントを挿入しました。", flush=True)
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