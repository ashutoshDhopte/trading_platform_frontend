'use client'

import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    verifyPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setForm({ email: "", password: "", verifyPassword: "" });
    setShowPassword(false);
    setShowVerifyPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          authType: "login",
          redirect: false
        })
      } else {
        result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          verifyPassword: form.verifyPassword,
          authType: "signin",
          redirect: false
        })
      }

      if(result?.ok){
        const session = await getSession();
        if(session){
          router.push(`/dashboard?userId=${session.userId}`);
        }
      }

    } catch (error) {
      console.error(isLogin ? "Login failed with error: " : "Signup failed with error: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if(session){
        router.push(`/dashboard?userId=${session.userId}`);
      }else{
        console.log("No session");
      }
    };
    fetchSession();
  }, [router]);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl font-bold p-4">You might have to wait for 60 secs after clicking the Login or Create Account button, to let the backend instance spin up.</h1>
      <p className="text-2xl mt-4">Welcome to your trading simulation platform</p>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-md mt-8"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isLogin ? "Login" : "Create Account"}
        </h2>
        <div className="mb-4">
          <label className="block mb-1 text-gray-300" htmlFor="email">Email</label>
          <input
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete={isLogin ? "username" : "new-email"}
            placeholder="please enter demo email"
          />
        </div>
        <div className="mb-4 relative">
          <label className="block mb-1 text-gray-300" htmlFor="password">Password</label>
          <input
            className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          <button
            type="button"
            className="absolute right-2 top-9 text-gray-400 hover:text-gray-200"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {!isLogin && (
          <div className="mb-4 relative">
            <label className="block mb-1 text-gray-300" htmlFor="verifyPassword">Verify Password</label>
            <input
              className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              type={showVerifyPassword ? "text" : "password"}
              id="verifyPassword"
              name="verifyPassword"
              value={form.verifyPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2 top-9 text-gray-400 hover:text-gray-200"
              onClick={() => setShowVerifyPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showVerifyPassword ? "Hide" : "Show"}
            </button>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center"
          disabled={loading}
        >
          {isLogin ? "Login" : "Create Account"}
          {loading && (
            <svg
              className="animate-spin ml-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
        </button>
      </form>
      <button
        onClick={toggleForm}
        className="mt-4 text-blue-400 hover:underline"
        disabled={loading}
      >
        {isLogin
          ? "Don't have an account? Create Account"
          : "Already have an account? Login"}
      </button>
    </div>
  );
}
