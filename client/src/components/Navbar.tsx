import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Droplet, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const { address, connect, isConnecting, isConnected } = useWallet();

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass-panel border-b-0 border-white/5"
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Droplet className="w-8 h-8 text-primary group-hover:fill-primary/20 transition-all duration-500" />
          <span className="font-display font-bold text-2xl tracking-widest text-glow">
            SHARKS.TRADE
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/auction" 
            className={`text-sm tracking-widest uppercase transition-colors hover:text-primary ${location === '/auction' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Live Auction
          </Link>
          <Link 
            href="/submit" 
            className={`text-sm tracking-widest uppercase transition-colors hover:text-primary ${location === '/submit' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Submit Art
          </Link>
          <Link 
            href="/admin" 
            className="text-sm tracking-widest uppercase text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-1"
            title="Admin Access"
          >
             <ShieldAlert className="w-3 h-3" />
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.15)]">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {truncateAddress(address!)}
            </div>
          ) : (
            <Button 
              onClick={connect} 
              disabled={isConnecting}
              className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground font-semibold tracking-wide uppercase transition-all duration-300 hover-glow"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
