/**
 * 度分秒形式（ddmmssX）の緯度・経度を10進数形式に変換する
 * dd = 度, mm = 分, ss = 秒, X = 方角（N/S/E/W）
 */

// 緯度を変換（ddmmssN/S形式）
function convertLatitude(latStr) {
  // 数値部分と方角を分離
  const direction = latStr.slice(-1);
  const numeric = latStr.slice(0, -1);
  
  // 度・分・秒に分解
  const degrees = parseInt(numeric.slice(0, 2), 10);
  const minutes = parseInt(numeric.slice(2, 4), 10);
  const seconds = parseInt(numeric.slice(4, 6), 10);
  
  // 10進数に変換
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  // 南緯の場合は負の値にする
  if (direction === 'S') {
    decimal = -decimal;
  }
  
  // 小数点以下4桁に丸める
  return parseFloat(decimal.toFixed(4));
}

// 経度を変換（dddmmssE/W形式）
function convertLongitude(lonStr) {
  // 数値部分と方角を分離
  const direction = lonStr.slice(-1);
  const numeric = lonStr.slice(0, -1);
  
  // 度・分・秒に分解
  const degrees = parseInt(numeric.slice(0, 3), 10);
  const minutes = parseInt(numeric.slice(3, 5), 10);
  const seconds = parseInt(numeric.slice(5, 7), 10);
  
  // 10進数に変換
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  // 西経の場合は負の値にする
  if (direction === 'W') {
    decimal = -decimal;
  }
  
  // 小数点以下4桁に丸める
  return parseFloat(decimal.toFixed(4));
}

// テスト用
function test() {
  // テストデータ
  const testData = [
    { lat: '242621N', lon: '1231508E' },
    { lat: '440001N', lon: '1440834E' },
    { lat: '325413N', lon: '1304906E' },
    { lat: '350345N', lon: '1360117E' }
  ];

  console.log('緯度変換テスト（ddmmssN → dd.dddd）:');
  testData.forEach(data => {
    const converted = convertLatitude(data.lat);
    console.log(`${data.lat} → ${converted} (小数点以下4桁)`);
  });

  console.log('\n経度変換テスト（dddmmssE → ddd.dddd）:');
  testData.forEach(data => {
    const converted = convertLongitude(data.lon);
    console.log(`${data.lon} → ${converted} (小数点以下4桁)`);
  });
}

module.exports = {
  convertLatitude,
  convertLongitude
};

// コマンドラインから直接実行された場合はテストを実行
if (require.main === module) {
  test();
} 