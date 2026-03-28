import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:3001/api";

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

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get<ListingDetail>(`${API}/listings/${id}`).then((res) => setListing(res.data)).catch(console.error);
  }, [id]);

  if (!listing) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">&larr; Back to listings</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
            {listing.image_url ? (
              <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-6xl">📦</span>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full capitalize">{listing.category}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">{listing.condition_type.replace("_", " ")}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            <p className="text-3xl font-bold text-indigo-600 mt-2">${listing.price.toFixed(2)}</p>

            <div className="mt-6 flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {listing.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{listing.username}</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description || "No description provided."}</p>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Listed {new Date(listing.created_at).toLocaleDateString()}
            </div>

            {/* Contact Seller */}
            <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Message Seller</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, is this still available?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                rows={3}
              />
              <button className="mt-3 w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
