import React, { useState, useEffect } from 'react';

interface SlideCategory {
  id: string;
  title: string;
  slides: number[];
}

// マニューバービューアコンポーネント
interface ManeuverViewerProps {
  slideNumber: number;
  isVisible: boolean;
}

const ManeuverViewer: React.FC<ManeuverViewerProps> = ({ slideNumber, isVisible }) => {
  // スライド番号に基づいて表示するHTMLファイルを決定
  const getManeuverFile = (slideNum: number): string => {
    // 特定のスライドに対応するマニューバーファイルをマッピング
    const maneuverMap: Record<number, string> = {
      5: '/maneuver/straight_join.html', // 例：スライド5にはstraight_join.htmlを表示
      7: '/maneuver/turning_join.html',  // 例：スライド7にはturning_join.htmlを表示
      12: '/maneuver/straight_overshoot.html',
      14: '/maneuver/turning_overshoot.html',
      18: '/maneuver/breakout.html',
      // 必要に応じて他のスライドとファイルのマッピングを追加
    };

    return maneuverMap[slideNum] || '';
  };

  const maneuverFile = getManeuverFile(slideNumber);

  if (!isVisible || !maneuverFile) {
    return null;
  }

  return (
    <div className="maneuver-viewer mt-4 border-2 border-indigo-200 rounded-lg overflow-hidden">
      <div className="bg-indigo-50 py-2 px-4 font-semibold text-indigo-800 flex justify-between items-center">
        <span>詳細図解ビューア</span>
        <a 
          href={maneuverFile}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          別ウィンドウで開く
        </a>
      </div>
      <iframe 
        src={maneuverFile} 
        className="w-full h-[500px]"
        title={`Maneuver Visualization for Slide ${slideNumber}`}
        allowFullScreen
      />
    </div>
  );
};

// スライドカテゴリー定義
const slideCategories: SlideCategory[] = [
  {
    id: 'intro',
    title: '編隊飛行の基本',
    slides: [1, 2, 3, 4, 5]
  },
  {
    id: 'rejoin',
    title: '再会合テクニック',
    slides: [6, 7, 8, 9, 10]
  },
  {
    id: 'overshoot',
    title: 'オーバーシュート操作',
    slides: [11, 12, 13, 14, 15, 16]
  },
  {
    id: 'breakout',
    title: 'ブレイクアウト手順',
    slides: [17, 18, 19, 20]
  }
];

const LearningTab: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showContentSelector, setShowContentSelector] = useState(false);
  const [showManeuver, setShowManeuver] = useState(false);
  const totalSlides = 20;

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // 特定のスライドに直接ジャンプする関数
  const goToSlide = (slideNumber: number) => {
    if (slideNumber >= 1 && slideNumber <= totalSlides) {
      setCurrentSlide(slideNumber);
      setShowContentSelector(false);
    }
  };

  // カテゴリーに含まれる最初のスライドに移動
  const goToCategory = (categoryId: string) => {
    const category = slideCategories.find(cat => cat.id === categoryId);
    if (category && category.slides.length > 0) {
      setCurrentSlide(category.slides[0]);
      setShowContentSelector(false);
    }
  };

  // 特定のスライドにマニューバービューアが利用可能かチェック
  const hasManeuverViewer = (slideNum: number): boolean => {
    const slidesWithManeuvers = [5, 7, 12, 14, 18]; // マニューバー対応スライド
    return slidesWithManeuvers.includes(slideNum);
  };

  // トグルマニューバービューア
  const toggleManeuverViewer = () => {
    setShowManeuver(!showManeuver);
  };

  useEffect(() => {
    // キーボードナビゲーションの設定
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide]);

  return (
    <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden">
      <div className="slide-container max-w-4xl mx-auto">
        <div className="navigation bg-indigo-800 text-center p-4 flex justify-between items-center">
          <div>
            <button 
              className="nav-btn bg-white text-indigo-800 border-none px-4 py-2 mx-1 cursor-pointer rounded font-bold hover:bg-indigo-100" 
              onClick={prevSlide}
            >
              前へ
            </button>
            <span className="text-white mx-4 font-semibold">{currentSlide} / {totalSlides}</span>
            <button 
              className="nav-btn bg-white text-indigo-800 border-none px-4 py-2 mx-1 cursor-pointer rounded font-bold hover:bg-indigo-100" 
              onClick={nextSlide}
            >
              次へ
            </button>
          </div>
          <div>
            {hasManeuverViewer(currentSlide) && (
              <button 
                className="nav-btn bg-green-500 text-white border-none px-4 py-2 mx-1 cursor-pointer rounded font-bold hover:bg-green-600 mr-2"
                onClick={toggleManeuverViewer}
              >
                {showManeuver ? '図解を隠す' : '図解を表示'}
              </button>
            )}
            <button 
              className="nav-btn bg-amber-400 text-indigo-900 border-none px-4 py-2 mx-1 cursor-pointer rounded font-bold hover:bg-amber-300"
              onClick={() => setShowContentSelector(!showContentSelector)}
            >
              目次
            </button>
          </div>
        </div>

        {/* コンテンツセレクター */}
        {showContentSelector && (
          <div className="content-selector bg-white p-6 border-b-2 border-indigo-200">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">学習コンテンツ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slideCategories.map(category => (
                <div 
                  key={category.id}
                  className="category-card bg-indigo-50 p-4 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
                  onClick={() => goToCategory(category.id)}
                >
                  <h3 className="text-lg font-semibold text-indigo-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-indigo-700">スライド: {category.slides.join(', ')}</p>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-semibold text-indigo-900 mt-6 mb-2">スライド一覧</h3>
            <div className="slide-numbers flex flex-wrap gap-2">
              {Array.from({ length: totalSlides }, (_, i) => i + 1).map(num => (
                <button 
                  key={num}
                  className={`w-10 h-10 flex items-center justify-center rounded-full 
                    ${currentSlide === num 
                      ? 'bg-indigo-700 text-white font-bold' 
                      : 'bg-gray-200 text-gray-700 hover:bg-indigo-200'}`}
                  onClick={() => goToSlide(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* スライド1 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 1 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">編隊飛行: RejoinとOvershoot</h1>
          <div className="content text-lg text-gray-800">
            <h2 className="text-xl font-bold mb-4 text-indigo-800">コンテンツ</h2>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Rejoinの目的と種類</li>
              <li>直進及び旋回によるRejoinの実行</li>
              <li>Overshootの発生時の対処</li>
              <li>Breakoutのタイミングと方法</li>
            </ul>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>安全第一:</strong> 編隊飛行は正確な操縦、適切な判断、明確なコミュニケーションが必要です。常に手順よりも安全を優先してください。</p>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">1/20</div>
        </div>
        
        {/* スライド2 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 2 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Rejoinの目的</h1>
          <div className="content text-lg text-gray-800">
            <p>Rejoinとは、分離した航空機を安全かつ効率的に再び集合させるための方法です。</p>
            <h3 className="text-lg font-bold mt-4 mb-2 text-indigo-800">主要ポイント:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>長機は、無線または視覚信号でRejoinを指示します</li>
              <li>長機は、エネルギー管理のために軽い上昇や降下を行うことがあります</li>
              <li>長機は、Rejoin中を通して僚機を監視します</li>
              <li>標準諸元は、事前ブリーフィングまたはユニット標準で設定されます</li>
            </ul>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>長機の責任:</strong></p>
              <ul className="list-disc pl-6 my-2">
                <li>僚機を注意深く監視する</li>
                <li>予測可能な飛行経路を維持する</li>
                <li>異なる対気速度やバンク角で飛行する場合は通信する</li>
              </ul>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">2/20</div>
        </div>
        
        {/* スライド3 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 3 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">標準的なRejoin時の諸元</h1>
          <div className="content text-lg text-gray-800">
            <table className="w-full border-collapse my-6">
              <tr className="bg-indigo-800 text-white">
                <th className="border border-gray-300 p-3 text-left">Rejoinタイプ</th>
                <th className="border border-gray-300 p-3 text-left">対気速度</th>
                <th className="border border-gray-300 p-3 text-left">バンク角</th>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-300 p-3">基本隊形から</td>
                <td className="border border-gray-300 p-3">300kt IAS</td>
                <td className="border border-gray-300 p-3">30度</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="border border-gray-300 p-3">戦術隊形から</td>
                <td className="border border-gray-300 p-3">350kt IAS</td>
                <td className="border border-gray-300 p-3">45度</td>
              </tr>
            </table>
            <p>Rejoinは、さまざまな位置から開始できます:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>ピッチアウト後</li>
              <li>セパレート（間隔を取った）後</li>
              <li>レーダー・トレールから</li>
              <li>戦術隊形から</li>
            </ul>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>注意:</strong> これらは標準諸元です。長機はこれらの標準から逸脱する際は、僚機にその旨を伝えるべきです。</p>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">3/20</div>
        </div>
        
        {/* スライド4 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 4 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Rejoinの種類</h1>
          <div className="content text-lg text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2 text-indigo-800">Straight Join-up</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>指示: 音声通信（状況により、視覚信号（ウイングロック）も使用される）</li>
                  <li>標準対気速度: 300kt IAS</li>
                  <li>2番機は左、3、4番機は右にRejoin</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-indigo-800">Turning Join-up</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>視覚信号: ウイングロック（旋回方向から）</li>
                  <li>2番機: 300kt IAS、30°バンク、長機の内側</li>
                  <li>3、4番機: 同じパラメータ、距離を詰めて長機の外側</li>
                </ul>
              </div>
            </div>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>コミュニケーションが重要:</strong> すべての視覚信号は、後続機のために各ウイングマンが繰り返すべきです。</p>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">4/20</div>
        </div>
        
        {/* スライド5 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 5 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Straight Join-up: テクニック</h1>
          <div className="content text-lg text-gray-800">
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>僚機は、長機から横幅を取り、約50ktのVc（接近速度）を確立</li>
              <li>ジェット後流を避けるため、長機から１機長下方に占位</li>
              <li>長機との距離に応じて、Vcを調整（3,000ft：+30kt、2,000ft：+20kt、1,000ft：+10kt）</li>
              <li>長機の30度ラインに近づいたら、HCA（交角）を作り、Finger-tip隊形へ移行</li>
              <li>30度ラインを維持できるように、速度をコントロール</li>
            </ol>
            <div className="relative h-[300px] w-full bg-blue-100 rounded-lg my-6 p-4">
              <div className="absolute top-[120px] left-[600px] w-[40px] h-[40px] bg-indigo-800 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[140px] left-[100px] w-[40px] h-[40px] bg-red-700 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[90px] left-[610px] text-sm text-indigo-900 font-semibold">リード</div>
              <div className="absolute top-[160px] left-[110px] text-sm text-red-800 font-semibold">ウイングマン</div>
              <div className="absolute top-[140px] left-[150px] text-red-800 text-sm font-semibold">約50ノットの接近速度</div>
              <div className="absolute top-[140px] left-[150px] w-[400px] border-t-2 border-dashed border-gray-600"></div>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">5/20</div>
        </div>
        
        {/* スライド6 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 6 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">参照点</h1>
          <div className="content text-lg text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2 text-indigo-800">距離判定が重要:</h3>
                <p>長機の後方約2,000ftでは:</p>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>エンジン排気口（∞）が識別できる</li>
                  <li>機首の機番はまだ識別できない</li>
                </ul>
                <p>長機との距離を判定しつつ速度をクロスチェックし、オーバーシュートを避けます。</p>
              </div>
              <div>
                <div className="bg-gray-200 h-[200px] flex items-center justify-center rounded-lg mt-5 p-4">
                  <div className="text-center text-gray-900">
                    <div className="text-2xl">≈ 1,500 ft</div>
                    <div className="w-[60px] h-[30px] mx-auto my-3 relative">
                      <div className="absolute w-[60px] h-[15px] bg-gray-800 rounded"></div>
                      <div className="absolute w-[15px] h-[15px] bg-gray-800 rounded-full top-0 left-[10px]"></div>
                      <div className="absolute w-[15px] h-[15px] bg-gray-800 rounded-full top-0 right-[10px]"></div>
                    </div>
                    <div>エンジン排気口の8の字パターンが見える</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>エネルギー管理:</strong> 速度（Vc）管理は常に行ってください。オーバーシュートを避けるには、出力低減のタイミングが重要です。</p>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">6/20</div>
        </div>
        
        {/* スライド7 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 7 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Turning Join-up（２番機）</h1>
          <div className="content text-lg text-gray-800">
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>長機の視覚信号の後、長機と同方向に旋回を開始</li>
              <li>１機長の機高差を確立</li>
              <li>Lead Pursuit(L.P)でAspect Angle（AA）を増加させる。</li>
              <li>5AAとなったら、Lead量を減らし、AAを維持して接近する。</li>
              <li>1,000ftに近づいたら、Lead量を増やし、AAを5から6AAに増加させる。</li>
              <li>6AAとなったら、再度Lead量を減少させ、Finger-tip隊形へ占位する。</li>
            </ol>
            <div className="relative h-[300px] w-full bg-blue-100 rounded-lg my-6 p-4">
              <div className="absolute w-[250px] h-[250px] border-2 border-dashed border-indigo-800 rounded-full top-[25px] left-[325px]"></div>
              <div className="absolute top-[25px] left-[450px] w-[40px] h-[40px] bg-indigo-800 transform -rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[125px] left-[200px] w-[40px] h-[40px] bg-red-700 transform rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[0px] left-[470px] text-sm text-indigo-900 font-semibold">リード</div>
              <div className="absolute top-[150px] left-[160px] text-sm text-red-800 font-semibold">2番機</div>
              <div className="absolute top-[80px] left-[280px] text-red-800 text-sm font-semibold">リードパーシュート</div>
              <div className="absolute top-[50px] left-[400px] transform -rotate-30 text-sm text-indigo-900 font-semibold">旋回円</div>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">7/20</div>
        </div>
        
        {/* スライド8 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 8 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">旋回時のAA</h1>
          <div className="content text-lg text-gray-800">
            <p className="mb-4">旋回を利用した空中集合には、AAの理解が重要です。</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>低AA：</strong>Tail(長機の真後ろ)～6AA</li>
              <li><strong>中AA：</strong>7～11AA</li>
              <li><strong>高AA：</strong>12～Hot(真正面)</li>
            </ul>
            <p>6AAから接近するのは、長機が監視しやすく、かつAspectのコントロールが容易だからです。</p>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">8/20</div>
        </div>
        
        {/* スライド9 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 9 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Turning Join-up (3/4番機)</h1>
          <div className="content text-lg text-gray-800">
            <h3 className="text-lg font-bold mb-2 text-indigo-800">実行手順:</h3>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>当初、3/4番機は2番機と同様に、長機の旋回内側から接近を開始します。</li>
              <li>2番機との安全な距離（最低500ft以上）を維持することが重要です。</li>
              <li>2番機が長機への集合（Finger-tip隊形への移行）を完了するまで、旋回内側の安全な距離で待機します。</li>
              <li>2番機の集合完了後、長機の下方を通過し（Nose-Tail Clearanceを確保）、旋回外側へ移動します。</li>
              <li>旋回外側で、所定の隊形に占位します。</li>
            </ol>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">9/20</div>
        </div>
        
        {/* スライド10 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 10 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Rejoin時のCommunication</h1>
          <div className="content text-lg text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2 text-indigo-800">視覚信号:</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>ウイングロック</li>
                </ul>
                <p>各ウイングマンは後続機のために信号を繰り返します。</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-indigo-800">無線通信:</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>視覚信号が実用的でない場合、長機は無線でRejoinを指示する場合がある。</li>
                  <li>標準と異なる場合、長機はパラメータを伝えるべき</li>
                </ul>
              </div>
            </div>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>無線通信例:</strong></p>
              <ul className="list-disc pl-6 my-2">
                <li>"DA-K, rejoin left"</li>
                <li>"DA-K, rejoin right, 350 knots"</li>
                <li>"DA-K, Straight Join-up, left side, 360°, 300kt."</li>
              </ul>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">10/20</div>
        </div>
        
        {/* スライド11 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 11 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Overshoot: 概念と重要性</h1>
          <div className="content text-lg text-gray-800">
            <h3 className="text-lg font-bold mb-2 text-indigo-800">Overshootとは？</h3>
            <p className="mb-4">Overshootは、Rejoin (再会合) 中に長機に対する**過度な接近率 (Vc)** や**不適切な角度 (AA/HCA)** が発生し、安全な集合が困難と判断した場合に、これを解消するために行う意図的な機動です。</p>

            <h3 className="text-lg font-bold mt-4 mb-2 text-indigo-800">なぜOvershootが必要か？</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>衝突のリスクを回避するため。</li>
              <li>無理な修正操作による危険な状況 (例: 視界喪失、失速) を防ぐため。</li>
              <li>安全かつ確実にRejoinを完了させるための、プロフェッショナルな判断と技術です。</li>
            </ul>

            <h3 className="text-lg font-bold mt-6 mb-2 text-indigo-800">実行時の共通重要事項:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>**早期判断:** 「危ないかも」と感じたら、Overshootの実行をためらわない。Rejoinを無理に「救おう」としないこと。</li>
              <li>**視界確保:** 常にリード（長機）と先行機を視界内に維持する。</li>
              <li>**伝達:** Overshootを行う際は、他の編隊メンバーに無線等で明確に伝える。（例: "DA-K 2, Overshooting"）</li>
            </ul>

            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>安全第一:</strong> 適切に実行されたOvershootは、危険を認識しながら無理な操作を続けるよりも、はるかに安全で正しい選択です。</p>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">11/20</div>
        </div>
        
        {/* スライド12 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 12 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Overshoot: 直進時の実行手順</h1>
          <div className="content text-lg text-gray-800">
            <p className="mb-4">直進Rejoin中のOvershootは、主に**過度な接近率 (Vc)** が原因で発生します。</p>
            <h3 className="text-lg font-bold mb-2 text-indigo-800">実行手順:</h3>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>過度の接近速度を認識したら、**直ちにアイドルパワーを選択**し、必要に応じて**スピードブレーキを使用**します。</li>
              <li>機首をわずかに長機から離れる方向（Joinしていたサイド）に向け、**数機幅分オフセットした平行経路**を取ります。</li>
              <li>長機を追い越す際は、**わずかに離れていくベクトル**を維持します。</li>
              <li>**肩越しに長機を視認**し続け、不用意に長機へ向かわないように注意します。</li>
              <li>長機と**同速になる直前**にスピードブレーキを格納し、**パワーを追加**して後方に落ちないようにエネルギーを管理します。</li>
              <li>安全な間隔と速度になったら、再度Join-upを試みるか、指示を待ちます。</li>
            </ol>

            {/* 図はそのまま流用 */}
            <div className="relative h-[300px] w-full bg-blue-100 rounded-lg my-6 p-4">
              <div className="absolute top-[150px] left-[400px] w-[40px] h-[40px] bg-indigo-800 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[170px] left-[500px] w-[40px] h-[40px] bg-red-700 transform rotate-15" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[120px] left-[410px] text-sm text-indigo-900 font-semibold">リード</div>
              <div className="absolute top-[190px] left-[510px] text-sm text-red-800 font-semibold">ウイングマン</div>
              <div className="absolute top-[130px] left-[480px] text-red-800 text-sm font-semibold">オーバーシュート経路</div>
              <div className="absolute h-[40px] top-[180px] left-[520px] border-l-2 border-dashed border-red-600 transform rotate-75"></div>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">12/20</div>
        </div>
        
        {/* スライド13 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 13 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Overshoot: 旋回時の判断と基本操作</h1>
          <div className="content text-lg text-gray-800">
            <p className="mb-4">旋回Rejoin中のOvershootは、**過度な接近率 (Vc)** に加え、**不適切なアスペクトアングル (AA)** や**角度ずれ (HCA)** が複合的に絡むことが多いです。</p>

            <h3 className="text-lg font-bold mt-4 mb-2 text-indigo-800">Overshootを判断する主な状況:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>現在のVcやAAのままでは、安全に減速・修正して目標位置に入れないと予測される場合。</li>
              <li>接近率を抑えるためにバンクを深くすると、長機が視界から隠れてしまう（ブラインドになる）リスクが高い場合。</li>
              <li>長機に対するAAが大きくなりすぎ（High AA）、適切なパーシュートカーブを描けない場合。</li>
            </ul>

            <h3 className="text-lg font-bold mt-4 mb-2 text-indigo-800">基本的な操作方針:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>**旋回外側へ機動:** 安全な間隔と視界を確保するため、通常は長機の旋回円の外側へ移動します。</li>
              <li>**パワー＆バンク調整:** アイドルパワーやスピードブレーキを使用し、バンク角を調整して接近率と角度ずれを制御します。</li>
              <li>**高度維持:** 基本的に長機より低い高度を維持し、上昇して視界を失わないようにします。</li>
            </ul>
             <p className="mt-6">具体的な実行手順は次のスライドで詳しく見ていきます。</p>

            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
               <p><strong>重要概念:</strong> 対気速度や角度ずれが大きいほど、問題を安全に解決するために必要な旋回半径（スペース）も大きくなります。早めの判断が重要です。</p>
             </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">13/20</div>
        </div>
        
        {/* スライド14 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 14 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">Overshoot: 旋回時の実行手順と視覚化</h1>
          <div className="content text-lg text-gray-800">
            <h3 className="text-lg font-bold mb-2 text-indigo-800">実行手順 (旋回外側へ):</h3>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>Overshootをコールし、アイドルパワー、必要ならスピードブレーキを使用。</li>
              <li>バンク角をやや浅くするか、一時的に逆バンクを入れるなどして、長機の**低い6時方向 (Low Six)** を目指して横切ります。</li>
              <li>横切る際は、**最低2機長程度の機首-尾部間隔 (Nose-Tail Clearance)** を確保します。</li>
              <li>長機の旋回円の外側に出たら、バンクとG（バックスティック圧）を調整し、長機と**平行な飛行経路**を維持しつつ安定させます (通常、Route Echelonの位置関係)。</li>
              <li>長機より高くならないように注意します。</li>
              <li>接近率と角度ずれがコントロールできたら、パワーを追加し、再度旋回内側へ移動して適切なAAを再確立し、Rejoinを完了させます。</li>
            </ol>

             {/* 図はそのまま流用 */}
            <div className="relative h-[300px] w-full bg-blue-100 rounded-lg my-6 p-4">
              <div className="absolute w-[250px] h-[250px] border-2 border-dashed border-indigo-800 rounded-full top-[25px] left-[325px]"></div>
              <div className="absolute top-[25px] left-[450px] w-[40px] h-[40px] bg-indigo-800 transform -rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[150px] left-[450px] w-[40px] h-[40px] bg-red-700 transform rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[0px] left-[470px] text-sm text-indigo-900 font-semibold">リード</div>
              <div className="absolute top-[170px] left-[460px] text-sm text-red-800 font-semibold">ウイングマン</div>
              <div className="absolute w-[100px] h-[100px] border-2 border-dashed border-red-600 rounded-full top-[100px] left-[400px]"></div>
              <div className="absolute top-[210px] left-[410px] text-red-800 text-sm font-semibold">オーバーシュート経路</div>
              <div className="absolute top-[60px] left-[500px] text-sm text-indigo-900 font-semibold">1. Vc/AA過大を認識</div>
              <div className="absolute top-[180px] left-[500px] text-sm text-indigo-900 font-semibold">2. リードのLow Sixを横切る</div>
              <div className="absolute top-[250px] left-[400px] text-sm text-indigo-900 font-semibold">3. 旋回外側で安定</div>
            </div>

          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">14/20</div>
        </div>
        
        {/* スライド15 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 15 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">角度的オーバーシュートと対気速度オーバーシュート</h1>
          <div className="content text-lg text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2 text-indigo-800">対気速度オーバーシュート</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>過度の接近速度によって引き起こされる</li>
                  <li>主な解決策: 出力を減らし、スピードブレーキを展開</li>
                  <li>離反ベクトルを持ってリードの外側を通過する結果になる</li>
                  <li>回復: 等速に達したら後方に落ちないよう出力を上げる</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-indigo-800">角度的オーバーシュート</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>過度の角度ずれ（不適切なパーシュートカーブ）によって引き起こされる</li>
                  <li>リードの旋回円の外側を飛行する必要はないかもしれない</li>
                  <li>リードの低い6時方向に飛行することで十分な前方視界を確保できる場合がある</li>
                  <li>回復: 機体を整列させ、エネルギーを管理してオーバーシュートを止める</li>
                </ul>
              </div>
            </div>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>実際には:</strong> ほとんどのオーバーシュートは対気速度と角度の両方の問題が組み合わさっています。</p>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">15/20</div>
        </div>
        
        {/* スライド16 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 16 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">3機と4機編隊でのオーバーシュート衝突回避</h1>
          <div className="content text-lg text-gray-800">
            <h3 className="text-lg font-bold mb-2 text-indigo-800">主要ポイント:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>先行機が以下の状態になるまで、最低500フィートの間隔を維持:</li>
              <ul className="list-disc pl-6">
                <li>オーバーシュートを完了している</li>
                <li>位置が安定している</li>
              </ul>
              <li>オーバーシュート時は、無線で他のウイングマンに通知</li>
              <li>各機は先行機の過度の接近速度を監視</li>
              <li>先行機のオーバーシュート状況を予測</li>
            </ul>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>無線通信例:</strong> "Viper 2 is overshooting"</p>
            </div>
            
            <div className="relative h-[300px] w-full bg-blue-100 rounded-lg my-6 p-4">
              <div className="absolute top-[150px] left-[400px] w-[40px] h-[40px] bg-indigo-800 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[170px] left-[500px] w-[40px] h-[40px] bg-red-700 transform rotate-15" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[150px] left-[200px] w-[40px] h-[40px] bg-green-700 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[200px] left-[100px] w-[40px] h-[40px] bg-orange-500 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[120px] left-[410px] text-sm text-indigo-900 font-semibold">リード</div>
              <div className="absolute top-[190px] left-[510px] text-sm text-indigo-900 font-semibold">#2 オーバーシュート中</div>
              <div className="absolute top-[120px] left-[160px] text-sm text-green-800 font-semibold">3番機</div>
              <div className="absolute top-[220px] left-[60px] text-sm text-orange-800 font-semibold">4番機</div>
              <div className="absolute top-[150px] left-[250px] text-green-800 text-sm font-semibold">500フィートの間隔を維持</div>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">16/20</div>
        </div>
        
        {/* スライド17 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 17 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">ブレイクアウト操作</h1>
          <div className="content text-lg text-gray-800">
            <h3 className="text-lg font-bold mb-2 text-indigo-800">ブレイクアウトのタイミング:</h3>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>リードから指示された場合</li>
              <li>リードが視界から外れた場合</li>
              <li>リードの下や前を横切らないと再会合や編隊維持ができない場合</li>
              <li>あなたの存在が編隊に危険をもたらす場合</li>
            </ol>
            
            <h3 className="text-lg font-bold mt-4 mb-2 text-indigo-800">ブレイクアウト中のリードの行動:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>無線でブレイクアウトを指示または確認する</li>
              <li>可能であれば、ブレイクアウトするウイングマンを視認し続ける</li>
              <li>衝突回避のために必要であれば、飛行経路を変更する</li>
              <li>再会合が可能な場合、ウイングマンに明確な指示を与える</li>
            </ul>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">17/20</div>
        </div>
        
        {/* スライド18 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 18 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">ブレイクアウト: 実行テクニック</h1>
          <div className="content text-lg text-gray-800">
            <h3 className="text-lg font-bold mb-2 text-indigo-800">ブレイクアウトの手順:</h3>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>リードに「ブレイクアウト」を通報</li>
              <li>クロスコントロール（ラダーとエルロンの逆方向使用）を回避</li>
              <li>可能であれば、リードから離れる方向（通常は下方外側）へ45°のバンクで旋回</li>
              <li>ジェントルにGを引き、垂直間隔を確保</li>
              <li>他の航空機との間隔を大きくするまで、アイドルとスピードブレーキを使用</li>
              <li>安全な間隔を確保したら、再会合の指示を受ける準備をする</li>
            </ol>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>無線通信例:</strong></p>
              <ul className="list-disc pl-6 my-2">
                <li>"Viper 2 is breaking out"</li>
                <li>"Viper, confirm Viper 2 breakout"</li>
                <li>"Viper 2, cleared to rejoin from the left when ready"</li>
              </ul>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">18/20</div>
        </div>
        
        {/* スライド19 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 19 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">共通エラーと解決策</h1>
          <div className="content text-lg text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2 text-indigo-800">再会合の一般的なエラー</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>過度の接近速度（高アスペクトで50ノット以上）</li>
                  <li>パーシュートカーブの不適切な選択</li>
                  <li>リードの視認喪失</li>
                  <li>オーバーシュートの判断が遅すぎる</li>
                  <li>再会合中の不適切なラダー使用</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-indigo-800">解決策</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>アスペクト角に応じた適切な接近速度の維持</li>
                  <li>早めの出力制御とエネルギー管理</li>
                  <li>常にリードを視界に入れるための頭部位置の維持</li>
                  <li>必要に応じて早めにオーバーシュート判断</li>
                  <li>ラダーの過剰使用を避け、エルロンとバックプレッシャーで飛行経路を制御</li>
                </ul>
              </div>
            </div>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>心がけること:</strong> スムーズで制御された再会合は、過度に高速または攻撃的な再会合よりも常にプロフェッショナルです。</p>
            </div>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">19/20</div>
        </div>
        
        {/* スライド20 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 20 ? 'block' : 'hidden'} bg-white`}>
          <h1 className="slide-title text-2xl text-indigo-900 border-b-2 border-indigo-800 pb-2 mb-6">まとめと安全の原則</h1>
          <div className="content text-lg text-gray-800">
            <h3 className="text-lg font-bold mb-2 text-indigo-800">重要なポイント:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>編隊飛行は精密さ、規律、明確なコミュニケーションが必要</li>
              <li>常に安全を最優先し、必要に応じてオーバーシュートまたはブレイクアウトを実行</li>
              <li>再会合では適切なアスペクト角と接近速度の関係を把握する</li>
              <li>3機、4機編隊での再会合は適切な間隔と順序を維持する</li>
              <li>全ての視覚信号と無線通信は明確かつ標準的なフレーズを使用</li>
            </ul>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-900">
              <p><strong>安全の原則:</strong></p>
              <ol className="list-decimal pl-6 my-2">
                <li>常にリードと他の編隊機を視認</li>
                <li>疑問がある場合は安全側に判断</li>
                <li>高アスペクトでの過度の接近速度を避ける</li>
                <li>他機との接近を制御できない場合は早めにブレイクアウト</li>
                <li>常に各操縦士の資格と状況に応じて飛行</li>
              </ol>
            </div>
            
            <p className="text-center mt-6 font-bold">安全かつ効果的な編隊飛行のために、継続的な練習と適切な監督が必要です。</p>
          </div>
          <ManeuverViewer slideNumber={currentSlide} isVisible={showManeuver} />
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">20/20</div>
        </div>
        
        {/* フッターナビゲーション - モバイル用 */}
        <div className="fixed bottom-0 left-0 w-full bg-indigo-800 md:hidden flex justify-between items-center p-2">
          <button 
            className="nav-btn bg-white text-indigo-800 border-none px-3 py-1 rounded font-bold text-sm" 
            onClick={prevSlide}
          >
            前へ
          </button>
          <span className="text-white font-semibold">{currentSlide}/{totalSlides}</span>
          <button 
            className="nav-btn bg-white text-indigo-800 border-none px-3 py-1 rounded font-bold text-sm" 
            onClick={nextSlide}
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningTab; 