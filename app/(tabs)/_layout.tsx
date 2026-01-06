import { Tabs } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { Chrome as Home, Search, Plus, BookOpen, User } from 'lucide-react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  // Responsive breakpoints
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  
  // Tamaños responsivos
  const iconSize = isDesktop ? 20 : isTablet ? 21 : 22;
  const createButtonSize = isDesktop ? 38 : isTablet ? 42 : 46;
  const tabBarHeight = (isDesktop ? 48 : isTablet ? 52 : 56) + insets.bottom;
  
  // Padding horizontal para centrar en pantallas grandes
  const getHorizontalPadding = () => {
    if (isDesktop) return Math.max((width - 500) / 2, 0);
    if (isTablet) return width * 0.12;
    return 0;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingHorizontal: getHorizontalPadding(),
        },
        tabBarActiveTintColor: Colors.neonBlue,
        tabBarInactiveTintColor: Colors.softGray,
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <Home size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <Search size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => (
            <View style={[styles.createButton, { 
              width: createButtonSize,
              height: createButtonSize,
              borderRadius: createButtonSize / 2,
            }]}>
              <Plus size={iconSize} color={Colors.background} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="boards"
        options={{
          title: 'Boards',
          tabBarIcon: ({ color }) => (
            <BookOpen size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <User size={iconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 114, 255, 0.3)',
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 114, 255, 0.3)',
  },
  createButton: {
    backgroundColor: Colors.neonPurple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});
