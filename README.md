# 🎲 Online Blackjack Game for Friends

Welcome to the Online Blackjack Game project! 🚀 This project is built using Next.js and allows you to play a thrilling game of Blackjack with your friends in real-time.

## 🛠️ Installation

Follow these simple steps to set up the project locally:

1. Clone the repository to your machine:

   ```bash
   git clone https://github.com/loudsheep/blackjack.git
   ```

2. Navigate to the project directory:

   ```bash
   cd blackjack
   ```

3. Install dependencies in root and SOCKET_SERVER folder:

   ```bash
   npm install
   cd ./SOCKET_SERVER
   npm install
   ```

4. Copy the `.env.example` file and rename it to `.env`:

   ```bash
   cp .env.example .env
   ```

5. Open the `.env` file and set the required environmental variables:

   ```env
   MONGODB_URI=your_mongo_url
   ```

   Replace `your_mongo_url` with the appropriate mongodb connection string.

## 🚀 Running Locally

Now that you have everything set up, run the project locally with the following commands:

```bash
npm run dev
```

```bash
npm run node
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to play the Online Blackjack Game.

## 🎉 Features

- Real-time multiplayer Blackjack game.
- Interactive and user-friendly interface.
- Enjoyable gaming experience with friends.

## 🤝 Contributing

We welcome contributions! Feel free to open issues or submit pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
