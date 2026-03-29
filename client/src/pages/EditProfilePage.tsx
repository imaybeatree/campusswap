import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { http, imageUrl } from "@/lib/http";
import { getToken, signOut } from "@/lib/token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";

interface User {
  id: number;
  username: string;
  email: string;
  has_avatar: number;
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

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [userId] = useState(() => getUserIdFromToken());
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    http()
      .get<User>(`/api/users/${userId}`)
      .then((res) => {
        setUser(res.data);
        setUsername(res.data.username);
        if (res.data.has_avatar) {
          setAvatarPreview(imageUrl(`/api/users/${res.data.id}/avatar`));
        }
      })
      .catch(console.error);
  }, [userId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await http().put(`/api/users/${userId}`, { username: username.trim() });

      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);
        formData.append("user_id", userId!.toString());
        await http().post("/api/upload/avatar", formData);
      }

      setSuccess("Profile updated.");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 409) {
        setError("Username is already taken.");
      } else {
        setError("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        navItems={[
          { label: "Browse Listings", href: "/home" },
          { label: "My Listings", href: "/my-listings" },
          { label: "Messages", href: "/messages" },
        ]}
      />

      <div className="max-w-lg mx-auto px-6 py-10">
        <Link to="/home" className="text-sm font-medium hover:underline">&larr; Back</Link>

        <h1 className="text-2xl font-bold mt-6 mb-8">Edit Profile</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="relative cursor-pointer group"
            onClick={() => document.getElementById("avatar-input")?.click()}
          >
            <Avatar className="h-20 w-20">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt={user.username} />
              ) : null}
              <AvatarFallback className="bg-black text-white text-2xl font-bold">
                {username.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <input
            id="avatar-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <div>
            <p className="font-semibold text-lg">{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <button
              type="button"
              onClick={() => document.getElementById("avatar-input")?.click()}
              className="text-sm text-primary hover:underline mt-1 cursor-pointer"
            >
              Change photo
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" value={user.email} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Member since</label>
            <p className="text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="cursor-pointer" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => navigate("/home")}
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="border-t border-border mt-10 pt-6">
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
