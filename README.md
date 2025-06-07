# Stock Trading Simulator - Frontend

This is the frontend for the Full-Stack Trading Platform Simulator, built with Next.js, React, and TypeScript. It provides a responsive and interactive user dashboard for simulating stock trades, viewing portfolio performance, and receiving real-time market data updates via WebSockets.

## Key Features

- **Interactive Dashboard:** Displays a user's total portfolio value, cash balance, and a detailed list of their stock holdings with current valuations.
- **Real-time Data:** Connects to a Go backend via WebSockets to receive and display live-updating mock stock prices without needing to refresh the page.
- **Trade Execution UI:** Simple and intuitive forms for submitting "buy" and "sell" orders to the backend API.
- **Data Visualization:** Presents transaction history and portfolio data in clean, readable tables and lists.
- **Modern Frontend Stack:** Built with the latest standards, including the Next.js App Router, TypeScript for type safety, and React hooks for state management.

## Tech Stack

- **Framework:** Next.js
- **Library:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API Communication:** REST (for actions) & WebSockets (for real-time data)

---

## Getting Started

Follow these instructions to get the frontend development server running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
- The [Go Backend Server](#) must be running locally for the frontend to fetch data and connect to WebSockets.
- [Go Backend Git repository](https://github.com/ashutoshDhopte/trading_platform_backend/)

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    # If the frontend is in its own repository
    git clone [https://github.com/your-username/trading-platform-frontend.git](https://github.com/your-username/trading-platform-frontend.git)
    cd trading-platform-frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

3.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    The application should now be running on [http://localhost:3000](http://localhost:3000).

---

## How It Works

- The application fetches initial portfolio and market data from the Go backend's REST API endpoints upon loading.
- It immediately establishes a WebSocket connection to the Go backend to start receiving a live stream of stock price updates.
- When a user submits a buy or sell order, a POST request is sent to the backend REST API. The UI then updates based on the response or by re-fetching the portfolio data to reflect the changes.

