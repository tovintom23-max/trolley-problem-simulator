# Trolley Problem Simulator

An interactive, top-down trolley problem simulator built with **HTML, CSS, JavaScript, and the HTML Canvas API**. Explore ethical dilemmas, choose a railway route, and review the consequences of each decision.

## Features

- Five playable ethical scenarios:
  - The Classic Dilemma
  - Railway Workers
  - The Difficult Choice
  - The Bridge Dilemma
  - Emergency Response
- Top-down railway environment rendered directly on HTML Canvas
- Animated trolley movement and track switching
- Track A / Track B decisions using buttons or keyboard shortcuts
- Special decisions:
  - Warning signal: clears people from the selected track in this simplified game model
  - Emergency brake: stops the trolley before the first person on the selected track
- Sound effects with an on/off control
- Score calculation and completion bonuses
- Decision history and analytics dashboard
- Local browser storage using `localStorage`
- Responsive layout for desktop, tablet, and mobile screens
- No external image assets or JavaScript libraries required

## Technologies

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and controls |
| CSS3 | Layout, styling, and responsive design |
| JavaScript | Game logic, animation, scoring, and interactions |
| HTML Canvas API | Drawing the railway, trolley, and characters |
| Web Audio API | Procedural sound effects |
| localStorage | Saving scores and decision history |

## Getting Started

### Run locally

1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` with the VS Code **Live Server** extension, or open the file directly in a modern browser.
4. Select a scenario and click **Start Simulation**.

### Project structure

```text
trolley-problem-simulator/
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
└── assets/
    └── screenshots/
        └── README.md
```

## Controls

| Control | Action |
|---|---|
| Start Simulation | Begins the selected scenario |
| Choose Track A | Selects the upper route at the junction |
| Choose Track B | Selects the lower route at the junction |
| `A` | Selects Track A when the decision is available |
| `B` | Selects Track B when the decision is available |
| `R` | Restarts the current scenario |
| Sound button | Turns sound effects on or off |

## Screenshots

Add screenshots of the running project to `assets/screenshots/` using these filenames:

- `gameplay.png` — the railway scene with the trolley approaching the junction
- `decision.png` — the decision panel showing Track A and Track B
- `dashboard.png` — the analytics dashboard and decision history

To capture a screenshot on Windows, press **Win + Shift + S**, select the area, save the image, and place it in the folder above.

Once the images are added, you can display them here by adding:

```markdown
![Gameplay](assets/screenshots/gameplay.png)
![Decision panel](assets/screenshots/decision.png)
![Analytics dashboard](assets/screenshots/dashboard.png)
```

## Data and Privacy

Scores and decision history are stored in the browser using `localStorage`. They are not sent to a server. Clearing browser site data may remove the saved game history.

## Important Simulation Note

This project is an educational game illustrating a simplified version of the trolley problem. The score is a game mechanic, not a scientific measure of morality or a claim that one ethical choice is universally correct. The warning and emergency-brake scenarios use simplified assumptions for interactive gameplay.

## Author

**Tovin Tom**

## License

No open-source license is included yet. Add a license file if you want to specify how others may use, modify, and distribute this project.
