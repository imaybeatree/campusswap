import { Link, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import logo from "@/assets/campusswap_logo.png";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-black border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="CampusSwap" className="h-8 w-8" />
            <span className="text-xl text-white font-bold">CampusSwap</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button className="bg-white text-black cursor-pointer" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button className="bg-white text-black cursor-pointer" onClick={() => navigate("/register")}>
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-32 min-h-[calc(100vh-65px)] flex items-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full">
          {/* Left - Copy */}
          <div className="flex-1 space-y-8">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              Your Campus Marketplace
            </h1>
            <p className="text-2xl text-muted-foreground leading-relaxed max-w-xl">
              The easiest way for students to buy and sell secondhand textbooks,
              electronics, furniture, and more — right on campus.
            </p>
            <div className="flex gap-3 pt-4">
              <Link to="/register" className={buttonVariants({ variant: "default", size: "lg" })}>
                Get started
              </Link>
              <Link to="/listings" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Browse listings
              </Link>
            </div>
          </div>

          {/* Right - Image */}
          <div className="flex-1 flex justify-center">
            <img
              src="/items.png"
              alt="Items for sale"
              className="w-full max-w-2xl"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
