import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Submissions
  app.get(api.submissions.list.path, async (req, res) => {
    const data = await storage.getSubmissions();
    res.json(data);
  });

  app.post(api.submissions.create.path, async (req, res) => {
    try {
      const input = api.submissions.create.input.parse(req.body);
      const sub = await storage.createSubmission(input);
      res.status(201).json(sub);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.patch(api.submissions.update.path, async (req, res) => {
    try {
      const input = api.submissions.update.input.parse(req.body);
      const id = parseInt(req.params.id);
      const sub = await storage.updateSubmission(id, input);
      res.json(sub);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Not found" });
    }
  });

  // Auctions
  app.get(api.auctions.list.path, async (req, res) => {
    const data = await storage.getAuctions();
    res.json(data);
  });

  app.get(api.auctions.getActive.path, async (req, res) => {
    const active = await storage.getActiveAuction();
    res.json(active || null);
  });

  app.post(api.auctions.create.path, async (req, res) => {
    try {
      const bodySchema = api.auctions.create.input.extend({
        submissionId: z.coerce.number()
      });
      const input = bodySchema.parse({
        ...req.body,
        endTime: new Date(req.body.endTime)
      });
      const active = await storage.getActiveAuction();
      if (active) {
        return res.status(400).json({ message: "There is already an active auction." });
      }

      const auction = await storage.createAuction(input);
      res.status(201).json(auction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.auctions.close.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const auction = await storage.closeAuction(id);
      res.json(auction);
    } catch (err) {
      res.status(404).json({ message: "Not found" });
    }
  });

  // Bids
  app.get(api.bids.list.path, async (req, res) => {
    const auctionId = parseInt(req.params.auctionId);
    const data = await storage.getBids(auctionId);
    res.json(data);
  });

  app.post(api.bids.create.path, async (req, res) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const input = api.bids.create.input.parse(req.body);
      
      const auction = await storage.getAuction(auctionId);
      if (!auction || auction.status !== 'active') {
        return res.status(400).json({ message: "Auction is not active" });
      }
      
      await storage.updateAuction(auctionId, {
        highestBid: input.amount,
        highestBidder: input.bidderWallet
      });

      const bid = await storage.createBid({
        auctionId,
        ...input
      });
      
      res.status(201).json(bid);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Call seed database
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingSubs = await storage.getSubmissions();
  if (existingSubs.length === 0) {
    const sub1 = await storage.createSubmission({
      artistName: "SharkBoy",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      artworkUrl: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=800&q=80",
      description: "A deep dive into the oceanic cultural shifts.",
      reservePrice: "0.1"
    });
    const sub2 = await storage.createSubmission({
      artistName: "OceanArt",
      walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      artworkUrl: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=800&q=80",
      description: "Neon dreams on Base.",
      reservePrice: "0.2"
    });

    await storage.updateSubmission(sub1.id, { status: "approved" });
    
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);
    await storage.createAuction({
      submissionId: sub1.id,
      endTime,
    });
  }
}
