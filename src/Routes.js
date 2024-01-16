import React from 'react';
import { Animated, Platform } from 'react-native';
import { width } from './utils/Scaling';
import Colors from './utils/Colors';

// navigation
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// screens
// Setup
import LoginScreen from './screens/setup/LoginScreen';
import RegisterScreen from './screens/setup/RegisterScreen';

// Home
import HomeScreen from './screens/home/HomeScreen';
import SearchScreen from './screens/home/SearchScreen';
import GroupScreen from './screens/home/GroupScreen';
import ChatForumScreen from './screens/home/ChatForumScreen';
import FolderScreen from './screens/home/FolderScreen';
import MemberListScreen from './screens/home/MemberListScreen';

// Inbox
import InboxScreen from './screens/inbox/InboxScreen';
import SearchUsersScreen from './screens/inbox/SearchUsersScreen';
import MessagesScreen from './screens/inbox/MessagesScreen';

// User
import UserProfileScreen from './screens/user/UserProfileScreen';
import EditProfileScreen from './screens/user/EditProfileScreen';
import SettingsScreen from './screens/user/SettingsScreen';
import NotificationsScreen from './screens/user/NotificationsScreen';

// Other
import CalendarScreen from './screens/CalendarScreen';

// animation transitions (react navigation also has some pre-made configs)
function forSlide ({ current, next, inverted, layouts: { screen } }) {
    const progress = Animated.add(
        current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        }),
        next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: 'clamp',
            })
            : 0
    );
  
    return {
        cardStyle: {
            transform: [
                {
                    translateX: Animated.multiply(
                        progress.interpolate({
                            inputRange: [0, 1, 2],
                            outputRange: [
                                screen.width, // Focused, but offscreen in the beginning
                                0, // Fully focused
                                screen.width * -0.3, // Fully unfocused
                            ],
                            extrapolate: 'clamp',
                        }),
                        inverted
                    ),
                },
            ]
        },
    };
};

// navigators
const SetupStackScreens = () => {
    // find a way to skip the log in screen if the user has already logged in
    // navigate to the tutorial screen through the register screen
    
    const SetupStack = createStackNavigator();

    return (
        <SetupStack.Navigator
            initialRouteName='Login'
            screenOptions={{
                headerStyle: { backgroundColor: Colors.theme },
                //headerTintColor: 'black',
                cardStyleInterpolator: forSlide,
                headerBackTitleVisible: false,
                headerLeftContainerStyle: Platform.OS === 'ios' ? { left: 12 } : null,
                //headerTitleStyle: { fontSize: width > 550 ? 21 : 18 },
                gestureEnabled: true
            }}
        >
            <SetupStack.Screen      // check if the navigation slides backwards to the HomeScreen after login
                name='Login'
                component={LoginScreen}
                options={{
                    header: () => null
                }}
            />
            <SetupStack.Screen
                name='Register'
                component={RegisterScreen}
                options={{
                    title: null,
                    headerShadowVisible: false,
                    headerTransparent: true
                }}
            />
        </SetupStack.Navigator>
    );
};

const HomeStackScreens = () => {
    const HomeStack = createStackNavigator();

    return (
        <HomeStack.Navigator
            initialRouteName='Search'
            screenOptions={{
                headerStyle: { backgroundColor: Colors.theme },
                headerTintColor: 'black',
                cardStyleInterpolator: forSlide,
                headerBackTitleVisible: false,
                headerLeftContainerStyle: Platform.OS === 'ios' ? { left: 12 } : null,
                headerTitleStyle: { fontSize: width > 550 ? 21 : 18 },
                gestureEnabled: true
            }}
        >
            <HomeStack.Screen
                name='Search'
                component={SearchScreen}
                options={{
                    header: () => null
                }}
            />
            <HomeStack.Screen
                name='Group'
                component={GroupScreen}
                options={{
                    title: null,
                    headerShadowVisible: false
                }}
            />
            <HomeStack.Screen
                name='ChatForum'
                component={ChatForumScreen}
                options={{
                    headerTitleAlign: 'center'
                }}
            />
            <HomeStack.Screen
                name='Folder'
                component={FolderScreen}
                options={{
                    title: 'Group Folder',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        borderBottomWidth: 0.4,
                        shadowOpacity: 0,
                        elevation: 0
                    }
                }}
            />
            <HomeStack.Screen
                name='MemberList'
                component={MemberListScreen}
                options={{
                    title: 'Members',
                    headerTitleAlign: 'center',
                    headerStyle: {      // <-- replace default border with a more visible one
                        borderBottomWidth: 0.4,
                        shadowOpacity: 0,
                        elevation: 0
                    }
                }}
            />
        </HomeStack.Navigator>
    );
};

const InboxStackScreens = () => {
    const InboxStack = createStackNavigator();

    return (
        <InboxStack.Navigator
            initialRouteName='Search'
            screenOptions={{
                headerStyle: { backgroundColor: Colors.theme },
                headerTintColor: 'black',
                cardStyleInterpolator: forSlide,
                headerBackTitleVisible: false,
                headerLeftContainerStyle: Platform.OS === 'ios' ? { left: 12 } : null,
                headerTitleStyle: { fontSize: width > 550 ? 21 : 18 },
                gestureEnabled: true
            }}
        >
            <InboxStack.Screen
                name='Search'
                component={SearchUsersScreen}
                options={{
                    header: () => null
                }}
            />
            <InboxStack.Screen
                name='Messages'
                component={MessagesScreen}
                options={{
                    headerTitleAlign: 'center'
                }}
            />
        </InboxStack.Navigator>
    );
};

const UserStackScreens = () => {
    const UserStack = createStackNavigator();

    return (
        <UserStack.Navigator
            initialRouteName='Edit' // <-- temp (optional?)
            screenOptions={{
                headerStyle: { backgroundColor: Colors.theme },
                headerTintColor: 'black',
                cardStyleInterpolator: forSlide,
                headerBackTitleVisible: false,
                headerLeftContainerStyle: Platform.OS === 'ios' ? { left: 12 } : null,
                headerTitleStyle: { fontSize: width > 550 ? 21 : 18 },
                gestureEnabled: true
            }}
        >
            <UserStack.Screen
                name='Edit'
                component={EditProfileScreen}
                options={{
                    headerTitleAlign: 'center',
                    headerStyle: {
                        borderBottomWidth: 0.4,
                        shadowOpacity: 0,
                        elevation: 0
                    }
                }}
            />
            <UserStack.Screen
                name='Settings'
                component={SettingsScreen}
                options={{
                    title: 'Settings',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        borderBottomWidth: 0.4,
                        shadowOpacity: 0,
                        elevation: 0
                    }
                }}
            />
            <UserStack.Screen
                name='Notifications'
                component={NotificationsScreen}
                options={{
                    title: 'Notifications',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        borderBottomWidth: 0.4,
                        shadowOpacity: 0,
                        elevation: 0
                    }
                }}
            />
        </UserStack.Navigator>
    );
};

const TabScreens = () => {
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator
            initialRouteName='Home'
            screenOptions={{
                headerTintColor: 'black',     // font color
                headerStyle: { backgroundColor: Colors.theme },
                headerTitleStyle: { fontSize: 22, top: 2 },
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: Colors.theme,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                    height: 56
                },
                gestureEnabled: true
            }}
        >
            <Tab.Screen
                name='Home'
                component={HomeScreen}
                options={HomeScreen.navigationOptions}
            />
            <Tab.Screen
                name='Inbox'
                component={InboxScreen}
                options={InboxScreen.navigationOptions}
            />
            <Tab.Screen
                name='Calendar'
                component={CalendarScreen}
                options={CalendarScreen.navigationOptions}
            />
            <Tab.Screen
                name='Profile'
                component={UserProfileScreen}
                options={UserProfileScreen.navigationOptions}
            />
        </Tab.Navigator>
    );
};

const MyTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: 'rgb(255, 255, 255)'
    }
};

const AppContainer = () => {
    const Stack = createStackNavigator();

    return (
        <NavigationContainer theme={MyTheme}>
            <Stack.Navigator
                initialRouteName='SetupStack'
                screenOptions={{
                    gestureEnabled: true,
                    headerShown: false
                }}
            >
                <Stack.Screen
                    name='Tab'
                    component={TabScreens}
                    options={{ 
                        gestureEnabled: false,  // <-- unsure if still needed since I now replace the login screen
                        cardStyleInterpolator: CardStyleInterpolators.forNoAnimation
                    }}
                />
                <Stack.Screen
                    name='SetupStack'
                    component={SetupStackScreens}
                    options={{
                        cardStyleInterpolator: CardStyleInterpolators.forNoAnimation
                    }}
                />
                <Stack.Screen
                    name='HomeStack'
                    component={HomeStackScreens}
                    options={{
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }}
                />
                <Stack.Screen
                    name='InboxStack'
                    component={InboxStackScreens}
                    options={{
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }}
                />
                <Stack.Screen
                    name='UserStack'
                    component={UserStackScreens}
                    options={{
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppContainer;