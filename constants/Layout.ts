import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// =============================================
// BREAKPOINTS - Mobile First
// =============================================
const BREAKPOINTS = {
  mobile: 0,      // 0 - 767px
  tablet: 768,    // 768 - 1023px  
  desktop: 1024,  // 1024 - 1439px
  wide: 1440,     // 1440px+
};

// Device detection
const isMobile = width < BREAKPOINTS.tablet;
const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
const isDesktop = width >= BREAKPOINTS.desktop;
const isWide = width >= BREAKPOINTS.wide;

// Legacy support
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;

// =============================================
// SCALING FUNCTIONS - Con límites para desktop
// =============================================
const baseWidth = 375;

// Escala básica con límite máximo
const normalize = (size: number, maxScale = 1.5): number => {
  const scale = Math.min(width / baseWidth, maxScale);
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Escala moderada - crece más lento, ideal para UI
const moderateScale = (size: number, factor = 0.3): number => {
  // En desktop, usar factor más bajo para evitar elementos gigantes
  const adjustedFactor = isDesktop ? Math.min(factor, 0.15) : factor;
  const scale = width / baseWidth;
  const limitedScale = Math.min(scale, isDesktop ? 1.3 : 2);
  return Math.round(size + (size * (limitedScale - 1) * adjustedFactor));
};

// Escala para contenedores - con máximos absolutos
const containerScale = (size: number, maxSize?: number): number => {
  const scaled = moderateScale(size, 0.2);
  return maxSize ? Math.min(scaled, maxSize) : scaled;
};


// =============================================
// LAYOUT VALUES
// =============================================

// Ancho máximo del contenido principal
const getMaxContentWidth = (): number => {
  if (isWide) return 1200;
  if (isDesktop) return 900;
  if (isTablet) return 700;
  return width;
};

// Padding horizontal según dispositivo
const getHorizontalPadding = (): number => {
  if (isDesktop) return 24;
  if (isTablet) return 20;
  return 16;
};

export default {
  window: { width, height },
  breakpoints: BREAKPOINTS,
  
  // Device detection
  isMobile,
  isTablet,
  isDesktop,
  isWide,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  
  // Funciones de escala
  normalize,
  moderateScale,
  containerScale,
  
  // Ancho máximo de contenido
  maxContentWidth: getMaxContentWidth(),
  
  // =============================================
  // SPACING - Valores fijos, no escalados en desktop
  // =============================================
  spacing: {
    xs: isDesktop ? 4 : moderateScale(4),
    sm: isDesktop ? 8 : moderateScale(8),
    md: isDesktop ? 16 : moderateScale(16),
    lg: isDesktop ? 24 : moderateScale(24),
    xl: isDesktop ? 32 : moderateScale(32),
    xxl: isDesktop ? 48 : moderateScale(48),
    xxxl: isDesktop ? 64 : moderateScale(64),
  },
  
  // =============================================
  // BORDER RADIUS - Consistente en todas las plataformas
  // =============================================
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
  },
  
  // =============================================
  // TYPOGRAPHY - Tamaños optimizados por plataforma
  // =============================================
  typography: {
    header: {
      fontFamily: 'MajorMono',
      h1: isDesktop ? 28 : isTablet ? 26 : moderateScale(24, 0.2),
      h2: isDesktop ? 24 : isTablet ? 22 : moderateScale(20, 0.2),
      h3: isDesktop ? 20 : isTablet ? 18 : moderateScale(18, 0.2),
      h4: isDesktop ? 16 : isTablet ? 15 : moderateScale(16, 0.2),
    },
    body: {
      fontFamily: 'SpaceMono',
      large: isDesktop ? 16 : isTablet ? 15 : 14,
      medium: isDesktop ? 14 : isTablet ? 14 : 13,
      small: isDesktop ? 13 : isTablet ? 13 : 12,
      tiny: isDesktop ? 11 : isTablet ? 11 : 10,
    },
  },
  
  // Animation timing
  animation: {
    fast: 150,
    medium: 250,
    slow: 400,
  },

  
  // =============================================
  // STATUS CARD - Tamaños por plataforma
  // =============================================
  statusCard: {
    minHeight: isDesktop ? 140 : isTablet ? 160 : isMobile ? 150 : 140,
    width: isDesktop 
      ? Math.min(500, width * 0.4)
      : isTablet 
        ? Math.min(450, width * 0.6)
        : width - 32,
    margin: isDesktop ? 12 : 10,
    padding: isDesktop ? 16 : 12,
  },
  
  // =============================================
  // MUSIC PLAYER
  // =============================================
  musicPlayer: {
    miniHeight: isDesktop ? 56 : 60,
    fullHeight: isDesktop ? Math.min(height * 0.7, 600) : height * 0.85,
    albumArtSize: isDesktop ? 220 : isTablet ? 200 : Math.min(width * 0.55, 200),
  },
  
  // =============================================
  // PROFILE
  // =============================================
  profile: {
    avatarSize: isDesktop ? 90 : isTablet ? 85 : 80,
    headerHeight: isDesktop ? 200 : isTablet ? 190 : 180,
  },
  
  // =============================================
  // GRID SYSTEM
  // =============================================
  grid: {
    columns: isDesktop ? 4 : isTablet ? 3 : 2,
    gap: isDesktop ? 16 : 12,
  },
  
  // =============================================
  // CARDS - Tamaños optimizados
  // =============================================
  cards: {
    user: {
      width: isDesktop ? 140 : isTablet ? 130 : 120,
      height: isDesktop ? 170 : isTablet ? 160 : 150,
    },
    playlist: {
      width: isDesktop 
        ? 180
        : isTablet 
          ? 160
          : (width - 48) / 2,
      height: isDesktop ? 90 : isTablet ? 85 : 80,
    },
    album: {
      width: isDesktop ? 160 : isTablet ? 150 : 140,
      height: isDesktop ? 200 : isTablet ? 190 : 180,
    },
    community: {
      height: isDesktop ? 100 : isTablet ? 95 : 90,
    },
  },
  
  // =============================================
  // TAB BAR
  // =============================================
  tabBar: {
    height: isDesktop ? 52 : 56,
    iconSize: isDesktop ? 22 : 24,
  },
  
  // =============================================
  // CONTENT PADDING
  // =============================================
  contentPadding: {
    horizontal: getHorizontalPadding(),
    vertical: isDesktop ? 16 : 14,
  },
  
  // =============================================
  // FEED LAYOUT - Para la vista principal
  // =============================================
  feed: {
    maxWidth: isDesktop ? 550 : isTablet ? 500 : width,
    sidebarWidth: isDesktop ? 280 : 0,
    gap: isDesktop ? 20 : 16,
  },
  
  // =============================================
  // ICONS - Tamaños consistentes
  // =============================================
  icons: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
  },
};
