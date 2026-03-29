import { imageUrl } from "@/lib/http";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  userId: number | string;
  name?: string;
  className?: string;
  fallbackClassName?: string;
}

export default function UserAvatar({ userId, name, className, fallbackClassName }: UserAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl(`/api/users/${userId}/avatar`)!} />
      <AvatarFallback className={fallbackClassName}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
