# ZKBridge Frontend

A modern, mobile-first React application for the Bitcoin-Ethereum trustless bridge with glassmorphism UI and crypto-native aesthetics.

## 🎨 Design System

### Glassmorphism UI
- **Glass cards**: Semi-transparent backgrounds with backdrop blur
- **Crypto glows**: Dynamic box shadows for Bitcoin/Ethereum themes
- **Smooth animations**: Framer Motion for micro-interactions
- **Responsive design**: Mobile-first approach with Tailwind CSS

### Theme System
- **Dark/Light mode**: Automatic system preference detection
- **Crypto colors**: Bitcoin orange (#F7931A) and Ethereum blue (#627EEA)
- **Gradient effects**: Dynamic gradients for visual appeal
- **Status indicators**: Color-coded transaction states

## 🚀 Features

### Core Components
1. **Landing Page**: Educational content about trustless bridging
2. **Wallet Connection**: MetaMask integration with RainbowKit
3. **Bitcoin Address Verification**: Real-time address validation
4. **Bridge Interface**: Interactive asset transfer form
5. **ZK Proof Visualizer**: Educational component with animations
6. **Transaction History**: Comprehensive transaction tracking
7. **Status Dashboard**: Real-time bridge status monitoring

### Technical Features
- **TypeScript**: Strict mode with comprehensive type safety
- **React Query**: Efficient data fetching and caching
- **Form Validation**: React Hook Form with Zod schemas
- **Progressive Web App**: Offline capabilities and app-like experience
- **Mobile Optimized**: Touch-friendly interactions
- **Error Boundaries**: Graceful error handling

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Web3**: Wagmi + RainbowKit for wallet integration
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **PWA**: Service Worker + Web App Manifest

## 📱 Mobile-First Design

### Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Touch Interactions
- **Swipe gestures**: Navigation and interactions
- **Touch targets**: Minimum 44px for accessibility
- **Haptic feedback**: Native device vibrations
- **Pull-to-refresh**: Mobile-native patterns

### Performance
- **Lazy loading**: Component and image optimization
- **Code splitting**: Route-based splitting
- **Service worker**: Offline caching
- **Image optimization**: Next.js Image component

## 🎭 Animation System

### Micro-interactions
- **Hover effects**: Scale and glow animations
- **Loading states**: Skeleton screens and spinners
- **Transitions**: Smooth state changes
- **Page transitions**: Route-based animations

### Framer Motion
- **Stagger animations**: Sequential element animations
- **Gesture support**: Drag and swipe interactions
- **Layout animations**: Automatic layout transitions
- **Scroll-triggered**: Intersection Observer animations

## 🔐 Security Features

### Wallet Security
- **MetaMask integration**: Secure wallet connection
- **Address validation**: Real-time format checking
- **Transaction signing**: Client-side signing only
- **Private key protection**: Never exposed to frontend

### Input Validation
- **Bitcoin addresses**: P2PKH, P2SH, Bech32 validation
- **Ethereum addresses**: Checksum validation
- **Amount validation**: Numeric and range checking
- **Form sanitization**: XSS protection

## 📊 State Management

### React Query
- **Server state**: API data caching and synchronization
- **Optimistic updates**: Immediate UI feedback
- **Background refetching**: Automatic data updates
- **Error handling**: Retry logic and fallbacks

### Local State
- **React hooks**: useState, useEffect, useContext
- **Form state**: React Hook Form management
- **UI state**: Component-level state
- **Theme state**: Next-themes provider

## 🌐 API Integration

### Endpoints
- **Bridge API**: Transaction management
- **Bitcoin API**: Transaction verification
- **Ethereum API**: Smart contract interaction
- **ZK API**: Proof generation and verification

### Error Handling
- **Network errors**: Retry with exponential backoff
- **Validation errors**: Form field highlighting
- **User feedback**: Toast notifications
- **Fallback UI**: Graceful degradation

## 🎨 Custom Components

### Glassmorphism Cards
```tsx
<div className="glass-card border border-white/20">
  {/* Content */}
</div>
```

### Crypto Glow Effects
```tsx
<div className="bitcoin-glow">
  {/* Bitcoin-themed content */}
</div>
```

### Interactive Elements
```tsx
<button className="interactive hover:scale-105">
  {/* Button content */}
</button>
```

## 📱 PWA Features

### Manifest
- **App metadata**: Name, description, icons
- **Display mode**: Standalone app experience
- **Theme colors**: Dynamic theme adaptation
- **Shortcuts**: Quick action buttons

### Service Worker
- **Caching strategy**: Cache-first for static assets
- **Offline support**: Basic offline functionality
- **Update notifications**: New version alerts
- **Background sync**: Queue actions when online

### Installation
- **Add to home screen**: Native app-like experience
- **Splash screen**: Custom loading screen
- **App shortcuts**: Quick access to features
- **Full screen**: Immersive experience

## 🔧 Development

### Getting Started
```bash
npm install
npm run dev
```

### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint checking
- `npm run type-check` - TypeScript validation

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 📈 Performance Optimization

### Bundle Analysis
- **Code splitting**: Route and component level
- **Tree shaking**: Remove unused code
- **Compression**: Gzip and Brotli
- **Caching**: Aggressive caching strategies

### Core Web Vitals
- **LCP**: Large Contentful Paint optimization
- **FID**: First Input Delay minimization
- **CLS**: Cumulative Layout Shift prevention
- **TTI**: Time to Interactive optimization

## 🧪 Testing

### Testing Strategy
- **Unit tests**: Component testing with Jest
- **Integration tests**: API integration testing
- **E2E tests**: Full user journey testing
- **Visual regression**: UI consistency testing

### Accessibility
- **WCAG 2.1 AA**: Compliance with standards
- **Screen readers**: ARIA labels and roles
- **Keyboard navigation**: Full keyboard support
- **Color contrast**: Sufficient contrast ratios

## 🚀 Deployment

### Build Optimization
- **Static generation**: Pre-rendered pages
- **Image optimization**: Next.js Image component
- **Font optimization**: Self-hosted fonts
- **CSS optimization**: Purged unused styles

### Hosting
- **Vercel**: Recommended hosting platform
- **CDN**: Global content delivery
- **SSL**: Automatic HTTPS
- **Analytics**: Built-in performance monitoring

## 📚 Documentation

### Component Documentation
- **Storybook**: Interactive component library
- **Props documentation**: TypeScript interfaces
- **Usage examples**: Code snippets
- **Design guidelines**: Visual specifications

### API Documentation
- **OpenAPI specs**: Swagger documentation
- **Type definitions**: TypeScript types
- **Error codes**: Comprehensive error reference
- **Rate limits**: API usage guidelines

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Conventional commits**: Standardized commit messages

## 📄 License

MIT License - see LICENSE file for details.

