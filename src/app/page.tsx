

export default function Home() {

  return (
    //redirect to /dashboard if user is logged in
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Welcome to trade/sim</h1>
        <p className="text-lg mt-4">Your trading simulation platform</p>
      </div>
    </div>
  )
}
