import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AtSign,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Coffee,
  Rocket,
  Calendar,
  Crown,
  X,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import NeonText from '@/components/ui/NeonText';
import GlassCard from '@/components/ui/GlassCard';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import Toast from '@/components/ui/Toast';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';

const moloCorpLogo = require('@/assets/images/molocorp.png');
const buyMeACoffeeQR = require('@/assets/images/buymeacofeqr.png');
const glowGif = require('@/assets/images/3dglow.gif');

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showVipModal, setShowVipModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isDesktop = width >= 1024;
  const isTablet = width >= 768;
  const formWidth = isDesktop ? 420 : isTablet ? 400 : width - 40;

  const buttonScale = useSharedValue(1);
  
  // Animación de luces intermitentes para el fondo
  const bgAnimation = useSharedValue(0);
  
  useEffect(() => {
    bgAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedBgStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bgAnimation.value,
      [0, 0.25, 0.5, 0.75, 1],
      [
        'rgba(0, 255, 255, 0.03)',
        'rgba(0, 255, 255, 0.08)',
        'rgba(0, 255, 255, 0.12)',
        'rgba(0, 255, 255, 0.08)',
        'rgba(0, 255, 255, 0.03)',
      ]
    );
    return { backgroundColor };
  });

  const sizes = {
    logo: isDesktop ? 140 : isTablet ? 160 : 180,
    title: isDesktop ? 26 : isTablet ? 28 : 30,
    subtitle: isDesktop ? 11 : 12,
    input: isDesktop ? 13 : 14,
    button: isDesktop ? 12 : 13,
    link: isDesktop ? 11 : 12,
    icon: isDesktop ? 16 : 18,
    small: isDesktop ? 10 : 11,
  };

  const handleLogin = async () => {
    if (!nickname.trim()) {
      setError('Ingresa tu @nickname');
      shakeButton();
      return;
    }
    if (!password) {
      setError('Ingresa tu contraseña');
      shakeButton();
      return;
    }
    setError('');

    // Login con el store
    const success = await login(nickname, password);

    if (success) {
      router.replace('/(tabs)');
    } else {
      // Mostrar toast de error
      setToastMessage('¡Ups! Verifica tu usuario o contraseña.');
      setShowToast(true);
      shakeButton();
    }
  };

  const handleForgotFromToast = () => {
    setShowToast(false);
    setShowForgotPassword(true);
  };

  const shakeButton = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(1.05, { duration: 50 }),
      withTiming(0.95, { duration: 50 }),
      withTiming(1, { duration: 50 })
    );
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const openMoloCorp = () => {
    Linking.openURL('https://www.molocorp.world/');
  };

  const openCoffee = () => {
    Linking.openURL('https://buymeacoffee.com/moloworld');
  };

  const openCalendar = () => {
    // Google Calendar con el correo resourcesmolo@gmail.com
    const meetingUrl = 'https://calendar.google.com/calendar/u/0/appointments/schedules?gv=true&email=resourcesmolo@gmail.com';
    Linking.openURL(meetingUrl);
  };

  const cryptoAddresses = {
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    SOL: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    XRP: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
    USDT: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={glowGif}
              style={[styles.glowGif, { width: sizes.logo * 2, height: sizes.logo * 2 }]}
              resizeMode="contain"
            />
            <Image
              source={moloCorpLogo}
              style={[styles.logo, { width: sizes.logo, height: sizes.logo }]}
              resizeMode="contain"
            />
          </View>
          <NeonText
            text="BLACK SKY"
            color={Colors.neonPurple}
            fontSize={sizes.title}
            glow
            glowIntensity={0.8}
          />
          <Text style={[styles.byText, { fontSize: sizes.small }]}>
            Un producto de{' '}
            <Text style={styles.moloLink} onPress={openMoloCorp}>
              MOLOWORLD S.A.S
            </Text>
          </Text>
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Shield size={14} color={Colors.neonBlue} />
          <Text style={[styles.tagline, { fontSize: sizes.subtitle }]}>
            Tu voz, tu anonimato, tu libertad
          </Text>
        </View>

        {/* Mission Statement */}
        <GlassCard style={[styles.missionCard, { width: formWidth }]}>
          <Text style={[styles.missionText, { fontSize: sizes.subtitle }]}>
            En un mundo donde la vigilancia es constante, BLACK SKY es tu refugio digital. 
            Una plataforma para la libre expresión anónima donde tus pensamientos permanecen 
            encriptados y tu identidad protegida.
          </Text>
          <Text style={[styles.missionHighlight, { fontSize: sizes.subtitle }]}>
            Expresarse es necesario. La privacidad es un derecho.
          </Text>
        </GlassCard>

        {/* Login Form */}
        <View style={[styles.formContainer, { width: formWidth }]}>
          <Text style={[styles.formTitle, { fontSize: sizes.input + 1 }]}>INICIAR SESIÓN</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <AtSign size={sizes.icon} color={Colors.neonPurple} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { fontSize: sizes.input }]}
              placeholder="nickname"
              placeholderTextColor={Colors.textMuted}
              value={nickname}
              onChangeText={(text) => {
                setNickname(text.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={sizes.icon} color={Colors.neonPurple} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { fontSize: sizes.input, flex: 1 }]}
              placeholder="contraseña"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              {showPassword ? (
                <EyeOff size={sizes.icon} color={Colors.textSecondary} />
              ) : (
                <Eye size={sizes.icon} color={Colors.textSecondary} />
              )}
            </Pressable>
          </View>

          <Animated.View style={[buttonAnimatedStyle, { width: '100%' }]}>
            <Pressable style={styles.loginButton} onPress={handleLogin}>
              <Text style={[styles.loginButtonText, { fontSize: sizes.button }]}>
                ENTRAR AL VOID
              </Text>
            </Pressable>
          </Animated.View>

          {/* Forgot Password */}
          <Pressable onPress={() => setShowForgotPassword(true)} style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { fontSize: sizes.link }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.registerText, { fontSize: sizes.link }]}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.registerLink}>Crear identidad</Text>
            </Text>
          </Pressable>
        </View>

        {/* Ads Transparency */}
        <GlassCard style={[styles.adsCard, { width: formWidth }]}>
          <Text style={[styles.adsTitle, { fontSize: sizes.subtitle }]}>
            📢 SOBRE LA PUBLICIDAD
          </Text>
          <Text style={[styles.adsText, { fontSize: sizes.small }]}>
            Al usar BLACK SKY es probable que veas publicidad. Creemos en la transparencia: 
            cada anuncio nos ayuda a mantener los servidores, mejorar la seguridad y seguir 
            desarrollando nuevas funciones.
          </Text>
          <Text style={[styles.adsText, { fontSize: sizes.small, marginTop: 8 }]}>
            Detrás de esta app hay un programador independiente con ideas, imaginación y 
            pasión por crear. La monetización nos permite reinvertir en la misma aplicación, 
            hacerla mejor y mantenerla gratuita para todos.
          </Text>
          <Text style={[styles.adsHighlight, { fontSize: sizes.small }]}>
            Tu apoyo, ya sea viendo anuncios o siendo VIP, impulsa la innovación. ¡Gracias por ser parte!
          </Text>
        </GlassCard>

        {/* VIP No Ads */}
        <Pressable onPress={() => setShowVipModal(true)} style={{ width: formWidth }}>
          <GlassCard style={styles.vipCard}>
            <View style={styles.vipHeader}>
              <Crown size={20} color="#FFD700" />
              <Text style={[styles.vipTitle, { fontSize: sizes.subtitle }]}>
                EXPERIENCIA VIP - SIN ANUNCIOS
              </Text>
            </View>
            <Text style={[styles.vipPrice, { fontSize: sizes.title - 4 }]}>
              $5 USD<Text style={styles.vipPeriod}>/mes</Text>
            </Text>
            <Text style={[styles.vipDescription, { fontSize: sizes.small }]}>
              Disfruta de BLACK SKY sin interrupciones. Paga con tarjeta, PSE, Nequi, 
              Daviplata o criptomonedas.
            </Text>
            <View style={styles.cryptoIcons}>
              <Text style={styles.cryptoBadge}>BTC</Text>
              <Text style={styles.cryptoBadge}>ETH</Text>
              <Text style={styles.cryptoBadge}>SOL</Text>
              <Text style={styles.cryptoBadge}>XRP</Text>
              <Text style={styles.cryptoBadge}>USDT</Text>
            </View>
          </GlassCard>
        </Pressable>

        {/* Coffee Donation */}
        <GlassCard style={[styles.coffeeCard, { width: formWidth }]}>
          <View style={styles.coffeeHeader}>
            <Coffee size={24} color="#FFDD00" />
            <Text style={[styles.coffeeTitle, { fontSize: sizes.subtitle }]}>
              ☕ Invítame un café
            </Text>
          </View>
          <Text style={[styles.coffeeText, { fontSize: sizes.small }]}>
            ¿Te gusta BLACK SKY? Un café me ayuda a seguir programando noches enteras 
            para traerte nuevas funciones. ¡Gracias por tu motivación! 💛
          </Text>
          <Image 
            source={buyMeACoffeeQR} 
            style={styles.coffeeQR}
            resizeMode="contain"
          />
          <Text style={[styles.coffeeScanText, { fontSize: sizes.small - 1 }]}>
            Escanea el QR o toca el botón
          </Text>
          <Pressable onPress={openCoffee} style={styles.coffeeButton}>
            <Image 
              source={{ uri: 'https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=moloworld&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff' }}
              style={styles.coffeeButtonImage}
              resizeMode="contain"
            />
          </Pressable>
        </GlassCard>

        {/* Investors Section */}
        <GlassCard style={[styles.investorCard, { width: formWidth }]}>
          <Rocket size={24} color={Colors.neonBlue} />
          <Text style={[styles.investorTitle, { fontSize: sizes.subtitle }]}>
            ¿TE INTERESA ESTE PROYECTO?
          </Text>
          <Text style={[styles.investorText, { fontSize: sizes.small }]}>
            ¿Quisieras colaborar, aportar ideas o impulsar esta startup? En MOLOWORLD S.A.S 
            creemos en construir relaciones de negocios basadas en la confianza a largo plazo.
          </Text>
          <Text style={[styles.investorHighlight, { fontSize: sizes.small }]}>
            Agenda una reunión virtual con nosotros y exploremos juntos las posibilidades.
          </Text>
          <Pressable style={styles.calendarButton} onPress={openCalendar}>
            <Calendar size={18} color={Colors.background} />
            <Text style={[styles.calendarButtonText, { fontSize: sizes.button }]}>
              AGENDAR REUNIÓN
            </Text>
          </Pressable>
        </GlassCard>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontSize: sizes.small - 1 }]}>
            Tus datos están encriptados de extremo a extremo
          </Text>
          <Pressable onPress={openMoloCorp}>
            <Text style={[styles.footerLink, { fontSize: sizes.small - 1 }]}>
              www.molocorp.world
            </Text>
          </Pressable>
          <Text style={[styles.copyright, { fontSize: sizes.small - 2 }]}>
            © 2024 MOLOWORLD S.A.S - Todos los derechos reservados
          </Text>
        </View>
      </ScrollView>

      {/* Toast de error */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type="error"
        onClose={() => setShowToast(false)}
        actionText="¿Olvidaste tus datos? Restablece tu cuenta"
        onAction={handleForgotFromToast}
        duration={6000}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={() => setShowForgotPassword(false)}
      />

      {/* VIP Modal */}
      {showVipModal && (
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modal, { width: formWidth }]}>
            <View style={styles.modalHeader}>
              <Crown size={24} color="#FFD700" />
              <Text style={styles.modalTitle}>SUSCRIPCIÓN VIP</Text>
              <Pressable onPress={() => setShowVipModal(false)} style={styles.closeModal}>
                <X size={24} color={Colors.text} />
              </Pressable>
            </View>
            
            <Text style={styles.modalPrice}>$5 USD / mes</Text>
            <Text style={styles.modalDescription}>
              Sin anuncios, para siempre mientras mantengas tu suscripción activa.
            </Text>

            <Text style={styles.paymentTitle}>MÉTODOS DE PAGO COLOMBIA</Text>
            <View style={styles.paymentOptions}>
              <Pressable style={styles.paymentButton}>
                <Text style={styles.paymentText}>💳 Tarjeta</Text>
              </Pressable>
              <Pressable style={styles.paymentButton}>
                <Text style={styles.paymentText}>🏦 PSE</Text>
              </Pressable>
              <Pressable style={styles.paymentButton}>
                <Text style={styles.paymentText}>📱 Nequi</Text>
              </Pressable>
              <Pressable style={styles.paymentButton}>
                <Text style={styles.paymentText}>📱 Daviplata</Text>
              </Pressable>
            </View>

            <Text style={styles.paymentTitle}>CRIPTOMONEDAS</Text>
            <View style={styles.cryptoOptions}>
              {Object.entries(cryptoAddresses).map(([crypto, address]) => (
                <Pressable 
                  key={crypto} 
                  style={styles.cryptoButton}
                  onPress={() => {
                    Linking.openURL(`https://pay.coinbase.com?currency=${crypto}`);
                  }}
                >
                  <Text style={styles.cryptoName}>{crypto}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalNote}>
              Al completar el pago, tu cuenta se actualizará automáticamente a VIP 
              y no volverás a ver anuncios.
            </Text>
          </GlassCard>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  glowGif: {
    position: 'absolute',
  },
  logo: {
    zIndex: 1,
  },
  byText: {
    fontFamily: 'SpaceMono',
    color: Colors.textMuted,
    marginTop: 8,
  },
  moloLink: {
    color: Colors.neonPurple,
    textDecorationLine: 'underline',
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  tagline: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
  },
  missionCard: {
    marginBottom: 24,
    padding: 14,
  },
  missionText: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  missionHighlight: {
    fontFamily: 'SpaceMono-Bold',
    color: Colors.neonBlue,
    textAlign: 'center',
  },
  formContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontFamily: 'MajorMono',
    color: Colors.text,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 50, 50, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 50, 50, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: '100%',
  },
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#ff5050',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(191, 0, 255, 0.3)',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'SpaceMono',
    color: Colors.text,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: Colors.neonPurple,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: 'MajorMono',
    color: Colors.background,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: Colors.textMuted,
    marginHorizontal: 12,
  },
  registerText: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  registerLink: {
    color: Colors.neonBlue,
  },
  forgotPassword: {
    marginTop: 12,
    padding: 8,
  },
  forgotPasswordText: {
    fontFamily: 'SpaceMono',
    color: Colors.neonPurple,
    textAlign: 'center',
  },
  adsCard: {
    marginBottom: 16,
    padding: 14,
    borderColor: 'rgba(255, 200, 0, 0.2)',
  },
  adsTitle: {
    fontFamily: 'MajorMono',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  adsText: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  adsHighlight: {
    fontFamily: 'SpaceMono-Bold',
    color: '#FFDD00',
    textAlign: 'center',
    marginTop: 10,
  },
  vipCard: {
    marginBottom: 16,
    padding: 14,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    alignItems: 'center',
  },
  vipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  vipTitle: {
    fontFamily: 'MajorMono',
    color: '#FFD700',
  },
  vipPrice: {
    fontFamily: 'SpaceMono-Bold',
    color: Colors.text,
  },
  vipPeriod: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  vipDescription: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  cryptoIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  cryptoBadge: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: Colors.neonBlue,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  coffeeCard: {
    marginBottom: 16,
    padding: 14,
    alignItems: 'center',
    borderColor: 'rgba(255, 221, 0, 0.3)',
  },
  coffeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  coffeeTitle: {
    fontFamily: 'MajorMono',
    color: '#FFDD00',
  },
  coffeeText: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  coffeeQR: {
    width: 140,
    height: 140,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  coffeeScanText: {
    fontFamily: 'SpaceMono',
    color: Colors.textMuted,
    marginBottom: 12,
  },
  coffeeButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  coffeeButtonImage: {
    width: 200,
    height: 50,
  },
  coffeeButtonText: {
    fontFamily: 'MajorMono',
    fontSize: 11,
    color: Colors.background,
  },
  investorCard: {
    marginBottom: 24,
    padding: 16,
    alignItems: 'center',
    borderColor: 'rgba(0, 114, 255, 0.3)',
  },
  investorTitle: {
    fontFamily: 'MajorMono',
    color: Colors.neonBlue,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  investorText: {
    fontFamily: 'SpaceMono',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  investorHighlight: {
    fontFamily: 'SpaceMono-Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neonBlue,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  calendarButtonText: {
    fontFamily: 'MajorMono',
    color: Colors.background,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontFamily: 'SpaceMono',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  footerLink: {
    fontFamily: 'SpaceMono',
    color: Colors.neonPurple,
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  copyright: {
    fontFamily: 'SpaceMono',
    color: Colors.textMuted,
    marginTop: 8,
    opacity: 0.6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'MajorMono',
    fontSize: 18,
    color: '#FFD700',
    marginLeft: 10,
    flex: 1,
  },
  closeModal: {
    padding: 4,
  },
  modalPrice: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentTitle: {
    fontFamily: 'MajorMono',
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 10,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  paymentText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: Colors.text,
  },
  cryptoOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cryptoButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  cryptoName: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 12,
    color: Colors.neonBlue,
  },
  modalNote: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 14,
  },
});
