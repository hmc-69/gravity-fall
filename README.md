# GRAVITY FALL v1.0

> "The sky above the port was the color of television, tuned to a dead channel."

## 📡 SYSTEM OVERVIEW
**Gravity Fall** is a high-stakes, cyberpunk-themed typing survival game. It is not just about speed; it is about **precision** and **stability**. In this strict environment, any error leads to immediate system failure.

## ⚠️ CORE PROTOCOLS (FEATURES)

### 💀 STRICT_MODE (Sudden Death)
Accuracy is non-negotiable.
- **Zero Tolerance**: Any typo, no matter how small, triggers an immediate **System Crash**.
- **Physics Failure**: Upon crashing, the interface literally falls apart, with letters crumbling under the weight of your failure using the `matter-js` physics engine.

### ⏳ STABILITY MONITOR (Inactivity Timer)
Constant input feels required to maintain the uplink.
- **5-Second Threshold**: If you stop typing for more than **5.0 seconds**, the connection destabilizes.
- **Result**: Automatic system failure and physics crash. Keep the data stream alive.

### 📟 TERMINAL AESTHETICS
- **Visuals**: Immersive retro-terminal interface with CRT-style green-on-black color scheme.
- **Feedback**: Dynamic text highlighting—typographic precision is visualized in real-time.
- **Atmosphere**: Authentic cyberpunk flavor text and "hacker" compliments (e.g., "MAINFRAME PENETRATION: 40%").

### 🏆 SCORING ALGORITHM
COMPETE FOR OPTIMAL METRICS:
- **Score**: Points awarded for correct characters and completed words.
- **Combo System**: Build streaks of correct words to increase your Score Multiplier (up to x3.0+).
- **WPM (Words Per Minute)**: Real-time tracking of data throughput.
- **Bonuses**:
    - **End Bonus**: Based on Average WPM.
    - **Completion Bonus**: Points awarded for remaining Stability time.

## 🛠️ INSTALLATION & INITIALIZATION

To deploy the local environment:

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd gravity_fall
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Initiate Link**
    ```bash
    npm run dev
    ```

## 🎮 OPERATIONAL GUIDE

1.  Click **INITIALIZE_LINK** to begin the session.
2.  **Transcribe** the Green Source Data (Left Panel) into the Input Terminal (Right Panel).
3.  **DO NOT** make mistakes. There is no backspace for errors—only the restart button.
4.  **DO NOT** hesitate. The 5-second timer is always ticking down when you are idle.
5.  Reach the end of the text to secure the data and win.

---
*System Monitor: ONLINE*