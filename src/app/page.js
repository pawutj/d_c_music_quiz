'use client';

import { useState, useEffect, useRef } from 'react';

export default function MusicQuiz() {
  const [gameState, setGameState] = useState('setup'); // setup, playing, answer, results
  const [songsData, setSongsData] = useState([]);
  const [albumsList, setAlbumsList] = useState([]);
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
  const [currentSongData, setCurrentSongData] = useState(null);
  const [answerTimeLeft, setAnswerTimeLeft] = useState(10);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizMode, setQuizMode] = useState('album'); // 'song' หรือ 'album'
  
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const answerTimerRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // โหลดข้อมูลจาก JSON
  useEffect(() => {
    const loadSongsData = async () => {
      try {
        const response = await fetch('/songs.json');
        const data = await response.json();
        setSongsData(data.songs);
        setAlbumsList(data.albums);
      } catch (error) {
        console.error('Error loading songs data:', error);
      }
    };

    loadSongsData();
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

  // Answer timer
  useEffect(() => {
    if (gameState === 'answer' && answerTimeLeft > 0) {
      answerTimerRef.current = setTimeout(() => {
        setAnswerTimeLeft(answerTimeLeft - 1);
      }, 1000);
    } else if (answerTimeLeft === 0) {
      nextQuestion();
    }

    return () => {
      if (answerTimerRef.current) {
        clearTimeout(answerTimerRef.current);
      }
    };
  }, [gameState, answerTimeLeft]);

  // Autocomplete logic - ปรับตาม mode
  useEffect(() => {
    if (userAnswer.length >= 1) {
      let filtered = [];
      
      if (quizMode === 'album') {
        // Mode อัลบั้ม: แสดงรายชื่ออัลบั้ม
        filtered = albumsList.filter(album =>
          album.toLowerCase().includes(userAnswer.toLowerCase())
        );
      } else {
        // Mode เพลง: แสดงรายชื่อเพลงทั้งหมด (ไม่มี .mp3)
        filtered = songsData
          .map(song => song.title)
          .filter(title =>
            title.toLowerCase().includes(userAnswer.toLowerCase())
          )
          .slice(0, 8);
      }
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [userAnswer, albumsList, songsData, quizMode]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = () => {
    if (songsData.length === 0) return;
    
    const shuffled = shuffleArray(songsData);
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

    const songData = songs[questionIndex];
    setCurrentSongData(songData);
    setTimeLeft(30);
    setUserAnswer('');
    setShowSuggestions(false);
    
    const audioSrc = `/music/${encodeURIComponent(songData.filename)}`;
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
    
    // ตรวจคำตอบตาม mode
    const correctAnswer = quizMode === 'album' ? currentSongData.album : currentSongData.title;
    const correct = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase();
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }

    const result = {
      question: currentQuestionIndex + 1,
      songData: currentSongData,
      userAnswer: userAnswer || '(ไม่ตอบ)',
      correctAnswer: correctAnswer,
      isCorrect: correct,
      timeUsed: 30 - timeLeft,
      mode: quizMode
    };

    setQuizResults([...quizResults, result]);

    // แสดงเฉลย 10 วินาที
    setGameState('answer');
    setAnswerTimeLeft(10);

    // หยุดเพลง
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    
    if (nextIndex >= shuffledSongs.length) {
      endQuiz();
    } else {
      setGameState('playing');
      loadQuestion(nextIndex, shuffledSongs);
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
    if (answerTimerRef.current) {
      clearTimeout(answerTimerRef.current);
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
    setAnswerTimeLeft(10);
    setUserAnswer('');
    setQuizResults([]);
    setShuffledSongs([]);
    setShowSuggestions(false);
    setCurrentSongData(null);
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
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (userAnswer.length >= 1 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const getModeInfo = () => {
    if (quizMode === 'album') {
      return {
        title: 'Album Quiz',
        emoji: '💿',
        description: 'ทายชื่ออัลบั้ม',
        placeholder: 'พิมพ์ชื่ออัลบั้ม...',
        rules: 'ฟังเพลงและตอบชื่ออัลบั้ม'
      };
    } else {
      return {
        title: 'Song Quiz',
        emoji: '🎵',
        description: 'ทายชื่อเพลง',
        placeholder: 'พิมพ์ชื่อเพลง...',
        rules: 'ฟังเพลงและตอบชื่อเพลง'
      };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Setup Screen */}
        {gameState === 'setup' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white text-center">
            <h1 className="text-4xl font-bold mb-6">{modeInfo.emoji} Music Quiz</h1>
            
            {/* Mode Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">🎯 เลือกโหมดเกม</h3>
              <div className="flex gap-4 justify-center mb-6">
                <button
                  onClick={() => setQuizMode('song')}
                  className={`px-6 py-3 rounded-full font-bold transition-all ${
                    quizMode === 'song' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                      : 'bg-black/20 text-gray-300 hover:bg-black/30'
                  }`}
                >
                  🎵 ทายชื่อเพลง
                </button>
                <button
                  onClick={() => setQuizMode('album')}
                  className={`px-6 py-3 rounded-full font-bold transition-all ${
                    quizMode === 'album' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-black/20 text-gray-300 hover:bg-black/30'
                  }`}
                >
                  💿 ทายชื่ออัลบั้ม
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-lg mb-4">พร้อมทดสอบความรู้เพลงหรือยัง?</p>
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <p className="text-sm mb-2">กติกาโหมด <span className="text-yellow-300 font-bold">{modeInfo.description}</span>:</p>
                <ul className="text-sm text-left max-w-md mx-auto space-y-1">
                  <li>• {modeInfo.rules}</li>
                  <li>• เวลา 30 วินาทีต่อข้อ</li>
                  <li>• เพลงในระบบ: {songsData.length} เพลง</li>
                  {quizMode === 'album' && <li>• อัลบั้มทั้งหมด: {albumsList.length} อัลบั้ม</li>}
                  <li>• <span className="text-yellow-300">💡 มี Autofill ช่วยเลือกคำตอบ</span></li>
                  <li>• <span className="text-green-300">✨ แสดงเฉลย 10 วินาทีหลังตอบ</span></li>
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
                  <option value={songsData.length}>ทั้งหมด ({songsData.length} ข้อ)</option>
                </select>
              </div>
            </div>
            <button
              onClick={startQuiz}
              disabled={songsData.length === 0}
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 disabled:cursor-not-allowed"
            >
              เริ่มเกม {modeInfo.description} ({numberOfQuestions} ข้อ)
            </button>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white text-center">
            <div className="mb-4">
              <span className="text-lg">ข้อ {currentQuestionIndex + 1}</span>
              <span className="text-gray-300"> จาก {shuffledSongs.length}</span>
              <div className="text-sm opacity-80 mt-1">
                โหมด: <span className="text-yellow-300 font-bold">{modeInfo.description}</span>
              </div>
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
              {currentSongData && (
                <p className="text-sm opacity-80 break-all">
                  เพลง: {currentSongData.title}
                </p>
              )}
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
                  placeholder={`${modeInfo.placeholder} (มี autocomplete ช่วย)`}
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
              💡 ใช้ลูกศรขึ้น/ลง เพื่อเลือก{quizMode === 'album' ? 'อัลบั้ม' : 'เพลง'}, Enter เพื่อใส่คำตอบ
            </div>

            <div className="text-2xl font-bold">
              คะแนน: {score} / {currentQuestionIndex + 1}
            </div>
          </div>
        )}

        {/* Answer Screen (เฉลย 10 วินาที) */}
        {gameState === 'answer' && currentSongData && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white text-center">
            <div className="mb-4">
              <span className="text-lg">ข้อ {currentQuestionIndex + 1}</span>
              <span className="text-gray-300"> - เฉลย</span>
              <div className="text-sm opacity-80 mt-1">
                โหมด: <span className="text-yellow-300 font-bold">{modeInfo.description}</span>
              </div>
            </div>
            
            <div className={`text-4xl font-bold mb-6 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '✅ ถูกต้อง!' : '❌ ผิด!'}
            </div>

            <div className="bg-black/20 rounded-lg p-6 mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">🎵 ข้อมูลเพลง</h3>
                <p className="text-sm mb-1"><strong>เพลง:</strong> {currentSongData.title}</p>
                <p className="text-sm mb-1"><strong>อัลบั้ม:</strong> <span className="text-blue-300">{currentSongData.album}</span></p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-md font-bold mb-2">📝 คำตอบ</h4>
                <p className="text-sm mb-1"><strong>คำตอบของคุณ:</strong> {userAnswer || '(ไม่ตอบ)'}</p>
                <p className="text-sm">
                  <strong>คำตอบที่ถูก:</strong> 
                  <span className="text-green-300 ml-1">
                    {quizMode === 'album' ? currentSongData.album : currentSongData.title}
                  </span>
                </p>
              </div>
            </div>

            <div className="text-3xl font-bold text-yellow-400 mb-4">
              ⏰ {answerTimeLeft}
            </div>

            <div className="text-sm opacity-80">
              รอ {answerTimeLeft} วินาที หรือ
            </div>
            
            <button
              onClick={nextQuestion}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors mt-2"
            >
              ข้อถัดไป
            </button>

            <div className="text-xl font-bold mt-4">
              คะแนน: {score} / {currentQuestionIndex + 1}
            </div>
          </div>
        )}

        {/* Results Screen */}
        {gameState === 'results' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">🎉 จบเกมแล้ว!</h2>
            <div className="text-lg mb-6">
              โหมด: <span className="text-yellow-300 font-bold">{modeInfo.description}</span>
            </div>
            
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
                    <span className="text-xs opacity-70 ml-2">
                      (โหมด: {result.mode === 'album' ? 'อัลบั้ม' : 'เพลง'})
                    </span>
                  </div>
                  <div className="break-all opacity-90 mb-1">
                    เพลง: {result.songData.title}
                  </div>
                  <div className="opacity-80 mb-1">
                    อัลบั้ม: <span className="text-blue-300">{result.songData.album}</span>
                  </div>
                  <div className="opacity-80 mb-1">
                    คำตอบของคุณ: {result.userAnswer}
                  </div>
                  {!result.isCorrect && (
                    <div className="opacity-80 mb-1">
                      คำตอบที่ถูก: <span className="text-green-300">{result.correctAnswer}</span>
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