"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  // final認識ごとに親にテキストを通知
  onResult: (text: string) => void,
};

/**
 * 音声認識（SpeechRecognition）入力コンポーネント
 * 
 * - 「音声入力」ボタンで認識開始、途中で停止ボタンで認識停止
 * - 認識途中の仮テキスト（interim）もリアルタイム表示
 * - final認識ごとにonResultで親へ通知
 * - 発話が途切れても停止せず、ボタンでのみ停止
 */
export const SpeechRecognitionInput = ({ onResult }: Props) => {
  // クロスブラウザ用にSpeechRecognitionインスタンスを取得
  const getSpeechRecognition = (): typeof SpeechRecognition | undefined => {
    if (typeof window === "undefined") return undefined;
    return window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  };

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const stopRequested = useRef(false);

  /**
   * コンポーネント初回マウント時にSpeechRecognitionインスタンスを生成・設定
   * 再マウントされない限り認識器の再生成はされない（安定動作のため依存配列は[]に固定）
   */
  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setIsSupported(false);
      return;
    }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "ja-JP";
    recognition.interimResults = true;
    recognition.continuous = true;

    // 認識結果受信時
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
      if (final) {
        setInterimText("");
        onResult(final);
      }
    };

    // エラー発生時も停止せず無視（Chromeでは発話途切れでno-speechエラーが頻発するため）
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 必要ならconsole.error(event.error);
    };

    // 発話終了時の自動再開処理
    recognition.onend = () => {
      // 停止指示時のみUIも停止
      if (stopRequested.current) {
        setIsListening(false);
        return;
      }
      recognition.start();
    };

    // クリーンアップ
    return () => {
      recognition.stop();
      stopRequested.current = true;
      setIsListening(false);
    };
  }, []);

  const start = () => {
    if (!recognitionRef.current) return;
    stopRequested.current = false;
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stop = () => {
    if (!recognitionRef.current) return;
    stopRequested.current = true;
    recognitionRef.current.stop();
    // setIsListening(false); はonendで呼ぶ
  };

  if (!isSupported) {
    return (
      <div className="text-red-500">
        This browser does not support speech recognition.
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <button
        type="button"
        className={`px-4 py-2 rounded text-white ${isListening ? "bg-red-500" : "bg-blue-500"}`}
        onClick={isListening ? stop : start}
      >
        {isListening ? "停止" : "音声入力"}
      </button>
      <div className="mt-2 min-h-6 text-gray-700">
        {isListening ? (interimText || "話してください…") : ""}
      </div>
    </div>
  );
};