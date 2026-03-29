import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { http, imageUrl } from "@/lib/http";
import { getToken } from "@/lib/token";
import UserAvatar from "@/components/UserAvatar";

interface ListingDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition_type: string;
  status: string;
  image_url: string | null;
  username: string;
  user_id: number;
  created_at: string;
}

function getCurrentUserId(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!));
    return Number(payload.sub);
  } catch {
    return null;
  }
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    http()
      .get<ListingDetail>(`/api/listings/${id}`)
      .then((res) => setListing(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold mb-2">Listing not found</h1>
        <p className="text-muted-foreground mb-6">This listing may have been removed or doesn't exist.</p>
        <Link to="/home" className="text-sm font-medium hover:underline">
          &larr; Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/home" className="text-black font-semibold">&larr; Back to listings</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
            {listing.image_url ? (
              <img src={imageUrl(listing.image_url)!} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-6xl">📦</span>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="px-2 py-1 bg-indigo-100 text-black rounded-full capitalize">{listing.category}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">{listing.condition_type.replace("_", " ")}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            <p className="text-3xl font-bold text-black mt-2">${Number(listing.price).toFixed(2)}</p>

            <Link to={`/profile/${listing.user_id}`} className="mt-6 flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
              <UserAvatar
                userId={listing.user_id}
                name={listing.username}
                className="h-10 w-10"
                fallbackClassName="bg-indigo-100 text-indigo-600 font-bold"
              />
              <div>
                <p className="font-semibold text-gray-900">{listing.username}</p>
              </div>
            </Link>

            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description || "No description provided."}</p>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Listed {new Date(listing.created_at).toLocaleDateString()}
            </div>

            {/* Contact Seller */}
            {currentUserId && currentUserId !== listing.user_id && (
              <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Message Seller</h3>
                {sent ? (
                  <div className="text-center py-4">
                    <p className="text-green-600 font-medium mb-2">Message sent!</p>
                    <button
                      onClick={() => navigate(`/messages/${listing.id}/${listing.user_id}`)}
                      className="text-sm text-indigo-600 hover:underline cursor-pointer"
                    >
                      View conversation
                    </button>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi, is this still available?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                      rows={3}
                    />
                    <button
                      disabled={sending || !message.trim()}
                      onClick={async () => {
                        setSending(true);
                        try {
                          await http().post("/api/messages", {
                            receiver_id: listing.user_id,
                            listing_id: listing.id,
                            content: message.trim(),
                          });
                          setSent(true);
                          setMessage("");
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setSending(false);
                        }
                      }}
                      className="mt-3 w-full py-2 bg-black text-white font-semibold cursor-pointer rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? "Sending..." : "Send Message"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
