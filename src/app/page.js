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
  
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // สำหรับ demo ให้ใช้ array ของเพลงตัวอย่าง
  const demoSongs = [
    'song1.mp3',
    'song2.mp3', 
    'song3.mp3',
    'song4.mp3',
    'song5.mp3'
  ];

  useEffect(() => {
    // ในการใช้งานจริง จะโหลดไฟล์จาก /public/music directory
    // ตอนนี้ใช้ demo songs
    setMusicFiles(demoSongs);
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
    setShuffledSongs(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizResults([]);
    setGameState('playing');
    loadQuestion(0, shuffled);
  };

  const loadQuestion = (questionIndex, songs) => {
    if (questionIndex >= songs.length) {
      endQuiz();
      return;
    }

    setTimeLeft(30);
    setUserAnswer('');
    
    // ในการใช้งานจริง จะโหลดไฟล์เสียงจาก /music directory
    // ตอนนี้ใช้ placeholder
    const audioSrc = `/music/${songs[questionIndex]}`;
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.load();
    }
  };

  const submitAnswer = () => {
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

    // ไปข้อถัดไป
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    
    if (nextIndex >= shuffledSongs.length) {
      endQuiz();
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
  };

  const restartQuiz = () => {
    setGameState('setup');
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(30);
    setUserAnswer('');
    setQuizResults([]);
    setShuffledSongs([]);
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    submitAnswer();
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
                  <li>• จำนวนข้อ: {musicFiles.length} ข้อ</li>
                </ul>
              </div>
              <p className="text-sm opacity-80 mb-4">
                * สำหรับ demo นี้ ใช้เพลงตัวอย่าง<br/>
                ในการใช้งานจริง ให้ใส่ไฟล์ MP3 ใน /public/music/
              </p>
            </div>
            <button
              onClick={startQuiz}
              disabled={musicFiles.length === 0}
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 disabled:cursor-not-allowed"
            >
              เริ่มเกม
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
                onError={() => console.log('Audio loading error - ในการใช้งานจริงต้องมีไฟล์เพลง')}
              >
                เบราว์เซอร์ไม่รองรับ audio element
              </audio>
              <p className="text-sm opacity-80">
                {shuffledSongs[currentQuestionIndex] ? 
                  `กำลังเล่น: ${shuffledSongs[currentQuestionIndex]}` : 
                  'กำลังโหลดเพลง...'
                }
              </p>
            </div>

            <form onSubmit={handleAnswerSubmit} className="mb-6">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="ใส่ชื่อไฟล์เพลง (ไม่ต้องใส่ .mp3)"
                className="w-full p-4 rounded-lg text-black text-center text-lg mb-4"
                autoFocus
              />
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

            <div className="text-2xl font-bold">
              คะแนน: {score}
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
                  className={`mb-3 p-3 rounded-lg text-left ${
                    result.isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'
                  }`}
                >
                  <div className="font-bold">
                    ข้อ {result.question}: {result.song} {result.isCorrect ? '✅' : '❌'}
                  </div>
                  <div className="text-sm">
                    คำตอบของคุณ: {result.userAnswer}
                  </div>
                  <div className="text-sm">
                    คำตอบที่ถูก: {result.correctAnswer}
                  </div>
                  <div className="text-sm opacity-80">
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