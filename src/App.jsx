import { useState, useEffect, useRef } from "react";
import { TossAds, getTossShareLink, share } from "@apps-in-toss/web-framework";
import { questions, types, memories } from "./data/questions";
import "./App.css";

function ListBannerAd({ adGroupId }) {
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!TossAds.initialize.isSupported()) return;
    TossAds.initialize({
      callbacks: {
        onInitialized: () => setIsInitialized(true),
        onInitializationFailed: (error) => console.error("Toss Ads 초기화 실패:", error),
      },
    });
  }, []);

  useEffect(() => {
    if (!isInitialized || !containerRef.current) return;
    const attached = TossAds.attachBanner(adGroupId, containerRef.current, {
      theme: "auto",
      tone: "blackAndWhite",
      variant: "expanded",
    });
    return () => attached?.destroy();
  }, [isInitialized, adGroupId]);

  return <div ref={containerRef} style={{ width: "100%", height: "96px" }} />;
}

function getResult(answers) {
  const scores = { A: 0, B: 0, C: 0, D: 0 };
  answers.forEach(({ dim, val }) => {
    scores[dim] += val ? 1 : -1;
  });
  const key =
    (scores.A >= 0 ? "A" : "S") +
    (scores.B >= 0 ? "O" : "L") +
    (scores.C >= 0 ? "T" : "C") +
    (scores.D >= 0 ? "X" : "H");
  return types[key];
}

function ProgressDots({ current, total }) {
  return (
    <div className="progress-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`dot ${i < current ? "done" : ""} ${i === current ? "active" : ""}`}
        />
      ))}
    </div>
  );
}

function Intro({ onStart }) {
  return (
    <div className="card intro-card">
      <img src="/logo.png" alt="영포티 테스트" className="intro-logo" />
      <p className="intro-subtitle">
        40대라도 다 같은 40대가 아니다.
        <br />
        나의 영포티 유형을 알아보자.
      </p>
      <div className="type-preview">
        {Object.values(types).map((t) => (
          <div key={t.name} className="type-chip" style={{ background: t.gradient }}>
            {t.emoji} {t.name}
          </div>
        ))}
      </div>
      <p className="intro-count">10문항 · 1분</p>
      <button className="btn-primary" onClick={onStart}>
        내 유형 알아보기 →
      </button>
    </div>
  );
}

function QuizCard({ question, questionIndex, total, onAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null);

  function handleOptionClick(option, idx) {
    setSelectedOption(idx);
    onAnswer({ dim: option.dim, val: option.val }, idx);
  }

  return (
    <div className="card quiz-card">
      <ProgressDots current={questionIndex} total={total} />
      <div className="question-emoji">{question.emoji}</div>
      <h2 className="question-text">{question.question}</h2>
      <div className="options">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className={`option-btn ${selectedOption === idx ? "selected" : ""}`}
            onClick={() => handleOptionClick(option, idx)}
          >
            <span className="option-label">{["A", "B", "C", "D"][idx]}</span>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function getRandomMemories(count = 4) {
  const shuffled = [...memories].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function ResultCard({ result, onRetry }) {
  const [copied, setCopied] = useState(false);
  const [randomMemories] = useState(() => getRandomMemories(4));

  async function handleShare() {
    const text = `나는 ${result.emoji} ${result.name} 유형! (영포티 지수 ${result.youngFortyScore}%)\n"${result.subtitle}"\n\n나는 어떤 영포티일까? 테스트해보세요 🔥`;
    const ogImageUrl = `${window.location.origin}/og.png`;
    try {
      const tossLink = await getTossShareLink("intoss://young40-test", ogImageUrl);
      await share({ message: `${text}\n\n${tossLink}` });
    } catch {
      if (navigator.share) {
        navigator.share({ text });
      } else {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    }
  }

  return (
    <div className="card result-card">
      <p className="result-label">나의 영포티 유형은</p>

      <div className="result-hero" style={{ background: result.gradient }}>
        <div className="result-hero-emoji">{result.emoji}</div>
        <div className="result-hero-name">{result.name}</div>
        <div className="result-hero-sub">{result.subtitle}</div>
      </div>

      <div className="score-row">
        <div className="score-bar-wrap">
          <div className="score-bar-label">
            <span>영포티 지수</span>
            <span className="score-value" style={{ color: result.color }}>{result.youngFortyScore}%</span>
          </div>
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${result.youngFortyScore}%`, background: result.gradient }}
            />
          </div>
        </div>
      </div>

      <p className="result-desc">{result.description}</p>

      <div className="result-tags">
        {result.tags.map((tag, i) => (
          <span key={i} className="result-tag" style={{ color: result.color, borderColor: result.color + "40", background: result.color + "10" }}>
            {tag}
          </span>
        ))}
      </div>

      <div className="memory-section">
        <p className="memory-title">🕰️ 혹시 이런 거 기억해?</p>
        <div className="memory-grid">
          {randomMemories.map((m, i) => (
            <div key={i} className="memory-item">
              <span className="memory-emoji">{m.emoji}</span>
              <span className="memory-text">{m.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="result-actions">
        <button className="btn-share" style={{ background: result.gradient }} onClick={handleShare}>
          {copied ? "복사됐어요 ✓" : "결과 공유하기 📤"}
        </button>
        <button className="btn-retry" onClick={onRetry}>
          다시 테스트하기
        </button>
      </div>

      <ListBannerAd adGroupId="ait.v2.live.7e273542668b401f" />
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  function handleStart() {
    setStep("quiz");
    setCurrentQ(0);
    setAnswers([]);
  }

  function handleAnswer({ dim, val }) {
    setTimeout(() => {
      const newAnswers = [...answers, { dim, val }];
      if (currentQ + 1 >= questions.length) {
        setResult(getResult(newAnswers));
        setStep("result");
      } else {
        setAnswers(newAnswers);
        setCurrentQ(currentQ + 1);
      }
    }, 350);
  }

  function handleRetry() {
    setStep("intro");
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  }

  return (
    <div className="app">
      <div className="container">
        {step === "intro" && <Intro onStart={handleStart} />}
        {step === "quiz" && (
          <QuizCard
            key={currentQ}
            question={questions[currentQ]}
            questionIndex={currentQ}
            total={questions.length}
            onAnswer={handleAnswer}
          />
        )}
        {step === "result" && result && (
          <ResultCard result={result} onRetry={handleRetry} />
        )}
      </div>
    </div>
  );
}
