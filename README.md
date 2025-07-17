# Trading Platform Simulator - Frontend

[Try the Live Application](https://trade-sim-liard.vercel.app/)

<img width="894" height="657" alt="Screenshot 2025-06-29 at 03 03 53" src="https://github.com/user-attachments/assets/925deb8f-8fd8-4522-b067-314a60dc717c" />


This is the frontend for the Full-Stack Trading Platform Simulator, built with Next.js, React, and TypeScript. It provides a responsive and interactive user interface for simulating stock trades, viewing portfolio performance, and analyzing real-time market data and AI-driven news sentiment.


## Key Features

- **Secure User Authentication:** A complete credentials-based login and registration system built with **NextAuth.js**, which securely manages user sessions.
- **AI-Powered Market Analysis:** A dedicated "Markets" page displays real-time news from the Finnhub API, with sentiment scores (Positive/Neutral/Negative) for each article calculated by a custom Python AI microservice.
- **Dynamic Data Visualization:** The dashboard displays a user's portfolio value and holdings, while the markets page shows a live-updating news feed with a 14-day EMA sentiment score for each stock.
- **Real-time Communication:** Connects to a Go backend via WebSockets to receive live stock price updates, new market news, and triggers **Browser Notifications** for important events.
- **Modern Frontend Stack:** Built with the latest standards, including the Next.js App Router, TypeScript for type safety, and features like paginated "load more" for news articles.

## Tech Stack

- **Framework:** Next.js
- **Library:** React
- **Language:** TypeScript
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **API Communication:** REST (for actions) & WebSockets (for real-time data)

## System Architecture

This frontend is part of a polyglot microservices architecture:
1.  **Next.js Frontend (This Repo):** The user interface, deployed on Vercel.
2.  **Go Backend:** The core service for user logic, trading, and orchestrating data from other services.
3.  **Python Sentiment Service:** A separate FastAPI service deployed on Hugging Face Spaces that analyzes news sentiment.

---

## Getting Started

Follow these instructions to get the frontend development server running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [npm](https://www.npmjs.com/) or another package manager
- The [Go Backend Server](https://github.com/ashutoshDhopte/trading_platform_backend) must be running locally. The Go service fetches data from Finnhub and the Python service.

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/trading-platform-frontend.git](https://github.com/your-username/trading-platform-frontend.git)
    cd trading-platform-frontend
    ```

    **Other repositories**

    Backend
    ```bash
    https://github.com/ashutoshDhopte/trading_platform_backend
    ```

    Sentiment Analysis
    ```bash
    https://huggingface.co/spaces/ashudhopte123/trading_platform_ml_huggingface/tree/main
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a file named `.env.local` in the project's root directory. You'll need to generate a strong `NEXTAUTH_SECRET` by running `openssl rand -base64 32` in your terminal.
    
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

- The application uses **NextAuth.js** to handle user sign-up and login. Upon successful authentication, a JWT from the Go backend is used to authorize protected API requests.
- The dashboard establishes a **WebSocket** connection to receive a live stream of stock prices, new market news, and trade confirmations.
- The "Markets" page displays detailed analysis for each stock, including a news feed with AI-generated sentiment scores. The news list is paginated, allowing users to "load more" historical articles.
- The frontend uses the Browser **Notification API** to alert users of important events, such as the arrival of new market news or completed trades.

