
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { config, chains } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

export function WalletProvider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiConfig config={config}>
            <RainbowKitProvider
                chains={chains}
                theme={{
                    lightMode: lightTheme({
                        accentColor: '#6366f1',
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                        fontStack: 'system',
                        overlayBlur: 'small',
                    }),
                    darkMode: darkTheme({
                        accentColor: '#6366f1',
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                        fontStack: 'system',
                        overlayBlur: 'small',
                    }),
                }}
                appInfo={{
                    appName: 'BridgeSpark',
                    learnMoreUrl: 'https://docs.bridgespark.app',
                }}
                showRecentTransactions={true}
                modalSize="compact"
            >
                {children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
