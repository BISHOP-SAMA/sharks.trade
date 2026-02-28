import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  artistName: text("artist_name").notNull(),
  walletAddress: text("wallet_address").notNull(),
  artworkUrl: text("artwork_url").notNull(),
  description: text("description").notNull(),
  reservePrice: text("reserve_price").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull(),
  endTime: timestamp("end_time").notNull(),
  highestBid: text("highest_bid").notNull().default("0"),
  highestBidder: text("highest_bidder"),
  status: text("status").notNull().default("active"), // active, closed
  createdAt: timestamp("created_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id").notNull(),
  bidderWallet: text("bidder_wallet").notNull(),
  amount: text("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, createdAt: true, status: true });
export const insertAuctionSchema = createInsertSchema(auctions).omit({ id: true, createdAt: true, highestBid: true, highestBidder: true, status: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = z.infer<typeof insertAuctionSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type UpdateSubmissionRequest = Partial<InsertSubmission> & { status?: string };
export type UpdateAuctionRequest = Partial<InsertAuction> & { highestBid?: string; highestBidder?: string; status?: string };
