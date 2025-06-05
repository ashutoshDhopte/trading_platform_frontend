'use client'

import { createAccount, login } from "@/lib/api";
import { useRouter } from "next/navigation";
import React, {useState } from "react";


export default function Home() {

  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle login or create account logic here
    let userId = 0;

    if(isLogin){

      login(form.email, form.password).then((data) => {

        if(data.Success){
          userId = data.Data as number;
          // After login success:
          router.push(`/dashboard?userId=${userId}`);
        }else{
          console.error("Login failed: " + data.ErrorMessage);
        }

      }).catch((error) => {
        console.error("Login failed with error: ", error);
      });

    }else{

      createAccount(form.email, form.password, form.verifyPassword).then((data) => {

        if(data.Success){
          userId = data.Data as number;
          // After login success:
          router.push(`/dashboard?userId=${userId}`);
        }else{
          console.error("Signup failed: " + data.ErrorMessage);
        }

      }).catch((error) => {
        console.error("Signup failed with error: ", error);
      });
    }
  };

  return (
    //redirect to /dashboard if user is logged in
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center h-screen">
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>
      </form>
      <button
        onClick={toggleForm}
        className="mt-4 text-blue-400 hover:underline"
      >
        {isLogin
          ? "Don't have an account? Create Account"
          : "Already have an account? Login"}
      </button>
    </div>
  )
}
