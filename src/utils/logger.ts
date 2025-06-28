/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 環境に応じてログ出力を制御するロガーユーティリティ
 */

const isDevelopment = import.meta.env.MODE === 'development';

// ログレベル型定義
export type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

// ログ可能な値の型定義
export type LogValue = string | number | boolean | null | undefined | object | Error;

export interface Logger {
  log: (...args: LogValue[]) => void;
  warn: (...args: LogValue[]) => void;
  error: (...args: LogValue[]) => void;
  info: (...args: LogValue[]) => void;
  debug: (...args: LogValue[]) => void;
}

export const logger: Logger = {
  log: (...args: LogValue[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: LogValue[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: LogValue[]) => {
    // エラーは本番環境でも出力（デバッグに必要）
    console.error(...args);
  },
  
  info: (...args: LogValue[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: LogValue[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

export default logger; 