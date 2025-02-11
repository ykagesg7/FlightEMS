/**
 * 連続したDMS入力を解析する関数
 * @param input 例："N354336"（緯度の場合は6桁, 経度の場合は7桁）
 * @param isLatitude 緯度ならtrue、経度ならfalse
 * @returns { degrees, minutes, seconds, hemisphere } または解析失敗ならnull
 */
export function parseContinuousDMS(
  input: string,
  isLatitude: boolean
): { degrees: string; minutes: string; seconds: string; hemisphere: string } | null {
  // 空白除去＆大文字に変換
  const trimmed = input.trim().toUpperCase();

  // 緯度は6桁、経度は7桁の数字部分と先頭または末尾に方向記号（N/S または E/W）が含まれる想定
  const regex = isLatitude
    ? /^([NS])?(\d{6})([NS])?$/
    : /^([EW])?(\d{7})([EW])?$/;
  const match = trimmed.match(regex);
  if (!match) return null;

  // 先頭または末尾の記号を取得（なければデフォルトとしてNまたはE）
  const hemisphere = match[1] || match[3] || (isLatitude ? 'N' : 'E');
  const digits = match[2];

  if (isLatitude) {
    // 6桁の場合：先頭2桁＝度、次の2桁＝分、残り2桁＝秒
    return {
      degrees: digits.slice(0, 2),
      minutes: digits.slice(2, 4),
      seconds: digits.slice(4, 6),
      hemisphere,
    };
  } else {
    // 7桁の場合：先頭3桁＝度、次の2桁＝分、残り2桁＝秒
    return {
      degrees: digits.slice(0, 3),
      minutes: digits.slice(3, 5),
      seconds: digits.slice(5, 7),
      hemisphere,
    };
  }
}

export const dmsToDecimal = (value: string, isLatitude: boolean): number => {
  // 先頭または末尾にあるヘミスフィア情報を抽出
  let hemisphere = '';
  if (/^[NnSsEeWw]/.test(value)) {
    hemisphere = value.charAt(0).toUpperCase();
    value = value.substring(1);
  } else if (/[NnSsEeWw]$/.test(value)) {
    hemisphere = value.charAt(value.length - 1).toUpperCase();
    value = value.substring(0, value.length - 1);
  }
  // ヘミスフィア指定がなければデフォルトとする
  if (!hemisphere) {
    hemisphere = isLatitude ? 'N' : 'E';
  }

  // 数字部分のみ取得
  const digits = value;
  if (isLatitude && digits.length !== 6) {
    throw new Error('緯度は6桁の数値 (ddmmss) で入力してください');
  }
  if (!isLatitude && digits.length !== 7) {
    throw new Error('経度は7桁の数値 (dddmmss) で入力してください');
  }

  let degrees: number, minutes: number, seconds: number;
  if (isLatitude) {
    degrees = parseInt(digits.slice(0, 2), 10);
    minutes = parseInt(digits.slice(2, 4), 10);
    seconds = parseInt(digits.slice(4, 6), 10);
  } else {
    degrees = parseInt(digits.slice(0, 3), 10);
    minutes = parseInt(digits.slice(3, 5), 10);
    seconds = parseInt(digits.slice(5, 7), 10);
  }

  // 分・秒の妥当性チェック
  if (minutes >= 60 || seconds >= 60) {
    throw new Error('分または秒の値が無効です');
  }

  let decimal = degrees + minutes / 60 + seconds / 3600;
  if ((isLatitude && hemisphere === 'S') || (!isLatitude && hemisphere === 'W')) {
    decimal *= -1;
  }
  return decimal;
}; 