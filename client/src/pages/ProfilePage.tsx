import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { http, imageUrl } from "@/lib/http";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

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

export default function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    http().get<User>(`/api/users/${id}`).then((res) => setUser(res.data)).catch(console.error);
    http().get<Listing[]>(`/api/users/${id}/listings`).then((res) => setListings(res.data)).catch(console.error);
  }, [id]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">&larr; Back to listings</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={imageUrl(`/api/users/${id}/avatar`)!} />
            <AvatarFallback className="bg-indigo-100 text-3xl font-bold text-indigo-600">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
            <p className="mt-1 text-sm text-gray-400">Joined {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* User Listings */}
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <p className="text-gray-500">No listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Link key={listing.id} to={`/listings/${listing.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  {listing.image_url ? (
                    <img src={imageUrl(listing.image_url)!} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-4xl">📦</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                  <p className="text-lg font-bold text-indigo-600 mt-1">${Number(listing.price).toFixed(2)}</p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${listing.status === "active" ? "bg-green-100 text-green-700" : listing.status === "sold" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
