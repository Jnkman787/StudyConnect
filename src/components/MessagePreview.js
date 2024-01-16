import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { width } from '../utils/Scaling';
import Colors from '../utils/Colors';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { ref, getStorage, getDownloadURL } from 'firebase/storage';
import { db, auth } from '../../firebase-config';

const MessagePreview = ({ navigation, message }) => {    // <-- pass all the arguments needed to fill in the details of the preview
    const [timeDate, setTimeDate] = useState();
    const [displayedUsername, setDisplayedUsername] = useState();
    const [displayedMessage, setDisplayedMessage] = useState();
    const [profileImage, setProfileImage] = useState(null);
    const [memberData, setMemberData] = useState();

    function checkUsernameLength (memberUsername) {
        if (width > 550) {
            setDisplayedUsername(memberUsername);
        } else {
            if (memberUsername.length > 18) {
                setDisplayedUsername(memberUsername.slice(0, 16) + '...');
            } else {
                setDisplayedUsername(memberUsername);
            }
        }
    };

    function checkMessageLength (messageSent) {
        if (width > 550) {
            if (messageSent.length > 45) {
                setDisplayedMessage(messageSent.slice(0, 43) + '...');
            } else {
                setDisplayedMessage(messageSent);
            }
        } else {
            if (messageSent.length > 25) {
                setDisplayedMessage(messageSent.slice(0, 23) + '...');
            } else {
                setDisplayedMessage(messageSent);
            }
        }
    };
    
    function getTimeText (messageDate) {
        let today = new Date();

        // check if the recorded date at which the message was sent was today
        if (messageDate.getFullYear() == today.getFullYear()) {
            if (messageDate.getMonth() == today.getMonth()) {
                if (messageDate.getDate() == today.getDate()) {
                    // set the timeDate variable with the time at which the message was sent
                    let hours = messageDate.getHours();
                    let minutes = messageDate.getMinutes();
                    let timePeriod;

                    // set hours & timePeriod
                    if (messageDate.getHours() >= 12) {     // PM
                        timePeriod = 'PM';
                        if (messageDate.getHours() > 12) { hours = messageDate.getHours() - 12; }
                    } else {    // AM
                        timePeriod = 'AM';
                        if (messageDate.getHours() == 0) { hours = 12; }
                    }

                    // set minutes
                    if (messageDate.getMinutes() < 10) { minutes = '0' + messageDate.getMinutes(); }

                    setTimeDate(hours + ':' + minutes + ' ' + timePeriod);
                    return;
                }
            }
        }

        // set the timeDate variable with the date at which the message was sent
        setTimeDate((messageDate.getMonth() + 1) + '/' + messageDate.getDate() + '/' + messageDate.getFullYear());
    };

    useEffect(() => {
        // use the message document ID to retrieve the document & most recent message data
        getMemberData();
        getMessageData();
    }, []);

    async function getMemberData () {
        const docSnap = await getDoc(doc(db, 'profiles', auth.currentUser.uid, 'direct-messages', message.item.documentID));
        checkUsernameLength(docSnap.data().username);
        setMemberData(docSnap.data());

        // get the member's profile image
        let location = 'profileImages/' + message.item.documentID;
        getDownloadURL(ref(getStorage(), location))
        .then((url) => {
            setProfileImage(url);
        }).catch(error => {})
    };

    // get the data of the most recent message
    async function getMessageData () {
        let messageList = [];
        const colRef = collection(db, 'profiles', auth.currentUser.uid, 'direct-messages', message.item.documentID, 'messages');
        const docsSnap = await getDocs(colRef);
        docsSnap.forEach(doc => {
            messageList.push(doc.data());
        });
        
        // re-order messages list in reverse chronological order
        messageList.sort(function (a, b) {
            return a.createdAt.seconds - b.createdAt.seconds;
        });
        messageList.reverse();

        getTimeText(messageList[0].createdAt.toDate());

        // check if the user sent the most recent message
        if (messageList[0].userID === auth.currentUser.uid) {
            let tempMessage = 'You: ' + messageList[0].message;
            checkMessageLength(tempMessage);
        } else {
            checkMessageLength(messageList[0].message);
        }
    };

    return (
        <TouchableOpacity
            style={styles.messageContainer}
            onPress={() => navigation.navigate('InboxStack', { screen: 'Messages', params: { member: memberData } })}
        >
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <View style={styles.profileIcon}>
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../assets/images/profile-outline.png')}
                        style={{ flex: 1, height: undefined, width: undefined, borderRadius: 35 }}
                    />
                </View>
                <View style={{ justifyContent: 'center', flex: 1, }}>
                    <Text style={styles.usernameText}>{displayedUsername}</Text>
                    <Text style={{ fontSize: width > 550 ? 18 : 16 }}>{displayedMessage}</Text>
                </View>
                <Text style={styles.dateText}>{timeDate}</Text>
            </View>
            <View style={styles.bottomBorder}/>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        width: '100%',
        height: width > 550 ? 95 : 75
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
    },
    dateText: {
        fontSize: width > 550 ? 17 : 15,
        color: Colors.grey,
        marginTop: width > 550 ? 26 : 16,
        marginRight: width > 550 ? 20 : 10
    },
    bottomBorder: {
        width: width > 550 ? '84%' : '77%',
        alignSelf: 'flex-end',
        height: 1,
        backgroundColor: Colors.border
    }
});

export default MessagePreview;