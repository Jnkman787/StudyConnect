import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { width } from '../utils/Scaling';
import Colors from '../utils/Colors';
import { ref, getStorage, getDownloadURL } from 'firebase/storage';
import { auth } from '../../firebase-config';

import MemberDetails from './MemberDetails';

const MemberPreview = ({ navigation, member }) => {     // <-- pass all the arguments needed to fill in the details of the preview
    const [profileImage, setProfileImage] = useState(null);
    const [displayedUsername, setDisplayedUsername] = useState();
    const [modalVisible, setModalVisible] = useState(false);

    function checkUsernameLength (memberUsername) {
        if (width > 550) {
            setDisplayedUsername(memberUsername);
        } else {
            if (memberUsername.length > 24) {
                setDisplayedUsername(memberUsername.slice(0, 22) + '...');
            } else {
                setDisplayedUsername(memberUsername);
            }
        }
    };

    useEffect(() => {
        // check if the object is empty
        if (Object.keys(member.item).length != 0) {
            // check the member's username length
            checkUsernameLength(member.item.username);

            // set the user's profile image
            let location = 'profileImages/' + member.item.userID;
            getDownloadURL(ref(getStorage(), location))
            .then((url) => {
                setProfileImage(url);
            }).catch(error => {})
        }
    }, [member]);

    return (
        <View>
            <TouchableOpacity
                style={styles.memberContainer}
                onPress={() => {
                    if (member.item.userID != auth.currentUser.uid) {
                        setModalVisible(true);
                    }
                }}
            >
                <View style={styles.profileIcon}>
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../assets/images/profile-outline.png')}
                        style={{ flex: 1, height: undefined, width: undefined, borderRadius: 35 }}
                    />
                </View>
                <View style={{ justifyContent: 'center', flex: 1, }}>
                    <Text style={styles.usernameText}>{displayedUsername}</Text>
                </View>
            </TouchableOpacity>

            <MemberDetails navigation={navigation} modalVisible={modalVisible} setModalVisible={setModalVisible} member={member.item} profileImage={profileImage}/>
        </View>
    );
};

const styles = StyleSheet.create({
    memberContainer: {
        width: '100%',
        height: width > 550 ? 90 : 70,
        flexDirection: 'row'
    },
    profileIcon: {
        height: width > 550 ? 70 : 55,
        width: width > 550 ? 70 : 55,
        borderRadius: width > 550 ? 35 : 30,
        marginLeft: 15,
        marginRight: 12,
        alignSelf: 'center'
    },
    usernameText: {
        fontSize: width > 550 ? 21 : 18,
        fontFamily: 'roboto-medium'
    }
});

export default MemberPreview;