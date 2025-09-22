import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { BridgeInterface } from '@/components/bridge-interface';
import { ZKProofVisualizer } from '@/components/zk-proof-visualizer';
import { TransactionHistory } from '@/components/transaction-history';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <BridgeInterface />
        <ZKProofVisualizer />
        <TransactionHistory />
      </main>
      <Footer />
    </div>
  );
}
