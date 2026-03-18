import { createGlobalStyle } from 'styled-components'

// Global styles with a clean and neutral visual base for desktop and mobile.
export const GlobalStyles = createGlobalStyle`
  :root {
    --bg-base: #f4f7fb;
    --bg-soft: #eef2f8;
    --card: #ffffff;
    --ink-primary: #182433;
    --ink-secondary: #4f5d73;
    --line: #d8dfeb;
    --brand: #007f73;
    --brand-soft: #e6f6f4;
    --warn-bg: #fff3cd;
    --warn-border: #f6d98b;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    color: var(--ink-primary);
    font-family: 'Poppins', 'Segoe UI', sans-serif;
    background:
      radial-gradient(circle at 12% 12%, #dbefff 0%, transparent 45%),
      radial-gradient(circle at 88% 10%, #e3f9f5 0%, transparent 38%),
      linear-gradient(180deg, var(--bg-base) 0%, var(--bg-soft) 100%);
  }

  button,
  input {
    font: inherit;
  }
`
