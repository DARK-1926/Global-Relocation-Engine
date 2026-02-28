# Global Relocation & Travel Decision Intelligence Engine

A full-stack system that aggregates real-time public data, applies multi-factor decision logic, and produces ranked, explainable recommendations based on user-defined constraints.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, TailwindCSS v4, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **APIs Used**: REST Countries, World Bank API, OpenWeatherMap, World Air Quality Index (WAQI)

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Clone or Extract the Project

Open a terminal in the project root directory (`global-relocation-engine`).

### 3. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an environment file:
   - In the `backend` folder, create a file named `.env`
   - Add your API keys to this file exactly like this:
     ```env
     OPENWEATHER_API_KEY=your_openweathermap_key_here
     WAQI_TOKEN=your_waqi_token_here
     ```
     _(Note: You can get these keys for free from [OpenWeatherMap](https://openweathermap.org/api) and [WAQI](https://aqicn.org/data-platform/token/).)_

4. Start the backend server:
   ```bash
   npm run dev
   ```
   _The backend will run on `http://localhost:3001`_

### 4. Frontend Setup

1. Open a **new, separate terminal** and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend application:
   ```bash
   npm run dev
   ```
   _The frontend will run on `http://localhost:5173`_

---

## 🎯 How to Use

1. Open your browser and go to `http://localhost:5173`.
2. **Select Destinations**: Use the dropdown to select at least 3 countries you want to compare.
3. **Set Preferences**:
   - Choose your **Risk Tolerance** (Low, Moderate, High).
   - Choose your **Duration of Stay** (Short-term, Long-term).
4. **Analyze**: Click the "Analyze Destinations" button.
5. The system will concurrently fetch real-time public data, calculate dynamic scores, and present a ranked list of destinations tailored strictly to your preferences!

## 🧠 System Architecture Notes

- **Caching**: All successful API responses are cached in memory for 60 minutes.
- **Resilience**: The backend is designed to return partial intelligence scores if a third-party API goes down, warning the user instead of crashing.
- **Dynamic Weighting**: The algorithm dynamically adjusts penalizations for Risk Tolerance and alters metric weights based on the Duration of Stay.
