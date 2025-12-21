import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">
        Gamified Medicare Call Center
      </h1>

      <Link
        href="/aca/dashboard"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
