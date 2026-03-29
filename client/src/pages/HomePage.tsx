import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http, imageUrl } from "@/lib/http";
import { getToken, signOut } from "@/lib/token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logo from "@/assets/campusswap_logo.png";

function getUserFromToken(): { id: number; initial: string } | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!));
    const id = Number(payload.sub);
    return { id, initial: id.toString().charAt(0).toUpperCase() };
  } catch {
    return null;
  }
}

interface Listing {
  id: number;
  user_id: number;
  title: string;
  price: number;
  category: string;
  condition_type: string;
  status: string;
  image_url: string | null;
  username: string;
  created_at: string;
}

const categories = ["all", "textbooks", "electronics", "furniture", "clothing", "supplies", "tickets", "other"];

export default function HomePage() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => getUserFromToken());
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const avatarSrc = currentUser ? imageUrl(`/api/users/${currentUser.id}/avatar`) : null;

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "all") params.set("category", category);
    const url = search || category !== "all" ? `/api/listings/search?${params}` : "/api/listings";
    http()
      .get<Listing[]>(url)
      .then((res) => setListings(res.data))
      .catch(console.error);
  }, [search, category]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-black border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="CampusSwap" className="h-8 w-8" />
            <span className="text-xl text-white font-bold">CampusSwap</span>
          </Link>
          <Input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white focus:text-black focus:placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-3 shrink-0">
            <Button
              className="bg-white text-black cursor-pointer"
              onClick={() => navigate("/listings/new")}
            >
              Sell Item
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer outline-none">
                <Avatar className="h-9 w-9 border-2 border-white/30 hover:border-white transition">
                  {avatarSrc && <AvatarImage src={avatarSrc} />}
                  <AvatarFallback className="bg-white text-black font-semibold text-sm">
                    {currentUser?.initial ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/my-listings")}>
                  My Listings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/messages")}>
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile/edit")}>
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto py-6 justify-center">
          {categories.map((c) => (
            <Button
              key={c}
              variant={category === c ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap cursor-pointer"
              onClick={() => setCategory(c)}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Button>
          ))}
        </div>

        {/* Results */}
        {listings.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">No listings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12 place-items-center">
            {listings.map((listing) => (
              <Link key={listing.id} to={`/listings/${listing.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition border border-border">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {listing.image_url ? (
                      <img src={imageUrl(listing.image_url)!} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground text-4xl">📦</span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{listing.title}</h3>
                    <p className="text-lg font-bold mt-1">${Number(listing.price).toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={imageUrl(`/api/users/${listing.user_id}/avatar`)!} />
                          <AvatarFallback className="text-[10px] font-semibold">
                            {listing.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{listing.username}</span>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {listing.condition_type.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
