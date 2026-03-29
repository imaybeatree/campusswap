import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http, imageUrl } from "@/lib/http";
import { getToken, signOut } from "@/lib/token";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export interface NavItem {
  label: string;
  href: string;
}

interface HeaderProps {
  navItems?: NavItem[];
  actionButton?: { label: string; href: string };
  children?: React.ReactNode;
  onUnreadCount?: (setter: (updater: (prev: number) => number) => void) => void;
}

export default function Header({ navItems = [], actionButton, children, onUnreadCount }: HeaderProps) {
  const navigate = useNavigate();
  const [currentUser] = useState(() => getUserFromToken());
  const [unreadCount, setUnreadCount] = useState(0);
  const avatarSrc = currentUser ? imageUrl(`/api/users/${currentUser.id}/avatar`) : null;

  useEffect(() => {
    http()
      .get<{ count: number }>("/api/messages/unread-count")
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    onUnreadCount?.(setUnreadCount);
  }, [onUnreadCount]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-black border-border px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="CampusSwap" className="h-8 w-8" />
          <span className="text-xl text-white font-bold">CampusSwap</span>
        </Link>

        {children}

        <div className="flex items-center gap-3 shrink-0">
          {actionButton && (
            <Button
              className="bg-white text-black cursor-pointer"
              onClick={() => navigate(actionButton.href)}
            >
              {actionButton.label}
            </Button>
          )}

          {navItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer outline-none">
                <div className="relative">
                  <Avatar className="h-9 w-9 border-2 border-white/30 hover:border-white transition">
                    {avatarSrc && <AvatarImage src={avatarSrc} />}
                    <AvatarFallback className="bg-white text-black font-semibold text-sm">
                      {currentUser?.initial ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -bottom-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1 ring-2 ring-black">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navItems.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    className="cursor-pointer"
                    onClick={() => navigate(item.href)}
                  >
                    {item.href === "/messages" ? (
                      <span className="flex items-center justify-between w-full">
                        {item.label}
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </span>
                    ) : (
                      item.label
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
