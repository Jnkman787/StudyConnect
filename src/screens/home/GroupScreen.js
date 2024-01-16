import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';
import { collection, setDoc, getDocs, doc } from 'firebase/firestore';
import { db, auth } from '../../../firebase-config';

import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const GroupScreen = ({ navigation, route }) => {   // <-- pass the group name (or groupID #) and use this to identify what to display
    // Slack: messages & files older than 90 days are hidden
    // Perhaps follow this same system and annouce it to new group users

    const { groupName } = route.params;
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        // check if the user has joined the group
        checkMemberList();
    }, []);

    async function checkMemberList () {
        const docsSnap = await getDocs(collection(db, 'groups', groupName, 'members'));

        for (let i in docsSnap.docs) {
            const doc = docsSnap.docs[i].data();
            if (doc.userID == auth.currentUser.uid) {
                setJoined(true);
                return;
            }
        }
    };

    function addMember () {
        const docData = {
            email: auth.currentUser.email,
            userID: auth.currentUser.uid,
            username: auth.currentUser.displayName
        };

        setDoc(doc(db, 'groups', groupName, 'members', auth.currentUser.uid), docData)
        .then(docRef => setJoined(true))
        .catch(error => console.log(error))

        setDoc(doc(db, 'profiles', auth.currentUser.uid, 'groups', groupName), {})
        .then(docRef => {})
        .catch(error => console.log(error))
    };

    return (
        <View style={styles.screen}>
            <Text style={styles.titleText}>Welcome to</Text>
            <Text style={styles.nameText}>{groupName}</Text>

            <View style={[styles.menuBox, { marginTop: joined === true ? width > 550 ? '15%' : '25%' : width > 550 ? '12.5%' : '20%' }]}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ChatForum', { groupName, joined } )}
                        style={styles.menuOption}
                    >
                        <MaterialCommunityIcons name='forum' size={width > 550 ? 55 : 45} color={Colors.subTheme}/>
                        <Text style={{ fontSize: width > 550 ? 21 : 18, fontFamily: 'roboto-medium', marginTop: 5 }}>Chat Forum</Text>
                    </TouchableOpacity>
                    <View style={{ height: '100%', width: 2, backgroundColor: Colors.border }}/>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Folder', { groupName })}
                        style={styles.menuOption}
                    >
                        <FontAwesome name='folder-open' size={width > 550 ? 55 : 45} color={Colors.subTheme}/>
                        <Text style={{ fontSize: width > 550 ? 21 : 18, fontFamily: 'roboto-medium', marginTop: 5 }}>Group Folder</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width: '100%', height: 2, backgroundColor: Colors.border }}/>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MemberList', { groupName })}
                        style={styles.menuOption}
                    >
                        <MaterialCommunityIcons name='account-group' size={width > 550 ? 60 : 50} color={Colors.subTheme}/>
                        <Text style={{ fontSize: width > 550 ? 21 : 18, fontFamily: 'roboto-medium', marginTop: 5 }}>Members</Text>
                    </TouchableOpacity>
                    <View style={{ height: '100%', width: 2, backgroundColor: Colors.border }}/>
                    <TouchableOpacity
                        //onPress={() => }
                        style={styles.menuOption}
                    >
                        {/*<Image
                            source={require('../../assets/images/whiteboard3.png')}
                            style={{ height: 45, width: 50 }}
                        />*/}
                        <MaterialCommunityIcons name='view-dashboard-edit' size={width > 550 ? 55 : 45} color={Colors.subTheme} style={{ top: 2 }}/>
                        {/*<MaterialCommunityIcons name='draw' size={width > 550 ? 55 : 45} color={Colors.subTheme}/>*/}
                        <Text style={{ fontSize: width > 550 ? 21 : 18, fontFamily: 'roboto-medium', marginTop: 11 }}>Whiteboard</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {!joined && <TouchableOpacity
                style={styles.joinButtonContainer}
                onPress={() => addMember()}
            >
                <Text style={{ color: 'white', fontSize: width > 550 ? 23 : 20 }}>Join Group</Text>
            </TouchableOpacity>}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.theme
    },
    titleText: {
        fontSize: width > 550 ? 40 : 30,
        alignSelf: 'center',
        marginTop: 15
    },
    nameText: {
        fontSize: width > 550 ? 45 : 35,
        alignSelf: 'center',
        marginTop: 20,
        color: Colors.subTheme,
        fontFamily: 'roboto-medium'
    },
    menuBox: {
        alignSelf: 'center',
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
    joinButtonContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        height: width > 550 ? 65 : 55,
        backgroundColor: Colors.subTheme,
        width: width > 550 ? '70%' : '80%',
        borderRadius: width > 550 ? 30 : 25,
        marginTop: width > 550 ? '10%' : '15%'
    }
});

export default GroupScreen;