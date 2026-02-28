import { db } from "./db";
import {
  submissions, auctions, bids,
  type Submission, type InsertSubmission, type UpdateSubmissionRequest,
  type Auction, type InsertAuction, type UpdateAuctionRequest,
  type Bid, type InsertBid
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Submissions
  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: number, updates: UpdateSubmissionRequest): Promise<Submission>;
  
  // Auctions
  getAuctions(): Promise<Auction[]>;
  getAuction(id: number): Promise<Auction | undefined>;
  getActiveAuction(): Promise<Auction | undefined>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  closeAuction(id: number): Promise<Auction>;
  updateAuction(id: number, updates: UpdateAuctionRequest): Promise<Auction>;

  // Bids
  getBids(auctionId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
}

export class DatabaseStorage implements IStorage {
  async getSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions).orderBy(desc(submissions.createdAt));
  }
  async getSubmission(id: number): Promise<Submission | undefined> {
    const [sub] = await db.select().from(submissions).where(eq(submissions.id, id));
    return sub;
  }
  async createSubmission(sub: InsertSubmission): Promise<Submission> {
    const [created] = await db.insert(submissions).values(sub).returning();
    return created;
  }
  async updateSubmission(id: number, updates: UpdateSubmissionRequest): Promise<Submission> {
    const [updated] = await db.update(submissions).set(updates).where(eq(submissions.id, id)).returning();
    return updated;
  }

  async getAuctions(): Promise<Auction[]> {
    return await db.select().from(auctions).orderBy(desc(auctions.createdAt));
  }
  async getAuction(id: number): Promise<Auction | undefined> {
    const [auc] = await db.select().from(auctions).where(eq(auctions.id, id));
    return auc;
  }
  async getActiveAuction(): Promise<Auction | undefined> {
    const [active] = await db.select().from(auctions).where(eq(auctions.status, 'active')).orderBy(desc(auctions.createdAt)).limit(1);
    return active;
  }
  async createAuction(auc: InsertAuction): Promise<Auction> {
    const [created] = await db.insert(auctions).values(auc).returning();
    return created;
  }
  async closeAuction(id: number): Promise<Auction> {
    const [updated] = await db.update(auctions).set({ status: 'closed' }).where(eq(auctions.id, id)).returning();
    return updated;
  }
  async updateAuction(id: number, updates: UpdateAuctionRequest): Promise<Auction> {
    const [updated] = await db.update(auctions).set(updates).where(eq(auctions.id, id)).returning();
    return updated;
  }

  async getBids(auctionId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.auctionId, auctionId)).orderBy(desc(bids.createdAt));
  }
  async createBid(bid: InsertBid): Promise<Bid> {
    const [created] = await db.insert(bids).values(bid).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
