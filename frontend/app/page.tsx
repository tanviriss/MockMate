export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-gray-900">
          Mock<span className="text-blue-600">Mate</span>
        </h1>
        <p className="text-2xl text-gray-600 max-w-2xl">
          AI Voice Interview Coach
        </p>
        <p className="text-lg text-gray-500 max-w-xl">
          Practice job interviews with personalized questions, real-time voice interaction,
          and AI-powered feedback.
        </p>

        <div className="flex gap-4 justify-center pt-8">
          <a
            href="/signup"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition"
          >
            Login
          </a>
        </div>

        <div className="pt-12 text-sm text-gray-500">
          <p>Backend API: <span className="font-mono text-green-600">http://localhost:8000</span> ✓</p>
        </div>
      </div>
    </main>
  );
}
