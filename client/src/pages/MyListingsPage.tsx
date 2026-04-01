import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http, imageUrl } from "@/lib/http";
import { getToken } from "@/lib/token";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const active = listings.filter((l) => l.status === "active");
  const reserved = listings.filter((l) => l.status === "reserved");
  const sold = listings.filter((l) => l.status === "sold");

  const setStatus = async (listing: Listing, newStatus: string) => {
    try {
      await http().put(`/api/listings/${listing.id}`, { ...listing, status: newStatus });
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteListing = async (listing: Listing) => {
    try {
      await http().delete(`/api/listings/${listing.id}`);
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        navItems={[
          { label: "Browse Listings", href: "/home" },
          { label: "Messages", href: "/messages" },
          { label: "Edit Profile", href: "/profile/edit" },
        ]}
        actionButton={{ label: "Browse Listings", href: "/home" }}
      />

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
                    <ListingCard key={listing.id} listing={listing} onSetStatus={setStatus} onDelete={deleteListing} />
                  ))}
                </div>
              </section>
            )}

            {/* Reserved */}
            {reserved.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-semibold mb-4">Reserved ({reserved.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {reserved.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} onSetStatus={setStatus} onDelete={deleteListing} />
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
                    <ListingCard key={listing.id} listing={listing} onSetStatus={setStatus} onDelete={deleteListing} />
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

const statusActions: Record<string, { label: string; status: string; style: string }[]> = {
  active: [
    { label: "Mark Reserved", status: "reserved", style: "text-yellow-600 hover:bg-yellow-50 border border-yellow-200" },
    { label: "Mark Sold", status: "sold", style: "text-red-600 hover:bg-red-50 border border-red-200" },
  ],
  reserved: [
    { label: "Mark Active", status: "active", style: "text-green-600 hover:bg-green-50 border border-green-200" },
    { label: "Mark Sold", status: "sold", style: "text-red-600 hover:bg-red-50 border border-red-200" },
  ],
  sold: [
    { label: "Relist", status: "active", style: "text-green-600 hover:bg-green-50 border border-green-200" },
  ],
};

interface ListingCardProps {
  listing: Listing;
  onSetStatus?: (listing: Listing, status: string) => void;
  onDelete?: (listing: Listing) => void;
}

function ListingCard({ listing, onSetStatus, onDelete }: ListingCardProps) {
  const navigate = useNavigate();
  const actions = onSetStatus ? (statusActions[listing.status] ?? []) : [];

  return (
    <Card className="overflow-hidden hover:shadow-md transition border border-border w-64">
      <Link to={`/listings/${listing.id}`}>
        <div className="w-64 h-64 bg-muted flex items-center justify-center">
          {listing.image_url ? (
            <img src={imageUrl(listing.image_url)!} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-muted-foreground text-4xl">📦</span>
          )}
        </div>
        <CardContent className="p-4 pb-2">
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
      </Link>
      <div className="px-4 pb-3 flex flex-col gap-2">
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action) => (
              <button
                key={action.status}
                onClick={() => onSetStatus!(listing, action.status)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md cursor-pointer transition ${action.style}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/listings/${listing.id}/edit`)}
            className="flex-1 text-xs font-medium py-1.5 rounded-md cursor-pointer transition text-blue-600 hover:bg-blue-50 border border-blue-200"
          >
            Edit
          </button>
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger className="flex-1 text-xs font-medium py-1.5 rounded-md cursor-pointer transition text-red-600 hover:bg-red-50 border border-red-200">
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{listing.title}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => onDelete(listing)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </Card>
  );
}
