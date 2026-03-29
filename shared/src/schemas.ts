import { z } from "zod";

// ── Enums ──

export const Category = z.enum([
  "textbooks",
  "electronics",
  "furniture",
  "clothing",
  "supplies",
  "tickets",
  "other",
]);

export const Condition = z.enum(["new", "like_new", "good", "fair", "poor"]);

export const ListingStatus = z.enum(["active", "reserved", "sold"]);

// ── Users ──

export const UserSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  username: z.string().min(1).max(100),
  password_hash: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1).max(100),
  password: z.string().min(6),
});

export const UpdateUserSchema = z.object({
  username: z.string().min(1).max(100).optional(),
});

export const UserProfileSchema = UserSchema.omit({ password_hash: true });

// ── Listings ──

export const ListingSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  price: z.number().nonnegative(),
  category: Category,
  condition_type: Condition,
  status: ListingStatus,
  image_url: z.string().url().max(500).nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const CreateListingSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  category: Category,
  condition_type: Condition,
  image_url: z.string().url().max(500).optional(),
});

export const UpdateListingSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  category: Category.optional(),
  condition_type: Condition.optional(),
  status: ListingStatus.optional(),
  image_url: z.string().url().max(500).optional(),
});

export const ListingSearchParams = z.object({
  q: z.string().optional(),
  category: Category.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

export const ListingWithSeller = ListingSchema.extend({
  username: z.string(),
});

// ── Favorites ──

export const FavoriteSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  listing_id: z.number().int(),
  created_at: z.coerce.date(),
});

export const CreateFavoriteSchema = z.object({
  listing_id: z.number().int(),
});

// ── Messages ──

export const MessageSchema = z.object({
  id: z.number().int(),
  sender_id: z.number().int(),
  receiver_id: z.number().int(),
  listing_id: z.number().int(),
  content: z.string().min(1),
  is_read: z.boolean(),
  created_at: z.coerce.date(),
});

export const CreateMessageSchema = z.object({
  receiver_id: z.number().int(),
  listing_id: z.number().int(),
  content: z.string().min(1),
});

export const MessageWithDetails = MessageSchema.extend({
  sender_name: z.string(),
  listing_title: z.string(),
});

// ── Inferred types ──

export type Category = z.infer<typeof Category>;
export type Condition = z.infer<typeof Condition>;
export type ListingStatus = z.infer<typeof ListingStatus>;

export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export type Listing = z.infer<typeof ListingSchema>;
export type CreateListing = z.infer<typeof CreateListingSchema>;
export type UpdateListing = z.infer<typeof UpdateListingSchema>;
export type ListingSearchParams = z.infer<typeof ListingSearchParams>;
export type ListingWithSeller = z.infer<typeof ListingWithSeller>;

export type Favorite = z.infer<typeof FavoriteSchema>;
export type CreateFavorite = z.infer<typeof CreateFavoriteSchema>;

export type Message = z.infer<typeof MessageSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type MessageWithDetails = z.infer<typeof MessageWithDetails>;
