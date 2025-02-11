import { useState, useEffect, useCallback } from 'react';
import { parseDMSValue, formatDMSValue } from '../utils'; // ヘルパー関数を utils からインポート

export const useDmsInput = (initialValue: string, onChange: (value: string) => void, latitude?: boolean) => {
    const [degrees, setDegrees] = useState<string>('');
    const [minutes, setMinutes] = useState<string>('');
    const [seconds, setSeconds] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // parseDMSValue, formatDMSValue は utils に移動

    useEffect(() => {
        const parsed = parseDMSValue(initialValue, latitude);
        if (parsed) {
            setDegrees(parsed.degrees);
            setMinutes(parsed.minutes);
            setSeconds(parsed.seconds);
        }
    }, [initialValue, latitude]);

    const handleFieldChange = useCallback((field: 'degrees' | 'minutes' | 'seconds', newValue: string) => {
        // ... (バリデーションロジックはここに記述)
        // ... (数値範囲チェック、エラーメッセージ設定)

        if (isValid) {
            setError(null);
            switch (field) {
                case 'degrees':
                    setDegrees(newValue);
                    break;
                case 'minutes':
                    setMinutes(newValue);
                    break;
                case 'seconds':
                    setSeconds(newValue);
                    break;
            }
        }
    }, [latitude]); // 依存配列を適切に設定

    useEffect(() => {
        if (!error) {
            onChange(formatDMSValue(degrees, minutes, seconds, latitude));
        }
    }, [degrees, minutes, seconds, onChange, error, latitude]);

    return { degrees, minutes, seconds, error, handleFieldChange };
}; 