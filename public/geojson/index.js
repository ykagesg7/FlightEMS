// GeoJSONデータをロードするためのヘルパー関数

/**
 * アルファベット別のウェイポイントインデックスをロードする
 * @returns {Promise<Object>} インデックスデータ
 */
export async function loadWaypointsAlphabetIndex() {
  try {
    const response = await fetch('/geojson/waypoints/index.json');
    if (!response.ok) {
      throw new Error('ウェイポイントインデックスのロードに失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('ウェイポイントインデックスの取得エラー:', error);
    return null;
  }
}

/**
 * 地域別のウェイポイントインデックスをロードする
 * @returns {Promise<Object>} インデックスデータ
 */
export async function loadWaypointsRegionIndex() {
  try {
    const response = await fetch('/geojson/waypoints/regions_index.json');
    if (!response.ok) {
      throw new Error('地域別ウェイポイントインデックスのロードに失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('地域別ウェイポイントインデックスの取得エラー:', error);
    return null;
  }
}

/**
 * 特定のアルファベットに属するウェイポイントをロードする
 * @param {string} letter - ロードするアルファベット（例: 'A'）
 * @returns {Promise<Object>} ウェイポイントデータ
 */
export async function loadWaypointsByLetter(letter) {
  try {
    const response = await fetch(`/geojson/waypoints/waypoints_${letter}.json`);
    if (!response.ok) {
      throw new Error(`${letter}で始まるウェイポイントのロードに失敗しました`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${letter}で始まるウェイポイントの取得エラー:`, error);
    return null;
  }
}

/**
 * 特定の地域に属するウェイポイントをロードする
 * @param {string} region - ロードする地域名（例: 'hokkaido'）
 * @returns {Promise<Object>} ウェイポイントデータ
 */
export async function loadWaypointsByRegion(region) {
  try {
    const response = await fetch(`/geojson/waypoints/waypoints_region_${region}.json`);
    if (!response.ok) {
      throw new Error(`${region}地域のウェイポイントのロードに失敗しました`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${region}地域のウェイポイントの取得エラー:`, error);
    return null;
  }
}

/**
 * 必要な範囲のウェイポイントをロードする
 * 地図の表示範囲に基づいて、適切な地域のウェイポイントをロードする
 * @param {Array<number>} bounds - 地図の表示範囲 [west, south, east, north]
 * @returns {Promise<Array<Object>>} ウェイポイントデータの配列
 */
export async function loadWaypointsInBounds(bounds) {
  try {
    // 地域インデックスをロード
    const regionIndex = await loadWaypointsRegionIndex();
    if (!regionIndex) return [];

    // 表示範囲内の地域を特定（シンプルな実装例）
    const [west, south, east, north] = bounds;
    const regionsToLoad = [];

    // 各地域の範囲と比較して、重なる地域を特定
    // この部分は実際の地域データ構造に応じて実装が必要
    // 以下は仮の実装例
    if (north > 41.0) regionsToLoad.push('hokkaido');
    if (south < 41.5 && north > 36.0) regionsToLoad.push('tohoku');
    if (south < 37.0 && north > 34.5) regionsToLoad.push('kanto');
    // ... 他の地域についても同様に

    // 該当する地域のデータをロード
    const waypointsPromises = regionsToLoad.map(region => loadWaypointsByRegion(region));
    const waypointsData = await Promise.all(waypointsPromises);

    // 結果をマージ
    const mergedWaypoints = {
      type: 'FeatureCollection',
      crs: waypointsData[0]?.crs || null,
      features: waypointsData.flatMap(data => data?.features || [])
    };

    return mergedWaypoints;
  } catch (error) {
    console.error('範囲内ウェイポイントの取得エラー:', error);
    return {
      type: 'FeatureCollection',
      features: []
    };
  }
}

/**
 * すべてのウェイポイントをロードする（パフォーマンスに注意）
 * @returns {Promise<Object>} すべてのウェイポイントデータ
 */
export async function loadAllWaypoints() {
  try {
    const response = await fetch('/geojson/Waypoints.json');
    if (!response.ok) {
      throw new Error('ウェイポイントデータのロードに失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('ウェイポイントデータの取得エラー:', error);
    return {
      type: 'FeatureCollection',
      features: []
    };
  }
}

/**
 * ウェイポイントを検索する
 * @param {string} query - 検索クエリ（ウェイポイントIDや名前の一部）
 * @returns {Promise<Array<Object>>} 検索結果のウェイポイント
 */
export async function searchWaypoints(query) {
  if (!query || query.length < 1) return [];
  
  // 検索クエリの最初の文字を取得
  const firstLetter = query.charAt(0).toUpperCase();
  
  try {
    // アルファベットでフィルタリング可能な場合
    if (/[A-Z]/.test(firstLetter)) {
      const waypointsData = await loadWaypointsByLetter(firstLetter);
      if (!waypointsData) return [];
      
      // クエリに一致するウェイポイントをフィルタリング
      return waypointsData.features.filter(feature => {
        const id = feature.properties.id || '';
        const name = feature.properties.name || '';
        return id.toLowerCase().includes(query.toLowerCase()) || 
               name.toLowerCase().includes(query.toLowerCase());
      });
    } else {
      // アルファベット以外の場合は全データからフィルタリング（非効率）
      console.warn('アルファベット以外で始まる検索は処理が重くなる可能性があります');
      const allData = await loadAllWaypoints();
      
      return allData.features.filter(feature => {
        const id = feature.properties.id || '';
        const name = feature.properties.name || '';
        return id.toLowerCase().includes(query.toLowerCase()) || 
               name.toLowerCase().includes(query.toLowerCase());
      });
    }
  } catch (error) {
    console.error('ウェイポイント検索エラー:', error);
    return [];
  }
} 