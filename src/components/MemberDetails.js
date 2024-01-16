import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { width } from '../utils/Scaling';
import Colors from '../utils/Colors';
import Modal from 'react-native-modal';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase-config';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const MemberDetails = ({ navigation, modalVisible, setModalVisible, member, profileImage }) => {  // <-- pass the member's username (or ID #) and use this to identify what to display
    const [friend, setFriend] = useState(false);

    useEffect(() => {
        // check if the member is in the user's friend list
        checkFriendList();
    }, []);

    async function checkFriendList () {
        const colRef = collection(db, 'profiles', auth.currentUser.uid, 'friends');
        const docsSnap = await getDocs(colRef);

        // look for the member in the user's list of friends
        for (let i in docsSnap.docs) {
            if (docsSnap.docs[i].id === member.userID) {
                setFriend(true);
            }
        }
    };

    function addFriend () {
        const docData = {
            email: member.email,
            userID: member.userID,
            username: member.username
        };

        setDoc(doc(db, 'profiles', auth.currentUser.uid, 'friends', member.userID), docData)
        .then(docRef => setFriend(true))
        .catch(error => console.log(error))
    };

    function removeFriend () {
        deleteDoc(doc(db, 'profiles', auth.currentUser.uid, 'friends', member.userID))
        .then(docRef => setFriend(false))
        .catch(error => console.log(error))
    };
    
    return (
        <Modal
            isVisible={modalVisible}
            onBackButtonPress={() => setModalVisible(false)}
            onBackdropPress={() => setModalVisible(false)}
            animationOutTiming={300}
            backdropTransitionOutTiming={500}
            backdropOpacity={0.55}
        >
            <View style={styles.modalContainer}>
                <View style={styles.profileIcon}>
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../assets/images/profile-outline.png')}
                        style={{ flex: 1, height: undefined, width: undefined, borderRadius: 60 }}
                    />
                </View>
                <Text style={styles.usernameText}>{member.username}</Text>
                <Text style={styles.emailText}>{member.email}</Text>

                <View style={{ flexDirection: 'row', marginTop: 25, alignSelf: 'center', justifyContent: 'space-evenly', width: '100%', paddingHorizontal: '10%' }}>
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('InboxStack', { screen: 'Messages', params: { member } });
                            }}
                        >
                            <MaterialCommunityIcons name='message' size={width > 550 ? 28 : 23} color={Colors.subTheme}/>
                        </TouchableOpacity>
                        <Text style={{ fontSize: width > 550 ? 16 : 14, marginTop: 5 }}>Message</Text>
                    </View>

                    {friend && <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                removeFriend();
                                setModalVisible(false);     // <-- needs fixing so that I don't have to close the modal
                            }}
                        >
                            <Ionicons name='person-remove' size={width > 550 ? 28 : 23} color={Colors.subTheme}/>
                        </TouchableOpacity>
                        <Text style={{ fontSize: width > 550 ? 16 : 14, marginTop: 5 }}>Remove Friend</Text>
                    </View>}

                    {!friend && <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => addFriend()}
                        >
                            <Ionicons name='person-add' size={width > 550 ? 28 : 23} color={Colors.subTheme}/>
                        </TouchableOpacity>
                        <Text style={{ fontSize: width > 550 ? 16 : 14, marginTop: 5 }}>Add Friend</Text>
                    </View>}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: Colors.theme,
        borderRadius: 20,
        height: width > 550 ? 425 : 350,
        width: width > 550 ? '70%' : '90%',
        alignSelf: 'center'
    },
    profileIcon: {
        height: width > 550 ? 120 : 90,
        width: width > 550 ? 120 : 90,
        borderRadius: width > 550 ? 60 : 45,
        alignSelf: 'center',
        marginTop: width > 550 ? 55 : 40
    },
    usernameText: {
        fontSize: width > 550 ? 27 : 24,
        fontFamily: 'roboto-medium',
        alignSelf: 'center',
        marginTop: 15
    },
    emailText: {
        fontSize: width > 550 ? 22 : 19,
        alignSelf: 'center',
        marginTop: 5
    },
    button: {
        height: width > 550 ? 50 : 40,
        width: width > 550 ? 50 : 40,
        borderRadius: width > 550 ? 25 : 20,
        backgroundColor: '#d9d9d9',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default MemberDetails;