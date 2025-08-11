'use client';

import { useState, useEffect, useRef } from 'react';

export default function MusicQuiz() {
  const [gameState, setGameState] = useState('setup'); // setup, playing, results
  const [musicFiles, setMusicFiles] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [userAnswer, setUserAnswer] = useState('');
  const [quizResults, setQuizResults] = useState([]);
  const [shuffledSongs, setShuffledSongs] = useState([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // รายชื่อเพลงทั้งหมดจาก music directory
  const allSongs = [
    "1-01. ダ・カーポ ～第2ボタンの誓い～.mp3",
    "1-02. Dream ～The ally of～.mp3",
    "1-03. Dream ～The other side～.mp3",
    "1-04. Small Cherry ～Promised bell～.mp3",
    "1-05. White Season.mp3",
    "1-06. All my love of the World.mp3",
    "1-07. うたまるえかき唄.mp3",
    "1-08. BELIEVE.mp3",
    "1-09. そよ風のハーモニー.mp3",
    "1-10. 未来地図.mp3",
    "1-11. Eternal love ～眩しい季節～.mp3",
    "2-01. Special Day ～太陽の神様～.mp3",
    "2-02. 明日の風.mp3",
    "2-03. 赤い糸.mp3",
    "2-04. 和泉子絵描き歌.mp3",
    "2-05. 恋のロイヤル☆ストレートフラッシュ.mp3",
    "2-06. ひとひらハート.mp3",
    "2-07. 僕らの場所へ.mp3",
    "2-08. 君の空に.mp3",
    "2-09. ただ今だけを、ずっと….mp3",
    "2-10. Hello Future.mp3",
    "2-11. 二人だけの音楽会.mp3",
    "2-12. 永遠の願い.mp3",
    "3-01. トキメキブーケトス.mp3",
    "3-02. My Dearest.mp3",
    "3-03. 愛妻家でりでりっく.mp3",
    "3-04. beautiful flower.mp3",
    "3-05. Especially.mp3",
    "3-06. ダ・カーポII ～あさきゆめみし君と～.mp3",
    "3-07. TIME WILL SHINE.mp3",
    "3-08. Little Distance.mp3",
    "3-09. If...～I wish～.mp3",
    "3-10. まぶしくてみえない.mp3",
    "3-11. Spring Has Come.mp3",
    "4-01. Happy my life 〜Thank you for everything!!〜.mp3",
    "4-02. 君のとなり.mp3",
    "4-03. with ～輝きのフィルム～.mp3",
    "4-04. HAPPY CHERRY FESTA!.mp3",
    "4-05. believe yourself.mp3",
    "4-06. 桜の羽根 ～Endless memory～.mp3",
    "4-07. Tomorrow_s Way ～アツイナミダ～.mp3",
    "4-08. Cloudy.mp3",
    "4-09. さよならの向こう側で.mp3",
    "4-10. ラブソングを君に.mp3",
    "4-11. 1 sec..mp3",
    "5-01. レンブラントの光.mp3",
    "5-02. 陽はまた昇る.mp3",
    "5-03. 雨上がりに咲いた虹.mp3",
    "5-04. 未来へのお守り.mp3",
    "5-05. 今を生きて.mp3",
    "5-06. Graduation from yesterday.mp3",
    "5-07. 恋のローラーコースター.mp3",
    "5-08. 一緒にDO MY BEST!!.mp3",
    "5-09. Love Motion.mp3",
    "5-10. 桜風.mp3",
    "5-11. 恋するX_mas.mp3",
    "5-12. D.C. Dream X_mas Xmas メドレー.mp3",
    "6-01. ダ・カーポIII ~キミにささげる あいのマホウ~.mp3",
    "6-02. All is Love for you.mp3",
    "6-03. ハジマリノウタ.mp3",
    "6-04. shiny steps!!.mp3",
    "6-05. TRUE MAGIC......mp3",
    "6-06. 春風に願いを.mp3",
    "6-07. ひらり涙.mp3",
    "6-08. 君がいた未来 君といない未来.mp3",
    "6-09. 私には見えない.mp3",
    "6-10. millions of thanks.mp3",
    "6-11. あの日見た桜のように (short ver.).mp3",
    "6-12. 自由の羽根 (short ver.).mp3",
    "6-13. Wonderful Days!.mp3",
    "7-01. Platinum Days.mp3",
    "7-02. タイムカプセル.mp3",
    "7-03. Silent Wish.mp3",
    "7-04. MerryMerryMerry!.mp3",
    "7-05. 桜色の願い.mp3",
    "7-06. my happy days.mp3",
    "7-07. センチメンタルパレット.mp3",
    "7-08. Happy Sensation.mp3",
    "7-09. キセキの足跡.mp3",
    "7-10. 春風とクリシェ.mp3",
    "7-11. キミがいない.mp3",
    "7-12. あさきゆめみし君と.mp3",
    "8-01. 未来パレード.mp3",
    "8-02. HAPPY CRESCENDO.mp3",
    "8-03. 僕たちの明日.mp3",
    "8-04. 僕の宝物.mp3",
    "8-05. 君色のラブソング.mp3",
    "8-06. キミと僕のキセキ.mp3",
    "8-07. 僕はキミでできている.mp3",
    "8-08. MISTY LOVE.mp3",
    "8-09. 未来トラベラー.mp3"
  ];

  // สร้างรายชื่อคำตอบ (ไม่มี .mp3)
  const allAnswers = allSongs.map(song => song.replace('.mp3', ''));

  useEffect(() => {
    setMusicFiles(allSongs);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      submitAnswer();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState, timeLeft]);

  // Autocomplete logic
  useEffect(() => {
    if (userAnswer.length >= 1) {
      const filtered = allAnswers.filter(answer =>
        answer.toLowerCase().includes(userAnswer.toLowerCase())
      ).slice(0, 8); // แสดงแค่ 8 รายการ
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [userAnswer]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = () => {
    if (musicFiles.length === 0) return;
    
    const shuffled = shuffleArray(musicFiles);
    const selectedSongs = shuffled.slice(0, numberOfQuestions);
    setShuffledSongs(selectedSongs);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizResults([]);
    setGameState('playing');
    loadQuestion(0, selectedSongs);
  };

  const loadQuestion = (questionIndex, songs) => {
    if (questionIndex >= songs.length) {
      endQuiz();
      return;
    }

    setTimeLeft(30);
    setUserAnswer('');
    setShowSuggestions(false);
    
    const audioSrc = `/music/${encodeURIComponent(songs[questionIndex])}`;
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.load();
      audioRef.current.play().catch(e => {
        console.log('Audio autoplay prevented:', e);
      });
    }
  };

  const submitAnswer = () => {
    setShowSuggestions(false);
    
    const currentSong = shuffledSongs[currentQuestionIndex];
    const correctAnswer = currentSong.replace('.mp3', '');
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase();
    
    if (isCorrect) {
      setScore(score + 1);
    }

    const result = {
      question: currentQuestionIndex + 1,
      song: currentSong,
      userAnswer: userAnswer || '(ไม่ตอบ)',
      correctAnswer: correctAnswer,
      isCorrect: isCorrect,
      timeUsed: 30 - timeLeft
    };

    setQuizResults([...quizResults, result]);

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    
    if (nextIndex >= shuffledSongs.length) {
      setTimeout(() => endQuiz(), 1000);
    } else {
      setTimeout(() => {
        loadQuestion(nextIndex, shuffledSongs);
      }, 1000);
    }
  };

  const skipQuestion = () => {
    setUserAnswer('(ข้าม)');
    submitAnswer();
  };

  const endQuiz = () => {
    setGameState('results');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const restartQuiz = () => {
    setGameState('setup');
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(30);
    setUserAnswer('');
    setQuizResults([]);
    setShuffledSongs([]);
    setShowSuggestions(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (userAnswer.trim()) {
      submitAnswer();
    }
  };

  const handleInputChange = (e) => {
    setUserAnswer(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setUserAnswer(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleInputBlur = () => {
    // ใช้ setTimeout เพื่อให้ click event ทำงานก่อน
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (userAnswer.length >= 1 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Setup Screen */}
        {gameState === 'setup' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white text-center">
            <h1 className="text-4xl font-bold mb-6">🎵 Music Quiz</h1>
            <div className="mb-6">
              <p className="text-lg mb-4">พร้อมทดสอบความรู้เพลงหรือยัง?</p>
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <p className="text-sm mb-2">กติกา:</p>
                <ul className="text-sm text-left max-w-md mx-auto space-y-1">
                  <li>• ฟังเพลงและใส่ชื่อไฟล์ (ไม่ต้องใส่ .mp3)</li>
                  <li>• เวลา 30 วินาทีต่อข้อ</li>
                  <li>• เพลงในระบบ: {musicFiles.length} เพลง</li>
                  <li>• <span className="text-yellow-300">💡 มี Autofill ช่วยเลือกคำตอบ</span></li>
                </ul>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-2">จำนวนข้อสอบ:</label>
                <select 
                  value={numberOfQuestions} 
                  onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                  className="bg-black/20 text-white border border-white/20 rounded px-3 py-2"
                >
                  <option value={5}>5 ข้อ</option>
                  <option value={10}>10 ข้อ</option>
                  <option value={15}>15 ข้อ</option>
                  <option value={20}>20 ข้อ</option>
                  <option value={25}>25 ข้อ</option>
                  <option value={allSongs.length}>ทั้งหมด ({allSongs.length} ข้อ)</option>
                </select>
              </div>
            </div>
            <button
              onClick={startQuiz}
              disabled={musicFiles.length === 0}
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 disabled:cursor-not-allowed"
            >
              เริ่มเกม ({numberOfQuestions} ข้อ)
            </button>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white text-center">
            <div className="mb-4">
              <span className="text-lg">ข้อ {currentQuestionIndex + 1}</span>
              <span className="text-gray-300"> จาก {shuffledSongs.length}</span>
            </div>
            
            <div className={`text-6xl font-bold mb-6 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
              {timeLeft}
            </div>

            <div className="mb-6">
              <audio
                ref={audioRef}
                controls
                className="w-full mb-4 rounded-lg"
                onLoadStart={() => console.log('Loading audio...')}
                onCanPlay={() => console.log('Audio ready to play')}
                onError={(e) => console.log('Audio error:', e)}
              >
                เบราว์เซอร์ไม่รองรับ audio element
              </audio>
              <p className="text-xs opacity-60 mb-2">
                💡 กดปุ่ม play ถ้าเพลงไม่เล่นอัตโนมัติ
              </p>
            </div>

            <form onSubmit={handleAnswerSubmit} className="mb-6">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  placeholder="พิมพ์ชื่อเพลง... (มี autocomplete ช่วย)"
                  className="w-full p-4 rounded-lg text-black text-center text-lg mb-4"
                  autoFocus
                  autoComplete="off"
                />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10 mb-4"
                  >
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`p-3 text-left cursor-pointer text-black text-sm border-b border-gray-100 hover:bg-blue-50 ${
                          index === selectedSuggestionIndex ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-x-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                  ส่งคำตอบ
                </button>
                <button
                  type="button"
                  onClick={skipQuestion}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                  ข้าม
                </button>
              </div>
            </form>

            <div className="text-xs opacity-60 mb-2">
              💡 ใช้ลูกศรขึ้น/ลง เพื่อเลือก, Enter เพื่อใส่คำตอบ
            </div>

            <div className="text-2xl font-bold">
              คะแนน: {score} / {currentQuestionIndex + 1}
            </div>
          </div>
        )}

        {/* Results Screen */}
        {gameState === 'results' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">🎉 จบเกมแล้ว!</h2>
            
            <div className="text-2xl mb-6">
              คะแนนรวม: <span className="font-bold text-yellow-400">{score}</span> / {shuffledSongs.length}
              <div className="text-lg text-gray-300">
                ({Math.round((score / shuffledSongs.length) * 100)}%)
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto">
              <h3 className="font-bold mb-4">ผลลัพธ์รายข้อ:</h3>
              {quizResults.map((result, index) => (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-lg text-left text-sm ${
                    result.isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'
                  }`}
                >
                  <div className="font-bold mb-1">
                    ข้อ {result.question}: {result.isCorrect ? '✅ ถูก' : '❌ ผิด'}
                  </div>
                  <div className="break-all opacity-90">
                    ไฟล์: {result.song}
                  </div>
                  <div className="opacity-80">
                    คำตอบของคุณ: {result.userAnswer}
                  </div>
                  {!result.isCorrect && (
                    <div className="opacity-80">
                      คำตอบที่ถูก: {result.correctAnswer}
                    </div>
                  )}
                  <div className="text-xs opacity-60">
                    ใช้เวลา: {result.timeUsed} วินาที
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={restartQuiz}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-200"
            >
              เล่นอีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}