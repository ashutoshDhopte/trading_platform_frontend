# Trading Platform Simulator - Frontend

This is the frontend for the Full-Stack Trading Platform Simulator, built with Next.js, React, and TypeScript. It provides a responsive and interactive user dashboard for simulating stock trades, viewing portfolio performance, receiving real-time market data updates, and managing a secure user session.

[Try it](https://trade-sim-liard.vercel.app/)

## Key Features

- **Secure User Authentication:** A complete credentials-based login and registration system built with **NextAuth.js**, which securely manages user sessions.
- **Interactive Dashboard:** Displays a user's total portfolio value, cash balance, and a detailed list of their stock holdings with current valuations after they log in.
- **Real-time Data & Notifications:** Connects to a Go backend via WebSockets to receive live stock price updates and triggers **Browser Notifications** for important events like trade confirmations.
- **Protected Trade Execution:** Simple and intuitive forms for submitting "buy" and "sell" orders to protected backend API endpoints, using JWTs for authorization.
- **Modern Frontend Stack:** Built with the latest standards, including the Next.js App Router, TypeScript for type safety, and React hooks for state management.

## Tech Stack

- **Framework:** Next.js
- **Library:** React
- **Language:** TypeScript
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **API Communication:** REST (for actions) & WebSockets (for real-time data)

---

## Getting Started

Follow these instructions to get the frontend development server running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
- The [Go Backend Server](https://github.com/ashutoshDhopte/trading_platform_backend/) must be running locally for the frontend to authenticate, fetch data, and connect to WebSockets.

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/trading-platform-frontend.git](https://github.com/your-username/trading-platform-frontend.git)
    cd trading-platform-frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    The application needs to know the URLs for your local backend server and requires secrets for session management. Create a file named `.env.local` in the project's root directory. You can generate a strong `NEXTAUTH_SECRET` by running `openssl rand -base64 32` in your terminal.
    
    ```env
    # .env.local file

    # URL for the REST API
    NEXT_PUBLIC_API_URL=http://localhost:8080/trade-sim
    
    # URL for the WebSocket server
    NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/trade-sim/ws/dashboard

    # NextAuth.js configuration
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-super-long-randomly-generated-string-goes-here
    ```
    *Note: Adjust the API paths (`/trade-sim`) and port (`8080`) to match your backend server's configuration.*

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    The application should now be running on [http://localhost:3000](http://localhost:3000).

---

## How It Works

- The application uses **NextAuth.js** to handle user sign-up and login. Upon successful authentication with the Go backend, NextAuth.js manages the user's session in the browser.
- For protected actions like buying or selling stocks, a **JWT** obtained during login is sent in the `Authorization` header of the API request.
- The dashboard establishes a **WebSocket** connection to the backend to receive a live stream of stock price updates, which dynamically re-renders the UI.
- When the backend sends a specific event message (e.g., after a trade is executed), the frontend uses the Browser **Notification API** to alert the user.

