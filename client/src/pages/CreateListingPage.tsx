import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { http } from "@/lib/http";
import { getToken } from "@/lib/token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const categories = ["textbooks", "electronics", "furniture", "clothing", "supplies", "tickets", "other"] as const;
const conditions = ["new", "like_new", "good", "fair", "poor"] as const;

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "other" as string,
    condition_type: "good" as string,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.price) {
      setError("Title and price are required.");
      return;
    }
    if (!imageFile) {
      setError("An image is required.");
      return;
    }

    setUploading(true);
    try {
      // Create listing first
      const res = await http().post<{ id: number }>("/api/listings", {
        ...form,
        price: parseFloat(form.price),
        user_id: Number(JSON.parse(atob(getToken()!.split(".")[1]!)).sub),
        image_url: null,
      });

      // Upload image to the listing if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("listing_id", res.data.id.toString());
        await http().post("/api/upload", formData);
      }

      navigate(`/listings/${res.data.id}`);
    } catch {
      setError("Failed to create listing. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/home" className="text-sm font-medium hover:underline">&larr; Back</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Sell an Item</h1>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Photo *</label>
            <Card
              className="border-dashed border-2 border-border rounded-xl overflow-hidden cursor-pointer hover:border-foreground/40 transition"
              onClick={() => document.getElementById("image-input")?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full aspect-video object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 21A4.75 4.75 0 012 16.25V7.75A4.75 4.75 0 016.75 3h10.5A4.75 4.75 0 0122 7.75v8.5A4.75 4.75 0 0117.25 21H6.75z" />
                  </svg>
                  <p className="text-sm">Click to upload an image</p>
                  <p className="text-xs mt-1">JPG, PNG, WebP or GIF (max 5MB)</p>
                </div>
              )}
            </Card>
            <input
              id="image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="mt-2 text-sm text-muted-foreground hover:underline"
              >
                Remove image
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Calculus Textbook, 8th Edition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe your item, include any details buyers should know..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
            />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($) *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full h-8 px-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium mb-2">Condition</label>
            <div className="flex gap-2 flex-wrap">
              {conditions.map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={form.condition_type === c ? "default" : "outline"}
                  size="sm"
                  className="rounded-full capitalize cursor-pointer"
                  onClick={() => update("condition_type", c)}
                >
                  {c.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={uploading}
          >
            {uploading ? "Posting..." : "Post Listing"}
          </Button>
        </form>
      </div>
    </div>
  );
}
