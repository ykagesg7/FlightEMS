import React, { useState, useEffect, useCallback } from 'react';
import { parseDMSValue, formatDMSValue } from '../utils';

interface DmsInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    latitude?: boolean; // 緯度入力かどうか
    error?: string;
}

/**
 * DMS形式のテキスト入力コンポーネント (簡略版)
 *
 * 入力形式: 緯度(6桁整数), 経度(7桁整数)
 *   緯度: DDMMSS (DD:度, MM:分, SS:秒)
 *   経度: DDDMMSS (DDD:度, MM:分, SS:秒)
 *
 * 方位記号(N, S, E, W)はオプションで、数値の前後どちらに付与しても認識します。
 * 例: "N345678", "345678N", "345678" (緯度), "E1234567", "1234567E", "1234567" (経度)
 */
const DmsInput: React.FC<DmsInputProps> = React.memo(({
    label,
    value,
    onChange,
    latitude = false,
    error
}) => {
    const [degrees, setDegrees] = useState('');
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');

    // 入力値が変更されたときに、degrees, minutes, secondsを更新
    useEffect(() => {
        const parsed = parseDMSValue(value, latitude);
        if (parsed) {
            setDegrees(parsed.degrees);
            setMinutes(parsed.minutes);
            setSeconds(parsed.seconds);
        }
    }, [value, latitude]);

    // DMS形式の文字列を生成する関数
    const formatValue = useCallback((d: string, m: string, s: string) => {
        return formatDMSValue(d, m, s, latitude);
    }, [latitude]);

    // 各入力値の変更ハンドラ
    const updateDegrees = useCallback((val: string) => {
        setDegrees(val);
        onChange(formatValue(val, minutes, seconds));
    }, [minutes, seconds, onChange, formatValue]);

    const updateMinutes = useCallback((val: string) => {
        setMinutes(val);
        onChange(formatValue(degrees, val, seconds));
    }, [degrees, seconds, onChange, formatValue]);

    const updateSeconds = useCallback((val: string) => {
        setSeconds(val);
        onChange(formatValue(degrees, minutes, val));
    }, [degrees, minutes, onChange, formatValue]);

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-white-700 mb-2">{label}</label>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={degrees}
                    onChange={(e) => updateDegrees(e.target.value)}
                    placeholder={latitude ? "DD" : "DDD"}
                    className="w-20 rounded border-gray-300"
                    maxLength={latitude ? 2 : 3}
                />
                <input
                    type="text"
                    value={minutes}
                    onChange={(e) => updateMinutes(e.target.value)}
                    placeholder="MM"
                    className="w-20 rounded border-gray-300"
                    maxLength={2}
                />
                <input
                    type="text"
                    value={seconds}
                    onChange={(e) => updateSeconds(e.target.value)}
                    placeholder="SS"
                    className="w-20 rounded border-gray-300"
                    maxLength={2}
                />
            </div>
            {error && <p className="mt-1 text-red-500 text-sm">{error}</p>} {/* エラーメッセージ表示 */}
        </div>
    );
});

export default DmsInput; 