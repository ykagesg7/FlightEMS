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
        // 例: newValue が空文字でない場合は有効とする（本来はより複雑なバリデーションを行う）
        const isValid = newValue.trim() !== '';
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
        } else {
            setError('無効な値です');
        }
    }, [latitude]); // 依存配列を適切に設定

    useEffect(() => {
        if (!error) {
            onChange(formatDMSValue(degrees, minutes, seconds, latitude));
        }
    }, [degrees, minutes, seconds, onChange, error, latitude]);

    return { degrees, minutes, seconds, error, handleFieldChange };
}; 