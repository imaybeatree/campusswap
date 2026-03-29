import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { http, imageUrl } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/UserAvatar";
import Header from "@/components/Header";

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
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

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

  return (
    <div className="min-h-screen bg-background">
      <Header
        navItems={[
          { label: "My Listings", href: "/my-listings" },
          { label: "Messages", href: "/messages" },
          { label: "Edit Profile", href: "/profile/edit" },
        ]}
        actionButton={{ label: "Sell Item", href: "/listings/new" }}
      >
        <Input
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white focus:text-black focus:placeholder:text-muted-foreground"
        />
      </Header>

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
                  <div className="aspect-square bg-muted flex items-center justify-center relative">
                    {listing.image_url ? (
                      <img src={imageUrl(listing.image_url)!} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground text-4xl">📦</span>
                    )}
                    {listing.status === "reserved" && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                        Reserved
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{listing.title}</h3>
                    <p className="text-lg font-bold mt-1">${Number(listing.price).toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <UserAvatar
                          userId={listing.user_id}
                          name={listing.username}
                          className="h-5 w-5"
                          fallbackClassName="text-[10px] font-semibold"
                        />
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
