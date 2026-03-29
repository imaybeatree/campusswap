import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http, imageUrl } from "@/lib/http";
import { getToken, signOut } from "@/lib/token";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logo from "@/assets/campusswap_logo.png";

interface Listing {
  id: number;
  title: string;
  price: number;
  category: string;
  condition_type: string;
  status: string;
  image_url: string | null;
  created_at: string;
}

function getUserIdFromToken(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!));
    return Number(payload.sub);
  } catch {
    return null;
  }
}

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [userId] = useState(() => getUserIdFromToken());

  useEffect(() => {
    if (!userId) return;
    http()
      .get<Listing[]>(`/api/users/${userId}/listings`)
      .then((res) => setListings(res.data))
      .catch(console.error);
  }, [userId]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const active = listings.filter((l) => l.status === "active");
  const sold = listings.filter((l) => l.status === "sold");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-black border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <img src={logo} alt="CampusSwap" className="h-8 w-8" />
            <span className="text-xl text-white font-bold">CampusSwap</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              className="bg-white text-black cursor-pointer"
              onClick={() => navigate("/home")}
            >
              Browse Listings
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer outline-none">
                <Avatar className="h-9 w-9 border-2 border-white/30 hover:border-white transition">
                  {userId && <AvatarImage src={imageUrl(`/api/users/${userId}/avatar`)!} />}
                  <AvatarFallback className="bg-white text-black font-semibold text-sm">
                    {userId?.toString().charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/home")}>
                  Browse Listings
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

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Listings</h1>
          <Button className="cursor-pointer" onClick={() => navigate("/listings/new")}>
            + New listing
          </Button>
        </div>

        {listings.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground mb-3">You haven't listed anything yet</p>
            <Button className="cursor-pointer" onClick={() => navigate("/listings/new")}>
              Post your first item
            </Button>
          </div>
        ) : (
          <>
            {/* Active */}
            {active.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-semibold mb-4">Active ({active.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {active.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            )}

            {/* Sold */}
            {sold.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Sold ({sold.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sold.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link to={`/listings/${listing.id}`}>
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
            <Badge
              variant={listing.status === "active" ? "default" : "secondary"}
              className="capitalize"
            >
              {listing.status}
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">
              {listing.condition_type.replace("_", " ")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
