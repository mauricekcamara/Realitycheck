# Reality Check - The Gambling Truth Platform

A mobile app that uses data and mathematics to help people understand the reality of gambling losses and make informed decisions about their financial future.

## 🎯 Core Mission

**Reality Check** destroys the delusion that gambling can be profitable long-term by providing personalized data that shows users their actual performance versus theoretical odds. Instead of relying on willpower ("don't gamble"), it uses intellectual honesty ("you literally cannot win long-term, here's your personal proof").

## ✨ Key Features

### 1. **Personal Casino Edge Calculator**
- Input your gambling history to see your actual house edge vs. theoretical
- Spoiler: You're performing worse than random chance
- Detailed breakdown by game type with personalized statistics

### 2. **Profit Impossibility Tracker**
- Based on your bankroll, bet sizes, and game choice
- Calculates the mathematical impossibility of your profitability goals
- Shows exactly how long until you're broke at current rates

### 3. **Debt Integration**
- Every dollar lost is automatically added to debt payoff timeline
- "This $200 casino session just delayed your debt freedom by 3 weeks"
- Visual timeline showing the impact on financial freedom

### 4. **Alternative Investment Tracker**
- Shows what that gambling money would be worth in:
  - S&P 500 Index Funds (10% annual return)
  - High-Yield Savings (4% annual return)
  - Debt Payoff (15% interest saved)
  - 401(k) Match (100% return)
- Custom investment calculator for any scenario

## 🛠️ Technical Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Charts**: React Native Chart Kit
- **Storage**: Expo Secure Store
- **UI**: Custom components with Linear Gradients
- **Icons**: Expo Vector Icons (Ionicons)

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   └── StatCard.tsx    # Gradient stat cards
├── hooks/              # Custom React hooks
│   └── useDataStorage.ts # Data persistence
├── screens/            # Main app screens
│   ├── HomeScreen.tsx           # Overview dashboard
│   ├── EdgeCalculatorScreen.tsx # Personal edge analysis
│   ├── ProfitTrackerScreen.tsx  # Profitability analysis
│   ├── DebtTrackerScreen.tsx    # Debt impact tracking
│   ├── InvestmentTrackerScreen.tsx # Investment comparisons
│   └── SettingsScreen.tsx       # App configuration
├── types/              # TypeScript type definitions
│   └── index.ts        # Data interfaces
└── utils/              # Utility functions
    └── calculations.ts # Mathematical calculations
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RealityCheck
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 📊 Data & Privacy

### Data Storage
- All data is stored locally on the device using Expo Secure Store
- No data is sent to external servers
- Your privacy is our priority
- Data is encrypted and secure

### Data Types
- **Gambling Sessions**: Date, game type, bet amount, wins/losses, duration
- **Debt Information**: Total debt, monthly payment, interest rate
- **User Settings**: Notifications, currency, theme preferences

## 🎮 Game Types Supported

The app includes theoretical house edges for:
- Blackjack (Basic Strategy): 0.5%
- Blackjack (No Strategy): 2.0%
- Roulette (American): 5.26%
- Roulette (European): 2.7%
- Craps (Pass Line): 1.41%
- Slots (Low Variance): 3.0%
- Slots (High Variance): 8.0%
- Video Poker (Jacks or Better): 0.46%
- Keno: 25.0%
- Lottery: 50.0%

## 📈 Mathematical Calculations

### Personal Edge Calculation
```
Personal Edge = (Total Losses / Total Bet Amount) × 100
```

### Profitability Analysis
```
Monthly Loss = (Average Bet × Game Edge / 100) × Sessions per Month
Time to Zero = Bankroll / Monthly Loss
Probability of Profit = max(0, 100 - (Game Edge × 10))
```

### Investment Projections
```
Projected Value = Initial Amount × (1 + Annual Return)^Years
Opportunity Cost = Projected Value - Initial Amount
```

## 🎨 Design Philosophy

### Visual Design
- **Dark Theme**: Easy on the eyes, reduces eye strain
- **Gradient Cards**: Modern, engaging visual elements
- **Color Coding**: Red for losses, green for gains, blue for neutral
- **Clean Typography**: Easy to read and understand

### User Experience
- **Data-Driven**: Every claim is backed by mathematical proof
- **Personalized**: Shows your actual performance, not generic advice
- **Motivational**: Focuses on opportunity cost and future potential
- **Non-Judgmental**: Presents facts without moralizing

## 🔮 Future Features

- **Data Export**: CSV export of gambling sessions
- **Cloud Backup**: Secure cloud storage for data backup
- **Multiple Currencies**: Support for international currencies
- **Advanced Analytics**: More detailed statistical analysis
- **Gambling Support Resources**: Direct links to help resources
- **Push Notifications**: Motivational reminders and insights

## 🤝 Contributing

This app is designed to help people make informed decisions about gambling. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This app is designed to provide educational information about gambling mathematics and personal financial impact. It is not intended as professional financial advice. If you or someone you know is struggling with gambling addiction, please seek professional help.

## 🆘 Support Resources

If you need help with gambling addiction:
- National Problem Gambling Helpline: 1-800-522-4700
- Gamblers Anonymous: gamblersanonymous.org
- National Council on Problem Gambling: ncpgambling.org

---

**Remember**: The only winning move is not to play. Your future self will thank you for making informed financial decisions. 