import React, { useState, useEffect, useRef } from 'react';
import Matter from 'matter-js';

// Some hacker-style helper texts
const PARAGRAPHS = [
    "The sky above the port was the color of television, tuned to a dead channel. It's not like I'm using,' Case heard someone say, as he shouldered his way through the crowd around the door of the Chat. 'It's like my body's developed this massive drug deficiency.' It was a Sprawl voice and a Sprawl joke. The Chat was a bar for professional expatriates; you could drink there for a week and never hear two words in Japanese.",
    "He who controls the past controls the future. He who controls the present controls the past. War is peace. Freedom is slavery. Ignorance is strength. To the future or to the past, to a time when thought is free, when men are different from one another and do not live alone - to a time when truth exists and what is done cannot be undone: From the age of uniformity, from the age of solitude, from the age of Big Brother, from the age of doublethink - greetings!",
    "A screaming comes across the sky. It has happened before, but there is nothing to compare it to now. It is too late. The Evacuation still proceeds, but it's all theatre. There are no lights inside the cars. No light anywhere. Above him lift girders old as an iron queen, and glass somewhere far above that would let the light of day through. But it's night. He's afraid of the way the glass will fall - soon - it will be a spectacle: the fall of a crystal palace."
];

const COMPLIMENTS = [
    "SYSTEM: OPTIMAL PERFORMANCE",
    "ACCESS GRANTED... ALMOST",
    "TYPING SPEED: GODLIKE",
    "MAINFRAME PENETRATION: 40%",
    "CODESTREAM STABLE"
];

const FallingLettersTextarea = () => {
    const [text, setText] = useState('');
    const [targetText, setTargetText] = useState('');
    const [isFalling, setIsFalling] = useState(false);
    const [fallingLetters, setFallingLetters] = useState([]);
    const [compliment, setCompliment] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [inactivityTimer, setInactivityTimer] = useState(5.0);

    // Scoring State
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(1.0);
    const [streak, setStreak] = useState(0); // Consecutive correct words
    const [wpm, setWpm] = useState(0);
    const [completedWords, setCompletedWords] = useState(0);

    const textareaRef = useRef(null);
    const containerRef = useRef(null);
    const letterRefs = useRef({});
    const engineRef = useRef(null);
    const runnerRef = useRef(null);

    // Timers
    const elapsedIntervalRef = useRef(null);
    const inactivityIntervalRef = useRef(null);

    // Init game
    useEffect(() => {
        setTargetText(PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPhysics();
            if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
            if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current);
        };
    }, []);

    const startGame = () => {
        setGameStarted(true);
        setIsFalling(false);
        setFallingLetters([]);
        setText('');
        setCompliment(''); // Clear any game over message
        setElapsedTime(0);
        setInactivityTimer(5.0);

        // Reset Score
        setScore(0);
        setCombo(1.0);
        setStreak(0);
        setWpm(0);
        setCompletedWords(0);

        // Clear any existing intervals just in case
        if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
        if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current);

        // Elapsed Timer
        elapsedIntervalRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 0.1);
        }, 100);

        // Inactivity Timer Loop
        inactivityIntervalRef.current = setInterval(() => {
            setInactivityTimer(prev => {
                if (prev <= 0.1) {
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);
    };

    // Check for inactivity expiration
    useEffect(() => {
        if (gameStarted && !isFalling && inactivityTimer <= 0.01) {
            triggerAnimation();
        }
    }, [inactivityTimer, gameStarted, isFalling]);

    // Update WPM
    useEffect(() => {
        if (gameStarted && !isFalling && elapsedTime > 0) {
            // Standard WPM: (characters / 5) / (minutes)
            const currentWpm = (text.length / 5) / (elapsedTime / 60);
            setWpm(Math.round(currentWpm));
        }
    }, [text, elapsedTime, gameStarted, isFalling]);


    const stopGameTimers = () => {
        if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
        if (inactivityIntervalRef.current) clearInterval(inactivityIntervalRef.current);
    };

    const handleChange = (e) => {
        if (!gameStarted || isFalling) return;

        const val = e.target.value;

        // Prevent manual deletion via input (just in case backspace slips through).
        if (e.nativeEvent.inputType === 'deleteContentBackward') return;

        // Check valid prefix - STRICT MODE (Sudden Death)
        // If the typed text does not match the start of the target text (including the new character)
        if (!targetText.startsWith(val)) {
            // playErrorSound(); // Assuming this is handled or placeholder
            // Pass 'val' (the text with the typo) as the override so the user sees their mistake fall
            triggerAnimation("SYSTEM FAILURE: DATA CORRUPTION DETECTED", val);
            return;
        }

        const isSpace = val.endsWith(' ') && !text.endsWith(' ');
        const isComplete = val.length === targetText.length;

        if (isSpace || isComplete) {
            const currentWords = val.trim().split(/\s+/);

            // Just finished a word?
            if (currentWords.length > completedWords) {
                const wordIndex = currentWords.length - 1;
                const typedWord = currentWords[wordIndex];

                // Since we are in strict mode, if we are here, it matches.
                const wordValue = typedWord.length * 10;
                const newScore = score + Math.round(wordValue * combo);
                setScore(newScore);

                const newStreak = streak + 1;
                setStreak(newStreak);
                setCompletedWords(currentWords.length);

                // Update Combo
                if (newStreak > 0 && newStreak % 10 === 0) {
                    setCombo(prev => prev + 0.5);
                    showCompliment(`COMBO UP! x${combo + 0.5}`);
                }
            }
        }

        setText(val);

        // Reset Inactivity Timer
        setInactivityTimer(5.0);

        // Completion Check
        if (val === targetText) {
            finishGame();
        }
    };

    const finishGame = () => {
        stopGameTimers();
        // End Bonus: (Avg WPM) * 10
        const endBonus = wpm * 10;
        // Completion Bonus: Time Remaining * 50
        const completionBonus = Math.floor(inactivityTimer * 50);

        setScore(prev => prev + endBonus + completionBonus);
        setCompliment(`MISSION COMPLETE. FINAL SCORE: ${score + endBonus + completionBonus}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
        }
    };

    const showCompliment = (customMsg) => {
        const msg = customMsg || COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
        setCompliment(msg);
        setTimeout(() => setCompliment(''), 2000);
    };

    const stopPhysics = () => {
        if (runnerRef.current) {
            Matter.Runner.stop(runnerRef.current);
            runnerRef.current = null;
        }
        if (engineRef.current) {
            Matter.Engine.clear(engineRef.current);
            Matter.World.clear(engineRef.current.world);
            engineRef.current = null;
        }
    };

    const triggerAnimation = (reason, overrideText = null) => {
        stopGameTimers();
        setIsFalling(true);

        if (reason) {
            setCompliment(reason);
        }

        const textToUse = overrideText !== null ? overrideText : text;
        const words = textToUse.trim().split(/\s+/).filter(w => w.length > 0);
        const penalty = words.length * 50;
        setScore(prev => Math.max(0, prev - penalty)); // Don't go below 0
        setCombo(1.0);

        // Measure letters
        const measuredLetters = measureLetters(textToUse, textareaRef.current);
        setFallingLetters(measuredLetters);
        setText('');
        initPhysics(measuredLetters);
    };

    const measureLetters = (textContent, textarea) => {
        if (!textarea) return [];

        const computedStyle = window.getComputedStyle(textarea);
        const measureDiv = document.createElement('div');

        // Copy exact typography
        measureDiv.style.font = computedStyle.font;
        measureDiv.style.fontFamily = computedStyle.fontFamily;
        measureDiv.style.fontSize = computedStyle.fontSize;
        measureDiv.style.fontWeight = computedStyle.fontWeight;
        measureDiv.style.letterSpacing = computedStyle.letterSpacing;
        measureDiv.style.lineHeight = computedStyle.lineHeight;
        measureDiv.style.padding = computedStyle.padding;
        measureDiv.style.whiteSpace = 'pre-wrap';
        measureDiv.style.wordBreak = 'break-word';
        measureDiv.style.width = `${textarea.clientWidth}px`;
        measureDiv.style.position = 'absolute';
        measureDiv.style.top = '0';
        measureDiv.style.left = '0';
        measureDiv.style.visibility = 'hidden';

        document.body.appendChild(measureDiv);

        const letters = [];
        const charArray = Array.from(textContent);

        charArray.forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.id = `measure-span-${i}`;
            measureDiv.appendChild(span);
        });

        const textareaRect = textarea.getBoundingClientRect(); // Viewport relative

        charArray.forEach((char, i) => {
            const span = measureDiv.querySelector(`#measure-span-${i}`);
            const rect = span.getBoundingClientRect();

            if (char !== '\n' && char !== '\r') {
                letters.push({
                    id: i,
                    char,
                    // Calculate absolute position
                    x: textareaRect.left + rect.left,
                    y: textareaRect.top + rect.top,
                    width: rect.width,
                    height: rect.height
                });
            }
        });

        document.body.removeChild(measureDiv);
        return letters;
    };

    const initPhysics = (letters) => {
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite;

        const engine = Engine.create();
        engineRef.current = engine;

        const bodies = letters.map(l => {
            return Bodies.rectangle(
                l.x + l.width / 2,
                l.y + l.height / 2,
                l.width,
                l.height,
                {
                    angle: 0,
                    restitution: 0.8,
                    friction: 0.005,
                    density: 0.04,
                    label: `letter-${l.id}`
                }
            );
        });

        Composite.add(engine.world, bodies);

        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);

        (function renderLoop() {
            if (!engineRef.current) return;
            bodies.forEach(body => {
                const letterId = body.label.replace('letter-', '');
                const el = letterRefs.current[letterId];
                if (el) {
                    const { x, y } = body.position;
                    el.style.transform = `translate(${x - letters.find(l => l.id == letterId).width / 2}px, ${y - letters.find(l => l.id == letterId).height / 2}px) rotate(${body.angle}rad)`;
                }
            });
            requestAnimationFrame(renderLoop);
        })();
    };

    return (
        <div className="terminal-container" ref={containerRef}>

            {/* HUD - Timers & Stats */}
            <div className="hud-container">
                <div className="hud-group">
                    <span>SCORE: {score}</span>
                    <span style={{ color: combo > 1 ? '#00ff00' : '#004400' }}>COMBO: x{combo.toFixed(1)}</span>
                    <span>WPM: {wpm}</span>
                </div>

                <div className="hud-group">
                    <span>SESSION: {elapsedTime.toFixed(1)}s</span>
                    <span style={{ color: inactivityTimer < 2 ? 'red' : '#00ff00' }}>
                        STABILITY: {inactivityTimer.toFixed(1)}s
                    </span>
                </div>
            </div>

            {/* Split Layout Container */}
            <div className="split-layout">
                {/* Left Panel: Target Text */}
                <div className="panel left-panel">
                    <div className="panel-header">// SOURCE DATA</div>
                    {!isFalling && (
                        <div className="target-text">
                            {/* Character-level rendering for styling errors */}
                            {targetText.split('').map((char, index) => {
                                let color = '#004400'; // Default dim
                                const typedChar = text[index];

                                if (typedChar !== undefined) {
                                    if (typedChar === char) {
                                        color = '#00ff00'; // Match
                                    } else {
                                        color = '#ff0000'; // ERROR
                                    }
                                } else {
                                    // Not typed yet
                                    color = '#004400';
                                }

                                return (
                                    <span key={index} style={{
                                        color: color,
                                        textShadow: color === '#00ff00' ? '0 0 5px #00ff00' : (color === '#ff0000' ? '0 0 5px #ff0000' : 'none'),
                                        background: color === '#ff0000' ? '#330000' : 'transparent' // Slight background highlight for error visibility
                                    }}>
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Panel: Input */}
                <div className="panel right-panel">
                    <div className="panel-header">// TRANSCRIPTION FEED</div>
                    {!isFalling && (
                        <textarea
                            ref={textareaRef}
                            disabled={!gameStarted}
                            value={text}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoFocus={gameStarted}
                            placeholder={gameStarted ? "INITIATE TRANSCRIPTION..." : "AWAITING START SIGNAL..."}
                            spellCheck="false"
                            className="input-textarea"
                            style={{ opacity: gameStarted ? 1 : 0.5 }}
                        />
                    )}
                </div>
            </div>

            {/* Start Button Overlay */}
            {
                !gameStarted && !isFalling && (
                    <div className="start-button-overlay">
                        <button
                            onClick={startGame}
                            className="glitch-button"
                        >
                            INITIALIZE_LINK
                        </button>
                    </div>
                )
            }


            {/* Compliment Toast */}
            {
                compliment && (
                    <div className="compliment-toast">
                        {compliment}
                    </div>
                )
            }

            {/* Falling Letters */}
            {
                isFalling && fallingLetters.map((l) => (
                    <div
                        key={l.id}
                        ref={el => letterRefs.current[l.id] = el}
                        className="falling-letter"
                        style={{
                            width: `${l.width}px`,
                            height: `${l.height}px`,
                            transform: `translate(${l.x}px, ${l.y}px)`
                        }}
                    >
                        {l.char}
                    </div>
                ))
            }

            {
                isFalling && (
                    <button
                        onClick={() => {
                            stopPhysics();
                            setTargetText(PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]);
                            startGame();
                        }}
                        className="crash-retry-button"
                    >
                        SYSTEM CRASHED. RETRY?
                    </button>
                )
            }

        </div >
    );
};

export default FallingLettersTextarea;
