import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import { StackActions } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { ref, getStorage, getDownloadURL } from 'firebase/storage';
import { auth } from '../../../firebase-config';

import CustomIcon from '../../utils/CustomIcon';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

// Look at Instagram's edit profile screen for ideas on how to design my EditProfileScreen

// Also likely need to include a delete profile option (maybe include in the EditProfileScreen)

// Should I provide users the ability to write a bio?

const UserProfileScreen = ({ navigation }) => {
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {   // <-- may need to find a way to update if user changes it on the edit profile screen
        // set the user's profile image
        let location = 'profileImages/' + auth.currentUser.uid;
        getDownloadURL(ref(getStorage(), location))
        .then((url) => {
            setProfileImage(url);
        }).catch(error => {
            // profile doesn't have a saved profile image
            // therefore, keep the selectedImage value as null
        })
    }, []);

    const handleSignOut = () => {
        signOut(auth)
        .then(() => {
            // Sign-out successful
            navigation.dispatch(StackActions.replace('SetupStack', { screen: 'Login' }));
        })
        .catch((error) => {
            let errorMessage;
            if (error.code != undefined) { errorMessage = error.code.slice(5); }
            Toast.show(errorMessage, {
                backgroundColor: Colors.darkGrey,
                position: Toast.positions.CENTER,
                opacity: 1,
                shadow: false,
                textStyle: { fontSize: width > 550 ? 19 : 16 }
            });
        })
    };

    return (
        <View style={styles.screen}>
            <View style={styles.detailsContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.profileIcon}>
                        <Image
                            source={profileImage ? { uri: profileImage } : require('../../assets/images/profile-outline.png')}
                            style={{ flex: 1, height: undefined, width: undefined, borderRadius: 50 }}
                        />
                    </View>
                    <Text style={styles.nameText}>{auth.currentUser.displayName}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/*<Feather name='mail' size={width > 550 ? 35 : 30} color='black'/>*/}
                    <MaterialIcons name='email' size={width > 550 ? 35 : 30} color='black'/>
                    <Text style={{ fontSize: width > 550 ? 19 : 16, marginLeft: 20 }}>{auth.currentUser.email}</Text>
                </View>
            </View>

            <View style={styles.menuContainer}>
                <View style={styles.menuBox}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <TouchableOpacity
                            //onPress={() => console.log(auth.currentUser.displayName)}
                            style={styles.menuOption}
                        >
                            {/*<Ionicons name='checkmark-circle' size={width > 550 ? 55 : 45} color={Colors.subTheme}/>*/}
                            <Ionicons name='checkmark-circle-outline' size={width > 550 ? 55 : 45} color={Colors.subTheme}/>
                            <Text style={{ fontSize: width > 550 ? 21 : 18, fontFamily: 'roboto-medium', marginTop: 5 }}>Tasks</Text>
                        </TouchableOpacity>
                        <View style={{ height: '100%', width: 2, backgroundColor: Colors.border }}/>
                        <TouchableOpacity
                            style={styles.menuOption}
                            onPress={() => navigation.navigate('UserStack', { screen: 'Edit' })}
                        >
                            {/*<MaterialIcons name='edit' size={width > 550 ? 58 : 45} color={Colors.subTheme} style={{ top: 1 }}/>
                            <Text style={{ fontSize: width > 550 ? 21 : 18, fontFamily: 'roboto-medium', marginTop: 8 }}>Edit Profile</Text>*/}
                            <AntDesign name='edit' size={width > 550 ? 50 : 40} color={Colors.subTheme} style={{ top: width > 550 ? 5 : 4 }}/>
                            <Text style={{ fontSize: width > 550 ? 21 : 18, fontFamily: 'roboto-medium', marginTop: 13 }}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', height: 2, backgroundColor: Colors.border }}/>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('UserStack', { screen: 'Notifications' })}
                            style={styles.menuOption}
                        >
                            {/*<Ionicons name='notifications' size={width > 550 ? 53 : 43} color={Colors.subTheme}/>*/}
                            <Ionicons name='notifications-outline' size={width > 550 ? 53 : 43} color={Colors.subTheme}/>
                            <Text style={{ fontSize: width > 550 ? 21 : 18, fontFamily: 'roboto-medium', marginTop: 5 }}>Notifications</Text>
                        </TouchableOpacity>
                        <View style={{ height: '100%', width: 2, backgroundColor: Colors.border }}/>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('UserStack', { screen: 'Settings' })}
                            style={styles.menuOption}
                        >
                            {/*<Ionicons name='settings-sharp' size={width > 550 ? 50 : 40} color={Colors.subTheme}/>*/}
                            <Ionicons name='settings-outline' size={width > 550 ? 50 : 40} color={Colors.subTheme}/>
                            <Text style={{ fontSize: width > 550 ? 21 : 18, fontFamily: 'roboto-medium', marginTop: 7 }}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => handleSignOut()}
                style={styles.logOffContainer}
            >
                <Feather name='power' size={width > 550 ? 35 : 30} color='red' style={{ marginRight: 20 }}/>
                <Text style={styles.logOffText}>Log out</Text>
            </TouchableOpacity>
        </View>
    );
};

UserProfileScreen.navigationOptions = () => {
    return {
        header: () => null,
        tabBarIcon: ({ focused }) => {
            if (focused) {
                return (<CustomIcon name='user' size={30} color='black' style={{ right: 3 }}/>);
            } else {
                return (<CustomIcon name='user-outline' size={30} color='black' style={{ right: 3 }}/>);
            }
        }
    };
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.theme
    },
    detailsContainer: {
        paddingTop: 20,
        height: width > 550 ? '25%' : '30%',
        paddingLeft: width > 550 ? 35 : 20,
        justifyContent: 'space-evenly'
    },
    profileIcon: {
        height: width > 550 ? 95 : 80,
        width: width > 550 ? 95 : 80,
        borderRadius: width > 550 ? 50 : 40,
        marginRight: 20
    },
    nameText: {
        color: 'black',
        fontSize: width > 550 ? 25 : 22,
        fontFamily: 'roboto-medium'
    },
    menuContainer: {
        flex: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center'
    },
    menuBox: {
        height: width > 550 ? 450 : 300,
        width: width > 550 ? 450 : 300,
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 20
    },
    menuOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    logOffContainer: {
        height: width > 550 ? '10%' : '10.5%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: width > 550 ? 35 : 20
    },
    logOffText: {
        color: 'red',
        fontSize: width > 550 ? 21 : 18,
        fontFamily: 'roboto-medium'
    }
});

export default UserProfileScreen;