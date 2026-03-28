import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { http } from "@/lib/http";
import { AxiosError } from "axios";
import { isTokenValid, setToken } from "@/lib/token";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if(isTokenValid()){
      navigate("/home")
    }
  }, [navigate])

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await http().post<{ token: string }>("/api/auth/login", {
        email,
        password,
      });
      setToken(res.data.token);
      const after = searchParams.get("after");
      console.log(after)
      navigate(after ? decodeURIComponent(after) : "/home");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-black">CampusSwap</Link>
          <p className="mt-2 text-gray-500">Sign in to your account</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-black cursor-pointer text-white font-semibold rounded-lg hover:bg-gray-600 transition">
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
