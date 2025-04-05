import React, { useState, useEffect } from 'react';

const LearningTab: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="slide-container max-w-4xl mx-auto">
        <div className="navigation bg-indigo-700 text-center p-4">
          <button 
            className="nav-btn bg-white text-indigo-700 border-none px-4 py-2 mx-1 cursor-pointer rounded font-bold" 
            onClick={prevSlide}
          >
            前へ
          </button>
          <span className="text-white mx-4">{currentSlide} / {totalSlides}</span>
          <button 
            className="nav-btn bg-white text-indigo-700 border-none px-4 py-2 mx-1 cursor-pointer rounded font-bold" 
            onClick={nextSlide}
          >
            次へ
          </button>
        </div>
        
        {/* スライド1 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 1 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">編隊飛行: 再会合とオーバーシュート</h1>
          <div className="content text-lg">
            <h2 className="text-xl font-bold mb-4">編隊飛行の紹介</h2>
            <p>このプレゼンテーションでは、編隊飛行を学ぶ学生パイロットのための主要な概念を説明します。</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>再会合の目的と種類の理解</li>
              <li>直進および旋回再会合の実行</li>
              <li>オーバーシュート発生時の対処</li>
              <li>ブレイクアウトのタイミングと方法の理解</li>
            </ul>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>安全第一:</strong> 編隊飛行は正確な操縦、適切な判断、明確なコミュニケーションが必要です。常に手順よりも安全を優先してください。</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">1/20</div>
        </div>
        
        {/* スライド2 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 2 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">再会合の目的</h1>
          <div className="content text-lg">
            <p>再会合とは、分離した航空機を安全かつ効率的に再び合流させるための操縦です。</p>
            <h3 className="text-lg font-bold mt-4 mb-2">主要ポイント:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>リードは無線または視覚信号で再会合を開始します</li>
              <li>リードはエネルギー管理のために軽い上昇や降下を行うことがあります</li>
              <li>リードは再会合全体を通してウイングマンを監視します</li>
              <li>標準パラメータは事前ブリーフィングまたはユニット標準で設定されます</li>
            </ul>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>リードの責任:</strong></p>
              <ul className="list-disc pl-6 my-2">
                <li>ウイングマンを注意深く監視する</li>
                <li>予測可能な飛行経路を維持する</li>
                <li>異なる対気速度やバンク角で飛行する場合は通信する</li>
              </ul>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">2/20</div>
        </div>
        
        {/* スライド3 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 3 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">標準的な再会合パラメータ</h1>
          <div className="content text-lg">
            <table className="w-full border-collapse my-6">
              <tr className="bg-indigo-700 text-white">
                <th className="border border-gray-300 p-3 text-left">再会合タイプ</th>
                <th className="border border-gray-300 p-3 text-left">対気速度</th>
                <th className="border border-gray-300 p-3 text-left">バンク角</th>
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-300 p-3">標準 (非戦術的)</td>
                <td className="border border-gray-300 p-3">300 KIAS</td>
                <td className="border border-gray-300 p-3">30度</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="border border-gray-300 p-3">戦術的位置から</td>
                <td className="border border-gray-300 p-3">350 KIAS</td>
                <td className="border border-gray-300 p-3">45度</td>
              </tr>
            </table>
            <p>再会合はさまざまな位置から開始できます:</p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>ピッチアウト後</li>
              <li>間隔を取った後</li>
              <li>計器トレイルから</li>
              <li>戦術的位置から</li>
            </ul>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>注意:</strong> これらは標準パラメータです。リードはこれらの標準からの逸脱を伝えるべきです。</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">3/20</div>
        </div>
        
        {/* スライド4 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 4 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">再会合の種類</h1>
          <div className="content text-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">直進再会合</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>視覚信号: ウイングロック</li>
                  <li>標準対気速度: 300 KIAS</li>
                  <li>2番機は左翼に再会合</li>
                  <li>3番機と4番機は右翼に再会合</li>
                  <li>例外: 戦術的状況では、すでにいる側に合流</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">旋回再会合</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>視覚信号: 旋回方向に最初の傾きを持つウイングロック</li>
                  <li>内側旋回 (2番機): 300 KIAS、30°バンク</li>
                  <li>外側旋回 (3番機と4番機): 同じパラメータ</li>
                  <li>航空機は数値順に再会合</li>
                </ul>
              </div>
            </div>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>コミュニケーションが重要:</strong> すべての視覚信号は後続機のために各ウイングマンが繰り返すべきです。</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">4/20</div>
        </div>
        
        {/* スライド5 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 5 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">直進再会合: テクニック</h1>
          <div className="content text-lg">
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>ウイングマンはリードを識別し、約50ノットの追い越し速度を確立</li>
              <li>ジェット後流を避けるため、リードのやや後方下方に位置取り</li>
              <li>リードの後方約1,500-2,000フィートになるまでこの姿勢を維持</li>
              <li>この地点から追い越し速度を減少させる</li>
              <li>リードから2-4機体幅まで接近するよう目標設定</li>
              <li>ルートからフィンガーチップに移行する前に、追い越し速度が制御されていることを確認</li>
            </ol>
            <div className="relative h-[300px] w-full bg-blue-50 rounded-lg my-6 p-4">
              <div className="absolute top-[120px] left-[600px] w-[40px] h-[40px] bg-indigo-800 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[140px] left-[100px] w-[40px] h-[40px] bg-red-700 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[90px] left-[610px] text-sm">リード</div>
              <div className="absolute top-[160px] left-[110px] text-sm">ウイングマン</div>
              <div className="absolute top-[140px] left-[150px] text-red-600 text-sm">約50ノットの接近速度</div>
              <div className="absolute top-[140px] left-[150px] w-[400px] border-t-2 border-dashed border-gray-600"></div>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">5/20</div>
        </div>
        
        {/* スライド6 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 6 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">再会合中の視覚的参照</h1>
          <div className="content text-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">重要な視覚的目印:</h3>
                <p>リードの後方約1,500フィートでは:</p>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>エンジン排気口の8の字パターンが見える</li>
                  <li>2つの別々のエンジンはまだ区別できない</li>
                  <li>これが追い越し速度を減少させる合図</li>
                </ul>
                <p>この距離から接近速度を減少させて、オーバーシュートを避けます。</p>
              </div>
              <div>
                <div className="bg-gray-200 h-[200px] flex items-center justify-center rounded-lg mt-5 p-4">
                  <div className="text-center">
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
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>エネルギー管理:</strong> エネルギー管理は早めに始めてください。オーバーシュートを避けるには、出力低減のタイミングが重要です。</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">6/20</div>
        </div>
        
        {/* スライド7 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 7 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">旋回再会合: 旋回内側 (2番機)</h1>
          <div className="content text-lg">
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>リードの信号と旋回の後、同じ方向に旋回を開始</li>
              <li>リードパーシュート（先行追尾）で30ノットの追い越し速度を確立</li>
              <li>リードの下方約50フィートの垂直間隔を確保</li>
              <li>適度なアスペクト角を維持するためにリードとラグパーシュートを調整</li>
              <li>パーシュートカーブと出力を調整して接近速度を制御</li>
              <li>ルートポジションからの再編成と同様にフィンガーチップへの再会合を完了</li>
            </ol>
            <div className="relative h-[300px] w-full bg-blue-50 rounded-lg my-6 p-4">
              <div className="absolute w-[250px] h-[250px] border-2 border-dashed border-indigo-800 rounded-full top-[25px] left-[325px]"></div>
              <div className="absolute top-[25px] left-[450px] w-[40px] h-[40px] bg-indigo-800 transform -rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[125px] left-[200px] w-[40px] h-[40px] bg-red-700 transform rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[0px] left-[470px] text-sm">リード</div>
              <div className="absolute top-[150px] left-[160px] text-sm">2番機</div>
              <div className="absolute top-[80px] left-[280px] text-red-600 text-sm">リードパーシュート</div>
              <div className="absolute top-[50px] left-[400px] transform -rotate-30 text-sm">旋回円</div>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">7/20</div>
        </div>
        
        {/* スライド8 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 8 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">旋回再会合におけるアスペクト角</h1>
          <div className="content text-lg">
            <p>旋回再会合ではアスペクト角の理解が重要です:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">アスペクト視点</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li><strong>低アスペクト:</strong> リードの機体がより後方から見える</li>
                  <li><strong>中アスペクト:</strong> リードの機体がより側面から見える</li>
                  <li><strong>高アスペクト:</strong> リードの機体がより正面から見える</li>
                </ul>
                <p>アスペクト角が安全な追い越し速度を決定します:</p>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>低アスペクト: 最大50ノット</li>
                  <li>中アスペクト: 最大30ノット</li>
                  <li>高アスペクト: 最大10ノット</li>
                </ul>
              </div>
              <div>
                <div className="mt-5 text-center">
                  <div className="my-5">
                    <div className="inline-block w-[40px] h-[40px] bg-indigo-800 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
                    <span className="ml-2">高アスペクト</span>
                  </div>
                  <div className="my-5">
                    <div className="inline-block w-[40px] h-[40px] bg-indigo-800 transform rotate-45" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
                    <span className="ml-2">中アスペクト</span>
                  </div>
                  <div className="my-5">
                    <div className="inline-block w-[40px] h-[40px] bg-indigo-800 transform rotate-90" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
                    <span className="ml-2">低アスペクト</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">8/20</div>
        </div>
        
        {/* スライド9 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 9 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">旋回再会合: 旋回外側 (3番機と4番機)</h1>
          <div className="content text-lg">
            <h3 className="text-lg font-bold mb-2">主要ポイント:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>航空機は適切な数値順序で再会合</li>
              <li>2番機は旋回内側に合流</li>
              <li>3番機と4番機は旋回外側に合流</li>
              <li>ルート位置で安定するまで先行機から最低500フィートの間隔を維持</li>
              <li>最小限の機首-尾部間隔を保ちながら先行機のジェット後流の下を横切る</li>
              <li>過度の接近速度がないか先行機の再会合を監視</li>
            </ul>
            <div className="relative h-[300px] w-full bg-blue-50 rounded-lg my-6 p-4">
              <div className="absolute w-[250px] h-[250px] border-2 border-dashed border-indigo-800 rounded-full top-[25px] left-[325px]"></div>
              <div className="absolute top-[25px] left-[450px] w-[40px] h-[40px] bg-indigo-800 transform -rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[125px] left-[200px] w-[40px] h-[40px] bg-red-700 transform rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[25px] left-[200px] w-[40px] h-[40px] bg-green-700 transform -rotate-75" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[0px] left-[470px] text-sm">リード</div>
              <div className="absolute top-[150px] left-[160px] text-sm">2番機</div>
              <div className="absolute top-[0px] left-[140px] text-sm">3番機</div>
              <div className="absolute top-[25px] left-[250px] text-green-700 text-sm">外側再会合</div>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">9/20</div>
        </div>
        
        {/* スライド10 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 10 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">再会合中のコミュニケーション</h1>
          <div className="content text-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">視覚信号:</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li><strong>直進再会合:</strong> ウイングロック</li>
                  <li><strong>旋回再会合:</strong> 旋回方向に最初の傾きを持つウイングロック</li>
                </ul>
                <p>各ウイングマンは後続機のために信号を繰り返します。</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">無線通信:</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>視覚信号が実用的でない場合、リードは無線で再会合を開始することがある</li>
                  <li>リードは標準外のパラメータを伝えるべき</li>
                  <li>ウイングマンは再会合の準備が整ったら「ready」と通報</li>
                </ul>
              </div>
            </div>
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>無線通信例:</strong></p>
              <ul className="list-disc pl-6 my-2">
                <li>"Viper 1, rejoin left"</li>
                <li>"Viper 1, rejoin right, 350 knots"</li>
                <li>"Viper 2, ready"</li>
              </ul>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">10/20</div>
        </div>
        
        {/* スライド11 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 11 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">オーバーシュートの紹介</h1>
          <div className="content text-lg">
            <h3 className="text-lg font-bold mb-2">オーバーシュートの目的:</h3>
            <p>オーバーシュートの目的は、再会合中の<strong>過度の追い越し速度を安全に消散させる</strong>、または<strong>過度の角度ずれを減少させる</strong>ことです。</p>
            
            <h3 className="text-lg font-bold mt-4 mb-2">主要ポイント:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>再会合を「救う」ためにオーバーシュートを遅らせない</li>
              <li>常にリードと先行機を視界に入れる</li>
              <li>早めにオーバーシュートの判断をする</li>
              <li>オーバーシュートを他の編隊メンバーに伝える</li>
            </ul>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>安全第一:</strong> 適切に実行されたオーバーシュートは、過度の接近速度や角度ずれで無理に再会合するよりも安全でプロフェッショナルです。</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">11/20</div>
        </div>
        
        {/* スライド12 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 12 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">直進再会合のオーバーシュート</h1>
          <div className="content text-lg">
            <h3 className="text-lg font-bold mb-2">実行:</h3>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>過度の追い越し速度を認識したら、すぐにアイドルとスピードブレーキ（必要な場合）を選択</li>
              <li>結果として、数機分の機体幅の外側で純粋な対気速度オーバーシュートになるはず</li>
              <li>わずかに離反するベクトルを維持</li>
              <li>肩越しにリードを見ながら、リードに向かって旋回しないよう注意</li>
              <li>等速に達する直前にスピードブレーキを格納し、出力を上げる</li>
              <li>エネルギー管理により後方に落ちることを防止</li>
            </ol>
            
            <div className="relative h-[300px] w-full bg-blue-50 rounded-lg my-6 p-4">
              <div className="absolute top-[150px] left-[400px] w-[40px] h-[40px] bg-indigo-800 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[170px] left-[500px] w-[40px] h-[40px] bg-red-700 transform rotate-15" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[120px] left-[410px] text-sm">リード</div>
              <div className="absolute top-[190px] left-[510px] text-sm">ウイングマン</div>
              <div className="absolute top-[130px] left-[480px] text-red-600 text-sm">オーバーシュート経路</div>
              <div className="absolute h-[40px] top-[180px] left-[520px] border-l-2 border-dashed border-red-600 transform rotate-75"></div>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">12/20</div>
        </div>
        
        {/* スライド13 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 13 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">旋回再会合のオーバーシュート</h1>
          <div className="content text-lg">
            <h3 className="text-lg font-bold mb-2">実行:</h3>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>早めにオーバーシュートの判断をする</li>
              <li>約2機分の機体長の間隔を保ちながらリードの低い6時方向を横切る</li>
              <li>機首-尾部の間隔が維持されていることを確認</li>
              <li>必要に応じてアイドルとスピードブレーキを選択</li>
              <li>旋回の外側に出たら、バンクとバックスティック圧を使用してルートエシェロンで安定させる</li>
              <li>オーバーシュート中はルートエシェロンより高い位置を飛行しない</li>
            </ol>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>重要概念:</strong> 対気速度や角度ずれが大きいほど、問題を解決するために必要な旋回半径も大きくなります。</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">13/20</div>
        </div>
        
        {/* スライド14 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 14 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">旋回再会合オーバーシュート: 視覚化</h1>
          <div className="content text-lg">
            <div className="relative h-[300px] w-full bg-blue-50 rounded-lg my-6 p-4">
              <div className="absolute w-[250px] h-[250px] border-2 border-dashed border-indigo-800 rounded-full top-[25px] left-[325px]"></div>
              <div className="absolute top-[25px] left-[450px] w-[40px] h-[40px] bg-indigo-800 transform -rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[150px] left-[450px] w-[40px] h-[40px] bg-red-700 transform rotate-30" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[0px] left-[470px] text-sm">リード</div>
              <div className="absolute top-[170px] left-[460px] text-sm">ウイングマン</div>
              <div className="absolute w-[100px] h-[100px] border-2 border-dashed border-red-600 rounded-full top-[100px] left-[400px]"></div>
              <div className="absolute top-[210px] left-[410px] text-red-600 text-sm">オーバーシュート経路</div>
              <div className="absolute top-[60px] left-[500px] text-sm">1. 過度の接近速度を認識</div>
              <div className="absolute top-[180px] left-[500px] text-sm">2. リードの6時方向を横切る</div>
              <div className="absolute top-[250px] left-[400px] text-sm">3. 旋回外側で安定</div>
            </div>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>覚えておくこと:</strong> 距離、視線、角度ずれが制御できたら、リードの旋回内側に戻り、適切なアスペクト角を再確立し、再会合を完了します。</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">14/20</div>
        </div>
        
        {/* スライド15 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 15 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">角度的オーバーシュートと対気速度オーバーシュート</h1>
          <div className="content text-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">対気速度オーバーシュート</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>過度の接近速度によって引き起こされる</li>
                  <li>主な解決策: 出力を減らし、スピードブレーキを展開</li>
                  <li>離反ベクトルを持ってリードの外側を通過する結果になる</li>
                  <li>回復: 等速に達したら後方に落ちないよう出力を上げる</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">角度的オーバーシュート</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>過度の角度ずれ（不適切なパーシュートカーブ）によって引き起こされる</li>
                  <li>リードの旋回円の外側を飛行する必要はないかもしれない</li>
                  <li>リードの低い6時方向に飛行することで十分な前方視界を確保できる場合がある</li>
                  <li>回復: 機体を整列させ、エネルギーを管理してオーバーシュートを止める</li>
                </ul>
              </div>
            </div>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>実際には:</strong> ほとんどのオーバーシュートは対気速度と角度の両方の問題が組み合わさっています。</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">15/20</div>
        </div>
        
        {/* スライド16 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 16 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">3機と4機編隊でのオーバーシュート衝突回避</h1>
          <div className="content text-lg">
            <h3 className="text-lg font-bold mb-2">主要ポイント:</h3>
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
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>無線通信例:</strong> "Viper 2 is overshooting"</p>
            </div>
            
            <div className="relative h-[300px] w-full bg-blue-50 rounded-lg my-6 p-4">
              <div className="absolute top-[150px] left-[400px] w-[40px] h-[40px] bg-indigo-800 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[170px] left-[500px] w-[40px] h-[40px] bg-red-700 transform rotate-15" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[150px] left-[200px] w-[40px] h-[40px] bg-green-700 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[200px] left-[100px] w-[40px] h-[40px] bg-orange-500 transform rotate-0" style={{clipPath: 'polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%)'}}></div>
              <div className="absolute top-[120px] left-[410px] text-sm">リード</div>
              <div className="absolute top-[190px] left-[510px] text-sm">#2 オーバーシュート中</div>
              <div className="absolute top-[120px] left-[160px] text-sm">#3</div>
              <div className="absolute top-[220px] left-[60px] text-sm">#4</div>
              <div className="absolute top-[150px] left-[250px] text-sm">500フィートの間隔を維持</div>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">16/20</div>
        </div>
        
        {/* スライド17 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 17 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">ブレイクアウト操作</h1>
          <div className="content text-lg">
            <h3 className="text-lg font-bold mb-2">ブレイクアウトのタイミング:</h3>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>リードから指示された場合</li>
              <li>リードが視界から外れた場合</li>
              <li>リードの下や前を横切らないと再会合や編隊維持ができない場合</li>
              <li>あなたの存在が編隊に危険をもたらす場合</li>
            </ol>
            
            <h3 className="text-lg font-bold mt-4 mb-2">ブレイクアウト中のリードの行動:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>無線でブレイクアウトを指示または確認する</li>
              <li>可能であれば、ブレイクアウトするウイングマンを視認し続ける</li>
              <li>衝突回避のために必要であれば、飛行経路を変更する</li>
              <li>再会合が可能な場合、ウイングマンに明確な指示を与える</li>
            </ul>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">17/20</div>
        </div>
        
        {/* スライド18 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 18 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">ブレイクアウト: 実行テクニック</h1>
          <div className="content text-lg">
            <h3 className="text-lg font-bold mb-2">ブレイクアウトの手順:</h3>
            <ol className="list-decimal pl-6 space-y-2 my-4">
              <li>リードに「ブレイクアウト」を通報</li>
              <li>クロスコントロール（ラダーとエルロンの逆方向使用）を回避</li>
              <li>可能であれば、リードから離れる方向（通常は下方外側）へ45°のバンクで旋回</li>
              <li>ジェントルにGを引き、垂直間隔を確保</li>
              <li>他の航空機との間隔を大きくするまで、アイドルとスピードブレーキを使用</li>
              <li>安全な間隔を確保したら、再会合の指示を受ける準備をする</li>
            </ol>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>無線通信例:</strong></p>
              <ul className="list-disc pl-6 my-2">
                <li>"Viper 2 is breaking out"</li>
                <li>"Viper, confirm Viper 2 breakout"</li>
                <li>"Viper 2, cleared to rejoin from the left when ready"</li>
              </ul>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">18/20</div>
        </div>
        
        {/* スライド19 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 19 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">共通エラーと解決策</h1>
          <div className="content text-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">再会合の一般的なエラー</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>過度の接近速度（高アスペクトで50ノット以上）</li>
                  <li>パーシュートカーブの不適切な選択</li>
                  <li>リードの視認喪失</li>
                  <li>オーバーシュートの判断が遅すぎる</li>
                  <li>再会合中の不適切なラダー使用</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">解決策</h3>
                <ul className="list-disc pl-6 space-y-2 my-4">
                  <li>アスペクト角に応じた適切な接近速度の維持</li>
                  <li>早めの出力制御とエネルギー管理</li>
                  <li>常にリードを視界に入れるための頭部位置の維持</li>
                  <li>必要に応じて早めにオーバーシュート判断</li>
                  <li>ラダーの過剰使用を避け、エルロンとバックプレッシャーで飛行経路を制御</li>
                </ul>
              </div>
            </div>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <p><strong>心がけること:</strong> スムーズで制御された再会合は、過度に高速または攻撃的な再会合よりも常にプロフェッショナルです。</p>
            </div>
          </div>
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">19/20</div>
        </div>
        
        {/* スライド20 */}
        <div className={`slide p-8 min-h-[500px] relative ${currentSlide === 20 ? 'block' : 'hidden'}`}>
          <h1 className="slide-title text-2xl text-indigo-800 border-b-2 border-indigo-800 pb-2 mb-6">まとめと安全の原則</h1>
          <div className="content text-lg">
            <h3 className="text-lg font-bold mb-2">重要なポイント:</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>編隊飛行は精密さ、規律、明確なコミュニケーションが必要</li>
              <li>常に安全を最優先し、必要に応じてオーバーシュートまたはブレイクアウトを実行</li>
              <li>再会合では適切なアスペクト角と接近速度の関係を把握する</li>
              <li>3機、4機編隊での再会合は適切な間隔と順序を維持する</li>
              <li>全ての視覚信号と無線通信は明確かつ標準的なフレーズを使用</li>
            </ul>
            
            <div className="important-box bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
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
          <div className="absolute bottom-2 right-4 text-sm text-gray-600">20/20</div>
        </div>
        
        {/* スライド6〜20は同様に追加... */}
        
      </div>
    </div>
  );
};

export default LearningTab; 