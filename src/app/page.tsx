export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Agency OS Admin</h1>
      <p className="text-gray-700">Bienvenido. Logeate para empezar.</p>
      <a className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700" href="/auth/signin">Sign In</a>
    </div>
  )
}
